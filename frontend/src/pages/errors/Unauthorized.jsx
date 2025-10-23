import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { MdOutlineDangerous } from "react-icons/md";
import "./Unauthorized.css";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="layout-center">
      <div className="container-card" style={{ textAlign: "center", maxWidth: 600 }}>
        {/* 🔹 Ícono arriba y texto rojo debajo */}
        <div className="unauthorized-header">
          <MdOutlineDangerous className="unauthorized-icon" />
          <h2 className="unauthorized-title">Acceso denegado</h2>
        </div>

        <p className="unauthorized-text">
          {user
            ? "Tu cuenta no tiene el rol necesario para acceder aquí."
            : "Debes iniciar sesión para continuar."}
        </p>

        <div className="unauthorized-actions">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}
