// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosClient";
import { FaSignInAlt, FaSpinner } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
console.log("VITE_GOOGLE_CLIENT_ID =", import.meta.env.VITE_GOOGLE_CLIENT_ID);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn(
        "VITE_GOOGLE_CLIENT_ID is not set. Google login will be disabled."
      );
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, user } = res.data || {};

      if (!token || !user) {
        toast.error("Login succeeded but server sent no token/user");
        return;
      }

      login({ token, user });

      toast.success("Login successful!", { autoClose: 1500 });

      setTimeout(() => {
        if (user.role === "admin") navigate("/admin/users");
        else navigate("/");
      }, 1500);
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      toast.error(backendMsg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error("Google login is not configured.");
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      toast.error("Google services not loaded yet. Please try again.");
      return;
    }

    setGoogleLoading(true);

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const idToken = response.credential;
          if (!idToken) {
            toast.error("Google login failed: no credential received.");
            setGoogleLoading(false);
            return;
          }

          try {
            const res = await api.post("/api/auth/google", { idToken });
            const { token, user } = res.data || {};

            if (!token || !user) {
              toast.error("Google login succeeded but no token/user returned.");
              setGoogleLoading(false);
              return;
            }

            login({ token, user });

            toast.success("Logged in with Google!", { autoClose: 1500 });

            setTimeout(() => {
              if (user.role === "admin") navigate("/admin");
              else navigate("/");
            }, 1500);
          } catch (err) {
            const backendMsg = err?.response?.data?.message;
            toast.error(backendMsg || "Google login failed. Please try again.");
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt((notification) => {
        const notDisplayed = notification.isNotDisplayed?.();
        const skipped = notification.isSkippedMoment?.();
        if (notDisplayed || skipped) {
          setGoogleLoading(false);
        }
      });
    } catch (err) {
      console.error("Error during Google login:", err);
      toast.error("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center theme-bg-primary p-6">
      <ToastContainer />

      <div className="w-full max-w-md theme-bg-secondary rounded-2xl theme-shadow-xl p-8 space-y-6 border theme-border-light">
        <div className="text-center">
          <FaSignInAlt className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <h1 className="text-3xl font-extrabold theme-text-primary">Sign In</h1>
        </div>

        {/* Test Users Dropdown */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <label className="block text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            🧪 Quick Test Login
          </label>
          <select
            onChange={(e) => {
              const [email, role] = e.target.value.split('|');
              if (email) {
                setEmail(email);
                setPassword('192357');
              }
            }}
            className="w-full text-sm border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2"
          >
            <option value="">-- Select Test User --</option>
            <option value="admin@vyapar360.com|platform_admin">🔧 Platform Admin</option>
            <option value="company.admin@test.com|company_admin">👔 Company Admin</option>
            <option value="hr.manager@test.com|hr_manager">👥 HR Manager</option>
            <option value="finance.manager@test.com|finance_manager">💰 Finance Manager</option>
            <option value="sales.manager@test.com|sales_manager">📈 Sales Manager</option>
            <option value="accountant@test.com|accountant">📊 Accountant</option>
            <option value="employee1@test.com|employee">👤 Employee - John Doe</option>
            <option value="employee2@test.com|employee">👤 Employee - Jane Smith</option>
            <option value="employee3@test.com|employee">👤 Employee - Bob Johnson</option>
            <option value="support@test.com|support">🎧 Support - Sarah Williams</option>
            <optgroup label="─────── Customers ───────">
              <option value="customer1@test.com|customer">🛒 Customer - Alex Brown</option>
              <option value="customer2@test.com|customer">🛒 Customer - Maria Garcia</option>
            </optgroup>
          </select>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Password: <strong>192357</strong> (auto-filled)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-1">
              Email address
            </label>
            <input
              type="email"
              className="w-full border theme-border-light theme-bg-tertiary theme-text-primary rounded-lg px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border theme-border-light theme-bg-tertiary theme-text-primary rounded-lg px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 active:scale-[0.98] transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin w-4 h-4" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 theme-border-light bg-current opacity-30" />
          <span className="text-xs theme-text-muted">OR</span>
          <div className="h-px flex-1 theme-border-light bg-current opacity-30" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="cursor-pointer w-full border theme-border-light theme-bg-secondary theme-text-primary py-2.5 rounded-lg font-semibold shadow-sm hover:theme-bg-tertiary active:scale-[0.98] transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <>
              <FaSpinner className="animate-spin w-4 h-4" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="flex justify-between text-xs pt-2">
          <Link
            to="/register"
            className="theme-text-accent font-medium hover:underline cursor-pointer transition-colors duration-150"
          >
            Register
          </Link>

          <Link
            to="/forgot-password"
            className="theme-text-accent font-medium hover:underline cursor-pointer transition-colors duration-150"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}