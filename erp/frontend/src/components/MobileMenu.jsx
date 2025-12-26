import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);
    const menuRef = useRef(null);
    const { auth, logout } = useAuth();
    const role = auth?.user?.role || "user";

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Close menu on route change
    const handleLinkClick = () => {
        setIsOpen(false);
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const linkClass = ({ isActive }) =>
        `block px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive
            ? "bg-blue-600 text-white"
            : "theme-text-secondary hover:theme-bg-tertiary"
        }`;

    const sectionClass =
        "flex items-center justify-between px-4 py-2.5 rounded-lg text-sm theme-text-secondary hover:theme-bg-tertiary cursor-pointer";

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:theme-bg-tertiary transition-colors"
                aria-label="Toggle menu"
            >
                <FaBars className="w-5 h-5 theme-text-secondary" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" />
            )}

            {/* Slide-out Menu */}
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 h-full w-72 theme-bg-secondary z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } shadow-2xl`}
            >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b theme-border-light">
                    <Link
                        to="/"
                        onClick={handleLinkClick}
                        className="font-bold text-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-transparent bg-clip-text"
                    >
                        Devopod ERP
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:theme-bg-tertiary"
                    >
                        <FaTimes className="w-5 h-5 theme-text-muted" />
                    </button>
                </div>

                {/* Menu Content */}
                <nav className="p-3 overflow-y-auto h-[calc(100%-140px)]">
                    <NavLink to="/" className={linkClass} onClick={handleLinkClick} end>
                        🏠 Dashboard
                    </NavLink>

                    {/* Finance Section */}
                    {(role === "admin" || role === "finance_manager") && (
                        <div className="mt-2">
                            <button
                                onClick={() => toggleSection("finance")}
                                className={sectionClass}
                            >
                                <span>💰 Finance</span>
                                {expandedSection === "finance" ? (
                                    <FaChevronUp className="w-3 h-3" />
                                ) : (
                                    <FaChevronDown className="w-3 h-3" />
                                )}
                            </button>
                            {expandedSection === "finance" && (
                                <div className="ml-4 mt-1 space-y-1 animate-fade-in-down">
                                    <NavLink
                                        to="/finance"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                        end
                                    >
                                        Finance Dashboard
                                    </NavLink>
                                    <NavLink
                                        to="/finance/accounts"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Accounts
                                    </NavLink>
                                    <NavLink
                                        to="/finance/journals"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Journals
                                    </NavLink>
                                    <NavLink
                                        to="/finance/statements"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Statements
                                    </NavLink>
                                    <NavLink
                                        to="/finance/invoices"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Invoices
                                    </NavLink>
                                    <NavLink
                                        to="/finance/payments"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Payments
                                    </NavLink>
                                    <NavLink
                                        to="/finance/customers"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Customers
                                    </NavLink>
                                    <NavLink
                                        to="/finance/vendors"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Vendors
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Projects Section */}
                    {(role === "admin" || role === "project_manager") && (
                        <div className="mt-2">
                            <NavLink
                                to="/projects"
                                className={linkClass}
                                onClick={handleLinkClick}
                            >
                                📁 Projects
                            </NavLink>
                        </div>
                    )}

                    {/* Admin Section */}
                    {role === "admin" && (
                        <div className="mt-2">
                            <button
                                onClick={() => toggleSection("admin")}
                                className={sectionClass}
                            >
                                <span>⚙️ Admin</span>
                                {expandedSection === "admin" ? (
                                    <FaChevronUp className="w-3 h-3" />
                                ) : (
                                    <FaChevronDown className="w-3 h-3" />
                                )}
                            </button>
                            {expandedSection === "admin" && (
                                <div className="ml-4 mt-1 space-y-1 animate-fade-in-down">
                                    <NavLink
                                        to="/admin/users"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Users
                                    </NavLink>
                                    <NavLink
                                        to="/admin/audit-logs"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Audit Logs
                                    </NavLink>
                                    <NavLink
                                        to="/admin/integrations"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Integrations
                                    </NavLink>
                                    <NavLink
                                        to="/settings"
                                        className={linkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Settings
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Menu Footer */}
                {auth && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t theme-border-light theme-bg-secondary">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {auth.user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium theme-text-primary truncate">
                                    {auth.user?.name || "User"}
                                </p>
                                <p className="text-xs theme-text-muted truncate">
                                    {auth.user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                handleLinkClick();
                            }}
                            className="w-full py-2 px-4 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
