// src/controllers/companyController.js
import * as companyService from "../../services/companyService.js";

export async function getPublicCompanies(req, res) {
    try {
        const { industry, city, search, rating, sort, order, page, limit } = req.query;
        const result = await companyService.getPublicCompaniesWithFilters({ industry, city, search, rating, sort, order, page, limit });
        res.json(result);
    } catch (err) {
        console.error("Error fetching companies:", err);
        res.status(500).json({ success: false, error: "Failed to fetch companies" });
    }
}

export async function getCompanyBySlug(req, res) {
    try {
        const { slug } = req.params;
        const result = await companyService.getCompanyProfileBySlug(slug);
        res.json(result);
    } catch (err) {
        console.error("Error fetching company:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to fetch company" });
    }
}

export async function getIndustries(req, res) {
    try {
        const result = await companyService.getAllIndustries();
        res.json(result);
    } catch (err) {
        console.error("Error fetching industries:", err);
        res.status(500).json({ success: false, error: "Failed to fetch industries" });
    }
}

export async function getCities(req, res) {
    try {
        const result = await companyService.getCitiesWithCompanies();
        res.json(result);
    } catch (err) {
        console.error("Error fetching cities:", err);
        res.status(500).json({ success: false, error: "Failed to fetch cities" });
    }
}

export async function registerCompany(req, res) {
    try {
        const userId = req.user.userId;
        const { name, industry, description, email, phone, website, address, city, state, country, pincode, gstin } = req.body;
        const result = await companyService.registerNewCompany(userId, { name, industry, description, email, phone, website, address, city, state, country, pincode, gstin });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error registering company:", err);
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to register company" });
    }
}

export async function getMyCompany(req, res) {
    try {
        const { companyId } = req.user;
        const result = await companyService.getCompanyByCompanyId(companyId);
        res.json(result);
    } catch (err) {
        console.error("Error fetching company:", err);
        if (err.statusCode === 400 || err.statusCode === 404) {
            return res.status(err.statusCode).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to fetch company" });
    }
}

export async function updateCompany(req, res) {
    try {
        const { companyId } = req.user;
        const updateData = req.body;
        const result = await companyService.updateCompanyDetails(companyId, updateData);
        res.json(result);
    } catch (err) {
        console.error("Error updating company:", err);
        res.status(500).json({ success: false, error: "Failed to update company" });
    }
}
