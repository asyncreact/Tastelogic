// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { forgotPassword } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// 1. IMPORTAR EL COMPONENTE TOGGLE
import ThemeToggle from "../components/ThemeToggle";

// Importamos el mismo CSS Flat
import "./css/Login.css";

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
      return; // La validación visual la maneja el CSS
    }

    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      
      const message = 
        response.data?.message || 
        "Te hemos enviado un enlace para restablecer tu contraseña";

      await MySwal.fire({
        title: 'CORREO ENVIADO',
        html: `
          <div style="font-size: 0.95rem;">
            <p style="margin-bottom: 10px;">${message}</p>
            <p style="opacity: 0.7; font-size: 0.85rem;">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'ENTENDIDO',
        confirmButtonColor: '#000',
        allowOutsideClick: false,
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#000' : '#fff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#000',
        customClass: { popup: 'rounded-0 border-1 border-secondary' }
      });

      setEmail("");
      setValidated(false);

    } catch (err) {
      const errorMessage = 
        err.response?.data?.message ||
        "Error al enviar el correo. Por favor intenta de nuevo";

      MySwal.fire({
        title: 'ERROR',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'CERRAR',
        confirmButtonColor: '#000',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#000' : '#fff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#000',
        customClass: { popup: 'rounded-0 border-1 border-secondary' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // 2. AGREGADO: position: relative al contenedor principal
    <div className="login-page d-flex align-items-center justify-content-center" style={{ position: 'relative' }}>
      
      {/* 3. IMPLEMENTACIÓN: Botón en la esquina superior IZQUIERDA */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 1050 }}>
        <ThemeToggle />
      </div>

      <Container>
        <Row className="justify-content-center w-100">
          <Col md={6} lg={5} xl={4}>
            
            {/* CARD FLAT */}
            <Card className="login-card-flat">
              <Card.Body className="p-4 p-md-5">
                
                <div className="text-center mb-5">
                  <h2 className="login-title">TasteLogic</h2>
                  <p className="login-subtitle">RECUPERAR CONTRASEÑA</p>
                </div>
                
                <p className="text-muted text-center small mb-4 px-2">
                  Ingresa tu email y te enviaremos las instrucciones para restablecer tu acceso.
                </p>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  
                  <Form.Group className="mb-4" controlId="formEmail">
                    <Form.Label className="flat-label">Email</Form.Label>
                    <Form.Control
                      className="flat-input"
                      type="email"
                      placeholder="nombre@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Form.Control.Feedback type="invalid" className="small mt-1">
                      Por favor ingresa un email válido.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="btn-flat-primary w-100 mt-2"
                    disabled={loading}
                  >
                    {loading ? "ENVIANDO..." : "ENVIAR ENLACE"}
                  </Button>

                  <div className="flat-divider"></div>

                  <div className="text-center">
                    <Link to="/login" className="link-flat fw-bold small">
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