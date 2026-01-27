// src/services/emailTemplateService.js - Email Template Service
import { query } from "../db/pool.js";
import { sendEmail } from "../utils/mailer.js";

/**
 * Get all templates for a company (including system defaults)
 */
export async function getTemplates(companyId, category = null) {
    let sql = `
    SELECT * FROM email_templates 
    WHERE (company_id = $1 OR company_id IS NULL)
    AND is_active = true
  `;
    const params = [companyId];

    if (category) {
        sql += ` AND category = $2`;
        params.push(category);
    }

    sql += ` ORDER BY is_default DESC, name ASC`;

    const result = await query(sql, params);
    return result.rows;
}

/**
 * Get a single template by slug
 */
export async function getTemplateBySlug(slug, companyId = null) {
    const result = await query(
        `SELECT * FROM email_templates 
     WHERE slug = $1 AND (company_id = $2 OR company_id IS NULL)
     ORDER BY company_id DESC NULLS LAST
     LIMIT 1`,
        [slug, companyId]
    );
    return result.rows[0];
}

/**
 * Get template by ID
 */
export async function getTemplateById(id) {
    const result = await query(
        `SELECT * FROM email_templates WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}

/**
 * Create a new template (company-specific)
 */
export async function createTemplate(companyId, templateData) {
    const { name, slug, subject, body, variables = [], category = 'general' } = templateData;

    const result = await query(
        `INSERT INTO email_templates (company_id, name, slug, subject, body, variables, category)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
        [companyId, name, slug, subject, body, JSON.stringify(variables), category]
    );
    return result.rows[0];
}

/**
 * Update an existing template
 */
export async function updateTemplate(id, companyId, updates) {
    const { name, subject, body, variables, category, is_active } = updates;

    const result = await query(
        `UPDATE email_templates 
     SET name = COALESCE($1, name),
         subject = COALESCE($2, subject),
         body = COALESCE($3, body),
         variables = COALESCE($4, variables),
         category = COALESCE($5, category),
         is_active = COALESCE($6, is_active),
         updated_at = NOW()
     WHERE id = $7 AND company_id = $8
     RETURNING *`,
        [name, subject, body, variables ? JSON.stringify(variables) : null, category, is_active, id, companyId]
    );
    return result.rows[0];
}

/**
 * Delete a template (soft delete by deactivating)
 */
export async function deleteTemplate(id, companyId) {
    const result = await query(
        `UPDATE email_templates SET is_active = false WHERE id = $1 AND company_id = $2 RETURNING *`,
        [id, companyId]
    );
    return result.rows[0];
}

/**
 * Replace variables in template
 */
export function renderTemplate(template, variables) {
    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value || '');
        body = body.replace(regex, value || '');
    }

    return { subject, body };
}

/**
 * Send email using template
 */
export async function sendTemplatedEmail(slug, recipientEmail, recipientName, variables, companyId = null) {
    // Get the template
    const template = await getTemplateBySlug(slug, companyId);

    if (!template) {
        throw new Error(`Template "${slug}" not found`);
    }

    // Render the template
    const { subject, body } = renderTemplate(template, variables);

    // Log the email
    const logResult = await query(
        `INSERT INTO email_logs (company_id, template_id, recipient_email, recipient_name, subject, body, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING id`,
        [companyId, template.id, recipientEmail, recipientName, subject, body]
    );
    const logId = logResult.rows[0].id;

    try {
        // Send the email
        await sendEmail({ to: recipientEmail, subject, htmlContent: body });

        // Update log status
        await query(
            `UPDATE email_logs SET status = 'sent' WHERE id = $1`,
            [logId]
        );

        return { success: true, logId };
    } catch (error) {
        // Log the error
        await query(
            `UPDATE email_logs SET status = 'failed', error_message = $1 WHERE id = $2`,
            [error.message, logId]
        );

        throw error;
    }
}

/**
 * Get email logs for a company
 */
export async function getEmailLogs(companyId, options = {}) {
    const { limit = 50, offset = 0, status = null, recipientEmail = null } = options;

    let sql = `
    SELECT el.*, et.name as template_name 
    FROM email_logs el
    LEFT JOIN email_templates et ON el.template_id = et.id
    WHERE el.company_id = $1
  `;
    const params = [companyId];
    let paramIndex = 2;

    if (status) {
        sql += ` AND el.status = $${paramIndex++}`;
        params.push(status);
    }

    if (recipientEmail) {
        sql += ` AND el.recipient_email ILIKE $${paramIndex++}`;
        params.push(`%${recipientEmail}%`);
    }

    sql += ` ORDER BY el.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
}

/**
 * Track email open (for tracking pixel)
 */
export async function trackEmailOpen(logId) {
    await query(
        `UPDATE email_logs SET status = 'opened', opened_at = NOW() WHERE id = $1 AND opened_at IS NULL`,
        [logId]
    );
}

/**
 * Track link click
 */
export async function trackEmailClick(logId) {
    await query(
        `UPDATE email_logs SET clicked_at = NOW() WHERE id = $1`,
        [logId]
    );
}

/**
 * Get available template categories
 */
export function getCategories() {
    return [
        { value: 'auth', label: 'Authentication' },
        { value: 'hr', label: 'HR & Employees' },
        { value: 'finance', label: 'Finance & Invoices' },
        { value: 'inventory', label: 'Inventory' },
        { value: 'crm', label: 'CRM & Sales' },
        { value: 'notifications', label: 'Notifications' },
        { value: 'general', label: 'General' }
    ];
}

export default {
    getTemplates,
    getTemplateBySlug,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    renderTemplate,
    sendTemplatedEmail,
    getEmailLogs,
    trackEmailOpen,
    trackEmailClick,
    getCategories
};
