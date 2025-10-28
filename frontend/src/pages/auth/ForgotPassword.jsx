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
    details: []
  });
  const [redirectTo, setRedirectTo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword({ email });
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
        message: data?.message || "Error al enviar el correo de recuperación",
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

      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-header">
            <IoRestaurantOutline className="forgot-icon" />
            <h1>Recuperar contraseña</h1>
          </div>

          <p className="forgot-description">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="form-group">
              <label htmlFor="forgot-email">Correo electrónico</label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </button>
          </form>

          <div className="forgot-footer">
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
