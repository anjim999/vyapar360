// backend/src/controllers/finance/journalController.js
import * as financeService from '../../services/financeService.js';

export async function getJournalEntries(_req, res, next) {
    try {
        const result = await financeService.getAllJournalEntries();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function createJournalEntry(req, res, next) {
    try {
        const { date, description, lines } = req.body;
        const result = await financeService.createNewJournalEntry(req.user.userId, { date, description, lines });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function approveJournalEntry(req, res, next) {
    try {
        const { id } = req.params;
        const result = await financeService.approveJournal(req.user.userId, id);
        res.json(result);
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
}

export async function getStatementsBalanceSheet(req, res, next) {
    try {
        const asOf = req.query.asOf;
        const result = await financeService.getBalanceSheet(asOf);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getStatementsProfitLoss(req, res, next) {
    try {
        const from = req.query.from;
        const to = req.query.to;
        const result = await financeService.getProfitLoss(from, to);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getStatementsCashFlow(req, res, next) {
    try {
        const from = req.query.from;
        const to = req.query.to;
        const result = await financeService.getCashFlow(from, to);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getExchangeRates(_req, res, next) {
    try {
        const result = await financeService.getAllExchangeRates();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function createExchangeRate(req, res, next) {
    try {
        const { base_currency, target_currency, rate, rate_date } = req.body;
        const result = await financeService.createNewExchangeRate({ base_currency, target_currency, rate, rate_date });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

export async function getFinanceDashboardSummary(_req, res, next) {
    try {
        const result = await financeService.getDashboardSummary();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getFinanceCashFlowTrend(_req, res, next) {
    try {
        const result = await financeService.getCashFlowTrend();
        res.json(result);
    } catch (err) {
        next(err);
    }
}
