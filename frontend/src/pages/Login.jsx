// pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Eye, EyeSlash } from "react-bootstrap-icons";

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

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      
      MySwal.fire({
        title: 'Error de Validación',
        text: 'Por favor completa todos los campos correctamente',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1f2937'
      });
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData);
      
      await MySwal.fire({
        title: 'Bienvenido',
        text: 'Inicio de sesión exitoso',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      if (result?.user?.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      MySwal.fire({
        title: 'Error',
        text: err.message || "Error al iniciar sesión",
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc3545'
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
              <h2 className="text-center mb-4">Iniciar Sesión</h2>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa un email válido.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Contraseña"
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

                <div className="text-end mb-3">
                  <Link to="/forgot-password" className="text-decoration-none">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-100"
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
                      Cargando...
                    </>
                  ) : "Iniciar Sesión"}
                </Button>
              </Form>

              <hr className="my-4" />

              <p className="text-center mb-0">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="text-decoration-none">
                  Regístrate
                </Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
