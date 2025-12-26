// src/pages/DashboardPage.jsx - Enhanced Dashboard with Charts & Skeletons
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowUp, FaArrowDown, FaChartLine, FaUsers, FaBuilding,
  FaFileInvoiceDollar, FaProjectDiagram, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaWallet, FaBox
} from "react-icons/fa";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { Card, SkeletonDashboard } from "../components/common";
import { RevenueChart, CashFlowChart, ExpenseDistributionChart } from "../components/Charts";

export default function DashboardPage() {
  const { auth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = auth?.user?.role;
  const companyId = auth?.user?.company_id;

  useEffect(() => {
    fetchDashboardData();
  }, [role, companyId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data based on role
      if (role === 'platform_admin' || role === 'admin') {
        // Platform admin sees platform-wide stats
        const res = await api.get("/api/admin/analytics");
        setData({
          type: 'admin',
          ...res.data
        });
      } else if (companyId) {
        // Company users see company-specific data
        const [summaryRes, alertsRes] = await Promise.all([
          api.get("/api/dashboard").catch(() => ({ data: null })),
          api.get("/api/dashboard/alerts").catch(() => ({ data: null })),
        ]);
        setData({
          type: 'company',
          summary: summaryRes.data,
          alerts: alertsRes.data
        });
      } else {
        // Regular user without company
        setData({ type: 'user' });
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setData({ type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Loading State with Skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold theme-text-primary">Dashboard</h1>
            <p className="theme-text-muted text-sm">Loading your data...</p>
          </div>
        </div>
        <SkeletonDashboard />
      </div>
    );
  }

  // User without company
  if (data?.type === 'user' && !companyId) {
    return <UserDashboard />;
  }

  // Platform Admin Dashboard
  if (data?.type === 'admin') {
    return <AdminDashboard data={data} />;
  }

  // Company Dashboard
  return <CompanyDashboard data={data} />;
}

// ============== User Dashboard (No Company) ==============
function UserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold theme-text-primary">Welcome to Devopod ERP</h1>
        <p className="theme-text-muted">Get started by registering your company or browsing the marketplace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard
          icon={<FaBuilding className="text-blue-500" />}
          title="Register Company"
          description="Create your company profile and access all ERP features"
          link="/request-company"
          buttonText="Get Started"
          gradient="from-blue-500 to-purple-600"
        />
        <QuickActionCard
          icon={<FaUsers className="text-green-500" />}
          title="Browse Marketplace"
          description="Discover businesses and services across India"
          link="/marketplace"
          buttonText="Explore"
          gradient="from-green-500 to-teal-600"
        />
        <QuickActionCard
          icon={<FaFileInvoiceDollar className="text-amber-500" />}
          title="My Requests"
          description="Track your company registration requests"
          link="/my-company-requests"
          buttonText="View Status"
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Features Preview */}
      <Card title="🚀 What You Can Do" padding="lg" className="mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "👥", label: "HR Management", desc: "Employees, Attendance, Payroll" },
            { icon: "💰", label: "Finance", desc: "Invoices, Expenses, Reports" },
            { icon: "📦", label: "Inventory", desc: "Stock, Products, Orders" },
            { icon: "🤝", label: "CRM", desc: "Leads, Customers, Sales" },
          ].map((feature, i) => (
            <div key={i} className="text-center p-4 rounded-xl theme-bg-tertiary">
              <span className="text-3xl">{feature.icon}</span>
              <h4 className="font-medium theme-text-primary mt-2">{feature.label}</h4>
              <p className="text-xs theme-text-muted mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============== Platform Admin Dashboard ==============
function AdminDashboard({ data }) {
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

// ============== Company Dashboard ==============
function CompanyDashboard({ data }) {
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
          <p className="theme-text-muted text-sm">Welcome back! Here's your business overview</p>
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

// ============== Reusable Components ==============

function StatCard({ label, value, icon, iconBg = "blue", prefix = "", trend }) {
  const bgColors = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="theme-bg-secondary rounded-xl p-4 border theme-border-light hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs theme-text-muted uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold theme-text-primary">
            {prefix}{typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`flex items-center text-xs font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                {trend >= 0 ? <FaArrowUp className="w-2 h-2 mr-0.5" /> : <FaArrowDown className="w-2 h-2 mr-0.5" />}
                {Math.abs(trend)}%
              </span>
              <span className="text-xs theme-text-muted">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColors[iconBg]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, link, buttonText, gradient }) {
  return (
    <div className="theme-bg-secondary rounded-xl p-6 border theme-border-light hover:shadow-lg transition-all group">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold theme-text-primary mb-2">{title}</h3>
      <p className="text-sm theme-text-muted mb-4">{description}</p>
      <Link
        to={link}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
      >
        {buttonText}
        <FaArrowUp className="w-3 h-3 rotate-45" />
      </Link>
    </div>
  );
}

function QuickLink({ to, icon, label, size = "md" }) {
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
  };

  return (
    <Link
      to={to}
      className={`${sizeClasses[size]} rounded-xl theme-bg-tertiary hover:theme-bg-secondary border theme-border-light hover:shadow-md transition-all flex flex-col items-center gap-2 group`}
    >
      <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-xs font-medium theme-text-primary text-center">{label}</span>
    </Link>
  );
}
