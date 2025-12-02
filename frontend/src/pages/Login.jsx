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
} from "react-bootstrap";
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
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
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
        title: "ERROR",
        text: !errorDetailsHtml ? errorMessage : undefined,
        html: errorDetailsHtml
          ? `<div>${errorMessage}${errorDetailsHtml}</div>`
          : undefined,
        icon: "error",
        confirmButtonText: "CERRAR",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 position-relative bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5} xl={4}>
            <Card>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-1">TasteLogic</h2>
                  <p className="text-muted mb-0">INICIAR SESIÓN</p>
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
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
                      Email requerido
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="mb-0">Contraseña</Form.Label>
                      <Link
                        to="/forgot-password"
                        className="small text-decoration-none"
                      >
                        ¿Olvidaste?
                      </Link>
                    </div>

                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
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
                        {showPassword ? <Eye size={18} /> : <EyeSlash size={18} />}
                      </button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      Contraseña requerida (mínimo 8 caracteres)
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
                      "ENTRAR"
                    )}
                  </Button>

                  <div className="text-center mt-3">
                    <p className="mb-0 small text-muted">
                      ¿Nuevo usuario?{" "}
                      <Link
                        to="/register"
                        className="fw-semibold text-decoration-none"
                      >
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
