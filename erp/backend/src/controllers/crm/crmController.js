// src/controllers/crmController.js
import pool from "../../db/pool.js";

// ============================================
// LEADS
// ============================================

export async function getLeads(req, res) {
    try {
        const { companyId } = req.user;
        const { status, source, search } = req.query;

        let query = `
      SELECT l.*, u.name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.company_id = $1
    `;
        const params = [companyId];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND l.status = $${paramCount}`;
            params.push(status);
        }
        if (source) {
            paramCount++;
            query += ` AND l.source = $${paramCount}`;
            params.push(source);
        }
        if (search) {
            paramCount++;
            query += ` AND (LOWER(l.name) LIKE LOWER($${paramCount}) OR LOWER(l.email) LIKE LOWER($${paramCount}))`;
            params.push(`%${search}%`);
        }
        query += ` ORDER BY l.created_at DESC`;

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function createLead(req, res) {
    try {
        const { companyId, userId } = req.user;
        const { name, email, phone, company_name, source, notes, assigned_to } = req.body;

        const result = await pool.query(
            `INSERT INTO leads (company_id, name, email, phone, company_name, source, notes, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [companyId, name, email, phone, company_name, source || 'other', notes, assigned_to, userId]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function updateLead(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const data = req.body;

        const result = await pool.query(
            `UPDATE leads SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone),
       company_name = COALESCE($4, company_name), status = COALESCE($5, status), source = COALESCE($6, source),
       notes = COALESCE($7, notes), assigned_to = COALESCE($8, assigned_to), updated_at = NOW()
       WHERE id = $9 AND company_id = $10 RETURNING *`,
            [data.name, data.email, data.phone, data.company_name, data.status, data.source, data.notes, data.assigned_to, id, companyId]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: "Not found" });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function deleteLead(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        await pool.query(`DELETE FROM leads WHERE id = $1 AND company_id = $2`, [id, companyId]);
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

// ============================================
// LEAD ACTIVITIES
// ============================================

export async function getLeadActivities(req, res) {
    try {
        const { companyId } = req.user;
        const { lead_id } = req.params;

        const result = await pool.query(
            `SELECT la.*, u.name as user_name FROM lead_activities la
       LEFT JOIN users u ON la.user_id = u.id
       WHERE la.lead_id = $1 ORDER BY la.created_at DESC`,
            [lead_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function addLeadActivity(req, res) {
    try {
        const { userId } = req.user;
        const { lead_id } = req.params;
        const { type, description, scheduled_at } = req.body;

        const result = await pool.query(
            `INSERT INTO lead_activities (lead_id, user_id, type, description, scheduled_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [lead_id, userId, type, description, scheduled_at]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}
