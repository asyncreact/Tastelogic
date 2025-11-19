// pages/admin/AdminDashboard.jsx
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  MdRestaurantMenu, 
  MdTableRestaurant, 
  MdShoppingCart,
  MdEventNote,
  MdLogout,
  MdVisibility,
  MdAdminPanelSettings
} from "react-icons/md";

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
          <Card className="shadow-lg border-0">
            <Card.Header 
              className="text-white border-0" 
              style={{ 
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                padding: '1.5rem'
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <MdAdminPanelSettings size={32} className="me-2" />
                  <h3 className="mb-0">Panel de Administración</h3>
                </div>
                <Badge bg="light" text="dark" style={{ fontSize: '0.875rem' }}>
                  Admin
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Información del admin */}
              <div className="mb-4">
                <h4>Bienvenido, {user?.name}!</h4>
                <p className="text-muted mb-2">
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="text-muted mb-0">
                  <strong>Rol:</strong>{" "}
                  <Badge 
                    style={{ 
                      backgroundColor: '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  >
                    Administrador
                  </Badge>
                </p>
              </div>

              <hr />

              {/* Módulos implementados */}
              <h5 className="mb-3">Módulos Disponibles</h5>
              <Row className="g-3 mb-4">
                <Col md={6} lg={3}>
                  <Card 
                    className="h-100 shadow-sm border-0" 
                    style={{ 
                      borderLeft: '4px solid #1f2937',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <MdRestaurantMenu 
                          size={40} 
                          style={{ color: '#1f2937' }} 
                          className="me-3"
                        />
                        <h5 className="mb-0">Menú</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Gestiona categorías, platos e imágenes del menú
                      </p>
                      <Button 
                        style={{ 
                          backgroundColor: '#1f2937', 
                          borderColor: '#1f2937',
                          color: 'white'
                        }}
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/menu")}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                      >
                        Gestionar menú
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3}>
                  <Card 
                    className="h-100 shadow-sm border-0" 
                    style={{ 
                      borderLeft: '4px solid #1f2937',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <MdTableRestaurant 
                          size={40} 
                          style={{ color: '#1f2937' }} 
                          className="me-3"
                        />
                        <h5 className="mb-0">Mesas</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Administra mesas, zonas e imágenes del restaurante
                      </p>
                      <Button 
                        style={{ 
                          backgroundColor: '#1f2937', 
                          borderColor: '#1f2937',
                          color: 'white'
                        }}
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/tables")}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                      >
                        Gestionar mesas
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3}>
                  <Card 
                    className="h-100 shadow-sm border-0" 
                    style={{ 
                      borderLeft: '4px solid #1f2937',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <MdShoppingCart 
                          size={40} 
                          style={{ color: '#1f2937' }} 
                          className="me-3"
                        />
                        <h5 className="mb-0">Órdenes</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Gestiona pedidos, estados y pagos de clientes
                      </p>
                      <Button 
                        style={{ 
                          backgroundColor: '#1f2937', 
                          borderColor: '#1f2937',
                          color: 'white'
                        }}
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/orders")}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                      >
                        Ver órdenes
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3}>
                  <Card 
                    className="h-100 shadow-sm border-0" 
                    style={{ 
                      borderLeft: '4px solid #1f2937',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <MdEventNote 
                          size={40} 
                          style={{ color: '#1f2937' }} 
                          className="me-3"
                        />
                        <h5 className="mb-0">Reservas</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        Gestiona reservas de mesas y horarios
                      </p>
                      <Button 
                        style={{ 
                          backgroundColor: '#1f2937', 
                          borderColor: '#1f2937',
                          color: 'white'
                        }}
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate("/admin/reservations")}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                      >
                        Ver reservas
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
                  className="d-flex align-items-center"
                >
                  <MdVisibility size={20} className="me-2" />
                  Ver como cliente
                </Button>
                <Button 
                  variant="outline-dark"
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <MdLogout size={20} className="me-2" />
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
