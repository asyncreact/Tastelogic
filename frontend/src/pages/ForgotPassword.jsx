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
  InputGroup,
} from "react-bootstrap";
import { forgotPassword } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Iconos estilo App
import { MdLockReset, MdEmail, MdArrowBack } from "react-icons/md";

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
        title: "Correo Enviado",
        html: `
          <div style="font-size: 0.95rem;">
            <p style="margin-bottom: 10px;">${message}</p>
            <p class="text-muted small">
              Revisa tu bandeja de entrada (y spam) para continuar.
            </p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#ff7a18",
        allowOutsideClick: false,
      });

      setEmail("");
      setValidated(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Error al enviar el correo. Por favor intenta de nuevo";

      MySwal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center animate-fade-in py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5} xl={4}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <Card.Body className="p-4 p-md-5">
                
                {/* Encabezado con Icono */}
                <div className="text-center mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 icon-orange shadow-sm"
                    style={{ width: 70, height: 70 }}
                  >
                    <MdLockReset size={32} />
                  </div>
                  <h2 className="fw-bold text-dark mb-1">Recuperar Acceso</h2>
                  <p className="text-muted small px-2">
                    Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
                  </p>
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  
                  {/* Input Email Estilizado */}
                  <Form.Group className="mb-4" controlId="formEmail">
                    <Form.Label className="small text-muted ms-1 mb-1">Correo electrónico</Form.Label>
                    <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                      <InputGroup.Text className="bg-white border-0 ps-3">
                        <MdEmail className="text-orange" size={20} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="nombre@correo.com"
                        className="border-0 py-2 fw-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ fontSize: '0.95rem' }}
                      />
                    </InputGroup>
                    <Form.Control.Feedback type="invalid" className="small ps-1">
                      Por favor ingresa un email válido.
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Botón Enviar */}
                  <Button
                    type="submit"
                    variant="primary" // Gradiente naranja
                    className="w-100 rounded-pill py-2 fw-bold shadow-sm"
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
                        Enviando...
                      </>
                    ) : (
                      "ENVIAR ENLACE"
                    )}
                  </Button>

                  {/* Footer Volver */}
                  <div className="text-center mt-4 pt-2">
                    <Link
                      to="/login"
                      className="d-inline-flex align-items-center fw-semibold small text-decoration-none text-muted hover-orange"
                    >
                      <MdArrowBack className="me-1" />
                      Volver a Iniciar Sesión
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