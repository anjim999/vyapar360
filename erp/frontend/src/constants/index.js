// src/constants/index.js
// Application constants

// User roles
export const ROLES = {
    PLATFORM_ADMIN: "platform_admin",
    CUSTOMER: "customer",
    COMPANY_ADMIN: "company_admin",
    HR_MANAGER: "hr_manager",
    FINANCE_MANAGER: "finance_manager",
    PROJECT_MANAGER: "project_manager",
    INVENTORY_MANAGER: "inventory_manager",
    SALES_MANAGER: "sales_manager",
    EMPLOYEE: "employee",
};

// Role display names
export const ROLE_LABELS = {
    [ROLES.PLATFORM_ADMIN]: "Platform Admin",
    [ROLES.CUSTOMER]: "Customer",
    [ROLES.COMPANY_ADMIN]: "Company Admin",
    [ROLES.HR_MANAGER]: "HR Manager",
    [ROLES.FINANCE_MANAGER]: "Finance Manager",
    [ROLES.PROJECT_MANAGER]: "Project Manager",
    [ROLES.INVENTORY_MANAGER]: "Inventory Manager",
    [ROLES.SALES_MANAGER]: "Sales Manager",
    [ROLES.EMPLOYEE]: "Employee",
};

// Role icons
export const ROLE_ICONS = {
    [ROLES.PLATFORM_ADMIN]: "👑",
    [ROLES.CUSTOMER]: "👤",
    [ROLES.COMPANY_ADMIN]: "🏢",
    [ROLES.HR_MANAGER]: "👥",
    [ROLES.FINANCE_MANAGER]: "💰",
    [ROLES.PROJECT_MANAGER]: "📋",
    [ROLES.INVENTORY_MANAGER]: "📦",
    [ROLES.SALES_MANAGER]: "💼",
    [ROLES.EMPLOYEE]: "👷",
};

// Status constants
export const STATUS = {
    // General
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",

    // Leave
    LEAVE_PENDING: "pending",
    LEAVE_APPROVED: "approved",
    LEAVE_REJECTED: "rejected",
    LEAVE_CANCELLED: "cancelled",

    // Contact Request
    REQUEST_PENDING: "pending",
    REQUEST_VIEWED: "viewed",
    REQUEST_REPLIED: "replied",
    REQUEST_ACCEPTED: "accepted",
    REQUEST_REJECTED: "rejected",
    REQUEST_CLOSED: "closed",

    // Invoice
    INVOICE_DRAFT: "draft",
    INVOICE_SENT: "sent",
    INVOICE_PAID: "paid",
    INVOICE_OVERDUE: "overdue",

    // Project
    PROJECT_PLANNING: "planning",
    PROJECT_IN_PROGRESS: "in_progress",
    PROJECT_ON_HOLD: "on_hold",
    PROJECT_COMPLETED: "completed",
    PROJECT_CANCELLED: "cancelled",

    // Task
    TASK_TODO: "todo",
    TASK_IN_PROGRESS: "in_progress",
    TASK_REVIEW: "review",
    TASK_DONE: "done",

    // Purchase Order
    PO_DRAFT: "draft",
    PO_SENT: "sent",
    PO_RECEIVED: "received",
    PO_CANCELLED: "cancelled",
};

// Status colors
export const STATUS_COLORS = {
    [STATUS.ACTIVE]: "success",
    [STATUS.INACTIVE]: "danger",
    [STATUS.PENDING]: "warning",
    [STATUS.APPROVED]: "success",
    [STATUS.REJECTED]: "danger",
    [STATUS.INVOICE_DRAFT]: "default",
    [STATUS.INVOICE_SENT]: "primary",
    [STATUS.INVOICE_PAID]: "success",
    [STATUS.INVOICE_OVERDUE]: "danger",
    [STATUS.PROJECT_PLANNING]: "info",
    [STATUS.PROJECT_IN_PROGRESS]: "primary",
    [STATUS.PROJECT_ON_HOLD]: "warning",
    [STATUS.PROJECT_COMPLETED]: "success",
    [STATUS.PROJECT_CANCELLED]: "danger",
};

