// src/controllers/marketplaceController.js
import * as marketplaceService from "../../services/marketplaceService.js";

export async function getContactRequests(req, res) {
    try {
        const { userId, companyId, role } = req.user;
        const { status } = req.query;
        const result = await marketplaceService.getContactRequestsByUser(userId, companyId, role, { status });
        res.json(result);
    } catch (err) {
        console.error("Error fetching contact requests:", err);
        res.status(500).json({ success: false, error: "Failed to fetch contact requests" });
    }
}

export async function sendContactRequest(req, res) {
    try {
        const { userId } = req.user;
        const { company_id, subject, message, service_type, budget_range, urgency } = req.body;
        const result = await marketplaceService.sendNewContactRequest(userId, { company_id, subject, message, service_type, budget_range, urgency });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error sending contact request:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to send contact request" });
    }
}

export async function replyToRequest(req, res) {
    try {
        const { companyId, userId } = req.user;
        const { id } = req.params;
        const { reply_message, status } = req.body;
        const result = await marketplaceService.replyToContactRequest(companyId, userId, id, { reply_message, status });
        res.json(result);
    } catch (err) {
        console.error("Error replying to request:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to reply to request" });
    }
}

export async function updateRequestStatus(req, res) {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const { status } = req.body;
        const result = await marketplaceService.updateContactRequestStatus(companyId, id, { status });
        res.json(result);
    } catch (err) {
        console.error("Error updating request status:", err);
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to update request status" });
    }
}

export async function getCompanyReviews(req, res) {
    try {
        const { company_id } = req.params;
        const result = await marketplaceService.getReviewsForCompany(company_id);
        res.json(result);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ success: false, error: "Failed to fetch reviews" });
    }
}

export async function addReview(req, res) {
    try {
        const { userId } = req.user;
        const { company_id, rating, title, review } = req.body;
        const result = await marketplaceService.addCompanyReview(userId, { company_id, rating, title, review });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error adding review:", err);
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: "Failed to add review" });
    }
}

export async function getSavedCompanies(req, res) {
    try {
        const { userId } = req.user;
        const result = await marketplaceService.getUserSavedCompanies(userId);
        res.json(result);
    } catch (err) {
        console.error("Error fetching saved companies:", err);
        res.status(500).json({ success: false, error: "Failed to fetch saved companies" });
    }
}

export async function saveCompany(req, res) {
    try {
        const { userId } = req.user;
        const { company_id } = req.body;
        const result = await marketplaceService.saveCompanyForUser(userId, { company_id });
        res.json(result);
    } catch (err) {
        console.error("Error saving company:", err);
        res.status(500).json({ success: false, error: "Failed to save company" });
    }
}

export async function unsaveCompany(req, res) {
    try {
        const { userId } = req.user;
        const { company_id } = req.params;
        const result = await marketplaceService.unsaveCompanyForUser(userId, company_id);
        res.json(result);
    } catch (err) {
        console.error("Error unsaving company:", err);
        res.status(500).json({ success: false, error: "Failed to unsave company" });
    }
}

export async function submitSupportTicket(req, res) {
    try {
        const { userId } = req.user;
        const { subject, message, category } = req.body;
        const result = await marketplaceService.createSupportTicket(userId, { subject, message, category });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error submitting support ticket:", err);
        res.status(500).json({ success: false, error: "Failed to submit support ticket" });
    }
}
