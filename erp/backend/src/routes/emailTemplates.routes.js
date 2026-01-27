// src/routes/emailTemplates.routes.js - Email Template Routes
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import * as controller from "../controllers/emailTemplateController.js";

const router = express.Router();

// Public route for email tracking (no auth)
router.get("/track/:logId/open", controller.trackOpen);

// All other routes require authentication
router.use(authMiddleware);

// Get all templates
router.get("/", controller.getTemplates);

// Get email logs
router.get("/logs", controller.getEmailLogs);

// Get single template
router.get("/:id", controller.getTemplate);

// Create template
router.post("/", controller.createTemplate);

// Preview template
router.post("/:id/preview", controller.previewTemplate);

// Send test email
router.post("/:id/send-test", controller.sendTestEmail);

// Update template
router.put("/:id", controller.updateTemplate);

// Delete template
router.delete("/:id", controller.deleteTemplate);

export default router;
