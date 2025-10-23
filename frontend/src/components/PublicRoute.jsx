import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "./Loader";

export default function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "customer") return <Navigate to="/customer/dashboard" replace />;
  }

  return <Outlet />;
}
