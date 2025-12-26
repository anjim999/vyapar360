// backend/src/services/financeService.js
import { query } from '../db/pool.js';
import pool from '../db/pool.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getAllAccounts() {
    const { rows } = await query(
        `SELECT id, code, name, type, parent_account_id, currency
     FROM accounts
     ORDER BY code`
    );
    return rows;
}

export async function createNewAccount(userId, { code, name, type, parent_account_id, currency }) {
    const { rows } = await query(
        `INSERT INTO accounts (code, name, type, parent_account_id, currency)
     VALUES ($1, $2, $3, $4, COALESCE($5, 'INR'))
     RETURNING *`,
        [code, name, type, parent_account_id || null, currency || 'INR']
    );
    await logAudit({
        userId,
        action: 'CREATE_ACCOUNT',
        entityType: 'account',
        entityId: rows[0].id,
        details: JSON.stringify(rows[0]),
    });
    return rows[0];
}

export async function updateExistingAccount(userId, id, { name, type, parent_account_id, currency }) {
    const { rowCount, rows } = await query(
        `UPDATE accounts
     SET name = $1,
         type = $2,
         parent_account_id = $3,
         currency = COALESCE($4, currency)
     WHERE id = $5
     RETURNING *`,
        [name, type, parent_account_id || null, currency, id]
    );
    if (rowCount === 0) {
        const error = new Error('Account not found');
        error.statusCode = 404;
        throw error;
    }
    await logAudit({
        userId,
        action: 'UPDATE_ACCOUNT',
        entityType: 'account',
        entityId: id,
        details: JSON.stringify(rows[0]),
    });
    return rows[0];
}

export async function deleteExistingAccount(userId, id) {
    await query(`DELETE FROM accounts WHERE id = $1`, [id]);
    await logAudit({
        userId,
        action: 'DELETE_ACCOUNT',
        entityType: 'account',
        entityId: id,
    });
    return { message: 'Account deleted' };
}

export async function getAllJournalEntries() {
    const { rows } = await query(
        `SELECT je.*, u.name AS created_by_name, ua.name AS approved_by_name
     FROM journal_entries je
     LEFT JOIN users u ON je.created_by = u.id
     LEFT JOIN users ua ON je.approved_by = ua.id
     ORDER BY je.date DESC, je.id DESC`
    );
    return rows;
}

export async function createNewJournalEntry(userId, { date, description, lines }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            rows: [entry],
        } = await client.query(
            `INSERT INTO journal_entries (date, description, status, created_by)
       VALUES ($1, $2, 'Draft', $3)
       RETURNING *`,
            [date, description, userId]
        );

        for (const line of lines || []) {
            await client.query(
                `INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit)
         VALUES ($1, $2, $3, $4)`,
                [entry.id, line.account_id, line.debit || 0, line.credit || 0]
            );
        }

        await client.query('COMMIT');
        await logAudit({
            userId,
            action: 'CREATE_JOURNAL',
            entityType: 'journal_entry',
            entityId: entry.id,
            details: JSON.stringify({ entry, lines }),
        });

        return entry;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function approveJournal(userId, id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            rows: [entry],
        } = await client.query(
            `UPDATE journal_entries
       SET status = 'Approved',
           approved_by = $1,
           approved_at = NOW()
       WHERE id = $2
       RETURNING *`,
            [userId, id]
        );

        if (!entry) {
            await client.query('ROLLBACK');
            const error = new Error('Journal entry not found');
            error.statusCode = 404;
            throw error;
        }

        const { rows: lines } = await client.query(
            `SELECT jl.*, a.type AS account_type
       FROM journal_lines jl
       JOIN accounts a ON jl.account_id = a.id
       WHERE jl.journal_entry_id = $1`,
            [id]
        );

        for (const line of lines) {
            let direction = 'OUT';
            let amount = line.debit - line.credit;
            if (amount > 0) {
                direction = 'IN';
            } else {
                direction = 'OUT';
                amount = -amount;
            }

            await client.query(
                `INSERT INTO transactions (journal_line_id, txn_date, direction, amount_base)
         VALUES ($1, $2, $3, $4)`,
                [line.id, entry.date, direction, amount]
            );
        }

        await client.query('COMMIT');

        await logAudit({
            userId,
            action: 'APPROVE_JOURNAL',
            entityType: 'journal_entry',
            entityId: id,
            details: JSON.stringify(entry),
        });

        return entry;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function getBalanceSheet(asOf) {
    const asOfDate = asOf || new Date().toISOString().slice(0, 10);

    const { rows } = await query(
        `SELECT a.type, a.name,
            SUM(jl.debit - jl.credit) AS balance
     FROM journal_entries je
     JOIN journal_lines jl ON je.id = jl.journal_entry_id
     JOIN accounts a ON jl.account_id = a.id
     WHERE je.status = 'Approved'
       AND je.date <= $1
     GROUP BY a.type, a.name
     ORDER BY a.type, a.name`,
        [asOfDate]
    );

    return rows;
}

