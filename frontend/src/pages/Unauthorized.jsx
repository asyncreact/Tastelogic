// src/pages/Unauthorized.jsx
import { Container, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { MdNoAccounts, MdArrowBack, MdDashboard } from "react-icons/md";

function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center animate-fade-in pb-5">
      <Container style={{ maxWidth: "480px" }}>
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <Card.Body className="p-5 text-center">
            
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
              style={{
                width: 80,
                height: 80,
                backgroundImage: "var(--btn-red-1)",
                color: "white",
                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.25)",
              }}
            >
              <MdNoAccounts size={40} />
            </div>

            {/* Títulos */}
            <h2 className="fw-bold text-dark mb-2">Acceso Denegado</h2>
            <p className="text-muted mb-4 leading-relaxed">
              Lo sentimos, no tienes los permisos necesarios para ver esta página.
            </p>

            {/* Información de Usuario*/}
            {user && (
              <div className="bg-light rounded-4 p-3 mb-4 text-start border border-light">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted">Usuario actual</span>
                  <span className="small fw-bold text-dark">{user.name}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Tu Rol</span>
                  <span className="badge bg-white text-secondary border shadow-sm">
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="d-grid gap-3">
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
                to="/dashboard"
                variant="white"
                className="rounded-pill border shadow-sm text-muted bg-white fw-medium"
              >
                <MdDashboard className="me-2" size={18} />
                Ir al Dashboard
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Unauthorized;