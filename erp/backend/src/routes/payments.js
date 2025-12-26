// src/routes/payments.js - Razorpay Payment Integration
import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireCompany } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Razorpay test credentials (replace with env vars in production)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_demo';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'demo_secret';

// Create order
router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt, notes } = req.body;
        const { userId, companyId } = req.user;

        if (!amount || amount < 1) {
            return res.status(400).json({ success: false, error: "Invalid amount" });
        }

        // In real implementation, call Razorpay API
        // For demo, we create a mock order
        const orderId = 'order_' + crypto.randomBytes(8).toString('hex');

        // Save order to database
        const result = await pool.query(
            `INSERT INTO payment_orders (order_id, user_id, company_id, amount, currency, status, notes)
       VALUES ($1, $2, $3, $4, $5, 'created', $6) RETURNING *`,
            [orderId, userId, companyId, amount, currency, JSON.stringify(notes)]
        );

        res.json({
            success: true,
            data: {
                id: orderId,
                amount: amount * 100, // Razorpay expects paise
                currency,
                receipt,
                key: RAZORPAY_KEY_ID
            }
        });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ success: false, error: "Failed to create order" });
    }
});

// Verify payment
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            // Update payment status
            await pool.query(
                `UPDATE payment_orders SET status = 'paid', payment_id = $1, updated_at = NOW()
         WHERE order_id = $2`,
                [razorpay_payment_id, razorpay_order_id]
            );

            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, error: "Payment verification failed" });
        }
    } catch (err) {
        console.error("Error verifying payment:", err);
        res.status(500).json({ success: false, error: "Failed to verify payment" });
    }
});

// Get payment history
router.get('/history', authMiddleware, requireCompany, async (req, res) => {
    try {
        const { companyId } = req.user;

        const result = await pool.query(
            `SELECT * FROM payment_orders WHERE company_id = $1 ORDER BY created_at DESC`,
            [companyId]
        );

        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ success: false, error: "Failed to fetch payments" });
    }
});

export default router;
