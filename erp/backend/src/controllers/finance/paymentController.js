// backend/src/controllers/finance/paymentController.js
import * as financeService from '../../services/financeService.js';

export async function getPayments(_req, res, next) {
    try {
        const result = await financeService.getAllPayments();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function createPayment(req, res, next) {
    try {
        const { invoice_id, payment_date, amount, currency, method, reference_number } = req.body;
        const result = await financeService.createNewPayment(req.user.userId, { invoice_id, payment_date, amount, currency, method, reference_number });
        res.status(201).json(result);
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
}

export async function getCustomers(_req, res, next) {
    try {
        const result = await financeService.getAllCustomers();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function createCustomer(req, res, next) {
    try {
        const { name, contact_person, email, phone, address, currency } = req.body;
        const result = await financeService.createNewCustomer({ name, contact_person, email, phone, address, currency });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function updateCustomer(req, res, next) {
    try {
        const { id } = req.params;
        const { name, contact_person, email, phone, address, currency } = req.body;
        const result = await financeService.updateExistingCustomer(id, { name, contact_person, email, phone, address, currency });
        res.json(result);
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
}

export async function getVendors(_req, res, next) {
    try {
        const result = await financeService.getAllVendors();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function createVendor(req, res, next) {
    try {
        const { name, contact_person, email, phone, address, currency } = req.body;
        const result = await financeService.createNewVendor({ name, contact_person, email, phone, address, currency });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function updateVendor(req, res, next) {
    try {
        const { id } = req.params;
        const { name, contact_person, email, phone, address, currency } = req.body;
        const result = await financeService.updateExistingVendor(id, { name, contact_person, email, phone, address, currency });
        res.json(result);
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
}
