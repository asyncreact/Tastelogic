// components/AuthOverlay.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { MdLock, MdClose } from "react-icons/md";
import "./AuthOverlay.css";

export default function AuthOverlay({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Si el usuario está autenticado, mostrar el contenido normal
  if (user) {
    return <>{children}</>;
  }

  // Handler para capturar clicks en el contenido
  const handleContentClick = (e) => {
    // Prevenir la acción por defecto
    e.preventDefault();
    e.stopPropagation();
    // Mostrar el modal
    setShowModal(true);
  };

  // Si NO está autenticado, mostrar overlay transparente
  return (
    <>
      {/* Contenido visible pero no interactivo */}
      <div style={{ position: "relative" }}>
        {children}
        
        {/* Overlay transparente que captura clicks */}
        <div 
          className="auth-overlay-backdrop" 
          onClick={handleContentClick}
        />
      </div>

      {/* Modal de autenticación */}
      {showModal && (
        <div className="auth-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="auth-modal-close" 
              onClick={() => setShowModal(false)}
            >
              <MdClose />
            </button>

            <div className="auth-modal-icon">
              <MdLock />
            </div>

            <h2>Inicia Sesión</h2>
            <p>
              Debes iniciar sesión para interactuar con el contenido y acceder a todas las funcionalidades
            </p>

            <div className="auth-modal-buttons">
              <button 
                className="btn-primary" 
                onClick={() => navigate("/login")}
              >
                Iniciar Sesión
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate("/register")}
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
