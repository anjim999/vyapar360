// src/components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHome, FaUsers, FaMoneyBillWave, FaBoxes, FaProjectDiagram, FaCog, FaBuilding, FaChevronDown, FaClock, FaCalendarAlt, FaFileInvoice, FaChartLine, FaStore } from "react-icons/fa";

export default function Sidebar() {
  const { auth } = useAuth();
  const role = auth?.user?.role || "user";
  const [expanded, setExpanded] = useState({ hr: false, finance: false, inventory: false });

  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const linkClass = ({ isActive }) =>
    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors " +
    (isActive ? "bg-blue-500 text-white" : "theme-text-secondary hover:theme-bg-tertiary");

  const sectionHeader = (label, key, icon) => (
    <button onClick={() => toggle(key)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold theme-text-muted uppercase hover:theme-bg-tertiary rounded-lg">
      <span className="flex items-center gap-2">{icon}{label}</span>
      <FaChevronDown className={`w-3 h-3 transition-transform ${expanded[key] ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <aside className="hidden md:block w-56 shrink-0 theme-bg-secondary rounded-xl theme-shadow-md p-3 h-fit border theme-border-light sticky top-20">
      {/* Debug: Show current role */}
      <div className="mb-3 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
        Role: <strong>{role}</strong>
      </div>
      <nav className="space-y-1">
        <NavLink to="/dashboard" className={linkClass}><FaHome />Dashboard</NavLink>
        <NavLink to="/marketplace" className={linkClass}><FaStore />Marketplace</NavLink>

        {/* HR Section */}
        {["admin", "company_admin", "hr_manager"].includes(role) && (
          <div>
            {sectionHeader("HR", "hr", <FaUsers className="w-3 h-3" />)}
            {expanded.hr && (
              <div className="ml-3 border-l-2 theme-border-light pl-2">
                <NavLink to="/hr/employees" className={linkClass}>Employees</NavLink>
                <NavLink to="/hr/departments" className={linkClass}>Departments</NavLink>
                <NavLink to="/hr/attendance" className={linkClass}><FaClock className="w-3 h-3" />Attendance</NavLink>
                <NavLink to="/hr/leaves" className={linkClass}><FaCalendarAlt className="w-3 h-3" />Leaves</NavLink>
                <NavLink to="/hr/holidays" className={linkClass}>Holidays</NavLink>
              </div>
            )}
          </div>
        )}

        {/* Finance Section */}
        {["admin", "company_admin", "finance_manager"].includes(role) && (
          <div>
            {sectionHeader("Finance", "finance", <FaMoneyBillWave className="w-3 h-3" />)}
            {expanded.finance && (
              <div className="ml-3 border-l-2 theme-border-light pl-2">
                <NavLink to="/finance" className={linkClass}>Overview</NavLink>
                <NavLink to="/finance/invoices" className={linkClass}><FaFileInvoice className="w-3 h-3" />Invoices</NavLink>
                <NavLink to="/finance/payments" className={linkClass}>Payments</NavLink>
                <NavLink to="/finance/accounts" className={linkClass}>Accounts</NavLink>
                <NavLink to="/finance/customers" className={linkClass}>Customers</NavLink>
                <NavLink to="/finance/vendors" className={linkClass}>Vendors</NavLink>
              </div>
            )}
          </div>
        )}

        {/* Inventory Section */}
        {["admin", "company_admin", "inventory_manager"].includes(role) && (
          <div>
            {sectionHeader("Inventory", "inventory", <FaBoxes className="w-3 h-3" />)}
            {expanded.inventory && (
              <div className="ml-3 border-l-2 theme-border-light pl-2">
                <NavLink to="/inventory/products" className={linkClass}>Products</NavLink>
                <NavLink to="/inventory/categories" className={linkClass}>Categories</NavLink>
                <NavLink to="/inventory/stock" className={linkClass}>Stock</NavLink>
              </div>
            )}
          </div>
        )}

        {/* CRM Section */}
        {["admin", "company_admin", "sales_manager"].includes(role) && (
          <>
            <NavLink to="/crm/leads" className={linkClass}>🎯 Leads</NavLink>
            <NavLink to="/crm/customers" className={linkClass}>👥 Customers</NavLink>
            <NavLink to="/crm/requests" className={linkClass}>📬 Requests</NavLink>
          </>
        )}

        {/* Projects */}
        {["admin", "company_admin", "project_manager"].includes(role) && (
          <>
            <NavLink to="/projects" className={linkClass}><FaProjectDiagram />Projects</NavLink>
            <NavLink to="/projects/tasks" className={linkClass}>📋 Tasks</NavLink>
          </>
        )}

        {/* Admin */}
        {(role === "admin" || role === "platform_admin") && (
          <>
            <p className="mt-4 mb-1 px-3 text-xs font-semibold theme-text-muted uppercase">Platform Admin</p>
            <NavLink to="/admin/company-requests" className={linkClass}>📋 Company Requests</NavLink>
            <NavLink to="/admin/companies" className={linkClass}>🏢 Companies</NavLink>
            <NavLink to="/admin/users" className={linkClass}>👤 Users</NavLink>
            <NavLink to="/admin/analytics" className={linkClass}>📊 Analytics</NavLink>
            <NavLink to="/admin/support" className={linkClass}>🎧 Support</NavLink>
            <NavLink to="/admin/audit-logs" className={linkClass}>📝 Audit Logs</NavLink>
          </>
        )}

        {/* Customer Links */}
        {role === "customer" && (
          <>
            <NavLink to="/marketplace" className={linkClass}>🏪 Browse Companies</NavLink>
            <NavLink to="/my-requests" className={linkClass}>📬 My Requests</NavLink>
            <NavLink to="/saved" className={linkClass}>❤️ Saved</NavLink>
          </>
        )}

        {/* Company Registration - for users without company */}
        {!["admin", "platform_admin", "company_admin"].includes(role) && (
          <NavLink to="/request-company" className={linkClass}>🏢 Register Company</NavLink>
        )}
        <NavLink to="/my-company-requests" className={linkClass}>📄 My Company Requests</NavLink>

        {/* Settings */}
        <div className="pt-4 border-t theme-border-light mt-4">
          <NavLink to="/settings" className={linkClass}><FaCog />Settings</NavLink>
        </div>
      </nav>
    </aside>
  );
}
