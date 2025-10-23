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
      setRedirectTo("/"); // redirige al login
    } catch (err) {
      const data = err.response?.data;
      setModal({
        show: true,
        type: "error",
        message: data?.message || "Error al registrarse",
        details: data?.details || [], // 👈 importante
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Redirección automática después del modal (3 s)
  useEffect(() => {
    if (modal.show && modal.type === "success" && redirectTo) {
      const timer = setTimeout(() => navigate(redirectTo, { replace: true }), 3000);
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

      <div className="layout-center">
        <div className="container-card register-container">
          {/* 🔹 Logo, título y subtítulo */}
          <div className="register-header">
            <IoRestaurantOutline size={40} className="register-icon" />
            <h2 className="register-title">TasteLogic</h2>
            <p className="register-subtitle">Crear cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <input
              placeholder="Nombre completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="input"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="input"
            />

            <PasswordInput
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Contraseña"
              required
            />

            <button type="submit" className="btn btn-primary">
              Registrarse
            </button>
          </form>

          <div className="register-links">
            <p>
              ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
            </p>
          </div>

          {modal.show && (
            <MessageModal
              type={modal.type}
              message={modal.message}
              details={modal.details} // 👈 pasamos el array
              onClose={handleCloseModal}
            />
          )}
        </div>
      </div>
    </>
  );
}
