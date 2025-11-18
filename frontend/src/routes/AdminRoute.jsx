// src/routes/AdminRoute.jsx
import PrivateRoute from './PrivateRoute';

function AdminRoute({ children }) {
  return (
    <PrivateRoute requiredRole="admin">
      {children}
    </PrivateRoute>
  );
}

export default AdminRoute;
