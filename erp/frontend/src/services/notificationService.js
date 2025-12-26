// src/services/notificationService.js
import api from "../api/axiosClient";

const notificationService = {
    getNotifications: async (unreadOnly = false) => {
        const params = unreadOnly ? "?unread_only=true" : "";
        const response = await api.get(`/api/notifications${params}`);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get("/api/notifications/count");
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await api.put(`/api/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.put("/api/notifications/all/read");
        return response.data;
    },

    deleteNotification: async (id) => {
        const response = await api.delete(`/api/notifications/${id}`);
        return response.data;
    },
};

export default notificationService;
