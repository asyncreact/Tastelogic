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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await registerUser(form);
      setModal({
        show: true,
        type: "success",
        message: res.data.message,
        details: [],
      });
      setRedirectTo("/");
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

      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <IoRestaurantOutline className="register-icon" />
            <h1>Crear cuenta</h1>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-form-group">
              <label htmlFor="register-name">Nombre completo</label>
              <input
                id="register-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre"
                autoComplete="name"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="register-email">Correo electrónico</label>
              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="register-password">Contraseña</label>
              <PasswordInput
                id="register-password"
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Crea una contraseña segura"
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="register-btn register-btn-primary" disabled={loading}>
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <div className="register-footer">
            <p>
              ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
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
