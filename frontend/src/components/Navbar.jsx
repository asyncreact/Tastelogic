// src/components/Navbar.jsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOrder } from "../hooks/useOrder";
import { BsSun, BsMoon } from "react-icons/bs";
import { RiShoppingBag4Line } from "react-icons/ri";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose, IoLogOutOutline } from "react-icons/io5";
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setIsDarkMode(initialTheme === "dark");
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

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
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* --- IZQUIERDA: Toggle + Logo --- */}
        <div className="navbar-left">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <BsSun size={18} /> : <BsMoon size={18} />}
          </button>

          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            TASTELOGIC
          </Link>
        </div>

        {/* --- CENTRO: Menú Links --- */}
        {user && (
          <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="navbar-link" onClick={closeMenu}>
                  {link.label}
                </Link>
              </li>
            ))}
            
            {/* Logout en móvil */}
            <li className="mobile-logout-item">
              <button onClick={handleLogout} className="navbar-link logout-btn">
                Cerrar Sesión
              </button>
            </li>
          </ul>
        )}

        {/* --- DERECHA: Bolsa + Usuario + Logout --- */}
        <div className="navbar-actions">
          {user ? (
            <>
              {/* 1. Bolsa */}
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

              {/* 2. Usuario */}
              <div className="user-menu">
                <button className="user-button">
                  {user.name || "Mi Cuenta"}
                </button>
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="dropdown-item" onClick={closeMenu}>Perfil</Link>
                  <Link to="/reservations" className="dropdown-item" onClick={closeMenu}>Reservas</Link>
                </div>
              </div>

              {/* 3. Logout (Icono PC) */}
              <button 
                className="desktop-logout-btn" 
                onClick={handleLogout}
                title="Cerrar Sesión"
              >
                <IoLogOutOutline size={24} />
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="user-button" onClick={closeMenu}>Ingresar</Link>
              <Link to="/register" className="user-button" onClick={closeMenu}>Registrar</Link>
            </div>
          )}

          {/* Menú Hamburguesa */}
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