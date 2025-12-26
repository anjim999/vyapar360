import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaSun, FaMoon, FaCog } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";
import LanguageSelector from "./LanguageSelector";
// import GlobalSearch from "./GlobalSearch";
// import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const active = (p) =>
    pathname === p || pathname.startsWith(p)
      ? "theme-text-accent font-semibold"
      : "theme-text-secondary";

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/login");
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 200);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="theme-bg-nav backdrop-blur-md theme-shadow-sm fixed top-0 left-0 right-0 z-40 border-b theme-border-light">
      <div className="flex items-center justify-between py-2 px-3 sm:px-6 lg:px-8">
        {/* Left Section: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu - Temporarily disabled */}
          {/* {auth && <MobileMenu />} */}

          <Link to="/" className="flex items-center gap-2">
            <span className="font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-transparent bg-clip-text tracking-wide">
              Vyapar360
            </span>
          </Link>
        </div>

        {/* Center Section: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {auth && (
            <>
              <Link
                className={`hover:theme-text-accent transition ${active("/")}`}
                to="/"
              >
                Dashboard
              </Link>
              <Link
                className={`hover:theme-text-accent transition ${active("/finance")}`}
                to="/finance"
              >
                Finance
              </Link>
              <Link
                className={`hover:theme-text-accent transition ${active("/projects")}`}
                to="/projects"
              >
                Projects
              </Link>
              {auth.user?.role === "admin" && (
                <Link
                  className={`hover:theme-text-accent transition ${active("/admin")}`}
                  to="/admin/users"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Section: Search, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search - Temporarily disabled */}
          {/* {auth && (
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>
          )} */}

          {/* Notifications */}
          {auth && <NotificationBell />}

          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="sun-icon">
              <FaSun className="text-white" />
            </span>
            <span className="moon-icon">
              <FaMoon className="text-blue-200" />
            </span>
          </button>

          {/* User Profile Dropdown */}
          {auth ? (
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setShowDropdown((p) => !p)}
                className="cursor-pointer flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow">
                  {auth.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 theme-bg-secondary rounded-xl theme-shadow-xl border theme-border-light z-50 animate-fade-in-down overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b theme-border-light">
                    <p className="text-sm font-medium theme-text-primary truncate">
                      {auth.user?.name || "User"}
                    </p>
                    <p className="text-xs theme-text-muted truncate">
                      {auth.user?.email}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 capitalize">
                      {auth.user?.role || "user"}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm theme-text-secondary hover:theme-bg-tertiary transition-colors"
                    >
                      <FaUserCircle className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm theme-text-secondary hover:theme-bg-tertiary transition-colors"
                    >
                      <FaCog className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t theme-border-light p-2">
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium hover:from-red-600 hover:to-pink-600 transition-all"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link className="theme-text-accent font-semibold" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
