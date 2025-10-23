import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import { IoRestaurantOutline } from "react-icons/io5"; // ✅ Ícono agregado
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import PasswordInput from "../../components/PasswordInput";
import "./ResetPassword.css"; // ✅ estilos locales

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: "", message: "" });
  const [redirectTo, setRedirectTo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setModal({
        show: true,
        type: "error",
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, { password });
      setModal({ show: true, type: "success", message: res.data.message });
      setRedirectTo("/"); // redirige al login
    } catch (err) {
      setModal({
        show: true,
        type: "error",
        message:
          err.response?.data?.message || "Error al restablecer la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.show && modal.type === "success" && redirectTo) {
      const timer = setTimeout(
        () => navigate(redirectTo, { replace: true }),
        2500
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
        <div className="container-card reset-container">
          {/* 🔹 Encabezado con ícono y títulos */}
          <div className="reset-header">
            <IoRestaurantOutline size={40} className="reset-icon" />
            <h2 className="reset-title">TasteLogic</h2>
            <p className="reset-subtitle">Restablecer contraseña</p>
          </div>

          <form onSubmit={handleSubmit} className="reset-form">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              required
            />

            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirmar contraseña"
              required
            />

            <button type="submit" className="btn btn-primary">
              Guardar nueva contraseña
            </button>
          </form>

          <div className="reset-links">
            <p>
              <Link to="/">Volver al inicio de sesión</Link>
            </p>
          </div>
        </div>
      </div>

      {modal.show && (
        <MessageModal
          type={modal.type}
          message={modal.message}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
