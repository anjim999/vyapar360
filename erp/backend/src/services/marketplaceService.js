// backend/src/services/marketplaceService.js
import pool from "../db/pool.js";

export async function getContactRequestsByUser(userId, companyId, role, { status }) {
    let query, params;

    if (role === "customer") {
        query = `
        SELECT cr.*, c.name as company_name, c.logo as company_logo,
               c.industry as company_industry
        FROM contact_requests cr
        JOIN companies c ON cr.company_id = c.id
        WHERE cr.customer_id = $1
      `;
        params = [userId];
    } else {
        query = `
        SELECT cr.*, u.name as customer_name, u.email as customer_email
        FROM contact_requests cr
        JOIN users u ON cr.customer_id = u.id
        WHERE cr.company_id = $1
      `;
        params = [companyId];
    }

    if (status) {
        query += ` AND cr.status = $2`;
        params.push(status);
    }

    query += ` ORDER BY cr.created_at DESC`;

    const result = await pool.query(query, params);
    return { success: true, data: result.rows };
}

export async function sendNewContactRequest(userId, { company_id, subject, message, service_type, budget_range, urgency }) {
    const company = await pool.query(
        `SELECT id FROM companies WHERE id = $1 AND is_active = true`,
        [company_id]
    );

    if (company.rows.length === 0) {
        const error = new Error("Company not found");
        error.statusCode = 404;
        throw error;
    }

    const result = await pool.query(
        `INSERT INTO contact_requests 
        (customer_id, company_id, subject, message, service_type, budget_range, urgency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
        [userId, company_id, subject, message, service_type, budget_range, urgency || 'normal']
    );

    await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
       SELECT id, 'contact_request', 'New Contact Request', $1, '/requests'
       FROM users WHERE company_id = $2 AND role IN ('company_admin', 'sales_manager')`,
        [`New request: ${subject}`, company_id]
    );

    return { success: true, data: result.rows[0] };
}

export async function replyToContactRequest(companyId, userId, id, { reply_message, status }) {
    const result = await pool.query(
        `UPDATE contact_requests SET
        reply_message = $1,
        status = $2,
        replied_by = $3,
        replied_at = NOW(),
        updated_at = NOW()
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
        [reply_message, status || 'replied', userId, id, companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Request not found");
        error.statusCode = 404;
        throw error;
    }

    await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'contact_request', 'Request Update', $2, '/my-requests')`,
        [result.rows[0].customer_id, `Your request has been ${status}`]
    );

    return { success: true, data: result.rows[0] };
}

export async function updateContactRequestStatus(companyId, id, { status }) {
    const result = await pool.query(
        `UPDATE contact_requests SET
        status = $1,
        updated_at = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
        [status, id, companyId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Request not found");
        error.statusCode = 404;
        throw error;
    }

    return { success: true, data: result.rows[0] };
}

export async function getReviewsForCompany(company_id) {
    const result = await pool.query(
        `SELECT r.*, u.name as reviewer_name
       FROM company_reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.company_id = $1 AND r.is_visible = true
       ORDER BY r.created_at DESC`,
        [company_id]
    );
    return { success: true, data: result.rows };
}

export async function addCompanyReview(userId, { company_id, rating, title, review }) {
    const hasContact = await pool.query(
        `SELECT id FROM contact_requests 
       WHERE customer_id = $1 AND company_id = $2 AND status IN ('accepted', 'closed')`,
        [userId, company_id]
    );

    const isVerified = hasContact.rows.length > 0;

    const existing = await pool.query(
        `SELECT id FROM company_reviews WHERE customer_id = $1 AND company_id = $2`,
        [userId, company_id]
    );

    if (existing.rows.length > 0) {
        const error = new Error("You have already reviewed this company");
        error.statusCode = 400;
        throw error;
    }

    const result = await pool.query(
        `INSERT INTO company_reviews (company_id, customer_id, rating, title, review, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
        [company_id, userId, rating, title, review, isVerified]
    );

    await pool.query(
        `UPDATE companies SET
        rating = (SELECT AVG(rating) FROM company_reviews WHERE company_id = $1 AND is_visible = true),
        review_count = (SELECT COUNT(*) FROM company_reviews WHERE company_id = $1 AND is_visible = true)
       WHERE id = $1`,
        [company_id]
    );

    return { success: true, data: result.rows[0] };
}

export async function getUserSavedCompanies(userId) {
    const result = await pool.query(
        `SELECT c.id, c.name, c.slug, c.industry, c.logo, c.city, 
              c.rating, c.review_count, c.is_verified, sc.created_at as saved_at
       FROM saved_companies sc
       JOIN companies c ON sc.company_id = c.id
       WHERE sc.customer_id = $1 AND c.is_active = true
       ORDER BY sc.created_at DESC`,
        [userId]
    );
    return { success: true, data: result.rows };
}

export async function saveCompanyForUser(userId, { company_id }) {
    await pool.query(
        `INSERT INTO saved_companies (customer_id, company_id)
       VALUES ($1, $2)
       ON CONFLICT (customer_id, company_id) DO NOTHING`,
        [userId, company_id]
    );
    return { success: true, message: "Company saved successfully" };
}

export async function unsaveCompanyForUser(userId, company_id) {
    await pool.query(
        `DELETE FROM saved_companies WHERE customer_id = $1 AND company_id = $2`,
        [userId, company_id]
    );
    return { success: true, message: "Company removed from saved" };
}

export async function createSupportTicket(userId, { subject, message, category }) {
    await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
       SELECT id, 'support', 'New Support Ticket', $1, '/admin/support'
       FROM users WHERE role = 'platform_admin'`,
        [`${category}: ${subject}`]
    );

    return {
        success: true,
        message: "Support ticket submitted. Our team will contact you soon.",
        ticket_id: `TKT-${Date.now()}`
    };
}
