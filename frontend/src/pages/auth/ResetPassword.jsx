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
    details: []
  });
  const [redirectTo, setRedirectTo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setModal({
        show: true,
        type: "error",
        message: "Las contraseñas no coinciden",
        details: []
      });
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, { password });
      setModal({ 
        show: true, 
        type: "success", 
        message: res.data.message,
        details: []
      });
      setRedirectTo("/");
    } catch (err) {
      const data = err.response?.data;
      setModal({
        show: true,
        type: "error",
        message: data?.message || "Error al restablecer la contraseña",
        details: data?.details || []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.show && modal.type === "success" && redirectTo) {
      const timer = setTimeout(() => navigate(redirectTo, { replace: true }), 2500);
      return () => clearTimeout(timer);
    }
  }, [modal, redirectTo, navigate]);

  const handleCloseModal = () => {
    setModal({ show: false, type: "", message: "", details: [] });
    if (redirectTo) navigate(redirectTo, { replace: true });
  };

  return (
    <>
      {loading && <Loader />}

      <div className="reset-container">
        <div className="reset-card">
          <div className="reset-header">
            <IoRestaurantOutline className="reset-icon" />
            <h1>Restablecer contraseña</h1>
          </div>

          <form onSubmit={handleSubmit} className="reset-form">
            <div className="form-group">
              <label htmlFor="reset-password">Nueva contraseña</label>
              <PasswordInput
                id="reset-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reset-confirm">Confirmar contraseña</label>
              <PasswordInput
                id="reset-confirm"
                name="confirm_password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </button>
          </form>

          <div className="reset-footer">
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
          details={modal.details}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
