// pages/ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { resetPassword } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Eye, EyeSlash } from "react-bootstrap-icons";

const MySwal = withReactContent(Swal);

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const showValidationErrors = (errorData) => {
    if (errorData.details && Array.isArray(errorData.details)) {
      const errorsByCampo = errorData.details.reduce((acc, detail) => {
        const campo = detail.campo || 'general';
        if (!acc[campo]) {
          acc[campo] = [];
        }
        acc[campo].push(detail.mensaje);
        return acc;
      }, {});

      let errorHTML = '<div style="text-align: center; padding: 0 10px;">';
      
      Object.entries(errorsByCampo).forEach(([campo, mensajes]) => {
        const campoDisplay = {
          'password': 'Contraseña'
        }[campo] || campo;

        errorHTML += `<div style="margin-bottom: 15px;">
          <strong style="color: #dc3545; font-size: 15px; display: block; margin-bottom: 8px;">${campoDisplay}</strong>
          <ul style="margin: 0; padding: 0; list-style: none; text-align: center;">`;
        
        mensajes.forEach(mensaje => {
          errorHTML += `<li style="margin: 6px 0; font-size: 13px; color: #495057;">${mensaje}</li>`;
        });
        
        errorHTML += `</ul></div>`;
      });
      
      errorHTML += '</div>';

      MySwal.fire({
        title: 'Errores de Validación',
        html: errorHTML,
        icon: 'error',
        confirmButtonText: 'Corregir',
        confirmButtonColor: '#1f2937',
        width: '500px',
      });
    } else {
      MySwal.fire({
        title: 'Error',
        text: errorData.message || "Token inválido o expirado. Solicita un nuevo enlace.",
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1f2937'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      
      MySwal.fire({
        title: 'Campos Incompletos',
        text: 'Por favor completa todos los campos correctamente',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1f2937'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      MySwal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonText: 'Corregir',
        confirmButtonColor: '#1f2937'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, {
        password: formData.password,
      });
      
      await MySwal.fire({
        title: 'Contraseña Actualizada',
        text: response.data?.message || 'Tu contraseña ha sido actualizada exitosamente',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false
      });
      
      navigate("/login");
      
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);
      
      const errorData = err.response?.data || {};
      
      if (errorData.details && Array.isArray(errorData.details)) {
        showValidationErrors({
          message: errorData.message || "Errores de validación",
          details: errorData.details
        });
      } else {
        showValidationErrors({
          message: errorData.message || "Token inválido o expirado. Solicita un nuevo enlace."
        });
      }
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
              <h2 className="text-center mb-4">Nueva Contraseña</h2>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Nueva contraseña</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#6c757d'
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                    </button>
                    <Form.Control.Feedback type="invalid">
                      La contraseña debe tener al menos 8 caracteres.
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={8}
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#6c757d'
                      }}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                    </button>
                    <Form.Control.Feedback type="invalid">
                      Las contraseñas deben coincidir.
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                  style={{ 
                    backgroundColor: '#1f2937',
                    borderColor: '#1f2937'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Actualizando...
                    </>
                  ) : "Restablecer contraseña"}
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

export default ResetPassword;
