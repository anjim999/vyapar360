// src/routes/crm.js
import express from 'express';
import * as crmController from '../controllers/crm/crmController.js';
import * as customerController from '../controllers/crm/customerController.js';
import { authMiddleware, requireRoles, requireCompany } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);
router.use(requireCompany);

// Leads
router.get("/leads", crmController.getLeads);
router.post("/leads", requireRoles("company_admin", "sales_manager"), crmController.createLead);
router.put("/leads/:id", requireRoles("company_admin", "sales_manager"), crmController.updateLead);
router.delete("/leads/:id", requireRoles("company_admin", "sales_manager"), crmController.deleteLead);

// Lead Activities
router.get("/leads/:lead_id/activities", crmController.getLeadActivities);
router.post("/leads/:lead_id/activities", crmController.addLeadActivity);

// Customers
router.get("/customers", customerController.getCustomers);
router.post("/customers", customerController.createCustomer);
router.put("/customers/:id", customerController.updateCustomer);
router.delete("/customers/:id", customerController.deleteCustomer);

export default router;