export async function getProfitLoss(from, to) {
    const { rows } = await query(
        `SELECT a.type, a.name,
            SUM(jl.debit - jl.credit) AS amount
     FROM journal_entries je
     JOIN journal_lines jl ON je.id = jl.journal_entry_id
     JOIN accounts a ON jl.account_id = a.id
     WHERE je.status = 'Approved'
       AND je.date BETWEEN $1 AND $2
       AND a.type IN ('REVENUE', 'EXPENSE')
     GROUP BY a.type, a.name
     ORDER BY a.type, a.name`,
        [from, to]
    );

    return rows;
}

export async function getCashFlow(from, to) {
    const { rows } = await query(
        `SELECT txn_date,
            SUM(CASE WHEN direction = 'IN' THEN amount_base ELSE 0 END) AS cash_in,
            SUM(CASE WHEN direction = 'OUT' THEN amount_base ELSE 0 END) AS cash_out
     FROM transactions
     WHERE txn_date BETWEEN $1 AND $2
     GROUP BY txn_date
     ORDER BY txn_date`,
        [from, to]
    );

    return rows;
}

export async function getAllCustomers() {
    const { rows } = await query(
        `SELECT * FROM customers ORDER BY name`
    );
    return rows;
}

export async function createNewCustomer({ name, contact_person, email, phone, address, currency }) {
    const { rows } = await query(
        `INSERT INTO customers (name, contact_person, email, phone, address, currency)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'INR'))
     RETURNING *`,
        [name, contact_person, email, phone, address, currency]
    );
    return rows[0];
}

export async function updateExistingCustomer(id, { name, contact_person, email, phone, address, currency }) {
    const { rows, rowCount } = await query(
        `UPDATE customers
     SET name = $1,
         contact_person = $2,
         email = $3,
         phone = $4,
         address = $5,
         currency = COALESCE($6, currency)
     WHERE id = $7
     RETURNING *`,
        [name, contact_person, email, phone, address, currency, id]
    );
    if (rowCount === 0) {
        const error = new Error('Customer not found');
        error.statusCode = 404;
        throw error;
    }
    return rows[0];
}

export async function getAllVendors() {
    const { rows } = await query(
        `SELECT * FROM vendors ORDER BY name`
    );
    return rows;
}

export async function createNewVendor({ name, contact_person, email, phone, address, currency }) {
    const { rows } = await query(
        `INSERT INTO vendors (name, contact_person, email, phone, address, currency)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'INR'))
     RETURNING *`,
        [name, contact_person, email, phone, address, currency]
    );
    return rows[0];
}

export async function updateExistingVendor(id, { name, contact_person, email, phone, address, currency }) {
    const { rows, rowCount } = await query(
        `UPDATE vendors
     SET name = $1,
         contact_person = $2,
         email = $3,
         phone = $4,
         address = $5,
         currency = COALESCE($6, currency)
     WHERE id = $7
     RETURNING *`,
        [name, contact_person, email, phone, address, currency, id]
    );
    if (rowCount === 0) {
        const error = new Error('Vendor not found');
        error.statusCode = 404;
        throw error;
    }
    return rows[0];
}

export async function getAllExchangeRates() {
    const { rows } = await query(
        `SELECT * FROM exchange_rates ORDER BY rate_date DESC`
    );
    return rows;
}

