// src/pages/Menu.jsx
import { useEffect } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { MdRestaurantMenu, MdCategory, MdImage, MdTimer, MdList } from "react-icons/md";
import { useMenu } from "../hooks/useMenu";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${API_URL}${cleanPath}`;
};

function Menu() {
  const { categories, items, loading, error, fetchCategories, fetchItems } = useMenu();

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error al cargar el menú: {error}</Alert>;
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4 d-flex align-items-center">
        <MdRestaurantMenu size={28} className="me-2" /> Menú
      </h2>

      {categories.length === 0 ? (
        <Alert variant="info">No hay categorías disponibles.</Alert>
      ) : (
        categories.map((category) => (
          <div key={category.id} className="mb-5">
            <h4 className="mb-3 d-flex align-items-center">
              <MdCategory size={22} className="me-2" />
              {category.name}
            </h4>

            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {items
                .filter((item) => item.category_id === category.id && item.is_available)
                .map((item) => (
                  <Col key={item.id}>
                    <Card className="h-100 shadow-sm">
                      {item.image_url ? (
                        <Card.Img
                          variant="top"
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          style={{ height: "180px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/180?text=Sin+Imagen";
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center bg-secondary text-white"
                          style={{ height: "180px" }}
                        >
                          <MdImage size={48} />
                        </div>
                      )}
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text className="flex-grow-1">{item.description}</Card.Text>

                        {item.ingredients && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-ingredients-${item.id}`}>{item.ingredients}</Tooltip>}
                          >
                            <div className="mb-2 d-flex align-items-center">
                              <MdList size={18} className="me-2" />
                              <small>Ingredientes</small>
                            </div>
                          </OverlayTrigger>
                        )}

                        {item.estimated_prep_time && (
                          <div className="mb-2 d-flex align-items-center">
                            <MdTimer size={18} className="me-2" />
                            <small>Tiempo prep. estimado: {item.estimated_prep_time} min</small>
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <strong>${parseFloat(item.price).toFixed(2)}</strong>
                          <Badge bg="success">Disponible</Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>
        ))
      )}
    </Container>
  );
}

export default Menu;
