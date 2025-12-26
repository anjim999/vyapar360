import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false, allowedRoles }) {
  const { auth, loading } = useAuth();

  if (loading) return null;

  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = auth.user?.role || "user";

  // requireAdmin - only platform_admin OR admin can access
  if (requireAdmin && userRole !== "platform_admin" && userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