export async function createNewExchangeRate({ base_currency, target_currency, rate, rate_date }) {
    const { rows } = await query(
        `INSERT INTO exchange_rates (base_currency, target_currency, rate, rate_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [base_currency, target_currency, rate, rate_date]
    );
    return rows[0];
}

export async function getRate(base, target, date) {
    if (base === target) return 1;
    const { rows } = await query(
        `SELECT rate
     FROM exchange_rates
     WHERE base_currency = $1
       AND target_currency = $2
       AND rate_date <= $3
     ORDER BY rate_date DESC
     LIMIT 1`,
        [base, target, date]
    );
    if (!rows[0]) return 1;
    return Number(rows[0].rate);
}

export async function getAllInvoices(type) {
    const params = [];
    let where = '1=1';
    if (type) {
        params.push(type);
        where = 'type = $1';
    }
    const { rows } = await query(
        `SELECT * FROM invoices WHERE ${where} ORDER BY issue_date DESC`,
        params
    );
    return rows;
}

export async function getInvoiceDetails(id) {
    const {
        rows: [inv],
    } = await query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    if (!inv) {
        const error = new Error('Invoice not found');
        error.statusCode = 404;
        throw error;
    }
    return inv;
}

export async function createNewInvoice(userId, { invoice_number, type, customer_id, vendor_id, project_id, issue_date, due_date, currency, amount }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const rate = await getRate(currency, 'INR', issue_date);
        const amount_base = Number(amount) * rate;

        const {
            rows: [inv],
        } = await client.query(
            `INSERT INTO invoices (
         invoice_number, type, customer_id, vendor_id, project_id,
         issue_date, due_date, currency, amount, amount_base, status
       ) VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Draft')
       RETURNING *`,
            [
                invoice_number,
                type,
                customer_id || null,
                vendor_id || null,
                project_id || null,
                issue_date,
                due_date,
                currency || 'INR',
                amount,
                amount_base,
            ]
        );

        await logAudit({
            userId,
            action: 'CREATE_INVOICE',
            entityType: 'invoice',
            entityId: inv.id,
            details: JSON.stringify(inv),
        });

        await client.query('COMMIT');
        return inv;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function updateExistingInvoice(id, { status }) {
    const { rows, rowCount } = await query(
        `UPDATE invoices
     SET status = COALESCE($1, status)
     WHERE id = $2
     RETURNING *`,
        [status, id]
    );
    if (rowCount === 0) {
        const error = new Error('Invoice not found');
        error.statusCode = 404;
        throw error;
    }
    return rows[0];
}

export async function getAllPayments() {
    const { rows } = await query(
        `SELECT * FROM payments ORDER BY payment_date DESC`
    );
    return rows;
}

export async function createNewPayment(userId, { invoice_id, payment_date, amount, currency, method, reference_number }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            rows: [inv],
        } = await client.query(`SELECT * FROM invoices WHERE id = $1`, [invoice_id]);
        if (!inv) {
            await client.query('ROLLBACK');
            const error = new Error('Invoice not found');
            error.statusCode = 404;
            throw error;
        }

        const rate = await getRate(currency, 'INR', payment_date);
        const amount_base = Number(amount) * rate;

        const {
            rows: [pay],
        } = await client.query(
            `INSERT INTO payments (invoice_id, payment_date, amount, amount_base, currency, method, reference_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
            [invoice_id, payment_date, amount, amount_base, currency, method, reference_number]
        );

        const newPaid = Number(inv.paid_amount_base) + amount_base;
        let status = inv.status;
        if (newPaid >= inv.amount_base) status = 'Paid';
        else if (newPaid > 0) status = 'Partially Paid';

        await client.query(
            `UPDATE invoices
       SET paid_amount_base = $1,
           status = $2
       WHERE id = $3`,
            [newPaid, status, invoice_id]
        );

        await client.query('COMMIT');

        await logAudit({
            userId,
            action: 'CREATE_PAYMENT',
            entityType: 'payment',
            entityId: pay.id,
            details: JSON.stringify(pay),
        });

        return pay;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function getDashboardSummary() {
    const [arRes, apRes] = await Promise.all([
        query(`SELECT COALESCE(SUM(amount_base - paid_amount_base),0) AS receivables
           FROM invoices WHERE type = 'AR'`),
        query(`SELECT COALESCE(SUM(amount_base - paid_amount_base),0) AS payables
           FROM invoices WHERE type = 'AP'`)
    ]);
    return {
        receivables: Number(arRes.rows[0].receivables),
        payables: Number(apRes.rows[0].payables),
    };
}

export async function getCashFlowTrend() {
    const { rows } = await query(
        `SELECT date_trunc('month', txn_date) AS month,
            SUM(CASE WHEN direction = 'IN' THEN amount_base ELSE 0 END) AS cash_in,
            SUM(CASE WHEN direction = 'OUT' THEN amount_base ELSE 0 END) AS cash_out
     FROM transactions
     GROUP BY date_trunc('month', txn_date)
     ORDER BY date_trunc('month', txn_date)`
    );
    return rows;
}
