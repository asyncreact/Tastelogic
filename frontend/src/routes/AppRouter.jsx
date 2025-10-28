// router/AppRouter.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Context Providers
import { MenuProvider } from "../context/MenuContext";
import { TablesProvider } from "../context/TablesContext";

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
import TablesAdmin from "../pages/admin/TablesAdmin";

// ✅ Customer Pages
import MenuCustomer from "../pages/customer/MenuCustomer";
import TablesCustomer from "../pages/customer/TablesCustomer"; // ✅ AGREGAR

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
        <TablesProvider>
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

            {/* 🪑 Customer - Ver Mesas y Zonas ✅ AGREGAR ESTA RUTA */}
            <Route
              path="/customer/tables"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <TablesCustomer />
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

            {/* 🪑 Admin - Gestión de Mesas y Zonas */}
            <Route
              path="/admin/tables"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TablesAdmin />
                </ProtectedRoute>
              }
            />

            {/* 🚫 Acceso no autorizado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ❌ Página no encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TablesProvider>
      </MenuProvider>
    </BrowserRouter>
  );
}
