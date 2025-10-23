import { useAuth } from "../hooks/useAuth";
import NavbarAdmin from "./NavbarAdmin";
import NavbarCustomer from "./NavbarCustomer";

export default function Navbar() {
  const { user } = useAuth();

  // Si no hay usuario logueado, no mostramos ningún navbar
  if (!user) return null;

  const role = user.role?.toLowerCase();

  if (role === "admin") return <NavbarAdmin />;
  if (role === "customer") return <NavbarCustomer />;

  return null; // Por si algún rol nuevo no tiene navbar asignado
}
