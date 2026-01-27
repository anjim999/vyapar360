// src/services/botService.js - AI Bot Service using Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env.js";
import { query } from "../db/pool.js";

// Initialize Gemini
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Get Gemini model with fallback support
 */
function getGeminiModel() {
    try {
        // Using lite version as primary - has separate quota pool
        return genAI.getGenerativeModel(
            { model: "gemini-2.5-flash-lite", apiVersion: "v1" },
            { retry: false }
        );
    } catch {
        // Fallback to standard flash version
        return genAI.getGenerativeModel(
            { model: "gemini-2.5-flash", apiVersion: "v1" },
            { retry: false }
        );
    }
}

/**
 * Generate content with retry logic for transient errors (503, 429)
 */
async function generateWithRetry(model, prompt, maxRetries = 3) {
    let delay = 2000; // Start with 2 second delay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await model.generateContent(prompt);
        } catch (err) {
            const msg = err?.message || "";
            const isRetryable = msg.includes("503") || msg.includes("429") || msg.includes("overloaded");

            if (!isRetryable || attempt === maxRetries) {
                throw err;
            }

            console.warn(
                `Gemini API error (attempt ${attempt}/${maxRetries}), retrying in ${delay / 1000}s...`
            );
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2; // Exponential backoff
        }
    }
}

/**
 * Role-specific system prompts for personalized AI experience
 */
const ROLE_PROMPTS = {
    platform_admin: {
        title: "Platform Administrator",
        focus: "Platform management, company onboarding, system health, and platform-wide analytics",
        capabilities: [
            "Review and approve new company registrations",
            "Monitor platform-wide metrics and health",
            "View all companies and users across the platform",
            "Handle platform support requests",
            "Manage platform configurations"
        ],
        quickActions: ["Pending company requests", "Platform metrics", "System alerts"]
    },
    company_admin: {
        title: "Company Administrator",
        focus: "Company-wide operations, team management, and business overview",
        capabilities: [
            "Manage all company employees and departments",
            "View comprehensive business dashboards",
            "Approve high-level requests (leaves, expenses)",
            "Configure company settings",
            "Access all ERP modules"
        ],
        quickActions: ["Business overview", "Pending approvals", "Team performance"]
    },
    hr_manager: {
        title: "HR Manager",
        focus: "Human resources, employee management, attendance, leaves, and payroll",
        capabilities: [
            "Manage employee records and onboarding",
            "Track attendance and leaves",
            "Approve leave requests",
            "Handle payroll and department management",
            "View HR analytics and reports"
        ],
        quickActions: ["Today's attendance", "Pending leave requests", "Employee count"]
    },
    finance_manager: {
        title: "Finance Manager",
        focus: "Financial operations, invoices, payments, expenses, and financial reports",
        capabilities: [
            "Create and manage invoices",
            "Track payments and receivables",
            "Manage expenses and budgets",
            "View financial reports and analytics",
            "Handle overdue invoice follow-ups"
        ],
        quickActions: ["Sales summary", "Overdue invoices", "Monthly revenue"]
    },
    inventory_manager: {
        title: "Inventory Manager",
        focus: "Stock management, products, purchase orders, and supply chain",
        capabilities: [
            "Manage product inventory",
            "Track stock levels and reorder points",
            "Create purchase orders",
            "Handle supplier management",
            "Monitor low stock alerts"
        ],
        quickActions: ["Low stock items", "Pending orders", "Stock value"]
    },
    project_manager: {
        title: "Project Manager",
        focus: "Project delivery, task management, team workload, and timelines",
        capabilities: [
            "Manage projects and milestones",
            "Assign and track tasks",
            "Monitor team workload",
            "Track project budgets and time logs",
            "Generate project reports"
        ],
        quickActions: ["Active projects", "Overdue tasks", "Team workload"]
    },
    employee: {
        title: "Team Member",
        focus: "Personal work, tasks, attendance, leaves, and team collaboration",
        capabilities: [
            "View and update personal tasks",
            "Mark attendance and apply for leaves",
            "View personal payslips and reports",
            "Collaborate with team via chat",
            "Track personal performance"
        ],
        quickActions: ["My tasks", "My attendance", "Apply for leave"]
    }
};

