// src/pages/dashboard/SalesDashboard.jsx
import { FaClock, FaUserTie, FaHandshake, FaClipboardList, FaMoneyBillWave } from "react-icons/fa";
import { Card } from "../../components/common";
import { StatCard, QuickLink } from "./components";

export function SalesDashboard({ data, userName }) {
    const summary = data?.summary || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">🤝 Sales Dashboard</h1>
                    <p className="theme-text-muted text-sm">Welcome back, {userName}! Drive your sales</p>
                </div>
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                    <FaClock className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Leads"
                    value={summary.totalLeads || 0}
                    icon={<FaUserTie />}
                    iconBg="blue"
                />
                <StatCard
                    label="Active Customers"
                    value={summary.activeCustomers || 0}
                    icon={<FaHandshake />}
                    iconBg="green"
                />
                <StatCard
                    label="Pending Requests"
                    value={summary.pendingRequests || 0}
                    icon={<FaClipboardList />}
                    iconBg="amber"
                />
                <StatCard
                    label="This Month Sales"
                    value={summary.monthlySales || 0}
                    icon={<FaMoneyBillWave />}
                    iconBg="purple"
                    prefix="₹"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Leads */}
                <Card title="📋 Recent Leads" padding="md">
                    <div className="space-y-3">
                        {[
                            { name: "ABC Corp", status: "New", value: "₹50,000" },
                            { name: "XYZ Ltd", status: "Contacted", value: "₹1,20,000" },
                            { name: "Tech Solutions", status: "Qualified", value: "₹80,000" },
                            { name: "Global Services", status: "Proposal", value: "₹2,00,000" },
                        ].map((lead, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-lg theme-bg-tertiary">
                                <div>
                                    <span className="font-medium theme-text-primary">{lead.name}</span>
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        {lead.status}
                                    </span>
                                </div>
                                <span className="text-green-500 font-semibold">{lead.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="⚡ Quick Actions" padding="md">
                    <div className="grid grid-cols-2 gap-3">
                        <QuickLink to="/crm/leads" icon="👤" label="Leads" size="sm" />
                        <QuickLink to="/crm/customers" icon="🤝" label="Customers" size="sm" />
                        <QuickLink to="/crm/requests" icon="📧" label="Requests" size="sm" />
                        <QuickLink to="/teams" icon="💬" label="Team Chat" size="sm" />
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default SalesDashboard;
