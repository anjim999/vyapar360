// backend/src/controllers/hr/employeeController.js
import * as hrService from "../../services/hrService.js";

export async function getEmployees(req, res) {
    try {
        const { companyId } = req.user;
        const { department_id, search, status } = req.query;
        const result = await hrService.getAllEmployees(companyId, { department_id, search, status });
        res.json(result);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({ success: false, error: "Failed to fetch employees" });
    }
}

export async function getEmployee(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const result = await hrService.getEmployeeById(companyId, id);
        res.json(result);
    } catch (err) {
        console.error("Error fetching employee:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to fetch employee" });
    }
}

export async function updateEmployee(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const updateData = req.body;
        const result = await hrService.updateExistingEmployee(companyId, id, updateData);
        res.json(result);
    } catch (err) {
        console.error("Error updating employee:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to update employee" });
    }
}
