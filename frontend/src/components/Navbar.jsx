// components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { MdLogout, MdLogin, MdPersonAdd } from "react-icons/md";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/customer/dashboard">TasteLogic</Link>
      </div>

      <div className="navbar-menu">
        <Link to="/customer/dashboard" className="navbar-link">
          Dashboard
        </Link>
        <Link to="/customer/menu" className="navbar-link">
          Menú
        </Link>
        <Link to="/customer/tables" className="navbar-link">
          Mesas
        </Link>
      </div>

      <div className="navbar-actions">
        {user ? (
          // Usuario autenticado - Mostrar nombre y logout
          <>
            <span className="navbar-user">Hola, {user.name}</span>
            <button onClick={handleLogout} className="navbar-btn logout">
              <MdLogout /> Cerrar Sesión
            </button>
          </>
        ) : (
          // Usuario NO autenticado - Mostrar Login y Register
          <>
            <Link to="/login" className="navbar-btn login">
              <MdLogin /> Iniciar Sesión
            </Link>
            <Link to="/register" className="navbar-btn register">
              <MdPersonAdd /> Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
