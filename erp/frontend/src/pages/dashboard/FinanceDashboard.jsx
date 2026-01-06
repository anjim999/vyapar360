// src/pages/dashboard/FinanceDashboard.jsx
import { FaClock, FaMoneyBillWave, FaWallet, FaFileInvoiceDollar, FaExclamationTriangle } from "react-icons/fa";
import { Card } from "../../components/common";
import { CashFlowChart } from "../../components/Charts";
import { StatCard, QuickLink } from "./components";

export function FinanceDashboard({ data, userName }) {
    const summary = data?.summary || {};
    const alerts = data?.alerts || {};

    const cashFlowData = [
        { month: "Jan", income: 450000, expense: 320000 },
        { month: "Feb", income: 520000, expense: 380000 },
        { month: "Mar", income: 480000, expense: 350000 },
        { month: "Apr", income: 610000, expense: 420000 },
        { month: "May", income: 590000, expense: 450000 },
        { month: "Jun", income: 720000, expense: 480000 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">💰 Finance Dashboard</h1>
                    <p className="theme-text-muted text-sm">Welcome back, {userName}! Track your finances</p>
                </div>
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                    <FaClock className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={summary.totalRevenue || 0}
                    icon={<FaMoneyBillWave />}
                    iconBg="green"
                    prefix="₹"
                    trend={12}
                />
                <StatCard
                    label="Receivables"
                    value={summary.totalReceivables || 0}
                    icon={<FaWallet />}
                    iconBg="blue"
                    prefix="₹"
                />
                <StatCard
                    label="Payables"
                    value={summary.totalPayables || 0}
                    icon={<FaFileInvoiceDollar />}
                    iconBg="red"
                    prefix="₹"
                />
                <StatCard
                    label="Overdue Invoices"
                    value={alerts?.overdueInvoices?.length || 0}
                    icon={<FaExclamationTriangle />}
                    iconBg="amber"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="💰 Cash Flow" padding="md">
                    <CashFlowChart data={cashFlowData} />
                </Card>

                {/* Overdue Invoices */}
                <Card title="⚠️ Overdue Invoices" padding="md">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {alerts?.overdueInvoices?.length > 0 ? (
                            alerts.overdueInvoices.slice(0, 5).map((inv) => (
                                <div key={inv.id} className="flex justify-between items-center p-3 rounded-lg theme-bg-tertiary">
                                    <div>
                                        <span className="theme-text-primary font-medium">{inv.invoice_number}</span>
                                        <p className="text-xs theme-text-muted">Due: {inv.due_date?.slice(0, 10)}</p>
                                    </div>
                                    <span className="text-red-500 font-semibold">₹{inv.amount_base?.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <span className="text-4xl">🎉</span>
                                <p className="theme-text-muted text-sm mt-2">No overdue invoices!</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card title="⚡ Quick Actions" padding="md">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <QuickLink to="/finance/invoices" icon="📄" label="Invoices" size="sm" />
                    <QuickLink to="/finance/payments" icon="💳" label="Payments" size="sm" />
                    <QuickLink to="/finance/expenses" icon="📊" label="Expenses" size="sm" />
                    <QuickLink to="/finance/accounts" icon="🏦" label="Accounts" size="sm" />
                    <QuickLink to="/finance/reports" icon="📈" label="Reports" size="sm" />
                    <QuickLink to="/teams" icon="💬" label="Team Chat" size="sm" />
                </div>
            </Card>
        </div>
    );
}

export default FinanceDashboard;