/**
 * Build personalized system prompt based on user role
 */
function buildSystemPrompt(context) {
    const { userName, role, companyName } = context;
    const roleConfig = ROLE_PROMPTS[role] || ROLE_PROMPTS.employee;
    const displayName = userName || "there";

    return `You are Vyapar360 AI Assistant, a highly intelligent and personalized business assistant.

## Current User Profile
- **Name**: ${displayName}
- **Role**: ${roleConfig.title}
- **Company**: ${companyName || "Not specified"}
- **Focus Area**: ${roleConfig.focus}

## Your Behavior for This User
1. **Address them personally** - Use "${displayName}" when appropriate
2. **Be role-aware** - Prioritize information relevant to their ${roleConfig.title} responsibilities
3. **Proactive insights** - Suggest actions based on their role's priorities
4. **Permission-aware** - Only suggest actions they have access to

## This User's Capabilities
${roleConfig.capabilities.map(c => `- ${c}`).join('\n')}

## Quick Actions They Often Need
${roleConfig.quickActions.map(a => `- "${a}"`).join('\n')}

## Available Modules in Vyapar360
- **Dashboard**: Business metrics and KPIs
- **HR Management**: Employees, Attendance, Leaves, Departments, Payroll
- **Finance**: Invoices, Payments, Expenses, Accounts, Reports
- **Inventory**: Products, Stock, Purchase Orders, Suppliers
- **Projects**: Project management, Tasks, Time logs, Milestones
- **CRM**: Leads, Customers, Contact Requests
- **Teams Chat**: Internal team communication

## Response Guidelines
- Be concise, helpful, and personalized
- Use bullet points and clear formatting
- Include navigation hints like "Go to HR → Employees"
- Format currency in Indian Rupees (₹)
- Be professional but warm - this is their personal AI assistant
- When showing data, provide context and insights
- Suggest next actions based on the data shown

## Important
- When the user asks for summaries or overviews, I will provide REAL data from their system
- Always be encouraging and supportive
- If data shows issues (overdue items, low stock), proactively highlight them
`;
}

/**
 * Process a chat message and return AI response
 */
export async function processChat(message, context = {}) {
    if (!genAI) {
        return {
            response: "AI Assistant is not configured. Please add GEMINI_API_KEY to environment variables.",
            intent: "error"
        };
    }

    try {
        // Build personalized system prompt based on user role
        const systemPrompt = buildSystemPrompt(context);
        const contextInfo = buildContextInfo(context);

        // Get the model with fallback support
        const model = getGeminiModel();

        // Create the prompt with role-aware context
        const prompt = `${systemPrompt}

Current Session Context:
${contextInfo}

User Message: ${message}

Provide a helpful, personalized response:`;

        // Generate response with retry logic
        const result = await generateWithRetry(model, prompt);
        const response = result.response.text();

        // Detect intent for potential actions
        const intent = detectIntent(message);

        return {
            response: response.trim(),
            intent,
            suggestions: getSuggestions(intent, context)
        };
    } catch (error) {
        console.error("Bot error:", error);

        // Handle quota exceeded (429) errors specifically
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
            // Try to extract retry delay from error details
            let retrySeconds = 60; // Default to 60 seconds
            if (error.errorDetails) {
                const retryInfo = error.errorDetails.find(d => d['@type']?.includes('RetryInfo'));
                if (retryInfo?.retryDelay) {
                    retrySeconds = parseInt(retryInfo.retryDelay) || 60;
                }
            }

            return {
                response: `⚠️ AI Assistant is temporarily unavailable due to API rate limits.\n\n**What happened:** The free tier quota for AI requests has been exceeded.\n\n**What to do:**\n• Wait ${retrySeconds} seconds and try again\n• For production use, consider upgrading to a paid Gemini API plan\n\nIn the meantime, you can:\n• Navigate the ERP modules manually\n• Check the Help section for guidance`,
                intent: "quota_exceeded",
                suggestions: ["Show dashboard", "Open HR module", "View invoices"]
            };
        }

        // Handle other API errors
        if (error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded')) {
            return {
                response: "🔄 The AI service is temporarily overloaded. Please try again in a few moments.",
                intent: "service_unavailable",
                suggestions: ["Retry in 30 seconds"]
            };
        }

        return {
            response: "I'm having trouble processing your request. Please try again later.",
            intent: "error"
        };
    }
}

