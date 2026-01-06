// src/routes/bot.routes.js - AI Bot Routes
import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { chat, getInsights, getSuggestions } from "../controllers/botController.js";

const router = express.Router();

// All bot routes require authentication
router.use(authenticateToken);

/**
 * POST /api/bot/chat
 * Send a message to the AI bot
 */
router.post("/chat", chat);

/**
 * GET /api/bot/insights
 * Get quick insights for dashboard
 */
router.get("/insights", getInsights);

/**
 * GET /api/bot/suggestions
 * Get suggested questions based on user role
 */
router.get("/suggestions", getSuggestions);

export default router;
