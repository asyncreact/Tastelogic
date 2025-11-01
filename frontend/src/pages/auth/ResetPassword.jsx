// pages/auth/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import { IoRestaurantOutline } from "react-icons/io5";
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import PasswordInput from "../../components/PasswordInput";
import "./ResetPassword.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: "",
    details: [],
  });
  const [redirectTo, setRedirectTo] = useState(null);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (password !== confirm) {
      setModal({
        show: true,
        type: "error",
        message: "Las contraseñas no coinciden",
        details: [],
      });
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, { password });

      setModal({
        show: true,
        type: "success",
        message:
          res.data.message || "Contraseña restablecida exitosamente",
        details: [],
      });

      // Redirige a login después de restablecer contraseña
      setRedirectTo("/login");
    } catch (err) {
      const data = err.response?.data;
      setModal({
        show: true,
        type: "error",
        message:
          data?.message || "Error al restablecer la contraseña",
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

      <div className="reset-password-container">
        <div className="reset-password-box">
          <IoRestaurantOutline className="logo-icon" />
          <h1>Restablecer Contraseña</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <PasswordInput
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="reset-btn"
              disabled={loading}
            >
              Restablecer Contraseña
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
