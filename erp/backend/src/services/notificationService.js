// backend/src/services/notificationService.js
import pool from "../db/pool.js";

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
    return { success: true };
}

export async function deleteUserNotification(userId, id) {
    await pool.query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [id, userId]);
    return { success: true };
}

export async function createNotification(userId, type, title, message, link = null) {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)`,
            [userId, type, title, message, link]
        );
    } catch (err) {
        console.error("Failed to create notification:", err);
    }
}
