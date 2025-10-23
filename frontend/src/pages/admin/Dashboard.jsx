import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <h2>Panel de Administración</h2>
      <p>Bienvenido, {user?.name}</p>
    </AdminLayout>
  );
}