/**
 * Process a command that requires database queries
 */
export async function processDataQuery(queryType, context) {
    try {
        const { userId, companyId, role } = context;
        let data = null;
        let summary = "";

        switch (queryType) {
            case "sales_summary":
                if (companyId) {
                    const result = await query(
                        `SELECT 
              COUNT(*) as total_invoices,
              COALESCE(SUM(amount_total), 0) as total_amount,
              COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
              COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
             FROM invoices 
             WHERE company_id = $1 
             AND created_at >= CURRENT_DATE - INTERVAL '30 days'`,
                        [companyId]
                    );
                    data = result.rows[0];
                    summary = `📊 Sales Summary (Last 30 Days):
• Total Invoices: ${data.total_invoices}
• Total Amount: ₹${Number(data.total_amount).toLocaleString()}
• Paid: ${data.paid_count}
• Pending: ${data.pending_count}`;
                }
                break;

            case "employees_today":
                if (companyId) {
                    const result = await query(
                        `SELECT 
              COUNT(*) as total,
              COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
              COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
              COUNT(CASE WHEN a.status = 'leave' THEN 1 END) as on_leave
             FROM users u
             LEFT JOIN attendance a ON u.id = a.user_id AND a.date = CURRENT_DATE
             WHERE u.company_id = $1 AND u.is_active = TRUE`,
                        [companyId]
                    );
                    data = result.rows[0];
                    summary = `👥 Today's Attendance:
• Total Employees: ${data.total}
• Present: ${data.present}
• Absent: ${data.absent}
• On Leave: ${data.on_leave}`;
                }
                break;

            case "pending_leaves":
                if (companyId) {
                    const result = await query(
                        `SELECT COUNT(*) as count 
             FROM leave_requests 
             WHERE company_id = $1 AND status = 'pending'`,
                        [companyId]
                    );
                    data = result.rows[0];
                    summary = `📋 Pending Leave Requests: ${data.count}`;
                }
                break;

            case "low_stock":
                if (companyId) {
                    const result = await query(
                        `SELECT name, current_stock, min_stock_level 
             FROM products 
             WHERE company_id = $1 AND current_stock <= min_stock_level
             LIMIT 5`,
                        [companyId]
                    );
                    data = result.rows;
                    if (data.length > 0) {
                        summary = `⚠️ Low Stock Items:\n${data.map(p => `• ${p.name}: ${p.current_stock} units`).join('\n')}`;
                    } else {
                        summary = "✅ All products are well stocked!";
                    }
                }
                break;

            case "overdue_invoices":
                if (companyId) {
                    const result = await query(
                        `SELECT invoice_number, amount_total, due_date 
             FROM invoices 
             WHERE company_id = $1 AND status = 'pending' AND due_date < CURRENT_DATE
             LIMIT 5`,
                        [companyId]
                    );
                    data = result.rows;
                    if (data.length > 0) {
                        summary = `⚠️ Overdue Invoices:\n${data.map(i => `• ${i.invoice_number}: ₹${Number(i.amount_total).toLocaleString()}`).join('\n')}`;
                    } else {
                        summary = "🎉 No overdue invoices!";
                    }
                }
                break;

            case "dashboard_summary":
                if (companyId) {
                    // Fetch comprehensive dashboard data
                    const [salesRes, attendanceRes, leavesRes, stockRes, overdueRes] = await Promise.all([
                        query(
                            `SELECT 
                                COUNT(*) as total_invoices,
                                COALESCE(SUM(amount_total), 0) as total_amount,
                                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
                             FROM invoices 
                             WHERE company_id = $1 
                             AND created_at >= CURRENT_DATE - INTERVAL '30 days'`,
                            [companyId]
                        ),
                        query(
                            `SELECT 
                                COUNT(*) as total,
                                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present
                             FROM users u
                             LEFT JOIN attendance a ON u.id = a.user_id AND a.date = CURRENT_DATE
                             WHERE u.company_id = $1 AND u.is_active = TRUE`,
                            [companyId]
                        ),
                        query(
                            `SELECT COUNT(*) as count 
                             FROM leave_requests 
                             WHERE company_id = $1 AND status = 'pending'`,
                            [companyId]
                        ),
                        query(
                            `SELECT COUNT(*) as count 
                             FROM products 
                             WHERE company_id = $1 AND current_stock <= min_stock_level`,
                            [companyId]
                        ),
                        query(
                            `SELECT COUNT(*) as count, COALESCE(SUM(amount_total), 0) as amount
                             FROM invoices 
                             WHERE company_id = $1 AND status = 'pending' AND due_date < CURRENT_DATE`,
                            [companyId]
                        )
                    ]);

                    const sales = salesRes.rows[0];
                    const attendance = attendanceRes.rows[0];
                    const leaves = leavesRes.rows[0];
                    const stock = stockRes.rows[0];
                    const overdue = overdueRes.rows[0];

                    data = { sales, attendance, leaves, stock, overdue };
                    summary = `📊 **Dashboard Summary**

💰 **Sales (Last 30 Days)**
• Total Invoices: ${sales.total_invoices}
• Revenue: ₹${Number(sales.total_amount).toLocaleString()}
• Paid: ${sales.paid_count}

👥 **Today's Attendance**
• Total Employees: ${attendance.total}
• Present: ${attendance.present}

📋 **Pending Actions**
• Leave Requests: ${leaves.count}
• Overdue Invoices: ${overdue.count} (₹${Number(overdue.amount).toLocaleString()})

📦 **Inventory Alerts**
• Low Stock Items: ${stock.count}`;
                }
                break;

            default:
                summary = "I couldn't find data for that query.";
        }

        return { data, summary };
    } catch (error) {
        console.error("Data query error:", error);
        return { data: null, summary: "Error fetching data." };
    }
}

