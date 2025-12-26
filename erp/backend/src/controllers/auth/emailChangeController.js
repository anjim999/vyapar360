// src/controllers/auth/emailChangeController.js
import pool from "../../db/pool.js";
import bcrypt from "bcryptjs";

// Change email with password verification
export async function changeEmail(req, res) {
    try {
        const { userId } = req.user;
        const { currentPassword, newEmail } = req.body;

        if (!currentPassword || !newEmail) {
            return res.status(400).json({
                success: false,
                error: "Current password and new email are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.status(400).json({ success: false, error: "Invalid email format" });
        }

        // Get user's current password
        const userResult = await pool.query(
            `SELECT password, email FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const user = userResult.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, error: "Incorrect password" });
        }

        // Check if new email is same as current
        if (user.email === newEmail) {
            return res.status(400).json({ success: false, error: "New email is same as current email" });
        }

        // Check if new email already exists
        const existingEmail = await pool.query(
            `SELECT id FROM users WHERE email = $1 AND id != $2`,
            [newEmail, userId]
        );

        if (existingEmail.rows.length > 0) {
            return res.status(400).json({ success: false, error: "Email already in use" });
        }

        // Update email
        await pool.query(
            `UPDATE users SET email = $1, email_verified = false, updated_at = NOW() WHERE id = $2`,
            [newEmail, userId]
        );

        res.json({
            success: true,
            message: "Email updated successfully. Please log in again with your new email.",
            newEmail
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed to change email" });
    }
}

// Change password
export async function changePassword(req, res) {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
        }

        // Get user's current password
        const userResult = await pool.query(
            `SELECT password FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, error: "Incorrect current password" });
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
            [hashedPassword, userId]
        );

        res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Failed to change password" });
    }
}
