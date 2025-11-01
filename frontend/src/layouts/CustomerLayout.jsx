// layouts/CustomerLayout.jsx

import { useAuth } from "../hooks/useAuth";
import NavbarCustomer from "../components/NavbarCustomer";
import NavbarGuest from "../components/NavbarGuest";

export default function CustomerLayout({ children }) {
  const { user } = useAuth();

  return (
    <div>
      {/* Mostrar NavbarGuest si no está autenticado, NavbarCustomer si lo está */}
      {user ? <NavbarCustomer /> : <NavbarGuest />}
      
      <main style={{ padding: "20px" }}>
        {children}
      </main>
    </div>
  );
}
