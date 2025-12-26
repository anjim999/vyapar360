// src/routes/chat.js - Real-time Chat API
import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireCompany } from '../middleware/auth.js';
import { sendToUser, sendToCompany } from '../utils/socketService.js';

const router = express.Router();

// Get chat rooms for user
router.get('/rooms', authMiddleware, async (req, res) => {
    try {
        const { userId, companyId } = req.user;

        const result = await pool.query(
            `SELECT cr.*, 
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.room_id = cr.id AND cm.is_read = false AND cm.sender_id != $1) as unread_count,
        (SELECT cm.message FROM chat_messages cm WHERE cm.room_id = cr.id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
        (SELECT cm.created_at FROM chat_messages cm WHERE cm.room_id = cr.id ORDER BY cm.created_at DESC LIMIT 1) as last_message_at
       FROM chat_rooms cr
       WHERE cr.company_id = $2 AND (cr.created_by = $1 OR $1 = ANY(cr.participants))
       ORDER BY last_message_at DESC NULLS LAST`,
            [userId, companyId]
        );

        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ success: false, error: "Failed to fetch rooms" });
    }
});

// Create chat room
router.post('/rooms', authMiddleware, requireCompany, async (req, res) => {
    try {
        const { userId, companyId } = req.user;
        const { name, participants, type = 'group' } = req.body;

        const result = await pool.query(
            `INSERT INTO chat_rooms (company_id, name, type, participants, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [companyId, name, type, participants || [], userId]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).json({ success: false, error: "Failed to create room" });
    }
});

// Get messages in a room
router.get('/rooms/:roomId/messages', authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 50, before } = req.query;

        let query = `SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar
                 FROM chat_messages cm
                 JOIN users u ON cm.sender_id = u.id
                 WHERE cm.room_id = $1`;
        const params = [roomId];

        if (before) {
            query += ` AND cm.created_at < $2`;
            params.push(before);
        }

        query += ` ORDER BY cm.created_at DESC LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));

        const result = await pool.query(query, params);

        res.json({ success: true, data: result.rows.reverse() });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ success: false, error: "Failed to fetch messages" });
    }
});

// Send message
router.post('/rooms/:roomId/messages', authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId, companyId } = req.user;
        const { message, attachments } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ success: false, error: "Message cannot be empty" });
        }

        const result = await pool.query(
            `INSERT INTO chat_messages (room_id, sender_id, message, attachments)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [roomId, userId, message, attachments || []]
        );

        // Get sender info
        const userResult = await pool.query(`SELECT name, avatar FROM users WHERE id = $1`, [userId]);
        const messageData = {
            ...result.rows[0],
            sender_name: userResult.rows[0]?.name,
            sender_avatar: userResult.rows[0]?.avatar
        };

        // Emit to room via Socket.io
        sendToCompany(companyId, 'chat:message', { roomId, message: messageData });

        res.status(201).json({ success: true, data: messageData });
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ success: false, error: "Failed to send message" });
    }
});

// Mark messages as read
router.put('/rooms/:roomId/read', authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId } = req.user;

        await pool.query(
            `UPDATE chat_messages SET is_read = true WHERE room_id = $1 AND sender_id != $2`,
            [roomId, userId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Error marking as read:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
});

export default router;
