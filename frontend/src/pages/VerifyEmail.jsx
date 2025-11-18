// pages/VerifyEmail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert, Button } from "react-bootstrap";
import { verifyAccount } from "../api/auth";

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  
  // ✅ Evita llamadas duplicadas en StrictMode
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const response = await verifyAccount(token);
        setStatus("success");
        setMessage(
          response.data?.data?.message || 
          response.data?.message || 
          "¡Tu cuenta ha sido verificada exitosamente! Ya puedes iniciar sesión."
        );
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || 
          "El enlace de verificación es inválido o ha expirado."
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col md={6} lg={5} className="mx-auto">
          <Card className="shadow text-center">
            <Card.Body className="p-5">
              {status === "loading" && (
                <>
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <h4>Verificando email...</h4>
                  <p className="text-muted">Por favor espera un momento.</p>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="text-success mb-3" style={{ fontSize: "64px" }}>
                    ✓
                  </div>
                  <h3 className="text-success mb-3">¡Email verificado!</h3>
                  <Alert variant="success">{message}</Alert>
                  <Button as={Link} to="/login" variant="primary" className="w-100 mt-3">
                    Ir a Iniciar Sesión
                  </Button>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="text-danger mb-3" style={{ fontSize: "64px" }}>
                    ✕
                  </div>
                  <h3 className="text-danger mb-3">Error de verificación</h3>
                  <Alert variant="danger">{message}</Alert>
                  <div className="d-grid gap-2 mt-4">
                    <Button as={Link} to="/register" variant="primary">
                      Registrarse nuevamente
                    </Button>
                    <Button as={Link} to="/login" variant="outline-secondary">
                      Intentar iniciar sesión
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default VerifyEmail;
