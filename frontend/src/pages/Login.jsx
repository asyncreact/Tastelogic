// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Iconos estilo App
import { 
  MdOutlineLogin, 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff, 
  MdArrowForward 
} from "react-icons/md";

const MySwal = withReactContent(Swal);

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData);

      const Toast = MySwal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: false,
      });

      Toast.fire({
        icon: "success",
        title: result.message || "BIENVENIDO",
      });

      if (result?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err.message || "Error al iniciar sesión";
      let errorDetailsHtml = "";
      
      if (err.details && Array.isArray(err.details)) {
        const listItems = err.details
          .map((d) => `<li>${typeof d === "object" ? d.message : d}</li>`)
          .join("");
        errorDetailsHtml = `<ul class="mt-2 mb-0 small" style="list-style:none;padding-left:0;">${listItems}</ul>`;
      }

      MySwal.fire({
        title: "Error de acceso",
        text: !errorDetailsHtml ? errorMessage : undefined,
        html: errorDetailsHtml
          ? `<div>${errorMessage}${errorDetailsHtml}</div>`
          : undefined,
        icon: "error",
        confirmButtonText: "Intentar de nuevo",
        confirmButtonColor: "#ff7a18",
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
                <div className="text-center mb-5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 icon-orange shadow-sm"
                    style={{ width: 70, height: 70 }}
                  >
                    <MdOutlineLogin size={32} />
                  </div>
                  <h2 className="fw-bold text-dark mb-1">Bienvenido</h2>
                  <p className="text-muted small">Ingresa tus credenciales para continuar</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* Input Email Estilizado */}
                  <Form.Group className="mb-4" controlId="formEmail">
                    <Form.Label className="small text-muted ms-1 mb-1">Correo electrónico</Form.Label>
                    <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                      <InputGroup.Text className="bg-white border-0 ps-3">
                        <MdEmail className="text-orange" size={20} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        className="border-0 py-2 fw-medium"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ fontSize: '0.95rem' }}
                      />
                    </InputGroup>
                  </Form.Group>

                  {/* Input Password Estilizado */}
                  <Form.Group className="mb-2" controlId="formPassword">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <Form.Label className="small text-muted ms-1 mb-0">Contraseña</Form.Label>
                    </div>
                    
                    <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                      <InputGroup.Text className="bg-white border-0 ps-3">
                        <MdLock className="text-orange" size={20} />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="border-0 py-2 fw-medium"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        style={{ fontSize: '0.95rem' }}
                      />
                      <Button 
                        variant="white" 
                        className="bg-white border-0 text-muted pe-3"
                        onClick={togglePasswordVisibility}
                        type="button"
                      >
                        {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* Olvidaste contraseña */}
                  <div className="text-end mb-4">
                    <Link
                      to="/forgot-password"
                      className="small text-decoration-none text-muted hover-orange"
                      style={{ fontSize: '0.85rem' }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  {/* Botón Submit */}
                  <Button
                    type="submit"
                    variant="primary" // Usa tu gradiente naranja global
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
                        Ingresando...
                      </>
                    ) : (
                      "INICIAR SESIÓN"
                    )}
                  </Button>

                  {/* Footer Registro */}
                  <div className="text-center mt-4 mb-3">
                    <p className="mb-0 small text-muted">
                      ¿No tienes una cuenta?{" "}
                      <Link
                        to="/register"
                        className="fw-bold text-decoration-none text-orange"
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                  </div>

                  {/* === LINK "CONTINUAR COMO VISITANTE" (AHORA ABAJO) === */}
                  <div className="text-center pt-2 border-top">
                    <Link 
                      to="/dashboard" 
                      className="d-inline-flex align-items-center text-decoration-none text-muted small hover-orange"
                      style={{ fontWeight: 500 }}
                    >
                      Continuar como visitante
                      <MdArrowForward className="ms-1" size={16} />
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

export default Login;