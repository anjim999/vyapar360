// src/routes/account.js
import express from 'express';
import * as emailChangeController from '../controllers/auth/emailChangeController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/account/profile - Get user profile
router.get("/profile", (req, res) => {
    // req.user is set by authMiddleware
    res.json({
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        companyId: req.user.companyId
    });
});

router.post("/change-email", emailChangeController.changeEmail);
router.post("/change-password", emailChangeController.changePassword);

export default router;
