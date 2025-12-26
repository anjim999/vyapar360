// src/services/projectService.js
import api from "../api/axiosClient";

const projectService = {
    getProjects: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/projects?${queryParams}`);
        return response.data;
    },

    createProject: async (data) => {
        const response = await api.post("/api/projects", data);
        return response.data;
    },

    updateProject: async (id, data) => {
        const response = await api.put(`/api/projects/${id}`, data);
        return response.data;
    },

    deleteProject: async (id) => {
        const response = await api.delete(`/api/projects/${id}`);
        return response.data;
    },

    // Tasks
    getTasks: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/api/projects/tasks?${queryParams}`);
        return response.data;
    },

    createTask: async (data) => {
        const response = await api.post("/api/projects/tasks", data);
        return response.data;
    },

    updateTask: async (id, data) => {
        const response = await api.put(`/api/projects/tasks/${id}`, data);
        return response.data;
    },

    deleteTask: async (id) => {
        const response = await api.delete(`/api/projects/tasks/${id}`);
        return response.data;
    },
};

export default projectService;
