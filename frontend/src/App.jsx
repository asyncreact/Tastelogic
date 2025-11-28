import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminTables from './pages/admin/AdminTables';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReservations from './pages/admin/AdminReservations';

import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

import ClientLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <Routes>
      {/* Rutas públicas de auth */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/verify/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Rutas cliente PÚBLICAS con navbar */}
      <Route element={<ClientLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reservations" element={<Reservations />} />
      </Route>

      {/* Rutas ADMIN protegidas */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route
          path="users"
          element={
            <div className="container py-5">
              <div className="card shadow">
                <div className="card-header bg-danger text-white">
                  <h4>Gestión de Usuarios</h4>
                </div>
                <div className="card-body">Próximamente: Lista de usuarios</div>
              </div>
            </div>
          }
        />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="tables" element={<AdminTables />} />
        <Route path="reservations" element={<AdminReservations />} />
      </Route>

      {/* Otras rutas */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Redirect component: "/" -> admin/dashboard si es admin, si no al menú
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Visitantes y clientes van al menú
  return <Navigate to="/menu" replace />;
}

export default App;
