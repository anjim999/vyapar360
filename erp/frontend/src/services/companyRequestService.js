// src/services/companyRequestService.js
import api from "../api/axiosClient";

const companyRequestService = {
    // User: Submit company registration request
    submitRequest: async (data) => {
        const response = await api.post("/api/company-requests/submit", data);
        return response.data;
    },

    // User: Get my requests
    getMyRequests: async () => {
        const response = await api.get("/api/company-requests/my-requests");
        return response.data;
    },

    // Admin: Get all requests
    getAllRequests: async (status = "") => {
        const params = status ? `?status=${status}` : "";
        const response = await api.get(`/api/company-requests/all${params}`);
        return response.data;
    },

    // Admin: Approve request
    approveRequest: async (id, data) => {
        const response = await api.post(`/api/company-requests/${id}/approve`, data);
        return response.data;
    },

    // Admin: Reject request
    rejectRequest: async (id, data) => {
        const response = await api.post(`/api/company-requests/${id}/reject`, data);
        return response.data;
    },
};

export default companyRequestService;
