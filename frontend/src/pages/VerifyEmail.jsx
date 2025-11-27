// src/pages/VerifyEmail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { verifyAccount } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ThemeToggle from "../components/ThemeToggle";

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

      MySwal.fire({
        title: "VERIFICANDO EMAIL",
        text: "Por favor espera un momento...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          MySwal.showLoading();
        },
      });

      try {
        const response = await verifyAccount(token);
        setStatus("success");

        const message =
          response.data?.data?.message ||
          response.data?.message ||
          "Tu cuenta ha sido verificada exitosamente";

        await MySwal.fire({
          title: "EMAIL VERIFICADO",
          text: message,
          icon: "success",
          confirmButtonText: "IR A INICIAR SESIÓN",
          allowOutsideClick: false,
        });

        navigate("/login");
      } catch (err) {
        setStatus("error");

        const errorMessage =
          err.response?.data?.message ||
          "El enlace de verificación es inválido o ha expirado";

        const result = await MySwal.fire({
          title: "ERROR DE VERIFICACIÓN",
          text: errorMessage,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "REGISTRARSE NUEVAMENTE",
          cancelButtonText: "IR AL LOGIN",
          confirmButtonColor: "#000",
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
    <div className="d-flex align-items-center justify-content-center min-vh-100 position-relative bg-light">
      {/* Toggle tema arriba a la izquierda */}
      <div className="position-absolute top-0 start-0 m-3">
        <ThemeToggle />
      </div>

      <Container>
        <Row className="w-100 justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="text-center">
              <Card.Body className="p-5">
                <h2 className="fw-bold mb-3">TasteLogic</h2>
                <p className="text-muted mb-4">ESTADO DE VERIFICACIÓN</p>

                <div className="py-4">
                  {status === "loading" && (
                    <div className="text-muted small text-uppercase">
                      <Spinner
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      Procesando solicitud...
                    </div>
                  )}

                  {status === "success" && (
                    <div className="text-success fw-bold text-uppercase">
                      ¡Verificación Exitosa!
                    </div>
                  )}

                  {status === "error" && (
                    <div className="text-danger fw-bold text-uppercase">
                      No se pudo verificar el correo
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
