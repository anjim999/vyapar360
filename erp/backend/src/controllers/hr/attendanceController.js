// backend/src/controllers/hr/attendanceController.js
import * as hrService from "../../services/hrService.js";

export async function getAttendance(req, res) {
    try {
        const { companyId, userId, role } = req.user;
        const { user_id, date, month, year } = req.query;
        const result = await hrService.getAllAttendance(companyId, userId, role, { user_id, date, month, year });
        res.json(result);
    } catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ success: false, error: "Failed to fetch attendance" });
    }
}

export async function checkIn(req, res) {
    try {
        const { companyId, userId } = req.user;
        const result = await hrService.performCheckIn(companyId, userId);
        res.status(201).json(result);
    } catch (err) {
        console.error("Error checking in:", err);
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to check in" });
    }
}

export async function checkOut(req, res) {
    try {
        const { userId } = req.user;
        const result = await hrService.performCheckOut(userId);
        res.json(result);
    } catch (err) {
        console.error("Error checking out:", err);
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to check out" });
    }
}

export async function markAttendance(req, res) {
    try {
        const { companyId } = req.user;
        const { user_id, date, status, check_in, check_out, notes } = req.body;
        const result = await hrService.markEmployeeAttendance(companyId, { user_id, date, status, check_in, check_out, notes });
        res.json(result);
    } catch (err) {
        console.error("Error marking attendance:", err);
        res.status(500).json({ success: false, error: "Failed to mark attendance" });
    }
}
