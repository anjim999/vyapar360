// src/services/companyService.js
// Company related API calls

import api from "../api/axiosClient";

const companyService = {
    // Public endpoints
    getPublicCompanies: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/companies/public?${queryParams}`);
        return response.data;
    },

    getCompanyBySlug: async (slug) => {
        const response = await api.get(`/api/companies/public/${slug}`);
        return response.data;
    },

    getIndustries: async () => {
        const response = await api.get("/api/companies/industries");
        return response.data;
    },

    getCities: async () => {
        const response = await api.get("/api/companies/cities");
        return response.data;
    },

    // Protected endpoints
    registerCompany: async (companyData) => {
        const response = await api.post("/api/companies/register", companyData);
        return response.data;
    },

    getMyCompany: async () => {
        const response = await api.get("/api/companies/my");
        return response.data;
    },

    updateMyCompany: async (companyData) => {
        const response = await api.put("/api/companies/my", companyData);
        return response.data;
    },
};

export default companyService;
