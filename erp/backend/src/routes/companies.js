// src/routes/companies.js
import express from 'express';
import * as companyController from '../controllers/company/companyController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

// Get all companies for marketplace
router.get("/public", companyController.getPublicCompanies);

// Get single company by slug
router.get("/public/:slug", companyController.getCompanyBySlug);

// Get industries list
router.get("/industries", companyController.getIndustries);

// Get cities with companies
router.get("/cities", companyController.getCities);

// ============================================
// PROTECTED ROUTES (Auth required)
// ============================================

// Register new company
router.post("/register", authMiddleware, companyController.registerCompany);

// Get my company
router.get("/my", authMiddleware, companyController.getMyCompany);

// Update my company
router.put("/my", authMiddleware, requireRoles("company_admin"), companyController.updateCompany);

export default router;
