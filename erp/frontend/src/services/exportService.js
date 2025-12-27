// src/services/exportService.js - Data Export Service
import api from "../api/axiosClient";

import { API_BASE_URL as BASE_URL } from "../config/env";

// Helper to download file
function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Export employees to CSV
export async function exportEmployeesCSV() {
    const response = await api.get("/api/exports/employees/csv", {
        responseType: "blob",
    });
    downloadFile(response.data, "employees.csv");
}

// Export customers to CSV
export async function exportCustomersCSV() {
    const response = await api.get("/api/exports/customers/csv", {
        responseType: "blob",
    });
    downloadFile(response.data, "customers.csv");
}

// Export invoices to CSV
export async function exportInvoicesCSV(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/exports/invoices/csv?${queryString}`, {
        responseType: "blob",
    });
    downloadFile(response.data, "invoices.csv");
}

// Export inventory to CSV
export async function exportInventoryCSV() {
    const response = await api.get("/api/exports/inventory/csv", {
        responseType: "blob",
    });
    downloadFile(response.data, "inventory.csv");
}

// Get invoice PDF (opens in new tab)
export function getInvoicePDFUrl(invoiceId) {
    const token = localStorage.getItem("erp-token");
    return `${BASE_URL}/api/exports/invoice/${invoiceId}/pdf?token=${token}`;
}

// Open invoice PDF in new tab
export function openInvoicePDF(invoiceId) {
    window.open(getInvoicePDFUrl(invoiceId), "_blank");
}

// Get financial report
export async function getFinancialReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/exports/reports/financial?${queryString}`);
    return response.data;
}

// Export financial report to CSV
export async function exportFinancialReportCSV(params = {}) {
    const queryParams = { ...params, format: "csv" };
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await api.get(`/api/exports/reports/financial?${queryString}`, {
        responseType: "blob",
    });
    downloadFile(response.data, "financial_report.csv");
}

export default {
    exportEmployeesCSV,
    exportCustomersCSV,
    exportInvoicesCSV,
    exportInventoryCSV,
    getInvoicePDFUrl,
    openInvoicePDF,
    getFinancialReport,
    exportFinancialReportCSV,
};