/**
 * Build context information string
 */
function buildContextInfo(context) {
    const parts = [];

    if (context.userName) parts.push(`User: ${context.userName}`);
    if (context.role) parts.push(`Role: ${context.role}`);
    if (context.companyName) parts.push(`Company: ${context.companyName}`);
    if (context.currentPage) parts.push(`Current Page: ${context.currentPage}`);

    return parts.length > 0 ? parts.join('\n') : 'No additional context';
}

/**
 * Detect user intent from message
 */
function detectIntent(message) {
    const lower = message.toLowerCase();

    // Dashboard/Summary queries (should fetch all key metrics)
    if (lower.includes('dashboard') || lower.includes('summary') || lower.includes('overview') || lower.includes('business')) {
        return 'data:dashboard';
    }

    // Data queries
    if (lower.includes('sales') || lower.includes('revenue') || lower.includes('invoice')) {
        return 'data:sales';
    }
    if (lower.includes('employee') || lower.includes('attendance') || lower.includes('staff')) {
        return 'data:employees';
    }
    if (lower.includes('leave') || lower.includes('vacation')) {
        return 'data:leaves';
    }
    if (lower.includes('stock') || lower.includes('inventory') || lower.includes('product')) {
        return 'data:inventory';
    }
    if (lower.includes('overdue') || lower.includes('pending payment')) {
        return 'data:overdue';
    }

    // Navigation
    if (lower.includes('where') || lower.includes('how to') || lower.includes('navigate')) {
        return 'navigation';
    }

    // Help
    if (lower.includes('help') || lower.includes('what can you')) {
        return 'help';
    }

    return 'general';
}

