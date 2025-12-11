import { useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOrder } from "../hooks/useOrder";

import { RiShoppingBag4Line } from "react-icons/ri";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose, IoLogOutOutline, IoRestaurantOutline } from "react-icons/io5";

import "./css/Navbar.css";

const NAV_LINKS = [
  { path: "/dashboard", label: "Home" },
  { path: "/menu", label: "Menú" },
  { path: "/orders", label: "Pedidos" },
  { path: "/reservations", label: "Reservas" },
];

function AppNavbar() {
  const { user, logout } = useAuth();
  const { cart } = useOrder();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  const cartItemsCount = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  return (
    <nav
      className="navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <button className="navbar-icon-button" type="button">
              <span className="navbar-icon-circle">
                <IoRestaurantOutline size={20} />
              </span>
              <span className="navbar-icon-text">TASTELOGIC</span>
            </button>
          </Link>
        </div>

        <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          {NAV_LINKS.map((link) => {
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

          {!user && (
            <>
              <li>
                <Link
                  to="/login"
                  className="navbar-link"
                  onClick={closeMenu}
                >
                  Ingresar
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="navbar-link"
                  onClick={closeMenu}
                >
                  Registrar
                </Link>
              </li>
            </>
          )}

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
          <Link
            to="/orders"
            className="cart-icon"
            onClick={closeMenu}
            aria-label="Carrito"
          >
            <RiShoppingBag4Line size={20} />
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </Link>

          {user ? (
            <>
              <div className="user-menu">
                <button className="user-button">
                  {user.name || "Mi Cuenta"}
                </button>
                <div className="dropdown-menu">
                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Perfil
                  </Link>
                  <Link
                    to="/reservations"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Reservas
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
          ) : (
            <div className="user-menu">
              <button className="user-button">Visitante</button>
            </div>
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

export default AppNavbar;
