// backend/src/controllers/finance/accountController.js
import * as financeService from '../../services/financeService.js';

export async function getAccounts(_req, res, next) {
    try {
        const result = await financeService.getAllAccounts();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function createAccount(req, res, next) {
    try {
        const { code, name, type, parent_account_id, currency } = req.body;
        const result = await financeService.createNewAccount(req.user.userId, { code, name, type, parent_account_id, currency });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function updateAccount(req, res, next) {
    try {
        const { id } = req.params;
        const { name, type, parent_account_id, currency } = req.body;
        const result = await financeService.updateExistingAccount(req.user.userId, id, { name, type, parent_account_id, currency });
        res.json(result);
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
}

export async function deleteAccount(req, res, next) {
    try {
        const { id } = req.params;
        const result = await financeService.deleteExistingAccount(req.user.userId, id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}
