// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Eye, EyeSlash } from "react-bootstrap-icons";

// 1. IMPORTAR EL COMPONENTE TOGGLE
import ThemeToggle from "../components/ThemeToggle";

// Importamos el CSS Flat personalizado
import "./css/Login.css";

const MySwal = withReactContent(Swal);

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validación básica de HTML5
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);

    try {
      // Llamamos al login del AuthContext
      const result = await login(formData);
      
      // Alerta de Éxito (Toast)
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
        // ✅ Usamos el mensaje que viene del backend o uno por defecto
        title: result.message || 'BIENVENIDO'
      });
      
      // Redirección basada en rol
      if (result?.user?.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      // ✅ Capturamos el mensaje de error específico del AuthContext
      const errorMessage = err.message || "Error al iniciar sesión";
      
      // Si hay detalles de validación (array), los formateamos para mostrarlos
      let errorDetailsHtml = "";
      if (err.details && Array.isArray(err.details)) {
        // Asumiendo que details es un array de strings o objetos con message
        const listItems = err.details.map(d => 
          `<li>${typeof d === 'object' ? d.message : d}</li>`
        ).join('');
        errorDetailsHtml = `<ul class="text-start mt-2 mb-0 small" style="list-style: none; padding-left: 0;">${listItems}</ul>`;
      }

      MySwal.fire({
        title: 'ERROR',
        // Si hay detalles HTML los mostramos, si no, solo el texto plano
        text: !errorDetailsHtml ? errorMessage : undefined,
        html: errorDetailsHtml ? `<div>${errorMessage}${errorDetailsHtml}</div>` : undefined,
        icon: 'error',
        confirmButtonColor: '#000',
        confirmButtonText: 'CERRAR',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#000' : '#fff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#000',
        customClass: {
          popup: 'rounded-0 border-1 border-secondary' // Alert cuadrado flat
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center" style={{ position: 'relative' }}>
      
      {/* 2. IMPLEMENTACIÓN: Botón en la esquina superior IZQUIERDA */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 1050 }}>
        <ThemeToggle />
      </div>

      <Container>
        <Row className="justify-content-center w-100">
          <Col md={6} lg={5} xl={4}>
            
            {/* CARD FLAT: Sin shadow, bordes definidos */}
            <Card className="login-card-flat">
              <Card.Body className="p-4 p-md-5">
                
                <div className="text-center mb-5">
                  <h2 className="login-title">TasteLogic</h2>
                  <p className="login-subtitle">INICIAR SESIÓN</p>
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  
                  {/* EMAIL */}
                  <Form.Group className="mb-4" controlId="formEmail">
                    <Form.Label className="flat-label">Email</Form.Label>
                    <Form.Control
                      className="flat-input"
                      type="email"
                      name="email"
                      placeholder="Correo electrónico"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid" className="small mt-1">
                      Email requerido
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* PASSWORD */}
                  <Form.Group className="mb-4" controlId="formPassword">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <Form.Label className="flat-label mb-0">Contraseña</Form.Label>
                        <Link to="/forgot-password" className="link-flat" style={{fontSize: '0.75rem'}}>
                            ¿Olvidaste?
                        </Link>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        className="flat-input"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••••"
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
                  </Form.Group>

                  {/* BUTTON */}
                  <Button
                    type="submit"
                    className="btn-flat-primary w-100 mt-2"
                    disabled={loading}
                  >
                    {loading ? "PROCESANDO..." : "ENTRAR"}
                  </Button>

                  {/* DIVIDER & REGISTER */}
                  <div className="flat-divider"></div>

                  <div className="text-center">
                    <p className="mb-0 text-muted small">
                      ¿Nuevo usuario?{" "}
                      <Link to="/register" className="link-flat ms-1 fw-bold">
                        Crear Cuenta
                      </Link>
                    </p>
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

export default Login;