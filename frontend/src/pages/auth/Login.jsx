// pages/auth/Login.jsx
import { useState } from "react";
import { loginUser } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { IoRestaurantOutline } from "react-icons/io5";
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import PasswordInput from "../../components/PasswordInput";
import { useAuth } from "../../hooks/useAuth";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: "",
    details: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: updateAuth } = useAuth();

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser(form);

      // ✅ GUARDAR TOKEN EN LOCALSTORAGE
      localStorage.setItem("token", res.data.token);

      // ✅ ACTUALIZAR CONTEXTO DE AUTENTICACIÓN
      updateAuth(res.data.user);

      setModal({
        show: true,
        type: "success",
        message: res.data.message || "Inicio de sesión exitoso",
        details: [],
      });

      // ✅ REDIRIGE SEGÚN EL ROL DEL USUARIO
      const redirectPath =
        res.data.user?.role === "admin"
          ? "/admin/dashboard"
          : "/customer/dashboard";

      setTimeout(() => navigate(redirectPath, { replace: true }), 1500);
    } catch (err) {
      const data = err.response?.data;
      setModal({
        show: true,
        type: "error",
        message: data?.message || "Error al iniciar sesión",
        details: data?.details || [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModal({ show: false, type: "", message: "", details: [] });
  };

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

      <div className="login-container">
        <div className="login-box">
          <IoRestaurantOutline className="logo-icon" />
          <h1>Bienvenido</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <PasswordInput
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              Iniciar Sesión
            </button>
          </form>

          <div className="links">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            <p>
              ¿No tienes cuenta?{" "}
              <Link to="/register">Crear cuenta</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
