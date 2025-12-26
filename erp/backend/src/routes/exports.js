// src/routes/exports.js - Data Export Routes
import express from 'express';
import { authMiddleware, requireCompany } from '../middleware/auth.js';
import { query } from '../db/pool.js';
import { exportToCSV, exportToJSON, generateInvoicePDF, generateReportPDF } from '../utils/dataExport.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

router.use(authMiddleware);

// Export employees to CSV
router.get('/employees/csv', requireCompany, async (req, res) => {
    try {
        const { companyId } = req.user;
        const result = await query(
            `SELECT e.employee_id, e.name, e.email, e.phone, e.designation, e.department_id, 
              e.date_of_joining, e.salary, e.status, e.created_at
       FROM employees e WHERE e.company_id = $1 ORDER BY e.name`,
            [companyId]
        );

        const columns = ['employee_id', 'name', 'email', 'phone', 'designation', 'date_of_joining', 'salary', 'status'];
        const filename = `employees_${companyId}_${Date.now()}`;
        const exportResult = exportToCSV(result.rows, filename, columns);

        if (exportResult.success) {
            res.download(exportResult.filePath, `employees.csv`);
        } else {
            res.status(400).json({ success: false, error: exportResult.error });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: 'Export failed' });
    }
});

// Export customers to CSV
router.get('/customers/csv', requireCompany, async (req, res) => {
    try {
        const { companyId } = req.user;
        const result = await query(
            `SELECT name, email, phone, company_name, address, is_active, created_at
       FROM customers WHERE company_id = $1 ORDER BY name`,
            [companyId]
        );

        const columns = ['name', 'email', 'phone', 'company_name', 'address', 'is_active', 'created_at'];
        const filename = `customers_${companyId}_${Date.now()}`;
        const exportResult = exportToCSV(result.rows, filename, columns);

        if (exportResult.success) {
            res.download(exportResult.filePath, `customers.csv`);
        } else {
            res.status(400).json({ success: false, error: exportResult.error });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: 'Export failed' });
    }
});

// Export invoices to CSV
router.get('/invoices/csv', requireCompany, async (req, res) => {
    try {
        const { companyId } = req.user;
        const { from, to, status } = req.query;

        let queryStr = `
      SELECT invoice_number, customer_name, amount_base, tax_amount, total_amount, 
             status, due_date, payment_date, created_at
      FROM invoices WHERE company_id = $1
    `;
        const params = [companyId];

        if (status) {
            params.push(status);
            queryStr += ` AND status = $${params.length}`;
        }
        if (from) {
            params.push(from);
            queryStr += ` AND created_at >= $${params.length}`;
        }
        if (to) {
            params.push(to);
            queryStr += ` AND created_at <= $${params.length}`;
        }

        queryStr += ' ORDER BY created_at DESC';
        const result = await query(queryStr, params);

        const columns = ['invoice_number', 'customer_name', 'amount_base', 'tax_amount', 'total_amount', 'status', 'due_date', 'created_at'];
        const filename = `invoices_${companyId}_${Date.now()}`;
        const exportResult = exportToCSV(result.rows, filename, columns);

        if (exportResult.success) {
            res.download(exportResult.filePath, `invoices.csv`);
        } else {
            res.status(400).json({ success: false, error: exportResult.error });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: 'Export failed' });
    }
});

// Export products/inventory to CSV
router.get('/inventory/csv', requireCompany, async (req, res) => {
    try {
        const { companyId } = req.user;
        const result = await query(
            `SELECT sku, name, category, quantity, unit, unit_price, cost_price, 
              reorder_level, is_active, created_at
       FROM products WHERE company_id = $1 ORDER BY name`,
            [companyId]
        );

        const columns = ['sku', 'name', 'category', 'quantity', 'unit', 'unit_price', 'cost_price', 'reorder_level', 'is_active'];
        const filename = `inventory_${companyId}_${Date.now()}`;
        const exportResult = exportToCSV(result.rows, filename, columns);

        if (exportResult.success) {
            res.download(exportResult.filePath, `inventory.csv`);
        } else {
            res.status(400).json({ success: false, error: exportResult.error });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: 'Export failed' });
    }
});

// Generate Invoice PDF
router.get('/invoice/:id/pdf', requireCompany, async (req, res) => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;

        // Get invoice
        const invoiceResult = await query(
            'SELECT * FROM invoices WHERE id = $1 AND company_id = $2',
            [id, companyId]
        );

        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];

        // Get company
        const companyResult = await query('SELECT * FROM companies WHERE id = $1', [companyId]);
        const company = companyResult.rows[0] || {};

        // Get customer if exists
        let customer = {};
        if (invoice.customer_id) {
            const customerResult = await query('SELECT * FROM customers WHERE id = $1', [invoice.customer_id]);
            customer = customerResult.rows[0] || {};
        }

        // Get invoice items if table exists
        let items = [];
        try {
            const itemsResult = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);
            items = itemsResult.rows;
        } catch (e) {
            // Invoice items table may not exist
            items = [{
                description: invoice.description || 'Services',
                quantity: 1,
                unit_price: invoice.amount_base || invoice.total_amount
            }];
        }

        invoice.items = items;
        const html = generateInvoicePDF(invoice, company, customer);

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `inline; filename="invoice_${invoice.invoice_number}.html"`);
        res.send(html);

    } catch (error) {
        console.error('Invoice PDF error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate invoice' });
    }
});

// Generate financial report
router.get('/reports/financial', requireCompany, async (req, res) => {
    try {
        const { companyId } = req.user;
        const { from, to, format = 'html' } = req.query;

        // Get income (paid invoices)
        const incomeResult = await query(
            `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM invoices 
       WHERE company_id = $1 AND status = 'paid'
       ${from ? `AND payment_date >= '${from}'` : ''}
       ${to ? `AND payment_date <= '${to}'` : ''}`,
            [companyId]
        );

        // Get expenses
        const expenseResult = await query(
            `SELECT COALESCE(SUM(amount), 0) as total, category
       FROM expenses 
       WHERE company_id = $1
       ${from ? `AND expense_date >= '${from}'` : ''}
       ${to ? `AND expense_date <= '${to}'` : ''}
       GROUP BY category`,
            [companyId]
        );

        const totalIncome = Number(incomeResult.rows[0]?.total || 0);
        const expenses = expenseResult.rows;
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.total), 0);
        const netProfit = totalIncome - totalExpenses;

        const data = [
            { category: 'Revenue', amount: totalIncome },
            ...expenses.map(e => ({ category: e.category || 'Other', amount: Number(e.total) })),
            { category: 'Net Profit', amount: netProfit }
        ];

        const columns = [
            { key: 'category', label: 'Category' },
            { key: 'amount', label: 'Amount (₹)', type: 'amount' }
        ];

        const summary = {
            total_revenue: totalIncome,
            total_expenses: totalExpenses,
            net_profit: netProfit
        };

        if (format === 'csv') {
            const filename = `financial_report_${Date.now()}`;
            const exportResult = exportToCSV(data, filename, ['category', 'amount']);
            if (exportResult.success) {
                return res.download(exportResult.filePath, 'financial_report.csv');
            }
        }

        const html = generateReportPDF('Financial Report', data, columns, summary);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate report' });
    }
});

export default router;
