// Centralized Environment Configuration
// This file is the SINGLE source of truth for all environment variables.
// It does NOT use window.location or other heuristics. It relies strictly on Vite environment variables.

export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const ERP_SOCKET_URL = import.meta.env.VITE_ERP_SOCKET_URL;
export const TEAMS_SOCKET_URL = import.meta.env.VITE_TEAMS_SOCKET_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Log configuration on startup for debugging
console.log('[Config] Loaded Environment Variables:', {
    API_BASE_URL,
    ERP_SOCKET_URL,
    TEAMS_SOCKET_URL,
    MODE: import.meta.env.MODE
});
