// src/utils/helpers.js

// Format currency
export const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

// Format date
export const formatDate = (date, options = {}) => {
    if (!date) return "-";
    const defaults = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(date).toLocaleDateString("en-IN", { ...defaults, ...options });
};

// Format datetime
export const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Format relative time
export const formatRelativeTime = (date) => {
    if (!date) return "-";
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
};

// Format number with commas
export const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num || 0);
};

// Format percentage
export const formatPercent = (value, decimals = 1) => {
    return `${(value || 0).toFixed(decimals)}%`;
};

// Truncate text
export const truncate = (text, length = 50) => {
    if (!text) return "";
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
};

// Get initials from name
export const getInitials = (name, count = 2) => {
    if (!name) return "?";
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, count);
};

// Generate random color
export const getRandomColor = () => {
    const colors = [
        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
        "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-red-500"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Get status color
export const getStatusColor = (status) => {
    const colors = {
        active: "success", inactive: "danger", pending: "warning",
        approved: "success", rejected: "danger", draft: "default",
        open: "primary", closed: "default", in_progress: "info",
        completed: "success", cancelled: "danger", paid: "success",
        unpaid: "danger", partial: "warning", overdue: "danger",
    };
    return colors[status?.toLowerCase()] || "default";
};

// Deep clone object
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === "object") return Object.keys(obj).length === 0;
    return false;
};

// Debounce function
export const debounce = (func, wait = 300) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// Download file
export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error("Failed to copy:", err);
        return false;
    }
};

// Parse query string
export const parseQueryString = (queryString) => {
    if (!queryString) return {};
    return Object.fromEntries(new URLSearchParams(queryString));
};

// Build query string
export const buildQueryString = (params) => {
    const filtered = Object.entries(params).filter(([_, v]) => v != null && v !== "");
    return new URLSearchParams(filtered).toString();
};

// Validate email
export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
    return /^[+]?[\d\s-]{10,}$/.test(phone);
};

// Generate unique ID
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Sleep/delay function
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Group array by key
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {});
};

// Sort array by key
export const sortBy = (array, key, order = "asc") => {
    return [...array].sort((a, b) => {
        if (a[key] < b[key]) return order === "asc" ? -1 : 1;
        if (a[key] > b[key]) return order === "asc" ? 1 : -1;
        return 0;
    });
};
