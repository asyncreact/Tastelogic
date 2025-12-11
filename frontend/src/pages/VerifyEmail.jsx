// src/pages/VerifyEmail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { verifyAccount } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { MdMarkEmailRead, MdErrorOutline, MdHourglassEmpty } from "react-icons/md";

const MySwal = withReactContent(Swal);

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;
      
      try {
        const response = await verifyAccount(token);
        setStatus("success");

        const message =
          response.data?.data?.message ||
          response.data?.message ||
          "Tu cuenta ha sido verificada exitosamente";

        await MySwal.fire({
          title: "¡Email Verificado!",
          text: message,
          icon: "success",
          confirmButtonText: "Ir a Iniciar Sesión",
          confirmButtonColor: "#ff7a18",
          allowOutsideClick: false,
        });

        navigate("/login");
      } catch (err) {
        setStatus("error");

        const errorMessage =
          err.response?.data?.message ||
          "El enlace de verificación es inválido o ha expirado";

        const result = await MySwal.fire({
          title: "Error de Verificación",
          text: errorMessage,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Registrarse de nuevo",
          cancelButtonText: "Ir al Login",
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#6c757d",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          navigate("/register");
        } else if (result.dismiss === MySwal.DismissReason.cancel) {
          navigate("/login");
        }
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center animate-fade-in py-5">
      <Container>
        <Row className="w-100 justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <Card.Body className="p-5 text-center">
                
                {/* Encabezado Dinámico según Estado */}
                <div className="mb-4">
                  {status === "loading" && (
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 shadow-sm bg-light text-secondary"
                      style={{ width: 80, height: 80 }}
                    >
                      <MdHourglassEmpty size={36} />
                    </div>
                  )}

                  {status === "success" && (
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 shadow-sm text-white"
                      style={{ width: 80, height: 80, backgroundColor: "#10b981" }} // Verde éxito
                    >
                      <MdMarkEmailRead size={36} />
                    </div>
                  )}

                  {status === "error" && (
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 shadow-sm text-white"
                      style={{ width: 80, height: 80, backgroundImage: "var(--btn-red-1)" }} // Rojo error
                    >
                      <MdErrorOutline size={36} />
                    </div>
                  )}

                  <h2 className="fw-bold text-dark mb-1">Verificación</h2>
                  <p className="text-muted small">Estado de tu cuenta</p>
                </div>

                {/* Contenido del Estado */}
                <div className="py-2">
                  {status === "loading" && (
                    <div className="d-flex flex-column align-items-center">
                      <Spinner animation="border" variant="warning" className="mb-3" />
                      <span className="text-muted small fw-semibold">
                        Verificando tu enlace...
                      </span>
                    </div>
                  )}

                  {status === "success" && (
                    <div className="text-success fw-bold">
                      <p className="mb-0">¡Verificación Exitosa!</p>
                      <small className="text-muted fw-normal">Redirigiendo al login...</small>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="text-danger fw-bold">
                      <p className="mb-0">No se pudo verificar</p>
                      <small className="text-muted fw-normal">El enlace puede haber expirado.</small>
                    </div>
                  )}
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default VerifyEmail;