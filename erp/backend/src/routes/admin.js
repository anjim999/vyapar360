// src/routes/admin.js
import express from 'express';
import * as adminController from '../controllers/admin/adminController.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);
router.use(requireAdmin);

// Existing routes that match the controller
// Existing routes that match the controller
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.get("/audit-logs", adminController.getAuditLogs);
router.get("/integrations", adminController.getIntegrations);
router.post("/integrations/test", adminController.testIntegration);

// New Routes
router.get("/analytics", adminController.getAnalytics);
router.get("/companies", adminController.getCompanies);
router.get("/support", adminController.getSupportTickets);

export default router;
