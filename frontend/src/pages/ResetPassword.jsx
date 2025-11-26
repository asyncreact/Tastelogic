// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { resetPassword } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Eye, EyeSlash } from "react-bootstrap-icons";

// 1. IMPORTAR EL COMPONENTE TOGGLE
import ThemeToggle from "../components/ThemeToggle";

// Importamos el CSS Flat compartido
import "./css/Login.css";

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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validación HTML5
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Validación coincidencia de contraseñas
    if (formData.password !== formData.confirmPassword) {
      MySwal.fire({
        title: 'ERROR',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonColor: '#000',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#000' : '#fff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#000',
        customClass: { popup: 'rounded-0 border-1 border-secondary' }
      });
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, {
        password: formData.password,
      });
      
      const Toast = MySwal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: false,
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#000' : '#fff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#000'
      });
      
      Toast.fire({
        icon: 'success',
        title: 'CONTRASEÑA ACTUALIZADA'
      });
      
      navigate("/login");
      
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);
      
      const errorData = err.response?.data || {};
      const errorMessage = errorData.message || "Error al restablecer la contraseña";

      // Formateo de errores de validación si existen
      let errorDetailsHtml = "";
      if (errorData.details && Array.isArray(errorData.details)) {
        const listItems = errorData.details.map(d => {
            const msg = typeof d === 'object' ? (d.mensaje || d.message) : d;
            return `<li style="margin-bottom: 4px;">${msg}</li>`;
        }).join('');
        
        errorDetailsHtml = `
          <div class="text-start mt-3 px-3">
            <ul style="padding-left: 20px; font-size: 0.9rem; color: ${document.documentElement.getAttribute('data-theme') === 'dark' ? '#ccc' : '#555'}">
              ${listItems}
            </ul>
          </div>
        `;
      }

      MySwal.fire({
        title: 'ERROR',
        text: !errorDetailsHtml ? errorMessage : undefined,
        html: errorDetailsHtml ? `<div>${errorMessage}</div>${errorDetailsHtml}` : undefined,
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
                  <p className="login-subtitle">NUEVA CONTRASEÑA</p>
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  
                  {/* PASSWORD */}
                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="flat-label">Nueva Contraseña</Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        className="flat-input"
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
                        className="password-toggle-flat"
                        style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                        }}
                      >
                        {showPassword ? <Eye size={18} /> : <EyeSlash size={18} />}
                      </button>
                    </div>
                    <Form.Control.Feedback type="invalid" className="small mt-1">
                      Mínimo 8 caracteres
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* CONFIRM PASSWORD */}
                  <Form.Group className="mb-4" controlId="formConfirmPassword">
                    <Form.Label className="flat-label">Confirmar Contraseña</Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        className="flat-input"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Repite la contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={8}
                        style={{ paddingRight: '45px' }}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="password-toggle-flat"
                        style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                        }}
                      >
                        {showConfirmPassword ? <Eye size={18} /> : <EyeSlash size={18} />}
                      </button>
                    </div>
                    <Form.Control.Feedback type="invalid" className="small mt-1">
                      Las contraseñas deben coincidir.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="btn-flat-primary w-100 mt-2"
                    disabled={loading}
                  >
                    {loading ? "ACTUALIZANDO..." : "CAMBIAR CONTRASEÑA"}
                  </Button>

                  <div className="flat-divider"></div>

                  <div className="text-center">
                    <Link to="/login" className="link-flat small fw-bold">
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

export default ResetPassword;