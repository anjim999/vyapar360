// src/controllers/customerController.js
import pool from "../../db/pool.js";

export async function getCustomers(req, res) {
    try {
        const { companyId } = req.user;
        const result = await pool.query(
            `SELECT c.*, COUNT(DISTINCT o.id) as total_orders, COALESCE(SUM(o.total_amount), 0) as total_spent
       FROM customers c LEFT JOIN orders o ON c.id = o.customer_id AND o.company_id = $1
       WHERE c.company_id = $1 GROUP BY c.id ORDER BY c.id DESC`,
            [companyId]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function createCustomer(req, res) {
    try {
        const { companyId, userId } = req.user;
        const { name, email, phone, company_name, address, notes } = req.body;
        const result = await pool.query(
            `INSERT INTO customers (company_id, name, email, phone, company_name, address, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [companyId, name, email, phone, company_name, address, notes, userId]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function updateCustomer(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const { name, email, phone, company_name, address, notes, is_active } = req.body;
        const result = await pool.query(
            `UPDATE customers SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone),
       company_name = COALESCE($4, company_name), address = COALESCE($5, address), notes = COALESCE($6, notes),
       is_active = COALESCE($7, is_active), updated_at = NOW()
       WHERE id = $8 AND company_id = $9 RETURNING *`,
            [name, email, phone, company_name, address, notes, is_active, id, companyId]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: "Not found" });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function deleteCustomer(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        await pool.query(`DELETE FROM customers WHERE id = $1 AND company_id = $2`, [id, companyId]);
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}
