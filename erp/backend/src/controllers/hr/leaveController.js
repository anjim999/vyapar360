// backend/src/controllers/hr/leaveController.js
import * as hrService from "../../services/hrService.js";

export async function getLeaveTypes(req, res) {
    try {
        const { companyId } = req.user;
        const result = await hrService.getAllLeaveTypes(companyId);
        res.json(result);
    } catch (err) {
        console.error("Error fetching leave types:", err);
        res.status(500).json({ success: false, error: "Failed to fetch leave types" });
    }
}

export async function getLeaves(req, res) {
    try {
        const { companyId, userId, role } = req.user;
        const { status, user_id } = req.query;
        const result = await hrService.getAllLeaves(companyId, userId, role, { status, user_id });
        res.json(result);
    } catch (err) {
        console.error("Error fetching leaves:", err);
        res.status(500).json({ success: false, error: "Failed to fetch leaves" });
    }
}

export async function applyLeave(req, res) {
    try {
        const { companyId, userId } = req.user;
        const { leave_type_id, start_date, end_date, reason } = req.body;
        const result = await hrService.applyForLeave(companyId, userId, { leave_type_id, start_date, end_date, reason });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error applying leave:", err);
        res.status(500).json({ success: false, error: "Failed to apply for leave" });
    }
}

export async function updateLeaveStatus(req, res) {
    try {
        const { companyId, userId } = req.user;
        const { id } = req.params;
        const { status } = req.body;
        const result = await hrService.updateExistingLeaveStatus(companyId, userId, id, { status });
        res.json(result);
    } catch (err) {
        console.error("Error updating leave status:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to update leave status" });
    }
}

export async function getHolidays(req, res) {
    try {
        const { companyId } = req.user;
        const { year } = req.query;
        const result = await hrService.getAllHolidays(companyId, { year });
        res.json(result);
    } catch (err) {
        console.error("Error fetching holidays:", err);
        res.status(500).json({ success: false, error: "Failed to fetch holidays" });
    }
}

export async function createHoliday(req, res) {
    try {
        const { companyId } = req.user;
        const { name, date, is_optional } = req.body;
        const result = await hrService.createNewHoliday(companyId, { name, date, is_optional });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating holiday:", err);
        res.status(500).json({ success: false, error: "Failed to create holiday" });
    }
}

export async function deleteHoliday(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const result = await hrService.deleteExistingHoliday(companyId, id);
        res.json(result);
    } catch (err) {
        console.error("Error deleting holiday:", err);
        res.status(500).json({ success: false, error: "Failed to delete holiday" });
    }
}
