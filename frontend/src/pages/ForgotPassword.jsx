// pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { forgotPassword } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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
      
      MySwal.fire({
        title: 'Campo Incompleto',
        text: 'Por favor ingresa un email válido',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1f2937' // ✅ Color actualizado
      });
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      
      const message = 
        response.data?.message || 
        "Te hemos enviado un enlace para restablecer tu contraseña";

      await MySwal.fire({
        title: 'Correo Enviado',
        html: `
          <div style="text-align: center;">
            <p style="margin-bottom: 10px;">${message}</p>
            <p style="color: #6c757d; font-size: 14px;">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1f2937', // ✅ Color actualizado
        allowOutsideClick: false
      });

      setEmail("");
      setValidated(false);

    } catch (err) {
      const errorMessage = 
        err.response?.data?.message ||
        "Error al enviar el correo. Por favor intenta de nuevo";

      MySwal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#1f2937' // ✅ Color actualizado
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col md={6} lg={5} xl={4} className="mx-auto">
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Recuperar Contraseña</h2>
              
              <p className="text-muted text-center mb-4">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
              </p>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="correo@ejemplo.com"
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
                  className="w-100 mb-3"
                  disabled={loading}
                  style={{ 
                    backgroundColor: '#1f2937', // ✅ Color gris oscuro
                    borderColor: '#1f2937'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviando...
                    </>
                  ) : "Enviar enlace"}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    Volver a Iniciar Sesión
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
