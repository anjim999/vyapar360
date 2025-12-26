// src/routes/reviews.js - Reviews & Ratings API
import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a company
router.get('/company/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        const result = await pool.query(
            `SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.company_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC`,
            [companyId]
        );

        // Calculate average rating
        const avgResult = await pool.query(
            `SELECT AVG(rating)::numeric(2,1) as avg_rating, COUNT(*) as total_reviews
       FROM reviews WHERE company_id = $1 AND is_approved = true`,
            [companyId]
        );

        res.json({
            success: true,
            data: result.rows,
            summary: {
                averageRating: parseFloat(avgResult.rows[0]?.avg_rating) || 0,
                totalReviews: parseInt(avgResult.rows[0]?.total_reviews) || 0
            }
        });
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ success: false, error: "Failed to fetch reviews" });
    }
});

// Create a review (authenticated)
router.post('/company/:companyId', authMiddleware, async (req, res) => {
    try {
        const { companyId } = req.params;
        const { userId } = req.user;
        const { rating, title, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: "Rating must be between 1 and 5" });
        }

        // Check if user already reviewed
        const existing = await pool.query(
            `SELECT id FROM reviews WHERE company_id = $1 AND user_id = $2`,
            [companyId, userId]
        );

        if (existing.rows.length > 0) {
            // Update existing review
            const result = await pool.query(
                `UPDATE reviews SET rating = $1, title = $2, comment = $3, updated_at = NOW()
         WHERE company_id = $4 AND user_id = $5 RETURNING *`,
                [rating, title, comment, companyId, userId]
            );
            return res.json({ success: true, data: result.rows[0], message: "Review updated" });
        }

        // Create new review
        const result = await pool.query(
            `INSERT INTO reviews (company_id, user_id, rating, title, comment, is_approved)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
            [companyId, userId, rating, title, comment]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error creating review:", err);
        res.status(500).json({ success: false, error: "Failed to create review" });
    }
});

// Delete review (own review only)
router.delete('/:reviewId', authMiddleware, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { userId } = req.user;

        await pool.query(
            `DELETE FROM reviews WHERE id = $1 AND user_id = $2`,
            [reviewId, userId]
        );

        res.json({ success: true, message: "Review deleted" });
    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).json({ success: false, error: "Failed to delete review" });
    }
});

export default router;
