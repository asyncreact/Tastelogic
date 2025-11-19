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
import AdminMenu from './pages/admin/AdminMenu';
import AdminTables from './pages/admin/AdminTables';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReservations from './pages/admin/AdminReservations'; // ✅ Importar AdminReservations

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
      
      {/* Dashboard de admin */}
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
                  <h4>Gestión de Usuarios</h4>
                </div>
                <div className="card-body">
                  <p>Próximamente: Lista de usuarios</p>
                </div>
              </div>
            </div>
          </AdminRoute>
        }
      />
      
      {/* ✅ Menú de admin */}
      <Route
        path="/admin/menu"
        element={
          <AdminRoute>
            <AdminMenu />
          </AdminRoute>
        }
      />
      
      {/* ✅ Órdenes de admin */}
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />
      
      {/* ✅ Mesas y Zonas de admin */}
      <Route
        path="/admin/tables"
        element={
          <AdminRoute>
            <AdminTables />
          </AdminRoute>
        }
      />
      
      {/* ✅ Reservas de admin */}
      <Route
        path="/admin/reservations"
        element={
          <AdminRoute>
            <AdminReservations />
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

// Componente auxiliar para redirigir home según rol
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
