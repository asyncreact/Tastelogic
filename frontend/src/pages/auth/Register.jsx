// pages/auth/Register.jsx
import { useState, useEffect } from "react";
import { registerUser } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { IoRestaurantOutline } from "react-icons/io5";
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import PasswordInput from "../../components/PasswordInput";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: "",
    details: [],
  });
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);
  const navigate = useNavigate();

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
      const res = await registerUser(form);

      setModal({
        show: true,
        type: "success",
        message: res.data.message || "Registro exitoso",
        details: [],
      });

      // Redirige a login después de registro exitoso
      setRedirectTo("/login");
    } catch (err) {
      const data = err.response?.data;
      setModal({
        show: true,
        type: "error",
        message: data?.message || "Error al registrarse",
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

      <div className="register-container">
        <div className="register-box">
          <IoRestaurantOutline className="logo-icon" />
          <h1>Crear Cuenta</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
              />
            </div>

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

            <button type="submit" className="register-btn" disabled={loading}>
              Registrarse
            </button>
          </form>

          <div className="links">
            <p>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
