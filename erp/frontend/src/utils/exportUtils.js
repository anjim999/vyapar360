import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Export data to PDF
 * @param {Object} options - Export options
 * @param {string} options.title - Document title
 * @param {Array} options.columns - Column definitions [{header: string, key: string}]
 * @param {Array} options.data - Array of objects to export
 * @param {string} options.filename - Output filename (without extension)
 * @param {Object} options.metadata - Additional metadata {company, date, etc.}
 */
export function exportToPDF({ title, columns, data, filename, metadata = {} }) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(title, 14, 20);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate
    if (metadata.company) {
        doc.text(metadata.company, 14, 28);
    }
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, metadata.company ? 34 : 28);

    // Table
    const tableColumn = columns.map((col) => col.header);
    const tableRows = data.map((row) =>
        columns.map((col) => {
            const value = row[col.key];
            if (col.format === "currency") {
                return `₹${value?.toLocaleString() || 0}`;
            }
            if (col.format === "date" && value) {
                return new Date(value).toLocaleDateString();
            }
            return value ?? "-";
        })
    );

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: metadata.company ? 40 : 35,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.1,
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
        );
    }

    doc.save(`${filename}.pdf`);
}

/**
 * Export data to Excel
 * @param {Object} options - Export options
 * @param {string} options.title - Sheet name
 * @param {Array} options.columns - Column definitions [{header: string, key: string}]
 * @param {Array} options.data - Array of objects to export
 * @param {string} options.filename - Output filename (without extension)
 */
export function exportToExcel({ title, columns, data, filename }) {
    // Transform data to match headers
    const transformedData = data.map((row) => {
        const newRow = {};
        columns.forEach((col) => {
            let value = row[col.key];
            if (col.format === "currency") {
                value = value ? Number(value) : 0;
            }
            if (col.format === "date" && value) {
                value = new Date(value).toLocaleDateString();
            }
            newRow[col.header] = value ?? "-";
        });
        return newRow;
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(transformedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title || "Sheet1");

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${filename}.xlsx`);
}

/**
 * Export invoice to PDF with detailed layout
 */
export function exportInvoiceToPDF(invoice, lineItems = []) {
    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text("Devopod Construction", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("123 Tech Park, Hyderabad, India", 14, 28);
    doc.text("GST: 36AABCU9603R1ZM", 14, 34);

    // Invoice Title
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text("INVOICE", 150, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`#${invoice.invoice_number}`, 196, 28, { align: "right" });
    doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 196, 34, { align: "right" });
    doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 196, 40, { align: "right" });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 50, 196, 50);

    // Bill To
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Bill To:", 14, 60);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.text(invoice.customer_name || "Customer", 14, 68);

    // Status
    doc.setFontSize(10);
    const statusColor = invoice.status === "PAID" ? [34, 197, 94] : [239, 68, 68];
    doc.setTextColor(...statusColor);
    doc.text(`Status: ${invoice.status}`, 196, 60, { align: "right" });

    // Line Items Table
    if (lineItems.length > 0) {
        autoTable(doc, {
            head: [["Description", "Qty", "Rate", "Amount"]],
            body: lineItems.map((item) => [
                item.description,
                item.quantity,
                `₹${item.rate?.toLocaleString()}`,
                `₹${item.amount?.toLocaleString()}`,
            ]),
            startY: 80,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [59, 130, 246] },
        });
    }

    // Totals
    const finalY = doc.lastAutoTable?.finalY || 80;
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Subtotal:", 140, finalY + 15);
    doc.text(`₹${invoice.amount_base?.toLocaleString()}`, 196, finalY + 15, { align: "right" });

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Total:", 140, finalY + 25);
    doc.text(`₹${invoice.amount_base?.toLocaleString()}`, 196, finalY + 25, { align: "right" });

    // Footer
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });

    doc.save(`invoice-${invoice.invoice_number}.pdf`);
}
