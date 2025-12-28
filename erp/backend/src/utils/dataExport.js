// src/utils/dataExport.js - CSV and PDF Export Utilities
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure exports directory exists
const exportsDir = path.join(__dirname, '..', '..', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// ============== CSV Export ==============
export function exportToCSV(data, filename, columns) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, error: 'No data to export' };
  }

  try {
    // Get column headers
    const headers = columns || Object.keys(data[0]);

    // Build CSV content
    let csvContent = headers.join(',') + '\n';

    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header] ?? '';

        // Handle different types
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }

        // Escape special characters
        value = String(value).replace(/"/g, '""');

        // Quote if contains comma, newline, or quote
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }

        return value;
      });

      csvContent += values.join(',') + '\n';
    });

    // Write to file
    const filePath = path.join(exportsDir, `${filename}.csv`);
    fs.writeFileSync(filePath, csvContent, 'utf8');

    return {
      success: true,
      filePath,
      filename: `${filename}.csv`,
      size: Buffer.byteLength(csvContent, 'utf8')
    };
  } catch (error) {
    console.error('CSV export error:', error);
    return { success: false, error: error.message };
  }
}

// ============== JSON Export ==============
export function exportToJSON(data, filename) {
  if (!data) {
    return { success: false, error: 'No data to export' };
  }

  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const filePath = path.join(exportsDir, `${filename}.json`);
    fs.writeFileSync(filePath, jsonContent, 'utf8');

    return {
      success: true,
      filePath,
      filename: `${filename}.json`,
      size: Buffer.byteLength(jsonContent, 'utf8')
    };
  } catch (error) {
    console.error('JSON export error:', error);
    return { success: false, error: error.message };
  }
}

// ============== HTML to PDF (Simple) ==============
export function generatePDFHTML(title, content, styles = '') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          font-size: 12px; 
          line-height: 1.5;
          padding: 40px;
          color: #333;
        }
        .header { 
          border-bottom: 2px solid #667eea; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .header h1 { 
          color: #667eea; 
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p { color: #666; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 10px; 
          text-align: left;
        }
        th { 
          background: #f8f9fa; 
          font-weight: 600;
          color: #333;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #ddd;
          text-align: center;
          color: #888;
          font-size: 10px;
        }
        .amount { text-align: right; font-weight: 600; }
        .total-row { background: #667eea !important; color: white; }
        .total-row td { font-weight: 700; }
        ${styles}
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}

// Generate Invoice PDF HTML
export function generateInvoicePDF(invoice, company, customer) {
  const items = invoice.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const tax = subtotal * (invoice.tax_rate || 0) / 100;
  const total = subtotal + tax;

  const content = `
    <div class="header">
      <h1>${company?.name || 'Company Name'}</h1>
      <p>${company?.address || ''} ${company?.city || ''}</p>
      <p>GSTIN: ${company?.gstin || 'N/A'} | Phone: ${company?.phone || 'N/A'}</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div>
        <h3 style="color: #667eea; margin-bottom: 10px;">Bill To:</h3>
        <p><strong>${customer?.name || invoice.customer_name || 'Customer'}</strong></p>
        <p>${customer?.address || ''}</p>
        <p>Email: ${customer?.email || 'N/A'}</p>
        <p>Phone: ${customer?.phone || 'N/A'}</p>
      </div>
      <div style="text-align: right;">
        <h2 style="color: #667eea;">INVOICE</h2>
        <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
        <p><strong>Date:</strong> ${new Date(invoice.date || invoice.created_at).toLocaleDateString('en-IN')}</p>
        <p><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'N/A'}</p>
        <p><strong>Status:</strong> ${invoice.status?.toUpperCase() || 'PENDING'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Description</th>
          <th style="text-align: center;">Qty</th>
          <th class="amount">Unit Price</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.description || item.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td class="amount">₹${Number(item.unit_price).toLocaleString('en-IN')}</td>
            <td class="amount">₹${(item.quantity * item.unit_price).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="3" class="amount">Subtotal</td>
          <td class="amount">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
        ${invoice.tax_rate ? `
        <tr>
          <td colspan="3" class="amount">Tax (${invoice.tax_rate}%)</td>
          <td class="amount">₹${tax.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td colspan="3" class="amount">TOTAL</td>
          <td class="amount">₹${total.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    ${invoice.notes ? `
    <div style="margin-top: 30px;">
      <h4>Notes:</h4>
      <p style="color: #666;">${invoice.notes}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Generated by Vyapar360 on ${new Date().toLocaleString('en-IN')}</p>
    </div>
  `;

  return generatePDFHTML(`Invoice ${invoice.invoice_number}`, content);
}

// Generate Report PDF HTML
export function generateReportPDF(title, data, columns, summary = null) {
  const tableRows = data.map(row => `
    <tr>
      ${columns.map(col => `<td${col.type === 'amount' ? ' class="amount"' : ''}>${col.type === 'amount' ? `₹${Number(row[col.key] || 0).toLocaleString('en-IN')}` :
    col.type === 'date' ? new Date(row[col.key]).toLocaleDateString('en-IN') :
      row[col.key] || '-'
    }</td>`).join('')}
    </tr>
  `).join('');

  const content = `
    <div class="header">
      <h1>${title}</h1>
      <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
    </div>

    ${summary ? `
    <div style="display: flex; gap: 20px; margin-bottom: 30px;">
      ${Object.entries(summary).map(([key, value]) => `
        <div style="background: #f8f9fa; padding: 15px 25px; border-radius: 8px; flex: 1;">
          <p style="color: #666; font-size: 11px; text-transform: uppercase;">${key.replace(/_/g, ' ')}</p>
          <p style="font-size: 20px; font-weight: 700; color: #667eea;">${typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <table>
      <thead>
        <tr>
          ${columns.map(col => `<th${col.type === 'amount' ? ' class="amount"' : ''}>${col.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <div class="footer">
      <p>Total Records: ${data.length}</p>
      <p>Generated by Vyapar360</p>
    </div>
  `;

  return generatePDFHTML(title, content);
}

// Clean up old export files (older than 24 hours)
export function cleanupOldExports() {
  try {
    const files = fs.readdirSync(exportsDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    files.forEach(file => {
      const filePath = path.join(exportsDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up export: ${file}`);
      }
    });
  } catch (error) {
    console.error('Export cleanup error:', error);
  }
}

export default {
  exportToCSV,
  exportToJSON,
  generatePDFHTML,
  generateInvoicePDF,
  generateReportPDF,
  cleanupOldExports
};
