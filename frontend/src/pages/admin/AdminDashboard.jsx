// pages/admin/AdminDashboard.jsx
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={10} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-danger text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">🔐 Panel de Administración</h3>
                <Badge bg="light" text="dark">Admin</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Información del admin */}
              <div className="mb-4">
                <h4>Bienvenido, {user?.name}! 👋</h4>
                <p className="text-muted mb-2">
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="text-muted mb-0">
                  <strong>Rol:</strong>{" "}
                  <Badge bg="danger">Administrador</Badge>
                </p>
              </div>

              <hr />

              {/* Tarjetas de estadísticas rápidas */}
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center border-primary">
                    <Card.Body>
                      <div className="display-6 text-primary mb-2">👥</div>
                      <h3 className="mb-1">150</h3>
                      <p className="text-muted mb-0 small">Usuarios</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-success">
                    <Card.Body>
                      <div className="display-6 text-success mb-2">📦</div>
                      <h3 className="mb-1">48</h3>
                      <p className="text-muted mb-0 small">Órdenes Hoy</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-warning">
                    <Card.Body>
                      <div className="display-6 text-warning mb-2">🍽️</div>
                      <h3 className="mb-1">32</h3>
                      <p className="text-muted mb-0 small">Platos Menú</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-info">
                    <Card.Body>
                      <div className="display-6 text-info mb-2">💰</div>
                      <h3 className="mb-1">$2,450</h3>
                      <p className="text-muted mb-0 small">Ventas Hoy</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <hr />

              {/* Módulos de administración */}
              <h5 className="mb-3">Módulos de Gestión</h5>
              <Row className="g-3 mb-4">
                <Col md={6} lg={4}>
                  <Card className="h-100 border-primary">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="display-6 text-primary me-3">👥</div>
                        <h5 className="mb-0">Usuarios</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Gestiona usuarios, roles y permisos del sistema
                      </p>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/users")}
                      >
                        Gestionar usuarios
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={4}>
                  <Card className="h-100 border-success">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="display-6 text-success me-3">🍽️</div>
                        <h5 className="mb-0">Menú</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Administra platos, categorías, precios y disponibilidad
                      </p>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/menu")}
                      >
                        Gestionar menú
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={4}>
                  <Card className="h-100 border-warning">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="display-6 text-warning me-3">📦</div>
                        <h5 className="mb-0">Órdenes</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Visualiza y gestiona todas las órdenes del restaurante
                      </p>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/orders")}
                      >
                        Ver órdenes
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={4}>
                  <Card className="h-100 border-info">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="display-6 text-info me-3">🪑</div>
                        <h5 className="mb-0">Mesas</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Gestiona mesas, zonas y disponibilidad del restaurante
                      </p>
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/tables")}
                      >
                        Gestionar mesas
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={4}>
                  <Card className="h-100 border-secondary">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="display-6 text-secondary me-3">📅</div>
                        <h5 className="mb-0">Reservas</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Administra reservaciones y disponibilidad de horarios
                      </p>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/reservations")}
                      >
                        Ver reservas
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={4}>
                  <Card className="h-100 border-dark">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="display-6 text-dark me-3">📊</div>
                        <h5 className="mb-0">Reportes</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Estadísticas detalladas y reportes de ventas
                      </p>
                      <Button 
                        variant="dark" 
                        size="sm" 
                        className="w-100"
                        disabled
                      >
                        Próximamente
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <hr />

              {/* Acciones rápidas */}
              <div className="d-flex justify-content-between align-items-center">
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  Ver como cliente
                </Button>
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;
