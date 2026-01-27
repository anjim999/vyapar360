// src/controllers/emailTemplateController.js - Email Template Controller
import * as emailTemplateService from "../services/emailTemplateService.js";

/**
 * Get all templates for company
 * GET /api/email-templates
 */
export async function getTemplates(req, res) {
    try {
        const companyId = req.user?.companyId;
        const { category } = req.query;

        const templates = await emailTemplateService.getTemplates(companyId, category);

        res.json({
            success: true,
            templates,
            categories: emailTemplateService.getCategories()
        });
    } catch (error) {
        console.error("Get templates error:", error);
        res.status(500).json({ success: false, message: "Failed to get templates" });
    }
}

/**
 * Get a single template
 * GET /api/email-templates/:id
 */
export async function getTemplate(req, res) {
    try {
        const { id } = req.params;
        const template = await emailTemplateService.getTemplateById(id);

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        res.json({ success: true, template });
    } catch (error) {
        console.error("Get template error:", error);
        res.status(500).json({ success: false, message: "Failed to get template" });
    }
}

/**
 * Create a new template
 * POST /api/email-templates
 */
export async function createTemplate(req, res) {
    try {
        const companyId = req.user?.companyId;

        if (!companyId) {
            return res.status(403).json({ success: false, message: "Company required" });
        }

        const { name, slug, subject, body, variables, category } = req.body;

        if (!name || !slug || !subject || !body) {
            return res.status(400).json({
                success: false,
                message: "Name, slug, subject, and body are required"
            });
        }

        const template = await emailTemplateService.createTemplate(companyId, {
            name, slug, subject, body, variables, category
        });

        res.status(201).json({ success: true, template });
    } catch (error) {
        console.error("Create template error:", error);
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: "Template with this slug already exists" });
        }
        res.status(500).json({ success: false, message: "Failed to create template" });
    }
}

/**
 * Update a template
 * PUT /api/email-templates/:id
 */
export async function updateTemplate(req, res) {
    try {
        const companyId = req.user?.companyId;
        const { id } = req.params;

        if (!companyId) {
            return res.status(403).json({ success: false, message: "Company required" });
        }

        const template = await emailTemplateService.updateTemplate(id, companyId, req.body);

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        res.json({ success: true, template });
    } catch (error) {
        console.error("Update template error:", error);
        res.status(500).json({ success: false, message: "Failed to update template" });
    }
}

/**
 * Delete a template
 * DELETE /api/email-templates/:id
 */
export async function deleteTemplate(req, res) {
    try {
        const companyId = req.user?.companyId;
        const { id } = req.params;

        if (!companyId) {
            return res.status(403).json({ success: false, message: "Company required" });
        }

        const template = await emailTemplateService.deleteTemplate(id, companyId);

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        res.json({ success: true, message: "Template deleted" });
    } catch (error) {
        console.error("Delete template error:", error);
        res.status(500).json({ success: false, message: "Failed to delete template" });
    }
}

/**
 * Preview a template with variables
 * POST /api/email-templates/:id/preview
 */
export async function previewTemplate(req, res) {
    try {
        const { id } = req.params;
        const { variables = {} } = req.body;

        const template = await emailTemplateService.getTemplateById(id);

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        const rendered = emailTemplateService.renderTemplate(template, variables);

        res.json({
            success: true,
            preview: {
                subject: rendered.subject,
                body: rendered.body
            }
        });
    } catch (error) {
        console.error("Preview template error:", error);
        res.status(500).json({ success: false, message: "Failed to preview template" });
    }
}

/**
 * Send a test email using template
 * POST /api/email-templates/:id/send-test
 */
export async function sendTestEmail(req, res) {
    try {
        const companyId = req.user?.companyId;
        const { id } = req.params;
        const { recipientEmail, variables = {} } = req.body;

        if (!recipientEmail) {
            return res.status(400).json({ success: false, message: "Recipient email is required" });
        }

        const template = await emailTemplateService.getTemplateById(id);

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        // Add [TEST] prefix to subject
        const testTemplate = {
            ...template,
            subject: `[TEST] ${template.subject}`
        };

        const rendered = emailTemplateService.renderTemplate(testTemplate, variables);

        // Send using the service
        const { sendEmail } = await import("../utils/mailer.js");
        await sendEmail(recipientEmail, rendered.subject, rendered.body);

        res.json({ success: true, message: "Test email sent successfully" });
    } catch (error) {
        console.error("Send test email error:", error);
        res.status(500).json({ success: false, message: "Failed to send test email" });
    }
}

/**
 * Get email logs
 * GET /api/email-templates/logs
 */
export async function getEmailLogs(req, res) {
    try {
        const companyId = req.user?.companyId;
        const { limit = 50, offset = 0, status, email } = req.query;

        if (!companyId) {
            return res.status(403).json({ success: false, message: "Company required" });
        }

        const logs = await emailTemplateService.getEmailLogs(companyId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            status,
            recipientEmail: email
        });

        res.json({ success: true, logs });
    } catch (error) {
        console.error("Get email logs error:", error);
        res.status(500).json({ success: false, message: "Failed to get email logs" });
    }
}

/**
 * Track email open (for tracking pixel)
 * GET /api/email-templates/track/:logId/open
 */
export async function trackOpen(req, res) {
    try {
        const { logId } = req.params;
        await emailTemplateService.trackEmailOpen(logId);

        // Return a 1x1 transparent GIF
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.set('Content-Type', 'image/gif');
        res.send(pixel);
    } catch (error) {
        console.error("Track open error:", error);
        res.status(200).send(); // Don't expose errors
    }
}

export default {
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    previewTemplate,
    sendTestEmail,
    getEmailLogs,
    trackOpen
};
