// src/services/financeService.js
import api from "../api/axiosClient";

const financeService = {
    // Dashboard
    getDashboard: async () => {
        const response = await api.get("/api/finance/dashboard");
        return response.data;
    },

    // Accounts
    getAccounts: async () => {
        const response = await api.get("/api/finance/accounts");
        return response.data;
    },
    createAccount: async (data) => {
        const response = await api.post("/api/finance/accounts", data);
        return response.data;
    },
    updateAccount: async (id, data) => {
        const response = await api.put(`/api/finance/accounts/${id}`, data);
        return response.data;
    },

    // Invoices
    getInvoices: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/finance/invoices?${queryParams}`);
        return response.data;
    },
    createInvoice: async (data) => {
        const response = await api.post("/api/finance/invoices", data);
        return response.data;
    },
    updateInvoice: async (id, data) => {
        const response = await api.put(`/api/finance/invoices/${id}`, data);
        return response.data;
    },
    deleteInvoice: async (id) => {
        const response = await api.delete(`/api/finance/invoices/${id}`);
        return response.data;
    },

    // Payments
    getPayments: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/finance/payments?${queryParams}`);
        return response.data;
    },
    createPayment: async (data) => {
        const response = await api.post("/api/finance/payments", data);
        return response.data;
    },

    // Customers
    getCustomers: async () => {
        const response = await api.get("/api/finance/customers");
        return response.data;
    },
    createCustomer: async (data) => {
        const response = await api.post("/api/finance/customers", data);
        return response.data;
    },
    updateCustomer: async (id, data) => {
        const response = await api.put(`/api/finance/customers/${id}`, data);
        return response.data;
    },
    deleteCustomer: async (id) => {
        const response = await api.delete(`/api/finance/customers/${id}`);
        return response.data;
    },

    // Vendors
    getVendors: async () => {
        const response = await api.get("/api/finance/vendors");
        return response.data;
    },
    createVendor: async (data) => {
        const response = await api.post("/api/finance/vendors", data);
        return response.data;
    },
    updateVendor: async (id, data) => {
        const response = await api.put(`/api/finance/vendors/${id}`, data);
        return response.data;
    },
    deleteVendor: async (id) => {
        const response = await api.delete(`/api/finance/vendors/${id}`);
        return response.data;
    },

    // Journal Entries
    getJournalEntries: async () => {
        const response = await api.get("/api/finance/journals");
        return response.data;
    },
    createJournalEntry: async (data) => {
        const response = await api.post("/api/finance/journals", data);
        return response.data;
    },

    // Reports
    getBalanceSheet: async () => {
        const response = await api.get("/api/finance/reports/balance-sheet");
        return response.data;
    },
    getIncomeStatement: async () => {
        const response = await api.get("/api/finance/reports/income-statement");
        return response.data;
    },
};

export default financeService;
