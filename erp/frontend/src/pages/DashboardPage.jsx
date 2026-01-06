// src/pages/DashboardPage.jsx - Role-Based Dashboard Router
import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { SkeletonDashboard } from "../components/common";
import { ROLES } from "../constants";
import {
  AdminDashboard,
  CompanyAdminDashboard,
  UserDashboard,
  HRDashboard,
  FinanceDashboard,
  ProjectDashboard,
  InventoryDashboard,
  SalesDashboard,
  EmployeeDashboard
} from "./dashboard";

export default function DashboardPage() {
  const { auth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = auth?.user?.role;
  const companyId = auth?.user?.company_id;
  const userName = auth?.user?.name || "User";

  useEffect(() => {
    fetchDashboardData();
  }, [role, companyId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data based on role
      if (role === ROLES.PLATFORM_ADMIN || role === 'admin') {
        const res = await api.get("/api/admin/analytics").catch(() => ({ data: {} }));
        setData({ type: 'admin', ...res.data });
      } else if (companyId) {
        const [summaryRes, alertsRes] = await Promise.all([
          api.get("/api/dashboard").catch(() => ({ data: {} })),
          api.get("/api/dashboard/alerts").catch(() => ({ data: {} })),
        ]);
        setData({
          type: 'company',
          summary: summaryRes.data || {},
          alerts: alertsRes.data || {}
        });
      } else {
        setData({ type: 'user' });
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setData({ type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Loading State
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

  // Role-specific Company Dashboards
  switch (role) {
    case ROLES.COMPANY_ADMIN:
      return <CompanyAdminDashboard data={data} userName={userName} />;
    case ROLES.HR_MANAGER:
      return <HRDashboard data={data} userName={userName} />;
    case ROLES.FINANCE_MANAGER:
      return <FinanceDashboard data={data} userName={userName} />;
    case ROLES.PROJECT_MANAGER:
      return <ProjectDashboard data={data} userName={userName} />;
    case ROLES.INVENTORY_MANAGER:
      return <InventoryDashboard data={data} userName={userName} />;
    case ROLES.SALES_MANAGER:
      return <SalesDashboard data={data} userName={userName} />;
    case ROLES.EMPLOYEE:
      return <EmployeeDashboard data={data} userName={userName} />;
    default:
      return <CompanyAdminDashboard data={data} userName={userName} />;
  }
}
