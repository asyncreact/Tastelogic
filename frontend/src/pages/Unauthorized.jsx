// src/pages/Unauthorized.jsx
import { Container, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Card className="shadow-lg w-100" style={{ maxWidth: "500px" }}>
        <Card.Body className="text-center p-5">
          {/* Icono de error */}
          <div className="text-danger mb-4" style={{ fontSize: "80px" }}>
            ⛔
          </div>

          {/* Título */}
          <h1 className="h2 text-danger mb-3">Acceso Denegado</h1>

          {/* Mensaje */}
          <p className="text-muted mb-4">
            No tienes los permisos necesarios para acceder a esta página.
          </p>

          {/* Información adicional */}
          {user && (
            <div className="alert alert-light mb-4 text-start">
              <small className="text-muted">
                <strong>Usuario actual:</strong> {user.name}
                <br />
                <strong>Rol:</strong> {user.role}
              </small>
            </div>
          )}

          {/* Botones de acción */}
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(-1)}
            >
              ← Volver atrás
            </Button>

            <Button
              as={Link}
              to="/dashboard"
              variant="outline-secondary"
            >
              Ir al Dashboard
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Unauthorized;
