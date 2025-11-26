// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Eye, EyeSlash } from "react-bootstrap-icons";

// 1. IMPORTAR EL COMPONENTE TOGGLE
import ThemeToggle from "../components/ThemeToggle";

import "./css/Login.css";

const MySwal = withReactContent(Swal);

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      MySwal.fire({
        title: 'ERROR',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonColor: '#000',
        confirmButtonText: 'CORREGIR',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#000' : '#fff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#000',
        customClass: { popup: 'rounded-0 border-1 border-secondary' }
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
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
        title: 'CUENTA CREADA'
      });
      
      navigate("/login");
      
    } catch (err) {
      console.error("Error en registro:", err);
      const errorMessage = err.message || "Error al registrar usuario";
      
      let errorDetailsHtml = "";
      if (err.details && Array.isArray(err.details)) {
        const listItems = err.details.map(d => {
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
        title: 'ERROR DE REGISTRO',
        text: !errorDetailsHtml ? errorMessage : undefined,
        html: errorDetailsHtml ? `<div>${errorMessage}</div>${errorDetailsHtml}` : undefined,
        icon: 'error',
        confirmButtonColor: '#000',
        confirmButtonText: 'CERRAR',
        width: errorDetailsHtml ? '450px' : undefined,
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
    <div className="login-page d-flex align-items-center justify-content-center register-compact-page" style={{ position: 'relative' }}>
      
      {/* 3. IMPLEMENTACIÓN: Botón en la esquina superior IZQUIERDA */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 1050 }}>
        <ThemeToggle />
      </div>

      <Container>
        <Row className="justify-content-center w-100">
          <Col md={6} lg={5} xl={4}>
            
            <Card className="login-card-flat">
              <Card.Body className="p-4">
                
                <div className="text-center mb-3">
                  <h2 className="login-title">TasteLogic</h2>
                  <p className="login-subtitle mb-0">CREAR CUENTA</p>
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  
                  <Form.Group className="mb-2" controlId="formName">
                    <Form.Label className="flat-label mb-1">Nombre</Form.Label>
                    <Form.Control
                      className="flat-input"
                      type="text"
                      name="name"
                      placeholder="Nombre"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      minLength={3}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2" controlId="formEmail">
                    <Form.Label className="flat-label mb-1">Email</Form.Label>
                    <Form.Control
                      className="flat-input"
                      type="email"
                      name="email"
                      placeholder="Correo electrónico"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-2" controlId="formPassword">
                    <Form.Label className="flat-label mb-1">Contraseña</Form.Label>
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
                          position: 'absolute', right: '10px', top: '50%',
                          transform: 'translateY(-50%)', background: 'transparent',
                          border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
                        }}
                      >
                        {showPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
                      </button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label className="flat-label mb-1">Confirmar</Form.Label>
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
                          position: 'absolute', right: '10px', top: '50%',
                          transform: 'translateY(-50%)', background: 'transparent',
                          border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
                        }}
                      >
                        {showConfirmPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
                      </button>
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="btn-flat-primary w-100 mt-2"
                    disabled={loading}
                  >
                    {loading ? "..." : "REGISTRARSE"}
                  </Button>

                  <div className="flat-divider" style={{ margin: '1rem 0' }}></div>

                  <div className="text-center">
                    <p className="mb-0 text-muted small">
                      ¿Ya tienes cuenta?{" "}
                      <Link to="/login" className="link-flat ms-1 fw-bold">
                        Inicia Sesión
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

export default Register;