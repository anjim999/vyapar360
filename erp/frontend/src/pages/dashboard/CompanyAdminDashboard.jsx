// src/pages/dashboard/CompanyAdminDashboard.jsx
import { FaClock, FaProjectDiagram, FaWallet, FaFileInvoiceDollar, FaBox } from "react-icons/fa";
import { Card } from "../../components/common";
import { RevenueChart, CashFlowChart, ExpenseDistributionChart } from "../../components/Charts";
import { StatCard, QuickLink } from "./components";

export function CompanyAdminDashboard({ data, userName }) {
    const summary = data?.summary || {};
    const alerts = data?.alerts || {};

    // Sample chart data (in production, this would come from API)
    const revenueData = [
        { month: "Jan", revenue: 450000 },
        { month: "Feb", revenue: 520000 },
        { month: "Mar", revenue: 480000 },
        { month: "Apr", revenue: 610000 },
        { month: "May", revenue: 590000 },
        { month: "Jun", revenue: 720000 },
    ];

    const cashFlowData = [
        { month: "Jan", income: 450000, expense: 320000 },
        { month: "Feb", income: 520000, expense: 380000 },
        { month: "Mar", income: 480000, expense: 350000 },
        { month: "Apr", income: 610000, expense: 420000 },
        { month: "May", income: 590000, expense: 450000 },
        { month: "Jun", income: 720000, expense: 480000 },
    ];

    const expenseData = [
        { name: "Salaries", value: 350000 },
        { name: "Operations", value: 280000 },
        { name: "Marketing", value: 150000 },
        { name: "Utilities", value: 120000 },
        { name: "Other", value: 80000 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">Company Dashboard</h1>
                    <p className="theme-text-muted text-sm">Welcome back, {userName}! Here's your business overview</p>
                </div>
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                    <FaClock className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Projects"
                    value={summary.totalProjects || 0}
                    icon={<FaProjectDiagram />}
                    iconBg="blue"
                    trend={12}
                />
                <StatCard
                    label="Receivables"
                    value={summary.totalReceivables || 0}
                    icon={<FaWallet />}
                    iconBg="green"
                    prefix="₹"
                    trend={5}
                />
                <StatCard
                    label="Payables"
                    value={summary.totalPayables || 0}
                    icon={<FaFileInvoiceDollar />}
                    iconBg="red"
                    prefix="₹"
                    trend={-3}
                />
                <StatCard
                    label="Inventory Items"
                    value={summary.inventoryCount || 0}
                    icon={<FaBox />}
                    iconBg="purple"
                    trend={8}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="📈 Revenue Trend" padding="md">
                    <RevenueChart data={revenueData} />
                </Card>
                <Card title="💰 Cash Flow" padding="md">
                    <CashFlowChart data={cashFlowData} />
                </Card>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expense Distribution */}
                <Card title="🥧 Expense Distribution" padding="md">
                    <ExpenseDistributionChart data={expenseData} />
                </Card>

                {/* Overdue Invoices */}
                <Card title="⚠️ Overdue Invoices" padding="md">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {alerts?.overdueInvoices?.length > 0 ? (
                            alerts.overdueInvoices.map((inv) => (
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

                {/* Quick Actions */}
                <Card title="⚡ Quick Actions" padding="md">
                    <div className="grid grid-cols-2 gap-3">
                        <QuickLink to="/finance/invoices" icon="📄" label="Invoices" size="sm" />
                        <QuickLink to="/hr/employees" icon="👥" label="Employees" size="sm" />
                        <QuickLink to="/inventory/products" icon="📦" label="Products" size="sm" />
                        <QuickLink to="/projects" icon="📊" label="Projects" size="sm" />
                        <QuickLink to="/crm/customers" icon="🤝" label="Customers" size="sm" />
                        <QuickLink to="/settings" icon="⚙️" label="Settings" size="sm" />
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default CompanyAdminDashboard;
