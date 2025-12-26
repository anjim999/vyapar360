// src/services/marketplaceService.js
// Marketplace module API calls

import api from "../api/axiosClient";

const marketplaceService = {
    // Contact Requests
    getContactRequests: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/marketplace/requests?${queryParams}`);
        return response.data;
    },

    sendContactRequest: async (data) => {
        const response = await api.post("/api/marketplace/requests", data);
        return response.data;
    },

    replyToRequest: async (id, data) => {
        const response = await api.post(`/api/marketplace/requests/${id}/reply`, data);
        return response.data;
    },

    updateRequestStatus: async (id, status) => {
        const response = await api.put(`/api/marketplace/requests/${id}/status`, { status });
        return response.data;
    },

    // Reviews
    getCompanyReviews: async (companyId) => {
        const response = await api.get(`/api/marketplace/reviews/${companyId}`);
        return response.data;
    },

    addReview: async (data) => {
        const response = await api.post("/api/marketplace/reviews", data);
        return response.data;
    },

    // Saved Companies
    getSavedCompanies: async () => {
        const response = await api.get("/api/marketplace/saved");
        return response.data;
    },

    saveCompany: async (companyId) => {
        const response = await api.post("/api/marketplace/saved", { company_id: companyId });
        return response.data;
    },

    unsaveCompany: async (companyId) => {
        const response = await api.delete(`/api/marketplace/saved/${companyId}`);
        return response.data;
    },

    // Support
    submitSupportTicket: async (data) => {
        const response = await api.post("/api/marketplace/support", data);
        return response.data;
    },
};

export default marketplaceService;
