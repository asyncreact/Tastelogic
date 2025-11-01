// components/NavbarGuest.jsx

import { useState } from "react";
import { IoRestaurantOutline } from "react-icons/io5";
import { MdLogin, MdPersonAdd, MdMenu, MdClose } from "react-icons/md";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function NavbarGuest() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Logo/Brand - Lado izquierdo */}
      <div className="navbar-brand">
        <IoRestaurantOutline className="navbar-logo" />
        <Link to="/customer/dashboard" onClick={closeMobileMenu}>
          TasteLogic
        </Link>
      </div>

      {/* Toggle para mobile */}
      <button
        className="navbar-mobile-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <MdClose /> : <MdMenu />}
      </button>

      {/* Navigation links - Centro */}
      <div className={`navbar-nav ${mobileMenuOpen ? "open" : ""}`}>
        <Link
          to="/customer/dashboard"
          className="navbar-link"
          onClick={closeMobileMenu}
        >
          <span>Inicio</span>
        </Link>
        <Link
          to="/customer/menu"
          className="navbar-link"
          onClick={closeMobileMenu}
        >
          <span>Menú</span>
        </Link>
        <Link
          to="/customer/tables"
          className="navbar-link"
          onClick={closeMobileMenu}
        >
          <span>Mesas</span>
        </Link>
      </div>

      {/* Botones de autenticación - Lado derecho */}
      <div className="navbar-user">
        <Link
          to="/login"
          className="navbar-link navbar-auth-btn login"
          onClick={closeMobileMenu}
        >
          <MdLogin />
          <span>Iniciar Sesión</span>
        </Link>
        <Link
          to="/register"
          className="navbar-link navbar-auth-btn register"
          onClick={closeMobileMenu}
        >
          <MdPersonAdd />
          <span>Registrarse</span>
        </Link>
      </div>
    </nav>
  );
}
