// backend/src/controllers/finance/invoiceController.js
import * as financeService from '../../services/financeService.js';

export async function getInvoices(req, res, next) {
    try {
        const { type } = req.query;
        const result = await financeService.getAllInvoices(type);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getInvoiceById(req, res, next) {
    try {
        const { id } = req.params;
        const result = await financeService.getInvoiceDetails(id);
        res.json(result);
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
}

export async function createInvoice(req, res, next) {
    try {
        const { invoice_number, type, customer_id, vendor_id, project_id, issue_date, due_date, currency, amount } = req.body;
        const result = await financeService.createNewInvoice(req.user.userId, { invoice_number, type, customer_id, vendor_id, project_id, issue_date, due_date, currency, amount });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function updateInvoice(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await financeService.updateExistingInvoice(id, { status });
        res.json(result);
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
}
