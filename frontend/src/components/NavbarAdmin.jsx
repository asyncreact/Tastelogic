// components/NavbarAdmin.jsx

import { IoRestaurantOutline } from "react-icons/io5";
import { FaPowerOff } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Navbar.css";

export default function NavbarAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <header className="navbar">
      {/* Logo/Brand - Lado izquierdo */}
      <div className="navbar-brand">
        <IoRestaurantOutline className="navbar-logo" />
        <Link to="/admin/dashboard" className="navbar-brand-link">
          TasteLogic Admin
        </Link>
      </div>

      {/* Navigation - Centro */}
      <nav className="navbar-nav">
        <Link to="/admin/dashboard" className="navbar-link">
          Dashboard
        </Link>
        <Link to="/admin/menu" className="navbar-link">
          Menú
        </Link>
        <Link to="/admin/tables" className="navbar-link">
          Mesas
        </Link>
      </nav>

      {/* User Info - Lado derecho */}
      <div className="navbar-user">
        <div className="navbar-user-info">
          <div className="navbar-user-name">{user?.name}</div>
          <div className="navbar-user-role">{user?.role}</div>
        </div>

        <button 
          className="navbar-logout" 
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <FaPowerOff />
        </button>
      </div>
    </header>
  );
}
