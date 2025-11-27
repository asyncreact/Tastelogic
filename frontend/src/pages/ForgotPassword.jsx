// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
} from "react-bootstrap";
import { forgotPassword } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ThemeToggle from "../components/ThemeToggle";

const MySwal = withReactContent(Swal);

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoading(true);

    try {
      const response = await forgotPassword({ email });

      const message =
        response.data?.message ||
        "Te hemos enviado un enlace para restablecer tu contraseña";

      await MySwal.fire({
        title: "CORREO ENVIADO",
        html: `
          <div style="font-size: 0.95rem;">
            <p style="margin-bottom: 10px;">${message}</p>
            <p style="opacity: 0.7; font-size: 0.85rem;">
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "ENTENDIDO",
        allowOutsideClick: false,
      });

      setEmail("");
      setValidated(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Error al enviar el correo. Por favor intenta de nuevo";

      MySwal.fire({
        title: "ERROR",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "CERRAR",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 position-relative bg-light">
      {/* Toggle tema arriba a la izquierda */}
      <div className="position-absolute top-0 start-0 m-3">
        <ThemeToggle />
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5} xl={4}>
            <Card>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-1">TasteLogic</h2>
                  <p className="text-muted mb-0">RECUPERAR CONTRASEÑA</p>
                </div>

                <p className="text-muted text-center small mb-4">
                  Ingresa tu email y te enviaremos las instrucciones para restablecer tu acceso.
                </p>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="nombre@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Por favor ingresa un email válido.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="dark"
                    className="w-100 mt-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        ENVIANDO...
                      </>
                    ) : (
                      "ENVIAR ENLACE"
                    )}
                  </Button>

                  <div className="text-center mt-3">
                    <Link
                      to="/login"
                      className="fw-semibold small text-decoration-none"
                    >
                      VOLVER A INICIAR SESIÓN
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ForgotPassword;
