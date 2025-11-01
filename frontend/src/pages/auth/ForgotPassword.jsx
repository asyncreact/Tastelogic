// pages/auth/ForgotPassword.jsx
import { useState, useEffect } from "react";
import { forgotPassword } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { IoRestaurantOutline } from "react-icons/io5";
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: "",
    details: [],
  });
  const [redirectTo, setRedirectTo] = useState(null);
  const navigate = useNavigate();

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword({ email });

      setModal({
        show: true,
        type: "success",
        message:
          res.data.message ||
          "Revisa tu correo para las instrucciones de recuperación",
        details: [],
      });

      // Redirige a login después de enviar instrucciones
      setRedirectTo("/login");
    } catch (err) {
      const data = err.response?.data;
      setModal({
        show: true,
        type: "error",
        message:
          data?.message || "Error al enviar el correo de recuperación",
        details: data?.details || [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModal({ show: false, type: "", message: "", details: [] });
    if (redirectTo) navigate(redirectTo, { replace: true });
  };

  // ============================================================
  // EFECTOS
  // ============================================================

  useEffect(() => {
    if (modal.show && modal.type === "success" && redirectTo) {
      const timer = setTimeout(
        () => navigate(redirectTo, { replace: true }),
        2500
      );
      return () => clearTimeout(timer);
    }
  }, [modal, redirectTo, navigate]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {loading && <Loader />}
      <MessageModal
        show={modal.show}
        type={modal.type}
        message={modal.message}
        details={modal.details}
        onClose={handleCloseModal}
      />

      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <IoRestaurantOutline className="logo-icon" />
          <h1>Recuperar Contraseña</h1>

          <p className="description">
            Ingresa tu correo electrónico y te enviaremos las
            instrucciones para restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            <button
              type="submit"
              className="forgot-btn"
              disabled={loading}
            >
              Enviar Instrucciones
            </button>
          </form>

          <div className="links">
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    </>
  );
}
