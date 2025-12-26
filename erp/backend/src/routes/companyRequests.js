// src/routes/companyRequests.js
import express from 'express';
import * as companyRequestController from '../controllers/marketplace/companyRequestController.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post("/submit", authMiddleware, companyRequestController.submitCompanyRequest);
router.get("/my-requests", authMiddleware, companyRequestController.getMyCompanyRequests);

// Admin routes
router.get("/all", authMiddleware, requireAdmin, companyRequestController.getAllCompanyRequests);
router.post("/:id/approve", authMiddleware, requireAdmin, companyRequestController.approveCompanyRequest);
router.post("/:id/reject", authMiddleware, requireAdmin, companyRequestController.rejectCompanyRequest);

export default router;
