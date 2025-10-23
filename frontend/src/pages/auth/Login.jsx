import { useState, useEffect } from "react";
import { loginUser } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { IoRestaurantOutline } from "react-icons/io5"; // ✅ Ícono restaurante
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import PasswordInput from "../../components/PasswordInput";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: "", message: "" });
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
      setModal({ show: true, type: "success", message: res.data.message });

      if (role === "admin") setRedirectTo("/admin/dashboard");
      else if (role === "customer") setRedirectTo("/customer/dashboard");
    } catch (err) {
      setModal({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Error al iniciar sesión",
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
    setModal({ show: false, type: "", message: "" });
    if (redirectTo) navigate(redirectTo, { replace: true });
  };

  return (
    <>
      {loading && <Loader />}

      <div className="layout-center">
        <div className="container-card login-container">
          {/* 🔹 Logo, título y subtítulo */}
          <div className="login-header">
            <IoRestaurantOutline size={40} className="login-icon" />
            <h2 className="login-title">TasteLogic</h2>
            <p className="login-subtitle">Iniciar sesión</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />

            <button type="submit" className="btn btn-primary">
              Entrar
            </button>
          </form>

          <div className="login-links">
            <p>
              ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </p>
            <p>
              <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
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
