// src/components/AdminNavbar.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose, IoLogOutOutline, IoRestaurantOutline } from "react-icons/io5";

import "./css/Navbar.css";

const ADMIN_NAV_LINKS = [
  { path: "/admin/dashboard", label: "Panel" },
  { path: "/admin/orders", label: "Pedidos" },
  { path: "/admin/reservations", label: "Reservas" },
  { path: "/admin/menu", label: "Menú" },
  { path: "/admin/tables", label: "Mesas" },
];

function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar admin-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link
            to="/admin/dashboard"
            className="navbar-logo"
            onClick={closeMenu}
          >
            <button className="navbar-icon-button" type="button">
              <span className="navbar-icon-circle">
                <IoRestaurantOutline size={20} />
              </span>
              <span className="navbar-icon-text">TASTELOGIC ADMIN</span>
            </button>
          </Link>
        </div>

        <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          {ADMIN_NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar-link ${isActive ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}

          {user && (
            <li className="mobile-logout-item">
              <button
                onClick={handleLogout}
                className="navbar-link logout-btn"
              >
                Cerrar Sesión
              </button>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          {user && (
            <>
              <div className="user-menu">
                <button className="user-button">
                  {user.name || "Admin"}
                </button>
                <div className="dropdown-menu">
                  <Link
                    to="/admin/profile"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Perfil
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Configuración
                  </Link>
                </div>
              </div>

              <button
                className="desktop-logout-btn"
                onClick={handleLogout}
                title="Cerrar Sesión"
              >
                <IoLogOutOutline size={24} />
              </button>
            </>
          )}

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <IoClose size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
