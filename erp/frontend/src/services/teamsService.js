// src/services/teamsService.js
// Service for Teams chat API calls
import api from "../api/axiosClient";

const teamsService = {
    // Direct Messages
    getDirectMessages: (userId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/api/teams/direct-messages/${userId}${queryString ? `?${queryString}` : ""}`);
    },

    sendDirectMessage: (userId, data) => {
        return api.post(`/api/teams/direct-messages/${userId}`, data);
    },

    // Channel Messages
    getChannelMessages: (teamId, channelId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/api/teams/${teamId}/channels/${channelId}/messages${queryString ? `?${queryString}` : ""}`);
    },

    sendChannelMessage: (teamId, channelId, data) => {
        return api.post(`/api/teams/${teamId}/channels/${channelId}/messages`, data);
    },

    // Teams
    getTeams: () => api.get("/api/teams"),

    // Channels
    getChannels: (teamId) => api.get(`/api/teams/${teamId}/channels`),

    // Users
    searchUsers: (query = "") => api.get(`/api/teams/users/search?query=${query}`),

    // Read receipts
    markAsRead: (userId) => api.post(`/api/teams/direct-messages/${userId}/read`),
    markAsDelivered: (userId) => api.post(`/api/teams/direct-messages/${userId}/delivered`),
};

export default teamsService;
