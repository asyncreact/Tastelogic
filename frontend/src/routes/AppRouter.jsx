// router/AppRouter.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Context Provider
import { MenuProvider } from "../context/MenuContext";

// ✅ Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyAccount from "../pages/auth/VerifyAccount";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// ✅ Dashboards
import AdminDashboard from "../pages/admin/Dashboard";
import CustomerDashboard from "../pages/customer/Dashboard";

// ✅ Admin Pages
import MenuAdmin from "../pages/admin/MenuAdmin";

// ✅ Customer Pages
import MenuCustomer from "../pages/customer/MenuCustomer";

// ✅ Route Guards
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

// ✅ Error Pages
import NotFound from "../pages/errors/NotFound";
import Unauthorized from "../pages/errors/Unauthorized";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MenuProvider>
        <Routes>
          {/* 🔓 Public routes (solo si NO está logueado) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify/:token" element={<VerifyAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* 👤 Customer Dashboard */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🍽️ Customer - Menú */}
          <Route
            path="/customer/menu"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MenuCustomer />
              </ProtectedRoute>
            }
          />

          {/* 🛠️ Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 📋 Admin - Gestión de Menú */}
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MenuAdmin />
              </ProtectedRoute>
            }
          />

          {/* 🚫 Acceso no autorizado */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ❌ Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MenuProvider>
    </BrowserRouter>
  );
}
