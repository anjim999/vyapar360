// src/routes/calendar.js
import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get events for a date range
router.get('/events', authMiddleware, async (req, res) => {
    try {
        const { userId, companyId } = req.user;
        const { start, end } = req.query;

        // Ensure table exists (one-time creation)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS calendar_events (
                id SERIAL PRIMARY KEY,
                company_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                start_time TIME,
                end_time TIME,
                location VARCHAR(255),
                type VARCHAR(50) DEFAULT 'meeting',
                color VARCHAR(20) DEFAULT '#3b82f6',
                is_company_wide BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Hybrid approach: Show company-wide events to everyone, private events only to creator
        const result = await pool.query(
            `SELECT id, company_id, user_id, title, description,
                    TO_CHAR(date, 'YYYY-MM-DD') as date,
                    TO_CHAR(start_time, 'HH24:MI') as start_time,
                    TO_CHAR(end_time, 'HH24:MI') as end_time,
                    location, type, color, is_company_wide, created_at, updated_at
             FROM calendar_events 
             WHERE company_id = $1 
             AND (is_company_wide = true OR user_id = $2)
             AND date >= $3::date AND date <= $4::date
             ORDER BY date, start_time`,
            [companyId, userId, start, end]
        );

        // Disable caching to ensure fresh data
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Get calendar events error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
});

// Create event
router.post('/events', authMiddleware, async (req, res) => {
    try {
        const { userId, companyId } = req.user;
        const { title, description, date, start_time, end_time, location, type, color, is_company_wide = true } = req.body;

        const result = await pool.query(
            `INSERT INTO calendar_events 
             (company_id, user_id, title, description, date, start_time, end_time, location, type, color, is_company_wide)
             VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11)
             RETURNING id, company_id, user_id, title, description, 
                       TO_CHAR(date, 'YYYY-MM-DD') as date, 
                       TO_CHAR(start_time, 'HH24:MI') as start_time,
                       TO_CHAR(end_time, 'HH24:MI') as end_time,
                       location, type, color, is_company_wide, created_at, updated_at`,
            [companyId, userId, title, description, date, start_time, end_time, location, type, color, is_company_wide]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Create calendar event error:', err);
        res.status(500).json({ success: false, error: 'Failed to create event' });
    }
});

// Update event
router.put('/events/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, companyId } = req.user;
        const { title, description, date, start_time, end_time, location, type, color } = req.body;

        const result = await pool.query(
            `UPDATE calendar_events 
             SET title = $1, description = $2, date = $3::date, start_time = $4, 
                 end_time = $5, location = $6, type = $7, color = $8, updated_at = NOW()
             WHERE id = $9 AND company_id = $10 AND user_id = $11
             RETURNING id, company_id, user_id, title, description,
                       TO_CHAR(date, 'YYYY-MM-DD') as date,
                       TO_CHAR(start_time, 'HH24:MI') as start_time,
                       TO_CHAR(end_time, 'HH24:MI') as end_time,
                       location, type, color, is_company_wide, created_at, updated_at`,
            [title, description, date, start_time, end_time, location, type, color, id, companyId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Update calendar event error:', err);
        res.status(500).json({ success: false, error: 'Failed to update event' });
    }
});

// Delete event
router.delete('/events/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, companyId } = req.user;

        await pool.query(
            `DELETE FROM calendar_events WHERE id = $1 AND company_id = $2 AND user_id = $3`,
            [id, companyId, userId]
        );

        res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
        console.error('Delete calendar event error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
});

export default router;
