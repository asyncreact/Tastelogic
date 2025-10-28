import { useState, useEffect } from "react";
import { loginUser } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { IoRestaurantOutline } from "react-icons/io5";
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import PasswordInput from "../../components/PasswordInput";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ 
    show: false, 
    type: "", 
    message: "",
    details: []
  });
  const [redirectTo, setRedirectTo] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);
      login(res.data.user);
      const role = res.data.user.role?.toLowerCase();

      setModal({ 
        show: true, 
        type: "success", 
        message: res.data.message,
        details: [] 
      });

      if (role === "admin") setRedirectTo("/admin/dashboard");
      else if (role === "customer") setRedirectTo("/customer/dashboard");
    } catch (err) {
      const data = err.response?.data;
      setModal({
        show: true,
        type: "error",
        message: data?.message || "Error al iniciar sesión",
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

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <IoRestaurantOutline className="login-icon" />
            <h1>Iniciar sesión</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="login-password">Contraseña</label>
              <PasswordInput
                id="login-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="login-btn login-btn-primary" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </p>
            <p>
              <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
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
