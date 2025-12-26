// src/services/uploadService.js - File Upload Service
import api from "../api/axiosClient";

// Upload avatar
export async function uploadAvatar(formData) {
    const response = await api.post("/api/uploads/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

// Upload company logo
export async function uploadLogo(formData) {
    const response = await api.post("/api/uploads/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

// Upload single document
export async function uploadDocument(formData) {
    const response = await api.post("/api/uploads/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

// Upload multiple documents
export async function uploadDocuments(formData) {
    const response = await api.post("/api/uploads/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

// Get documents for entity
export async function getDocuments(entityType, entityId) {
    const response = await api.get(`/api/uploads/documents/${entityType}/${entityId}`);
    return response.data;
}

export default {
    uploadAvatar,
    uploadLogo,
    uploadDocument,
    uploadDocuments,
    getDocuments,
};
