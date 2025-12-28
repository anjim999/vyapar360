// backend/src/services/notificationService.js
import pool from "../db/pool.js";
import { emitNewNotification, emitNotificationCount } from "../utils/socketService.js";

export async function getUserNotifications(userId, { unread_only }) {
    let query = `SELECT * FROM notifications WHERE user_id = $1`;
    if (unread_only === "true") query += ` AND is_read = false`;
    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await pool.query(query, [userId]);

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId]
    );

    return {
        success: true,
        data: result.rows,
        meta: {
            unread_count: parseInt(countResult.rows[0].count)
        }
    };
}

export async function getUnreadNotificationCount(userId) {
    const result = await pool.query(
        `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    return { success: true, count: parseInt(result.rows[0].count) };
}

export async function markNotificationAsRead(userId, id) {
    if (id === "all") {
        await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
    } else {
        await pool.query(`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [id, userId]);
    }

    // Emit updated count
    const countResult = await getUnreadNotificationCount(userId);
    emitNotificationCount(userId, countResult.count);

    return { success: true };
}

export async function deleteUserNotification(userId, id) {
    await pool.query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [id, userId]);
    return { success: true };
}

// Create notification and emit via socket for real-time update
export async function createNotification(userId, type, title, message, link = null) {
    try {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, link) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [userId, type, title, message, link]
        );

        const notification = result.rows[0];

        // Emit real-time notification via socket
        emitNewNotification(userId, notification);

        // Also emit updated count
        const countResult = await getUnreadNotificationCount(userId);
        emitNotificationCount(userId, countResult.count);

        console.log(`🔔 Notification sent to user ${userId}: ${title}`);
        return notification;
    } catch (err) {
        console.error("Failed to create notification:", err);
        return null;
    }
}

// Create notification for multiple users (e.g., all platform admins)
export async function createNotificationForRole(role, type, title, message, link = null) {
    try {
        const usersResult = await pool.query(
            `SELECT id FROM users WHERE role = $1`,
            [role]
        );

        const notifications = [];
        for (const user of usersResult.rows) {
            const notif = await createNotification(user.id, type, title, message, link);
            if (notif) notifications.push(notif);
        }

        return notifications;
    } catch (err) {
        console.error("Failed to create notifications for role:", err);
        return [];
    }
}