/**
 * Get context-aware suggestions
 */
function getSuggestions(intent, context) {
    const suggestions = [];

    switch (intent) {
        case 'data:sales':
            suggestions.push("Show overdue invoices");
            suggestions.push("Create new invoice");
            break;
        case 'data:employees':
            suggestions.push("Show pending leaves");
            suggestions.push("Mark attendance");
            break;
        case 'data:leaves':
            suggestions.push("Show today's attendance");
            suggestions.push("Approve pending leaves");
            break;
        case 'data:inventory':
            suggestions.push("Show low stock alerts");
            suggestions.push("Create purchase order");
            break;
        case 'help':
            suggestions.push("Show sales summary");
            suggestions.push("Today's attendance");
            suggestions.push("Pending approvals");
            break;
        default:
            suggestions.push("Show dashboard summary");
            suggestions.push("What can you do?");
    }

    return suggestions;
}

/**
 * Save a bot message to history
 */
export async function saveBotMessage(userId, role, content, intent = null, dataInsight = null, suggestions = []) {
    try {
        await query(
            `INSERT INTO bot_messages (user_id, role, content, intent, data_insight, suggestions) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, role, content, intent, dataInsight, JSON.stringify(suggestions)]
        );
    } catch (error) {
        console.error("Error saving bot message:", error);
        // Don't throw - history saving is non-critical
    }
}

/**
 * Get bot conversation history for a user with pagination
 * @param {number} userId - User ID
 * @param {number} limit - Number of messages to fetch
 * @param {string} before - Fetch messages before this timestamp (ISO string) for infinite scroll
 */
export async function getBotHistory(userId, limit = 50, before = null) {
    try {
        let sql;
        let params;

        if (before) {
            // Fetch older messages (for infinite scroll up)
            sql = `SELECT id, role, content, intent, data_insight, suggestions, created_at 
                   FROM bot_messages 
                   WHERE user_id = $1 AND created_at < $2
                   ORDER BY created_at DESC 
                   LIMIT $3`;
            params = [userId, before, limit];
        } else {
            // Fetch latest messages (initial load)
            sql = `SELECT id, role, content, intent, data_insight, suggestions, created_at 
                   FROM bot_messages 
                   WHERE user_id = $1 
                   ORDER BY created_at DESC 
                   LIMIT $2`;
            params = [userId, limit];
        }

        const result = await query(sql, params);

        // Check if there are more older messages
        let hasMore = false;
        if (result.rows.length > 0) {
            const oldestTimestamp = result.rows[result.rows.length - 1].created_at;
            const countResult = await query(
                `SELECT COUNT(*) as count FROM bot_messages WHERE user_id = $1 AND created_at < $2`,
                [userId, oldestTimestamp]
            );
            hasMore = parseInt(countResult.rows[0].count) > 0;
        }

        // Reverse to get chronological order (oldest first for display)
        const messages = result.rows.reverse().map(row => ({
            id: row.id,
            role: row.role,
            content: row.content,
            intent: row.intent,
            dataInsight: row.data_insight,
            suggestions: row.suggestions || [],
            timestamp: row.created_at
        }));

        return { messages, hasMore };
    } catch (error) {
        console.error("Error fetching bot history:", error);
        return { messages: [], hasMore: false };
    }
}

/**
 * Clear bot conversation history for a user
 */
export async function clearBotHistory(userId) {
    try {
        await query(`DELETE FROM bot_messages WHERE user_id = $1`, [userId]);
        return true;
    } catch (error) {
        console.error("Error clearing bot history:", error);
        return false;
    }
}

export default {
    processChat,
    processDataQuery,
    saveBotMessage,
    getBotHistory,
    clearBotHistory
};
