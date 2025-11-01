import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user || !user.role) return <Navigate to="/" replace />;

  const userRole = user.role.toLowerCase();
  const normalizedRoles = allowedRoles.map((r) => r.toLowerCase());

  if (allowedRoles.length > 0 && !normalizedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
