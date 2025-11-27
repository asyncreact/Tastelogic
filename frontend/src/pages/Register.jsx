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
} from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import ThemeToggle from "../components/ThemeToggle";

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

  const togglePasswordVisibility = () =>
    setShowPassword((prev) => !prev);

  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

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
        title: "ERROR",
        text: "Las contraseñas no coinciden",
        icon: "error",
        confirmButtonText: "CORREGIR",
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
        title: "CUENTA CREADA",
      });

      navigate("/login");
    } catch (err) {
      const errorMessage = err.message || "Error al registrar usuario";

      let errorDetailsHtml = "";
      if (err.details && Array.isArray(err.details)) {
        const listItems = err.details
          .map((d) => {
            const msg =
              typeof d === "object" ? d.mensaje || d.message : d;
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
        title: "ERROR DE REGISTRO",
        text: !errorDetailsHtml ? errorMessage : undefined,
        html: errorDetailsHtml
          ? `<div>${errorMessage}</div>${errorDetailsHtml}`
          : undefined,
        icon: "error",
        confirmButtonText: "CERRAR",
        width: errorDetailsHtml ? "450px" : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 position-relative bg-light">
      {/* Toggle tema arriba a la izquierda */}
      <div className="position-absolute top-0 start-0 m-3">
        <ThemeToggle />
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5} xl={4}>
            <Card>
              <Card.Body className="p-4">
                <div className="text-center mb-3">
                  <h2 className="fw-bold mb-1">TasteLogic</h2>
                  <p className="text-muted mb-0">CREAR CUENTA</p>
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-2" controlId="formName">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Nombre"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      minLength={3}
                    />
                    <Form.Control.Feedback type="invalid">
                      Ingresa un nombre válido.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Correo electrónico"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Ingresa un email válido.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2" controlId="formPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="btn btn-link p-0 border-0 position-absolute top-50 end-0 translate-middle-y me-2"
                        style={{ textDecoration: "none" }}
                      >
                        {showPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
                      </button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      Contraseña mínima de 8 caracteres.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Repite la contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="btn btn-link p-0 border-0 position-absolute top-50 end-0 translate-middle-y me-2"
                        style={{ textDecoration: "none" }}
                      >
                        {showConfirmPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeSlash size={16} />
                        )}
                      </button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      Repite la contraseña correctamente.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="dark"
                    className="w-100 mt-2"
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
                        PROCESANDO...
                      </>
                    ) : (
                      "REGISTRARSE"
                    )}
                  </Button>

                  <div className="text-center mt-3">
                    <p className="mb-0 small text-muted">
                      ¿Ya tienes cuenta?{" "}
                      <Link
                        to="/login"
                        className="fw-semibold text-decoration-none"
                      >
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
