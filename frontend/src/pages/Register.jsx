// src/pages/Register.jsx
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
  MdPersonAdd, 
  MdPerson, 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff,
  MdArrowForward 
} from "react-icons/md";

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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

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
        title: "Error de validación",
        text: "Las contraseñas no coinciden",
        icon: "warning",
        confirmButtonText: "Corregir",
        confirmButtonColor: "#ff7a18",
      });
      return;
    }

    setValidated(true);
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const Toast = MySwal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: false,
      });

      Toast.fire({
        icon: "success",
        title: "Cuenta creada exitosamente",
      });

      navigate("/login");
    } catch (err) {
      const errorMessage = err.message || "Error al registrar usuario";
      let errorDetailsHtml = "";

      if (err.details && Array.isArray(err.details)) {
        const listItems = err.details
          .map((d) => {
            const msg = typeof d === "object" ? d.mensaje || d.message : d;
            return `<li style="margin-bottom: 4px;">${msg}</li>`;
          })
          .join("");

        errorDetailsHtml = `
          <div class="text-start mt-3 px-3">
            <ul style="padding-left: 20px; font-size: 0.9rem;">
              ${listItems}
            </ul>
          </div>
        `;
      }

      MySwal.fire({
        title: "No se pudo registrar",
        text: !errorDetailsHtml ? errorMessage : undefined,
        html: errorDetailsHtml
          ? `<div>${errorMessage}</div>${errorDetailsHtml}`
          : undefined,
        icon: "error",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#ef4444",
        width: errorDetailsHtml ? "450px" : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center animate-fade-in py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <Card.Body className="p-4 p-md-5">
                
                {/* Encabezado */}
                <div className="text-center mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 icon-orange shadow-sm"
                    style={{ width: 70, height: 70 }}
                  >
                    <MdPersonAdd size={32} />
                  </div>
                  <h2 className="fw-bold text-dark mb-1">Crear Cuenta</h2>
                  <p className="text-muted small">Únete a TasteLogic hoy mismo</p>
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  
                  {/* Nombre */}
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label className="small text-muted ms-1 mb-1">Nombre completo</Form.Label>
                    <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                      <InputGroup.Text className="bg-white border-0 ps-3">
                        <MdPerson className="text-orange" size={20} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="name"
                        className="border-0 py-2 fw-medium"
                        placeholder="Ej: Juan Pérez"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        minLength={3}
                        style={{ fontSize: '0.95rem' }}
                      />
                    </InputGroup>
                    <Form.Control.Feedback type="invalid" className="small ps-1">
                      El nombre es requerido.
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3" controlId="formEmail">
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
                    <Form.Control.Feedback type="invalid" className="small ps-1">
                      Ingresa un email válido.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      {/* Password */}
                      <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label className="small text-muted ms-1 mb-1">Contraseña</Form.Label>
                        <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                          <InputGroup.Text className="bg-white border-0 ps-3">
                            <MdLock className="text-orange" size={20} />
                          </InputGroup.Text>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="border-0 py-2 fw-medium"
                            placeholder="Mín. 8 caracteres"
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
                            {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                          </Button>
                        </InputGroup>
                        <Form.Control.Feedback type="invalid" className="small ps-1">
                          Mínimo 8 caracteres.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      {/* Confirm Password */}
                      <Form.Group className="mb-4" controlId="formConfirmPassword">
                        <Form.Label className="small text-muted ms-1 mb-1">Confirmar</Form.Label>
                        <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                          <InputGroup.Text className="bg-white border-0 ps-3">
                            <MdLock className="text-orange" size={20} />
                          </InputGroup.Text>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            className="border-0 py-2 fw-medium"
                            placeholder="Repetir contraseña"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={8}
                            style={{ fontSize: '0.95rem' }}
                          />
                          <Button 
                            variant="white" 
                            className="bg-white border-0 text-muted pe-3"
                            onClick={toggleConfirmPasswordVisibility}
                            type="button"
                          >
                            {showConfirmPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Botón Registrar */}
                  <Button
                    type="submit"
                    variant="primary"
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
                        Creando cuenta...
                      </>
                    ) : (
                      "REGISTRARSE"
                    )}
                  </Button>

                  {/* Footer Login */}
                  <div className="text-center mt-4 mb-3">
                    <p className="mb-0 small text-muted">
                      ¿Ya tienes una cuenta?{" "}
                      <Link
                        to="/login"
                        className="fw-bold text-decoration-none text-orange"
                      >
                        Inicia Sesión aquí
                      </Link>
                    </p>
                  </div>

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

export default Register;