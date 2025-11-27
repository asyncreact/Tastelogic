// src/pages/NotFound.jsx
import { Container, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Card className="shadow-lg w-100" style={{ maxWidth: "600px" }}>
        <Card.Body className="text-center p-5">
          {/* Código 404 */}
          <h1 className="display-1 fw-bold text-primary mb-3">
            404
          </h1>

          {/* Título */}
          <h2 className="h3 mb-3">Página no encontrada</h2>

          {/* Mensaje */}
          <p className="text-muted mb-4">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>

          {/* Icono */}
          <div className="mb-4" style={{ fontSize: "60px" }}>
            🔍
          </div>

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
              to="/"
              variant="outline-secondary"
            >
              Ir al inicio
            </Button>
          </div>

          {/* Links útiles */}
          <hr className="my-4" />

          <div className="text-muted">
            <small>Enlaces útiles:</small>
            <div className="d-flex justify-content-center gap-3 mt-2">
              <Link to="/dashboard" className="text-decoration-none">
                Dashboard
              </Link>
              <Link to="/login" className="text-decoration-none">
                Login
              </Link>
              <Link to="/register" className="text-decoration-none">
                Registro
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default NotFound;
