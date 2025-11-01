// pages/customer/Dashboard.jsx
import CustomerLayout from "../../layouts/CustomerLayout";
import { useAuth } from "../../hooks/useAuth";
import AuthOverlay from "../../components/AuthOverlay";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <CustomerLayout>
      <AuthOverlay>
        <div className="dashboard-container">
          <h1>Panel del Cliente</h1>
          <p>
            Bienvenido, {user?.name || "Visitante"}
          </p>
        </div>
      </AuthOverlay>
    </CustomerLayout>
  );
}
