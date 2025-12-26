// src/services/accountService.js
import api from "../api/axiosClient";

const accountService = {
    // Change email with password verification
    changeEmail: async (currentPassword, newEmail) => {
        const response = await api.post("/api/account/change-email", {
            currentPassword,
            newEmail
        });
        return response.data;
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.post("/api/account/change-password", {
            currentPassword,
            newPassword
        });
        return response.data;
    },
};

export default accountService;
