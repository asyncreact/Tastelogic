import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyAccount } from "../../api/auth";
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import "./VerifyAccount.css"; // ✅ estilos locales

export default function VerifyAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [modal, setModal] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyAccount(token);
        setModal({ show: true, type: "success", message: res.data.message });
        setRedirectTo("/"); // 🔁 redirigir al login
      } catch (err) {
        setModal({
          show: true,
          type: "error",
          message: err.response?.data?.message || "Error al verificar la cuenta",
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  // 🔁 Redirección automática después del modal (2.5 s)
  useEffect(() => {
    if (modal.show && modal.type === "success" && redirectTo) {
      const timer = setTimeout(() => navigate(redirectTo, { replace: true }), 2500);
      return () => clearTimeout(timer);
    }
  }, [modal, redirectTo, navigate]);

  // 🔹 Redirección inmediata si el usuario cierra el modal antes
  const handleCloseModal = () => {
    setModal({ show: false, type: "", message: "" });
    if (redirectTo) navigate(redirectTo, { replace: true });
  };

  return (
    <>
      {loading && <Loader />}

      {!loading && (
        <div className="layout-center">
          <div className="container-card verify-container">
            <h2 className="verify-title">Verificando tu cuenta...</h2>
            <p className="verify-text">
              Este proceso puede tardar unos segundos. Si todo está correcto,
              serás redirigido automáticamente al inicio de sesión.
            </p>
          </div>
        </div>
      )}

      {/* Modal de mensaje */}
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
