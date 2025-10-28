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
    details: []
  });
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyAccount(token);
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
          message: data?.message || "Error al verificar la cuenta",
          details: data?.details || []
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

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

      <div className="verify-container">
        <div className="verify-card">
          <div className="verify-header">
            <IoRestaurantOutline className="verify-icon" />
            <h1>Verificando cuenta</h1>
          </div>

          <p className="verify-message">
            Este proceso puede tardar unos segundos. Si todo está correcto, serás redirigido automáticamente al inicio de sesión.
          </p>
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
