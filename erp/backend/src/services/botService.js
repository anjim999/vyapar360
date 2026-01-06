// src/services/botService.js - AI Bot Service using Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env.js";
import { query } from "../db/pool.js";

// Initialize Gemini
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// System prompt for the bot
const SYSTEM_PROMPT = `You are Vyapar360 AI Assistant, a helpful business assistant for an ERP (Enterprise Resource Planning) system.

Your capabilities:
1. **Answer Questions**: Help users understand how to use the ERP system
2. **Provide Insights**: Give business insights based on data queries
3. **Guide Navigation**: Tell users where to find features
4. **Suggest Actions**: Recommend next steps based on context

Available Modules in Vyapar360:
- Dashboard: Overview of business metrics
- HR Management: Employees, Attendance, Leaves, Departments
- Finance: Invoices, Payments, Expenses, Accounts
- Inventory: Products, Stock, Purchase Orders
- Projects: Project management, Tasks, Time logs
- CRM: Leads, Customers, Contact Requests
- Teams Chat: Internal team communication

Response Guidelines:
- Be concise and helpful
- Use bullet points for multiple items
- Include navigation hints like "Go to HR → Employees"
- If you don't have specific data, give general guidance
- Format currency in Indian Rupees (₹)
- Be professional but friendly

When providing data insights, format numbers clearly and provide context.
`;

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
        // Build context message
        const contextInfo = buildContextInfo(context);

        // Get the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create the prompt
        const prompt = `${SYSTEM_PROMPT}

Current User Context:
${contextInfo}

User Message: ${message}

Provide a helpful response:`;

        // Generate response
        const result = await model.generateContent(prompt);
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
        return {
            response: "I'm having trouble processing your request. Please try again.",
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
             FROM employees e
             LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = CURRENT_DATE
             WHERE e.company_id = $1`,
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
                        `SELECT name, quantity, min_stock_level 
             FROM products 
             WHERE company_id = $1 AND quantity <= min_stock_level
             LIMIT 5`,
                        [companyId]
                    );
                    data = result.rows;
                    if (data.length > 0) {
                        summary = `⚠️ Low Stock Items:\n${data.map(p => `• ${p.name}: ${p.quantity} units`).join('\n')}`;
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

export default {
    processChat,
    processDataQuery
};
