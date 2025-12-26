// src/routes/hr.js
import express from 'express';
import * as departmentController from '../controllers/hr/departmentController.js';
import * as employeeController from '../controllers/hr/employeeController.js';
import * as attendanceController from '../controllers/hr/attendanceController.js';
import * as leaveController from '../controllers/hr/leaveController.js';
import * as employeeAccountController from '../controllers/hr/employeeAccountController.js';
import { authMiddleware, requireRoles, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// All HR routes require authentication and company membership
router.use(authMiddleware);
router.use(requireCompany);

// ============================================
// DEPARTMENTS
// ============================================
router.get("/departments", departmentController.getDepartments);
router.post("/departments", requireRoles("company_admin", "hr_manager"), departmentController.createDepartment);
router.put("/departments/:id", requireRoles("company_admin", "hr_manager"), departmentController.updateDepartment);
router.delete("/departments/:id", requireRoles("company_admin", "hr_manager"), departmentController.deleteDepartment);

// ============================================
// EMPLOYEES - Account Management (HR creates user accounts)
// ============================================
router.get("/employees", employeeAccountController.getCompanyEmployees);
router.post("/employees", requireRoles("company_admin", "hr_manager"), employeeAccountController.createEmployeeAccount);
router.get("/employees/:id", employeeController.getEmployee);
router.put("/employees/:id", requireRoles("company_admin", "hr_manager"), employeeController.updateEmployee);
router.put("/employees/:id/role", requireRoles("company_admin", "hr_manager"), employeeAccountController.updateEmployeeRole);
router.post("/employees/:id/reset-password", requireRoles("company_admin", "hr_manager"), employeeAccountController.resetEmployeePassword);
router.put("/employees/:id/deactivate", requireRoles("company_admin", "hr_manager"), employeeAccountController.deactivateEmployee);

// ============================================
// ATTENDANCE
// ============================================
router.get("/attendance", attendanceController.getAttendance);
router.post("/attendance/check-in", attendanceController.checkIn);
router.post("/attendance/check-out", attendanceController.checkOut);
router.post("/attendance/mark", requireRoles("company_admin", "hr_manager"), attendanceController.markAttendance);

// ============================================
// LEAVES
// ============================================
router.get("/leave-types", leaveController.getLeaveTypes);
router.get("/leaves", leaveController.getLeaves);
router.post("/leaves", leaveController.applyLeave);
router.put("/leaves/:id/status", requireRoles("company_admin", "hr_manager"), leaveController.updateLeaveStatus);

// ============================================
// HOLIDAYS
// ============================================
router.get("/holidays", leaveController.getHolidays);
router.post("/holidays", requireRoles("company_admin", "hr_manager"), leaveController.createHoliday);
router.delete("/holidays/:id", requireRoles("company_admin", "hr_manager"), leaveController.deleteHoliday);

export default router;
