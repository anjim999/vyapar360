// src/services/hrService.js
// HR module API calls

import api from "../api/axiosClient";

const hrService = {
    // Departments
    getDepartments: async () => {
        const response = await api.get("/api/hr/departments");
        return response.data;
    },

    createDepartment: async (data) => {
        const response = await api.post("/api/hr/departments", data);
        return response.data;
    },

    updateDepartment: async (id, data) => {
        const response = await api.put(`/api/hr/departments/${id}`, data);
        return response.data;
    },

    deleteDepartment: async (id) => {
        const response = await api.delete(`/api/hr/departments/${id}`);
        return response.data;
    },

    // Employees
    getEmployees: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/hr/employees?${queryParams}`);
        return response.data;
    },

    getEmployee: async (id) => {
        const response = await api.get(`/api/hr/employees/${id}`);
        return response.data;
    },

    createEmployee: async (data) => {
        const response = await api.post("/api/hr/employees", data);
        return response.data;
    },

    updateEmployee: async (id, data) => {
        const response = await api.put(`/api/hr/employees/${id}`, data);
        return response.data;
    },

    updateEmployeeRole: async (id, data) => {
        const response = await api.put(`/api/hr/employees/${id}/role`, data);
        return response.data;
    },

    resetEmployeePassword: async (id, newPassword) => {
        const response = await api.post(`/api/hr/employees/${id}/reset-password`, { newPassword });
        return response.data;
    },

    deactivateEmployee: async (id) => {
        const response = await api.put(`/api/hr/employees/${id}/deactivate`);
        return response.data;
    },

    // Attendance
    getAttendance: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/hr/attendance?${queryParams}`);
        return response.data;
    },

    checkIn: async () => {
        const response = await api.post("/api/hr/attendance/check-in");
        return response.data;
    },

    checkOut: async () => {
        const response = await api.post("/api/hr/attendance/check-out");
        return response.data;
    },

    markAttendance: async (data) => {
        const response = await api.post("/api/hr/attendance/mark", data);
        return response.data;
    },

    // Leave Types
    getLeaveTypes: async () => {
        const response = await api.get("/api/hr/leave-types");
        return response.data;
    },

    // Leaves
    getLeaves: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/hr/leaves?${queryParams}`);
        return response.data;
    },

    applyLeave: async (data) => {
        const response = await api.post("/api/hr/leaves", data);
        return response.data;
    },

    updateLeaveStatus: async (id, status) => {
        const response = await api.put(`/api/hr/leaves/${id}/status`, { status });
        return response.data;
    },

    // Holidays
    getHolidays: async (year) => {
        const params = year ? `?year=${year}` : "";
        const response = await api.get(`/api/hr/holidays${params}`);
        return response.data;
    },

    createHoliday: async (data) => {
        const response = await api.post("/api/hr/holidays", data);
        return response.data;
    },

    deleteHoliday: async (id) => {
        const response = await api.delete(`/api/hr/holidays/${id}`);
        return response.data;
    },
};

export default hrService;
