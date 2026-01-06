// src/pages/dashboard/AdminDashboard.jsx
import { FaUsers, FaBuilding, FaCheckCircle, FaClock } from "react-icons/fa";
import { Card } from "../../components/common";
import { RevenueChart, CashFlowChart } from "../../components/Charts";
import { StatCard, QuickLink } from "./components";

export function AdminDashboard({ data }) {
    const summary = data?.summary || {};
    const growth = data?.growth || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">Platform Dashboard</h1>
                    <p className="theme-text-muted text-sm">Overview of the entire platform</p>
                </div>
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                    <FaClock className="w-4 h-4" />
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Users"
                    value={summary.totalUsers || 0}
                    icon={<FaUsers />}
                    iconBg="blue"
                    trend={12}
                />
                <StatCard
                    label="Total Companies"
                    value={summary.totalCompanies || 0}
                    icon={<FaBuilding />}
                    iconBg="green"
                    trend={8}
                />
                <StatCard
                    label="Active Companies"
                    value={summary.activeCompanies || 0}
                    icon={<FaCheckCircle />}
                    iconBg="purple"
                    trend={5}
                />
                <StatCard
                    label="Pending Requests"
                    value={summary.pendingRequests || 0}
                    icon={<FaClock />}
                    iconBg="amber"
                    trend={-3}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="📈 Platform Growth" padding="md">
                    {growth.length > 0 ? (
                        <RevenueChart data={growth.map(g => ({ month: g.month, revenue: g.users * 1000 }))} />
                    ) : (
                        <div className="h-64 flex items-center justify-center theme-text-muted">
                            No growth data available
                        </div>
                    )}
                </Card>
                <Card title="🏢 Company Registrations" padding="md">
                    {growth.length > 0 ? (
                        <CashFlowChart data={growth.map(g => ({ month: g.month, income: g.companies * 1000, expense: 0 }))} />
                    ) : (
                        <div className="h-64 flex items-center justify-center theme-text-muted">
                            No registration data available
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickLink to="/admin/company-requests" icon="📋" label="Company Requests" />
                <QuickLink to="/admin/companies" icon="🏢" label="Manage Companies" />
                <QuickLink to="/admin/users" icon="👥" label="Manage Users" />
                <QuickLink to="/admin/analytics" icon="📊" label="Analytics" />
            </div>
        </div>
    );
}

export default AdminDashboard;
