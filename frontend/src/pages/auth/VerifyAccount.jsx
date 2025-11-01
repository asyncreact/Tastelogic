// pages/auth/VerifyAccount.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyAccount } from "../../api/auth";
import { IoRestaurantOutline } from "react-icons/io5";
import MessageModal from "../../components/MessageModal";
import Loader from "../../components/Loader";
import "./VerifyAccount.css";

export default function VerifyAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: "",
    details: [],
  });
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  // ============================================================
  // EFECTOS - Verificar cuenta
  // ============================================================

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyAccount(token);

        setModal({
          show: true,
          type: "success",
          message: res.data.message || "Cuenta verificada exitosamente",
          details: [],
        });

        // Redirige a login después de verificar cuenta
        setRedirectTo("/login");
      } catch (err) {
        const data = err.response?.data;
        setModal({
          show: true,
          type: "error",
          message: data?.message || "Error al verificar la cuenta",
          details: data?.details || [],
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  // ============================================================
  // EFECTOS - Redireccionamiento automático
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
  // HANDLERS
  // ============================================================

  const handleCloseModal = () => {
    setModal({ show: false, type: "", message: "", details: [] });
    if (redirectTo) navigate(redirectTo, { replace: true });
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

      <div className="verify-container">
        <div className="verify-box">
          <IoRestaurantOutline className="logo-icon" />
          <h1>Verificando Cuenta</h1>

          <p className="description">
            Este proceso puede tardar unos segundos. Si todo está
            correcto, serás redirigido automáticamente al inicio de
            sesión.
          </p>

          <div className="spinner"></div>
        </div>
      </div>
    </>
  );
}
