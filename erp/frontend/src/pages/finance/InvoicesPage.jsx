import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFilePdf, FaFileExcel, FaDownload } from "react-icons/fa";
import api from "../../api/axiosClient";
import { toast } from "react-toastify";
import { exportToPDF, exportToExcel } from "../../utils/exportUtils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const params =
        typeFilter === "ALL" ? {} : { params: { type: typeFilter } };
      const res = await api.get("/api/finance/invoices", params);
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [typeFilter]);

  const handleExportPDF = () => {
    exportToPDF({
      title: "Invoices Report",
      columns: [
        { header: "Invoice #", key: "invoice_number" },
        { header: "Type", key: "type" },
        { header: "Issue Date", key: "issue_date", format: "date" },
        { header: "Due Date", key: "due_date", format: "date" },
        { header: "Amount", key: "amount_base", format: "currency" },
        { header: "Paid", key: "paid_amount_base", format: "currency" },
        { header: "Status", key: "status" },
      ],
      data: invoices,
      filename: `invoices-${new Date().toISOString().slice(0, 10)}`,
      metadata: { company: "Devopod Construction ERP" },
    });
    toast.success("PDF exported successfully!");
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportToExcel({
      title: "Invoices",
      columns: [
        { header: "Invoice #", key: "invoice_number" },
        { header: "Type", key: "type" },
        { header: "Issue Date", key: "issue_date", format: "date" },
        { header: "Due Date", key: "due_date", format: "date" },
        { header: "Amount", key: "amount_base", format: "currency" },
        { header: "Paid", key: "paid_amount_base", format: "currency" },
        { header: "Status", key: "status" },
      ],
      data: invoices,
      filename: `invoices-${new Date().toISOString().slice(0, 10)}`,
    });
    toast.success("Excel exported successfully!");
    setShowExportMenu(false);
  };

  if (loading) return <div className="theme-text-primary">Loading invoices...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold theme-text-primary">Invoices</h1>
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium theme-bg-tertiary theme-text-secondary hover:bg-green-100 dark:hover:bg-green-900 transition-colors border theme-border-light"
            >
              <FaDownload className="w-3 h-3" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 theme-bg-secondary rounded-lg theme-shadow-xl border theme-border-light z-50 animate-fade-in-down overflow-hidden">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm theme-text-primary hover:theme-bg-tertiary transition-colors"
                >
                  <FaFilePdf className="w-4 h-4 text-red-500" />
                  Export PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm theme-text-primary hover:theme-bg-tertiary transition-colors"
                >
                  <FaFileExcel className="w-4 h-4 text-green-500" />
                  Export Excel
                </button>
              </div>
            )}
          </div>

          <Link
            to="/finance/invoices/new"
            className="text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
          >
            + New Invoice
          </Link>
        </div>
      </div>

      <div className="theme-bg-secondary rounded-xl theme-shadow-md p-3 flex gap-3 items-center border theme-border-light">
        <span className="text-xs theme-text-muted">Filter:</span>
        <select
          className="border theme-border-light theme-bg-tertiary theme-text-primary rounded px-2 py-1 text-xs"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="AR">Accounts Receivable (AR)</option>
          <option value="AP">Accounts Payable (AP)</option>
        </select>
        <span className="ml-auto text-xs theme-text-muted">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="theme-bg-secondary rounded-xl theme-shadow-md p-4 overflow-x-auto border theme-border-light">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b theme-border-light theme-bg-tertiary">
              <th className="text-left py-2 px-2 theme-text-secondary">Invoice #</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Type</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Issue</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Due</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Amount</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Paid</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b theme-border-light last:border-b-0 hover:theme-bg-tertiary transition-colors">
                <td className="py-2 px-2 theme-text-primary font-medium">{inv.invoice_number}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${inv.type === "AR"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    }`}>
                    {inv.type}
                  </span>
                </td>
                <td className="py-2 px-2 theme-text-secondary">
                  {inv.issue_date ? inv.issue_date.slice(0, 10) : ""}
                </td>
                <td className="py-2 px-2 theme-text-secondary">
                  {inv.due_date ? inv.due_date.slice(0, 10) : ""}
                </td>
                <td className="py-2 px-2 theme-text-primary font-medium">₹{inv.amount_base?.toLocaleString()}</td>
                <td className="py-2 px-2 theme-text-primary">₹{inv.paid_amount_base?.toLocaleString()}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === "PAID"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : inv.status === "OVERDUE"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center theme-text-muted">
                  <p className="text-3xl mb-2">📄</p>
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
