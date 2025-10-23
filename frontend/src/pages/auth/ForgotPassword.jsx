import { useState, useEffect } from "react";
import { forgotPassword } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { IoRestaurantOutline } from "react-icons/io5"; // ✅ Ícono agregado
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import "./ForgotPassword.css"; // ✅ Estilos locales

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: "", message: "" });
  const [redirectTo, setRedirectTo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword({ email });
      setModal({ show: true, type: "success", message: res.data.message });
      setRedirectTo("/"); // redirige al login
    } catch (err) {
      setModal({
        show: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Error al enviar el correo de recuperación",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.show && modal.type === "success" && redirectTo) {
      const timer = setTimeout(
        () => navigate(redirectTo, { replace: true }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [modal, redirectTo, navigate]);

  const handleCloseModal = () => {
    setModal({ show: false, type: "", message: "" });
    if (redirectTo) navigate(redirectTo, { replace: true });
  };

  return (
    <>
      {loading && <Loader />}

      <div className="layout-center">
        <div className="container-card forgot-container">
          {/* 🔹 Encabezado con icono y títulos */}
          <div className="forgot-header">
            <IoRestaurantOutline size={40} className="forgot-icon" />
            <h2 className="forgot-title">TasteLogic</h2>
            <p className="forgot-subtitle">Recuperar contraseña</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-form">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />

            <button type="submit" className="btn btn-primary">
              Enviar enlace
            </button>
          </form>

          <div className="forgot-links">
            <p>
              <Link to="/">Volver al inicio de sesión</Link>
            </p>
          </div>

          {modal.show && (
            <MessageModal
              type={modal.type}
              message={modal.message}
              onClose={handleCloseModal}
            />
          )}
        </div>
      </div>
    </>
  );
}
