// src/pages/NotFound.jsx
import { Container, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import { MdSearchOff, MdArrowBack, MdHome } from "react-icons/md";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center animate-fade-in pb-5">
      <Container style={{ maxWidth: "480px" }}>
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <Card.Body className="p-5 text-center">
            
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4 icon-orange"
              style={{
                width: 80,
                height: 80,
                boxShadow: "0 10px 25px rgba(255, 122, 24, 0.25)",
              }}
            >
              <MdSearchOff size={40} />
            </div>

            {/* Código 404 */}
            <h1 className="display-1 fw-bold text-orange mb-0" style={{ letterSpacing: '-2px' }}>
              404
            </h1>

            {/* Título */}
            <h2 className="h4 fw-bold text-dark mb-3">Página no encontrada</h2>

            {/* Mensaje */}
            <p className="text-muted mb-4 leading-relaxed">
              Lo sentimos, parece que la página que estás buscando no existe, ha sido movida o el enlace es incorrecto.
            </p>

            {/* Botones de acción */}
            <div className="d-grid gap-3 mb-4">
              <Button
                variant="primary"
                size="lg"
                className="rounded-pill shadow-sm fw-semibold fs-6"
                onClick={() => navigate(-1)}
              >
                <MdArrowBack className="me-2" size={20} />
                Volver atrás
              </Button>

              <Button
                as={Link}
                to="/"
                variant="white"
                className="rounded-pill border shadow-sm text-muted bg-white fw-medium"
              >
                <MdHome className="me-2" size={18} />
                Ir al inicio
              </Button>
            </div>

            {/* Separador sutil */}
            <hr className="border-light my-4" />

            {/* Links útiles */}
            <div className="text-muted small">
              <span className="d-block mb-2 text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                Enlaces rápidos
              </span>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/dashboard" className="text-decoration-none text-secondary hover-orange">
                  Dashboard
                </Link>
                <span className="text-light-gray">•</span>
                <Link to="/login" className="text-decoration-none text-secondary hover-orange">
                  Login
                </Link>
                <span className="text-light-gray">•</span>
                <Link to="/register" className="text-decoration-none text-secondary hover-orange">
                  Registro
                </Link>
              </div>
            </div>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default NotFound;