// src/routes/marketplace.js
import express from 'express';
import * as marketplaceController from '../controllers/marketplace/marketplaceController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// CONTACT REQUESTS
// ============================================

// Get contact requests (works for both customers and company users)
router.get("/requests", authMiddleware, marketplaceController.getContactRequests);

// Send contact request (any authenticated user)
router.post("/requests", authMiddleware, marketplaceController.sendContactRequest);

// Reply to request (company only)
router.post("/requests/:id/reply", authMiddleware, requireRoles("company_admin", "sales_manager"), marketplaceController.replyToRequest);

// Update request status (company only)
router.put("/requests/:id/status", authMiddleware, requireRoles("company_admin", "sales_manager"), marketplaceController.updateRequestStatus);

// ============================================
// REVIEWS
// ============================================

// Get company reviews (public)
router.get("/reviews/:company_id", marketplaceController.getCompanyReviews);

// Add review (customer only)
router.post("/reviews", authMiddleware, requireRoles("customer"), marketplaceController.addReview);

// ============================================
// SAVED COMPANIES (Customer favorites)
// ============================================

// Get saved companies
router.get("/saved", authMiddleware, requireRoles("customer"), marketplaceController.getSavedCompanies);

// Save company
router.post("/saved", authMiddleware, requireRoles("customer"), marketplaceController.saveCompany);

// Unsave company
router.delete("/saved/:company_id", authMiddleware, requireRoles("customer"), marketplaceController.unsaveCompany);

// ============================================
// SUPPORT / HELP
// ============================================

// Submit support ticket
router.post("/support", authMiddleware, marketplaceController.submitSupportTicket);

export default router;
