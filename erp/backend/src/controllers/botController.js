// src/controllers/botController.js - AI Bot Controller
import { processChat, processDataQuery, saveBotMessage, getBotHistory, clearBotHistory } from "../services/botService.js";

/**
 * Handle chat message
 * POST /api/bot/chat
 */
export async function chat(req, res) {
    try {
        const { message, context = {} } = req.body;
        const userId = req.user?.userId;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Add user info to context from auth
        const enrichedContext = {
            ...context,
            userId,
            userName: req.user?.name,
            role: req.user?.role,
            companyId: req.user?.companyId
        };

        const userMessage = message.trim();

        // Save user message to history
        if (userId) {
            await saveBotMessage(userId, 'user', userMessage);
        }

        // Process the message
        const result = await processChat(userMessage, enrichedContext);

        // If intent suggests data query, fetch real data
        if (result.intent?.startsWith('data:')) {
            const queryType = result.intent.split(':')[1];
            const queryMap = {
                'dashboard': 'dashboard_summary',
                'sales': 'sales_summary',
                'employees': 'employees_today',
                'leaves': 'pending_leaves',
                'inventory': 'low_stock',
                'overdue': 'overdue_invoices'
            };

            if (queryMap[queryType] && enrichedContext.companyId) {
                const dataResult = await processDataQuery(queryMap[queryType], enrichedContext);
                if (dataResult.summary) {
                    result.dataInsight = dataResult.summary;
                }
            }
        }

        // Save bot response to history
        if (userId) {
            await saveBotMessage(
                userId,
                'bot',
                result.response,
                result.intent,
                result.dataInsight || null,
                result.suggestions || []
            );
        }

        res.json({
            success: true,
            response: result.response,
            dataInsight: result.dataInsight || null,
            suggestions: result.suggestions || [],
            intent: result.intent
        });

    } catch (error) {
        console.error("Bot chat error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process message",
            error: error.message
        });
    }
}

/**
 * Get quick insights for dashboard
 * GET /api/bot/insights
 */
export async function getInsights(req, res) {
    try {
        const context = {
            userId: req.user?.userId,
            companyId: req.user?.companyId,
            role: req.user?.role
        };

        const insights = [];

        if (context.companyId) {
            // Fetch key metrics
            const [sales, attendance, overdue] = await Promise.all([
                processDataQuery('sales_summary', context),
                processDataQuery('employees_today', context),
                processDataQuery('overdue_invoices', context)
            ]);

            if (sales.summary) insights.push({ type: 'sales', text: sales.summary });
            if (attendance.summary) insights.push({ type: 'attendance', text: attendance.summary });
            if (overdue.summary) insights.push({ type: 'overdue', text: overdue.summary });
        }

        res.json({
            success: true,
            insights
        });

    } catch (error) {
        console.error("Bot insights error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get insights"
        });
    }
}

/**
 * Get suggested questions based on role
 * GET /api/bot/suggestions
 */
export async function getSuggestions(req, res) {
    try {
        const role = req.user?.role || 'employee';

        const suggestions = {
            common: [
                "What can you do?",
                "Show me today's summary",
                "Any pending approvals?"
            ],
            hr_manager: [
                "Show today's attendance",
                "Any pending leave requests?",
                "How many employees are on leave?"
            ],
            finance_manager: [
                "Show sales summary",
                "Any overdue invoices?",
                "What's our revenue this month?"
            ],
            inventory_manager: [
                "Show low stock items",
                "Any pending purchase orders?",
                "What's our stock value?"
            ],
            project_manager: [
                "Show active projects",
                "Any overdue tasks?",
                "Team workload summary"
            ],
            company_admin: [
                "Show business overview",
                "Any critical alerts?",
                "Pending approvals count"
            ],
            employee: [
                "My pending tasks",
                "My attendance this month",
                "My leave balance"
            ]
        };

        const roleSuggestions = suggestions[role] || suggestions.employee;

        res.json({
            success: true,
            suggestions: [...suggestions.common, ...roleSuggestions]
        });

    } catch (error) {
        console.error("Bot suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get suggestions"
        });
    }
}

/**
 * Get chat history for current user
 * GET /api/bot/history
 * Query params:
 *   - before: ISO timestamp to fetch messages before (for infinite scroll)
 *   - limit: Number of messages to fetch (default 50)
 */
export async function getHistory(req, res) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const before = req.query.before || null;
        const limit = parseInt(req.query.limit) || 50;

        const { messages, hasMore } = await getBotHistory(userId, limit, before);

        res.json({
            success: true,
            history: messages,
            hasMore
        });

    } catch (error) {
        console.error("Bot history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get chat history"
        });
    }
}

/**
 * Clear chat history for current user
 * DELETE /api/bot/history
 */
export async function deleteHistory(req, res) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        await clearBotHistory(userId);

        res.json({
            success: true,
            message: "Chat history cleared"
        });

    } catch (error) {
        console.error("Bot clear history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to clear chat history"
        });
    }
}

export default {
    chat,
    getInsights,
    getSuggestions,
    getHistory,
    deleteHistory
};
