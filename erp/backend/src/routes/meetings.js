// src/routes/meetings.js - Meeting Links API
import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// Get meetings for a project
router.get('/project/:projectId', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;

        const result = await pool.query(
            `SELECT m.*, u.name as created_by_name
       FROM meetings m
       LEFT JOIN users u ON m.created_by = u.id
       WHERE m.project_id = $1
       ORDER BY m.scheduled_at DESC`,
            [projectId]
        );

        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching meetings:", err);
        res.status(500).json({ success: false, error: "Failed to fetch meetings" });
    }
});

// Get all upcoming meetings for user
router.get('/upcoming', authMiddleware, requireCompany, async (req, res) => {
    try {
        const { companyId } = req.user;

        const result = await pool.query(
            `SELECT m.*, p.name as project_name, u.name as created_by_name
       FROM meetings m
       LEFT JOIN projects p ON m.project_id = p.id
       LEFT JOIN users u ON m.created_by = u.id
       WHERE m.company_id = $1 AND m.scheduled_at >= NOW()
       ORDER BY m.scheduled_at ASC
       LIMIT 20`,
            [companyId]
        );

        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching meetings:", err);
        res.status(500).json({ success: false, error: "Failed to fetch meetings" });
    }
});

// Create meeting
router.post('/', authMiddleware, requireCompany, async (req, res) => {
    try {
        const { userId, companyId } = req.user;
        const { title, description, meeting_link, platform, scheduled_at, duration_minutes, project_id, attendees } = req.body;

        if (!title || !meeting_link || !scheduled_at) {
            return res.status(400).json({ success: false, error: "Title, meeting link, and scheduled time are required" });
        }

        const result = await pool.query(
            `INSERT INTO meetings (company_id, project_id, title, description, meeting_link, platform, scheduled_at, duration_minutes, attendees, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [companyId, project_id, title, description, meeting_link, platform || 'other', scheduled_at, duration_minutes || 60, attendees || [], userId]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error creating meeting:", err);
        res.status(500).json({ success: false, error: "Failed to create meeting" });
    }
});

// Update meeting
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, meeting_link, platform, scheduled_at, duration_minutes, attendees, status } = req.body;

        const result = await pool.query(
            `UPDATE meetings SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        meeting_link = COALESCE($3, meeting_link),
        platform = COALESCE($4, platform),
        scheduled_at = COALESCE($5, scheduled_at),
        duration_minutes = COALESCE($6, duration_minutes),
        attendees = COALESCE($7, attendees),
        status = COALESCE($8, status),
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
            [title, description, meeting_link, platform, scheduled_at, duration_minutes, attendees, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Meeting not found" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error updating meeting:", err);
        res.status(500).json({ success: false, error: "Failed to update meeting" });
    }
});

// Delete meeting
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(`DELETE FROM meetings WHERE id = $1`, [id]);

        res.json({ success: true, message: "Meeting deleted" });
    } catch (err) {
        console.error("Error deleting meeting:", err);
        res.status(500).json({ success: false, error: "Failed to delete meeting" });
    }
});

export default router;
