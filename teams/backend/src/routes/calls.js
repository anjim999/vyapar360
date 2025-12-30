// teams/backend/src/routes/calls.js - Call History API
import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Ensure call_history table exists (run once on startup)
const ensureTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS call_history (
                id SERIAL PRIMARY KEY,
                company_id INTEGER NOT NULL,
                caller_id INTEGER NOT NULL,
                receiver_id INTEGER,
                channel_id INTEGER,
                call_type VARCHAR(20) NOT NULL DEFAULT 'video',
                status VARCHAR(20) NOT NULL DEFAULT 'initiated',
                duration_seconds INTEGER DEFAULT 0,
                started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                ended_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_call_history_company ON call_history(company_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_call_history_caller ON call_history(caller_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_call_history_receiver ON call_history(receiver_id)`);
        console.log('✅ call_history table ensured');
        return true;
    } catch (err) {
        console.error('Error ensuring call_history table:', err.message);
        return false;
    }
};
ensureTable();

// Debug endpoint to manually create table and check status
router.get('/setup', async (req, res) => {
    try {
        const created = await ensureTable();
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'call_history'
            )
        `);
        res.json({
            success: true,
            tableExists: tableCheck.rows[0].exists,
            message: created ? 'Table created/verified' : 'Table creation attempted'
        });
    } catch (error) {
        console.error('Error in setup:', error);
        res.status(500).json({ error: 'Failed to setup table', details: error.message });
    }
});

// Get call history for current user
router.get('/history', async (req, res) => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;
        const { limit = 50, offset = 0 } = req.query;

        const result = await pool.query(`
            SELECT 
                ch.*,
                caller.name as caller_name,
                caller.email as caller_email,
                receiver.name as receiver_name,
                receiver.email as receiver_email
            FROM call_history ch
            LEFT JOIN users caller ON ch.caller_id = caller.id
            LEFT JOIN users receiver ON ch.receiver_id = receiver.id
            WHERE ch.company_id = $1 
              AND (ch.caller_id = $2 OR ch.receiver_id = $2)
            ORDER BY ch.started_at DESC
            LIMIT $3 OFFSET $4
        `, [companyId, userId, limit, offset]);

        res.json({
            success: true,
            calls: result.rows
        });
    } catch (error) {
        console.error('Error fetching call history:', error);
        res.status(500).json({ error: 'Failed to fetch call history' });
    }
});

// Log a new call
router.post('/log', async (req, res) => {
    try {
        const { callerId, receiverId, callType, status, duration, channelId } = req.body;
        const companyId = req.user?.companyId;

        const result = await pool.query(`
            INSERT INTO call_history (
                company_id, caller_id, receiver_id, call_type, status, duration_seconds, channel_id, started_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING *
        `, [companyId, callerId, receiverId, callType, status, duration || 0, channelId || null]);

        res.json({
            success: true,
            call: result.rows[0]
        });
    } catch (error) {
        console.error('Error logging call:', error);
        res.status(500).json({ error: 'Failed to log call' });
    }
});

// Update call status by call ID
router.patch('/:callId', async (req, res) => {
    try {
        const { callId } = req.params;
        const { status, duration } = req.body;

        // Update without company filter to allow both parties to update
        const result = await pool.query(`
            UPDATE call_history 
            SET status = COALESCE($1, status),
                duration_seconds = COALESCE($2, duration_seconds),
                ended_at = CASE WHEN $1 IN ('completed', 'declined', 'missed') THEN NOW() ELSE ended_at END
            WHERE id = $3
            RETURNING *
        `, [status, duration, callId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Call not found' });
        }

        res.json({
            success: true,
            call: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating call:', error);
        res.status(500).json({ error: 'Failed to update call' });
    }
});

// Update most recent call between two users (for receiver who doesn't have call ID)
router.patch('/by-users/:callerId/:receiverId', async (req, res) => {
    try {
        const { callerId, receiverId } = req.params;
        const { status, duration } = req.body;

        // Find and update the most recent pending call between these users
        const result = await pool.query(`
            UPDATE call_history 
            SET status = COALESCE($1, status),
                duration_seconds = COALESCE($2, duration_seconds),
                ended_at = CASE WHEN $1 IN ('completed', 'declined', 'missed') THEN NOW() ELSE ended_at END
            WHERE id = (
                SELECT id FROM call_history 
                WHERE caller_id = $3 AND receiver_id = $4 
                AND status IN ('initiated', 'ringing', 'answered')
                ORDER BY started_at DESC LIMIT 1
            )
            RETURNING *
        `, [status, duration, callerId, receiverId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No active call found between users' });
        }

        res.json({
            success: true,
            call: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating call by users:', error);
        res.status(500).json({ error: 'Failed to update call' });
    }
});

// Get call statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;

        const result = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE caller_id = $1) as outgoing_calls,
                COUNT(*) FILTER (WHERE receiver_id = $1) as incoming_calls,
                COUNT(*) FILTER (WHERE status = 'missed' AND receiver_id = $1) as missed_calls,
                COUNT(*) FILTER (WHERE call_type = 'video') as video_calls,
                COUNT(*) FILTER (WHERE call_type = 'audio') as audio_calls,
                COALESCE(SUM(duration_seconds), 0) as total_duration_seconds
            FROM call_history
            WHERE company_id = $2 AND (caller_id = $1 OR receiver_id = $1)
        `, [userId, companyId]);

        res.json({
            success: true,
            stats: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching call stats:', error);
        res.status(500).json({ error: 'Failed to fetch call stats' });
    }
});

export default router;

