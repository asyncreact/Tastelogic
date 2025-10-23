import { useNavigate } from "react-router-dom";
import { PiSmileySad } from "react-icons/pi";
import "./NotFound.css"; // ✅ estilos locales para esta página

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="layout-center">
      <div className="container-card" style={{ textAlign: "center", maxWidth: 600 }}>
        {/* 🔹 Icono y encabezado */}
        <div className="notfound-header">
          <PiSmileySad className="notfound-icon" />
          <h1 className="notfound-code">404</h1>
          <h2 className="notfound-title">Página no encontrada</h2>
        </div>

        <p className="notfound-text">
          La página que estás buscando no existe o fue movida.
        </p>

        <div className="notfound-actions">
          <button className="btn btn-primary" onClick={() => navigate("/", { replace: true })}>
            Ir al inicio
          </button>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}
