// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Componentes de rutas
import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Pages públicas
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Pages protegidas (Customer)
import Dashboard from './pages/Dashboard';

// Pages admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Pages de error
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* ========================================
          RUTAS PÚBLICAS
      ======================================== */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="/verify/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ========================================
          RUTAS PROTEGIDAS (Customer)
      ======================================== */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* ========================================
          RUTAS ADMIN
      ======================================== */}
      {/* Ruta principal de admin - redirige a dashboard */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      
      {/* ✅ Dashboard de admin */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Subrutas de admin */}
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <div className="container py-5">
              <div className="card shadow">
                <div className="card-header bg-danger text-white">
                  <h4>👥 Gestión de Usuarios</h4>
                </div>
                <div className="card-body">
                  <p>Próximamente: Lista de usuarios</p>
                </div>
              </div>
            </div>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <AdminRoute>
            <div className="container py-5">
              <div className="card shadow">
                <div className="card-header bg-success text-white">
                  <h4>🍽️ Gestión de Menú</h4>
                </div>
                <div className="card-body">
                  <p>Próximamente: Administración de menú</p>
                </div>
              </div>
            </div>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <div className="container py-5">
              <div className="card shadow">
                <div className="card-header bg-warning">
                  <h4>📦 Gestión de Órdenes</h4>
                </div>
                <div className="card-body">
                  <p>Próximamente: Lista de órdenes</p>
                </div>
              </div>
            </div>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tables"
        element={
          <AdminRoute>
            <div className="container py-5">
              <div className="card shadow">
                <div className="card-header bg-info text-white">
                  <h4>🪑 Gestión de Mesas</h4>
                </div>
                <div className="card-body">
                  <p>Próximamente: Administración de mesas</p>
                </div>
              </div>
            </div>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <AdminRoute>
            <div className="container py-5">
              <div className="card shadow">
                <div className="card-header bg-secondary text-white">
                  <h4>📅 Gestión de Reservas</h4>
                </div>
                <div className="card-body">
                  <p>Próximamente: Lista de reservas</p>
                </div>
              </div>
            </div>
          </AdminRoute>
        }
      />

      {/* ========================================
          RUTAS ESPECIALES
      ======================================== */}
      <Route path="/" element={<HomeRedirect />} />
      
      {/* Página de acceso denegado */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Página 404 - debe ser la última */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ✅ Componente auxiliar para redirigir home según rol
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'admin' 
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/dashboard" replace />;
}

export default App;