// Priority levels
export const PRIORITY = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    URGENT: "urgent",
};

// Priority colors
export const PRIORITY_COLORS = {
    [PRIORITY.LOW]: "default",
    [PRIORITY.MEDIUM]: "info",
    [PRIORITY.HIGH]: "warning",
    [PRIORITY.URGENT]: "danger",
};

// Industries
export const INDUSTRIES = [
    { value: "IT & Software", label: "IT & Software", icon: "💻" },
    { value: "Manufacturing", label: "Manufacturing", icon: "🏭" },
    { value: "Healthcare", label: "Healthcare", icon: "🏥" },
    { value: "Education", label: "Education", icon: "📚" },
    { value: "Retail", label: "Retail", icon: "🛒" },
    { value: "Construction", label: "Construction", icon: "🏗️" },
    { value: "Finance & Banking", label: "Finance & Banking", icon: "🏦" },
    { value: "Real Estate", label: "Real Estate", icon: "🏢" },
    { value: "Consulting", label: "Consulting", icon: "💼" },
    { value: "Hospitality", label: "Hospitality", icon: "🏨" },
    { value: "Transportation", label: "Transportation", icon: "🚚" },
    { value: "Agriculture", label: "Agriculture", icon: "🌾" },
    { value: "Other", label: "Other", icon: "📋" },
];

// Attendance status
export const ATTENDANCE_STATUS = {
    PRESENT: "present",
    ABSENT: "absent",
    HALF_DAY: "half_day",
    LEAVE: "leave",
    HOLIDAY: "holiday",
};

// Budget ranges for contact requests
export const BUDGET_RANGES = [
    { value: "under_10k", label: "Under ₹10,000" },
    { value: "10k_50k", label: "₹10,000 - ₹50,000" },
    { value: "50k_1l", label: "₹50,000 - ₹1,00,000" },
    { value: "1l_5l", label: "₹1,00,000 - ₹5,00,000" },
    { value: "5l_10l", label: "₹5,00,000 - ₹10,00,000" },
    { value: "above_10l", label: "Above ₹10,00,000" },
    { value: "not_sure", label: "Not sure yet" },
];

// Date formats
export const DATE_FORMATS = {
    DISPLAY: "DD MMM YYYY",
    INPUT: "YYYY-MM-DD",
    DISPLAY_WITH_TIME: "DD MMM YYYY, hh:mm A",
    TIME_ONLY: "hh:mm A",
};

// Currency
export const CURRENCIES = [
    { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
    { value: "GBP", label: "British Pound (£)", symbol: "£" },
];

// Paid/Premium features
export const PREMIUM_FEATURES = [
    {
        id: "advanced_analytics",
        name: "Advanced Analytics",
        description: "Deep insights with AI-powered analytics",
        icon: "📊",
    },
    {
        id: "custom_branding",
        name: "Custom Branding",
        description: "White-label solution with your brand",
        icon: "🎨",
    },
    {
        id: "api_access",
        name: "API Access",
        description: "Full REST API access for integrations",
        icon: "🔗",
    },
    {
        id: "priority_support",
        name: "Priority Support",
        description: "24/7 dedicated support team",
        icon: "🎯",
    },
    {
        id: "data_export",
        name: "Bulk Data Export",
        description: "Export all data in multiple formats",
        icon: "📤",
    },
    {
        id: "multi_location",
        name: "Multi-Location Support",
        description: "Manage multiple office locations",
        icon: "🌍",
    },
];

// API endpoints
export const API_ENDPOINTS = {
    AUTH: "/api/auth",
    COMPANIES: "/api/companies",
    HR: "/api/hr",
    INVENTORY: "/api/inventory",
    FINANCE: "/api/finance",
    PROJECTS: "/api/projects",
    MARKETPLACE: "/api/marketplace",
    DASHBOARD: "/api/dashboard",
};

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: "erp_token",
    USER: "erp_user",
    THEME: "erp_theme",
    LANGUAGE: "erp_language",
};
