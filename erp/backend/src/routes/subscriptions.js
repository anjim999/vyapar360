// src/routes/subscriptions.js
import express from 'express';
import { authMiddleware, requireCompany } from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import * as subscriptionController from '../controllers/subscription/subscriptionController.js';

const router = express.Router();

// Role check for subscription management (purchase/cancel/modify)
// Only company_admin, hr_manager, and manager can manage subscriptions
const canManageSubscription = requireRole('company_admin', 'hr', 'hr_manager', 'manager');

// =====================================================
// PUBLIC ROUTES (No auth required)
// =====================================================

// Get all plans (public - for pricing page)
router.get('/plans', subscriptionController.getPlans);

// Razorpay webhook (no auth, verified by signature)
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

// =====================================================
// PROTECTED ROUTES (Auth required)
// =====================================================

// Get current subscription
router.get('/current', authMiddleware, requireCompany, subscriptionController.getCurrentSubscription);

// Check feature access
router.get('/feature/:feature', authMiddleware, requireCompany, subscriptionController.checkFeature);

// Get payment history
router.get('/payments', authMiddleware, requireCompany, subscriptionController.getPaymentHistory);

// Create payment order for subscription (admin/hr/manager only)
router.post('/create-order', authMiddleware, requireCompany, canManageSubscription, subscriptionController.createOrder);

// Verify payment after Razorpay checkout (admin/hr/manager only)
router.post('/verify-payment', authMiddleware, requireCompany, canManageSubscription, subscriptionController.verifyPayment);

// Upgrade to free plan (admin/hr/manager only)
router.post('/upgrade-free', authMiddleware, requireCompany, canManageSubscription, subscriptionController.upgradeFree);

// Get subscription summary
router.get('/summary', authMiddleware, requireCompany, subscriptionController.getSubscriptionSummary);

// Cancel subscription (admin/hr/manager only)
router.post('/cancel', authMiddleware, requireCompany, canManageSubscription, subscriptionController.cancelSubscription);

// Reactivate subscription (admin/hr/manager only)
router.post('/reactivate', authMiddleware, requireCompany, canManageSubscription, subscriptionController.reactivateSubscription);

// Change billing cycle (admin/hr/manager only)
router.post('/change-billing-cycle', authMiddleware, requireCompany, canManageSubscription, subscriptionController.changeBillingCycle);

export default router;
