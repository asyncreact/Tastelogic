// pages/Dashboard.jsx
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Dashboard</h3>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-4">
                <h4>Bienvenido, {user?.name}! 👋</h4>
                <p className="text-muted mb-2">
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="text-muted mb-2">
                  <strong>Rol:</strong>{" "}
                  <Badge bg={user?.role === "admin" ? "danger" : "secondary"}>
                    {user?.role || "usuario"}
                  </Badge>
                </p>
                <p className="text-muted">
                  <strong>Estado:</strong>{" "}
                  <Badge bg={user?.is_verified ? "success" : "warning"}>
                    {user?.is_verified ? "Verificado" : "Pendiente verificación"}
                  </Badge>
                </p>
              </div>

              <hr />

              <Row className="g-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h5>📊 Estadísticas</h5>
                      <p className="text-muted">
                        Accede a tus estadísticas y métricas.
                      </p>
                      <Button variant="outline-primary" size="sm">
                        Ver estadísticas
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h5>⚙️ Configuración</h5>
                      <p className="text-muted">
                        Administra tu perfil y preferencias.
                      </p>
                      <Button variant="outline-primary" size="sm">
                        Configurar
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                {hasRole("admin") && (
                  <Col md={12}>
                    <Card className="bg-light">
                      <Card.Body>
                        <h5>🔐 Panel de Administración</h5>
                        <p className="text-muted mb-2">
                          Acceso exclusivo para administradores.
                        </p>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => navigate("/admin")}
                        >
                          Ir al panel admin
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>

              <hr />

              <div className="text-center">
                <Button variant="outline-danger" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
