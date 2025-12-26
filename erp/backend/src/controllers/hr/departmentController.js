// backend/src/controllers/hr/departmentController.js
import * as hrService from "../../services/hrService.js";

export async function getDepartments(req, res) {
    try {
        const { companyId } = req.user;
        const result = await hrService.getAllDepartments(companyId);
        res.json(result);
    } catch (err) {
        console.error("Error fetching departments:", err);
        res.status(500).json({ success: false, error: "Failed to fetch departments" });
    }
}

export async function createDepartment(req, res) {
    try {
        const { companyId } = req.user;
        const { name, description, manager_id } = req.body;
        const result = await hrService.createNewDepartment(companyId, { name, description, manager_id });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating department:", err);
        res.status(500).json({ success: false, error: "Failed to create department" });
    }
}

export async function updateDepartment(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const { name, description, manager_id } = req.body;
        const result = await hrService.updateExistingDepartment(companyId, id, { name, description, manager_id });
        res.json(result);
    } catch (err) {
        console.error("Error updating department:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to update department" });
    }
}

export async function deleteDepartment(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const result = await hrService.deleteExistingDepartment(companyId, id);
        res.json(result);
    } catch (err) {
        console.error("Error deleting department:", err);
        res.status(500).json({ success: false, error: "Failed to delete department" });
    }
}
