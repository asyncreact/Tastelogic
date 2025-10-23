import CustomerLayout from "../../layouts/CustomerLayout";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <CustomerLayout>
      <h2>Panel del Cliente</h2>
      <p>Bienvenido, {user?.name}</p>
    </CustomerLayout>
  );
}
