// components/NavbarCustomer.jsx

import { IoRestaurantOutline } from "react-icons/io5";
import { FaPowerOff } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Navbar.css";

export default function NavbarCustomer() {
  const { user, logout } = useAuth();

  const handleLogout = () => logout();

  return (
    <header className="navbar">
      {/* 🔹 Logo / título */}
      <div className="navbar-logo">
        <span className="navbar-icon">
          <IoRestaurantOutline size={20} />
        </span>
        <span className="navbar-title">TasteLogic</span>
      </div>

      {/* 🔹 Enlaces del cliente */}
      <nav className="navbar-links">
        <Link to="/customer/menu">Menú</Link>
      </nav>

      {/* 🔹 Usuario */}
      <div className="navbar-user">
        <div className="navbar-user-info">
          <div className="navbar-user-name">{user?.name}</div>
          <div className="navbar-user-role">{user?.role}</div>
        </div>

        {/* 🔴 Botón de logout con ícono */}
        <button className="navbar-logout" onClick={handleLogout}>
          <FaPowerOff size={18} />
        </button>
      </div>
    </header>
  );
}
