// src/services/inventoryService.js
// Inventory module API calls

import api from "../api/axiosClient";

const inventoryService = {
    // Categories
    getCategories: async () => {
        const response = await api.get("/api/inventory/categories");
        return response.data;
    },

    createCategory: async (data) => {
        const response = await api.post("/api/inventory/categories", data);
        return response.data;
    },

    updateCategory: async (id, data) => {
        const response = await api.put(`/api/inventory/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await api.delete(`/api/inventory/categories/${id}`);
        return response.data;
    },

    // Products
    getProducts: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/inventory/products?${queryParams}`);
        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/api/inventory/products/${id}`);
        return response.data;
    },

    createProduct: async (data) => {
        const response = await api.post("/api/inventory/products", data);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.put(`/api/inventory/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/api/inventory/products/${id}`);
        return response.data;
    },

    // Stock
    getStockMovements: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/inventory/stock/movements?${queryParams}`);
        return response.data;
    },

    adjustStock: async (data) => {
        const response = await api.post("/api/inventory/stock/adjust", data);
        return response.data;
    },

    getLowStockAlerts: async () => {
        const response = await api.get("/api/inventory/stock/alerts");
        return response.data;
    },

    // Purchase Orders
    getPurchaseOrders: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/inventory/purchase-orders?${queryParams}`);
        return response.data;
    },

    createPurchaseOrder: async (data) => {
        const response = await api.post("/api/inventory/purchase-orders", data);
        return response.data;
    },
};

export default inventoryService;
