// src/controllers/notificationController.js
import * as notificationService from "../../services/notificationService.js";

export async function getNotifications(req, res) {
    try {
        const { userId } = req.user;
        const { unread_only } = req.query;
        const result = await notificationService.getUserNotifications(userId, { unread_only });
        res.json(result);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function getUnreadCount(req, res) {
    try {
        const { userId } = req.user;
        const result = await notificationService.getUnreadNotificationCount(userId);
        res.json(result);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function markAsRead(req, res) {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        const result = await notificationService.markNotificationAsRead(userId, id);
        res.json(result);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function markAllAsRead(req, res) {
    try {
        const { userId } = req.user;
        const result = await notificationService.markNotificationAsRead(userId, "all");
        res.json(result);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}


export async function deleteNotification(req, res) {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        const result = await notificationService.deleteUserNotification(userId, id);
        res.json(result);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed" });
    }
}

export async function createNotification(userId, type, title, message, link = null) {
    return notificationService.createNotification(userId, type, title, message, link);
}
