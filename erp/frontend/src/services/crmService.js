// src/services/crmService.js
import api from "../api/axiosClient";

const crmService = {
    getLeads: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/crm/leads?${queryParams}`);
        return response.data;
    },

    createLead: async (data) => {
        const response = await api.post("/api/crm/leads", data);
        return response.data;
    },

    updateLead: async (id, data) => {
        const response = await api.put(`/api/crm/leads/${id}`, data);
        return response.data;
    },

    deleteLead: async (id) => {
        const response = await api.delete(`/api/crm/leads/${id}`);
        return response.data;
    },

    getLeadActivities: async (leadId) => {
        const response = await api.get(`/api/crm/leads/${leadId}/activities`);
        return response.data;
    },

    addLeadActivity: async (leadId, data) => {
        const response = await api.post(`/api/crm/leads/${leadId}/activities`, data);
        return response.data;
    },
};

export default crmService;
