// src/components/layout/Sidebar.jsx
// Main navigation sidebar

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTeamsNotification } from "../../context/TeamsNotificationContext";
import {
    FaHome, FaUsers, FaMoneyBillWave, FaProjectDiagram, FaBoxes,
    FaChartLine, FaCog, FaBuilding, FaBriefcase, FaEnvelope,
    FaCalendarAlt, FaClock, FaFileInvoice, FaChevronDown,
    FaUserTie, FaWarehouse, FaHandshake, FaShoppingCart,
    FaStar, FaHeart, FaQuestionCircle, FaComments
} from "react-icons/fa";
import { ROLES } from "../../constants";
import { ComingSoonBadge, PremiumBadge } from "../common";

export function Sidebar({ isOpen, onClose }) {
    const { auth } = useAuth();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    // Get Teams notification count for badge
    const teamsNotification = useTeamsNotification();
    const teamsUnreadCount = teamsNotification?.unreadCount || 0;

    const userRole = auth?.user?.role || ROLES.EMPLOYEE;

    const toggleMenu = (key) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Define navigation based on user role
    const getNavigation = () => {
        const commonItems = [
            {
                name: "Dashboard",
                path: "/dashboard",
                icon: <FaHome />,
            },
            {
                name: "Teams Chat",
                path: "/teams",
                icon: <FaComments />,
                badge: teamsUnreadCount,
            },
        ];

        // Company roles navigation
        const companyNavigation = [
            {
                name: "HR Management",
                icon: <FaUsers />,
                roles: [ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER],
                children: [
                    { name: "Employees", path: "/hr/employees", icon: <FaUserTie /> },
                    { name: "Departments", path: "/hr/departments", icon: <FaBuilding /> },
                    { name: "Attendance", path: "/hr/attendance", icon: <FaClock /> },
                    { name: "Leaves", path: "/hr/leaves", icon: <FaCalendarAlt /> },
                    { name: "Holidays", path: "/hr/holidays", icon: <FaCalendarAlt /> },
                    { name: "Payroll", path: "/hr/payroll", icon: <FaMoneyBillWave />, comingSoon: true },
                ],
            },
            {
                name: "Finance",
                icon: <FaMoneyBillWave />,
                roles: [ROLES.COMPANY_ADMIN, ROLES.FINANCE_MANAGER],
                children: [
                    { name: "Invoices", path: "/finance/invoices", icon: <FaFileInvoice /> },
                    { name: "Payments", path: "/finance/payments", icon: <FaMoneyBillWave /> },
                    { name: "Accounts", path: "/finance/accounts", icon: <FaChartLine /> },
                    { name: "Expenses", path: "/finance/expenses", icon: <FaShoppingCart /> },
                    { name: "Reports", path: "/finance/reports", icon: <FaChartLine /> },
                ],
            },
            {
                name: "Inventory",
                icon: <FaBoxes />,
                roles: [ROLES.COMPANY_ADMIN, ROLES.INVENTORY_MANAGER],
                children: [
                    { name: "Products", path: "/inventory/products", icon: <FaBoxes /> },
                    { name: "Categories", path: "/inventory/categories", icon: <FaWarehouse /> },
                    { name: "Stock", path: "/inventory/stock", icon: <FaWarehouse /> },
                    { name: "Purchase Orders", path: "/inventory/purchase-orders", icon: <FaShoppingCart /> },
                    { name: "Low Stock Alerts", path: "/inventory/alerts", icon: <FaWarehouse /> },
                ],
            },
            {
                name: "Projects",
                icon: <FaProjectDiagram />,
                roles: [ROLES.COMPANY_ADMIN, ROLES.PROJECT_MANAGER, ROLES.EMPLOYEE],
                children: [
                    { name: "All Projects", path: "/projects", icon: <FaProjectDiagram /> },
                    { name: "Tasks", path: "/projects/tasks", icon: <FaBriefcase /> },
                    { name: "Time Logs", path: "/projects/time-logs", icon: <FaClock /> },
                    { name: "Gantt Chart", path: "/projects/gantt", icon: <FaChartLine />, premium: true },
                ],
            },
            {
                name: "CRM",
                icon: <FaHandshake />,
                roles: [ROLES.COMPANY_ADMIN, ROLES.SALES_MANAGER],
                children: [
                    { name: "Leads", path: "/crm/leads", icon: <FaUserTie /> },
                    { name: "Customers", path: "/crm/customers", icon: <FaUsers /> },
                    { name: "Contact Requests", path: "/crm/requests", icon: <FaEnvelope /> },
                ],
            },
            {
                name: "Analytics",
                path: "/analytics",
                icon: <FaChartLine />,
                roles: [ROLES.COMPANY_ADMIN],
            },
            {
                name: "Settings",
                path: "/settings",
                icon: <FaCog />,
                roles: [ROLES.COMPANY_ADMIN],
            },
        ];

        // Customer navigation
        const customerNavigation = [
            {
                name: "Browse Companies",
                path: "/marketplace",
                icon: <FaBuilding />,
            },
            {
                name: "My Requests",
                path: "/my-requests",
                icon: <FaEnvelope />,
            },
            {
                name: "Saved Companies",
                path: "/saved",
                icon: <FaHeart />,
            },
            {
                name: "My Reviews",
                path: "/my-reviews",
                icon: <FaStar />,
            },
        ];

        // Platform admin navigation
        const platformAdminNavigation = [
            {
                name: "All Companies",
                path: "/admin/companies",
                icon: <FaBuilding />,
            },
            {
                name: "All Users",
                path: "/admin/users",
                icon: <FaUsers />,
            },
            {
                name: "Platform Analytics",
                path: "/admin/analytics",
                icon: <FaChartLine />,
            },
            {
                name: "Support Tickets",
                path: "/admin/support",
                icon: <FaQuestionCircle />,
            },
            {
                name: "Settings",
                path: "/admin/settings",
                icon: <FaCog />,
            },
        ];

        if (userRole === ROLES.PLATFORM_ADMIN) {
            return [...commonItems, ...platformAdminNavigation];
        } else if (userRole === ROLES.CUSTOMER) {
            return [...commonItems, ...customerNavigation];
        } else {
            // Filter company navigation based on role
            const filteredNav = companyNavigation.filter((item) => {
                if (!item.roles) return true;
                return item.roles.includes(userRole);
            });
            return [...commonItems, ...filteredNav];
        }
    };

    const navigation = getNavigation();

    const NavItem = ({ item }) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus[item.name];
        const isActive = location.pathname === item.path ||
            (hasChildren && item.children.some(child => location.pathname === child.path));

        if (hasChildren) {
            return (
                <div className="mb-1">
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className={`
              w-full flex items-center justify-between px-4 py-2.5 rounded-xl
              transition-all duration-200 group
              ${isActive
                                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800 theme-text-secondary hover:theme-text-primary"
                            }
            `}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`text-lg ${isActive ? "text-blue-500" : ""}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.name}</span>
                        </div>
                        <FaChevronDown
                            className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>

                    {isExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l-2 theme-border-light">
                            {item.children.map((child) => (
                                <NavLink
                                    key={child.path}
                                    to={child.comingSoon || child.premium ? "#" : child.path}
                                    onClick={(e) => {
                                        if (child.comingSoon || child.premium) {
                                            e.preventDefault();
                                        }
                                        if (window.innerWidth < 1024) onClose?.();
                                    }}
                                    className={({ isActive }) => `
                    flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    transition-all duration-200 mb-1
                    ${isActive && !child.comingSoon && !child.premium
                                            ? "bg-blue-500 text-white"
                                            : child.comingSoon || child.premium
                                                ? "opacity-60 cursor-not-allowed theme-text-muted"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-800 theme-text-secondary hover:theme-text-primary"
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-2">
                                        {child.icon}
                                        <span>{child.name}</span>
                                    </div>
                                    {child.comingSoon && <ComingSoonBadge />}
                                    {child.premium && <PremiumBadge />}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <NavLink
                to={item.path}
                onClick={() => {
                    if (window.innerWidth < 1024) onClose?.();
                }}
                className={({ isActive }) => `
          flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1
          transition-all duration-200
          ${isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 theme-text-secondary hover:theme-text-primary"
                    }
        `}
            >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium flex-1">{item.name}</span>
                {item.badge > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        {item.badge > 99 ? "99+" : item.badge}
                    </span>
                )}
            </NavLink>
        );
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-72 z-50
          theme-bg-secondary border-r theme-border-light
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-center border-b theme-border-light">
                    <NavLink to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            V
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Vyapar360
                        </span>
                    </NavLink>
                </div>

                {/* Navigation */}
                <nav className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
                    {navigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;
