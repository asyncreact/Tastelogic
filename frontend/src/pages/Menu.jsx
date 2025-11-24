// src/pages/Menu.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  OverlayTrigger,
  Tooltip,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { MdRestaurantMenu, MdCategory, MdImage, MdTimer, MdList, MdSearch, MdShoppingCart } from "react-icons/md";
import { useMenu } from "../hooks/useMenu";
import { useOrder } from "../hooks/useOrder";
import Swal from "sweetalert2";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${API_URL}${cleanPath}`;
};

function Menu() {
  const { categories, items, loading, error, fetchCategories, fetchItems } = useMenu();
  const { addToCart, cart } = useOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  // Filtrar items según búsqueda y categoría seleccionada
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "" || String(item.category_id) === String(selectedCategory);
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.ingredients && item.ingredients.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSearch && item.is_available;
    });
  }, [items, searchTerm, selectedCategory]);

  // Filtrar las categorías que tienen items visibles
  const visibleCategories = useMemo(() => {
    return categories.filter((cat) =>
      filteredItems.some((item) => String(item.category_id) === String(cat.id))
    );
  }, [categories, filteredItems]);

  // Función para agregar al carrito
  const handleAddToCart = (item) => {
    addToCart(item, 1);
    Swal.fire({
      icon: "success",
      title: "¡Agregado al carrito!",
      text: `${item.name} ha sido agregado al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Obtener cantidad de un item en el carrito
  const getItemQuantityInCart = (itemId) => {
    const cartItem = cart.find((i) => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 d-flex align-items-center">
          <MdRestaurantMenu size={28} className="me-2" /> Menú
        </h2>
        {cart.length > 0 && (
          <Badge bg="primary" pill className="d-flex align-items-center" style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
            <MdShoppingCart size={20} className="me-2" />
            {cart.reduce((total, item) => total + item.quantity, 0)} items
          </Badge>
        )}
      </div>

      {/* Buscador y filtro por categoría */}
      <Row className="mb-4 g-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <MdSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Buscar por nombre, descripción o ingredientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            aria-label="Filtrar por categoría"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Resultados */}
      {filteredItems.length === 0 ? (
        <Alert variant="info">
          No se encontraron platos disponibles{searchTerm && " con ese criterio de búsqueda"}.
        </Alert>
      ) : visibleCategories.length === 0 ? (
        <Alert variant="info">No hay categorías disponibles.</Alert>
      ) : (
        visibleCategories.map((category) => (
          <div key={category.id} className="mb-5">
            <h4 className="mb-3 d-flex align-items-center">
              <MdCategory size={22} className="me-2" />
              {category.name}
            </h4>

            <Row className="g-4">
              {filteredItems
                .filter((item) => String(item.category_id) === String(category.id))
                .map((item) => {
                  const quantityInCart = getItemQuantityInCart(item.id);
                  return (
                    <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
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
                              overlay={
                                <Tooltip id={`tooltip-ingredients-${item.id}`}>
                                  {item.ingredients}
                                </Tooltip>
                              }
                            >
                              <div className="mb-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                                <MdList size={18} className="me-2" />
                                <small>Ingredientes</small>
                              </div>
                            </OverlayTrigger>
                          )}

                          {item.estimated_prep_time && (
                            <div className="mb-2 d-flex align-items-center">
                              <MdTimer size={18} className="me-2" />
                              <small>Tiempo prep.: {item.estimated_prep_time} min</small>
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-center mt-auto mb-2">
                            <strong>${parseFloat(item.price).toFixed(2)}</strong>
                            <Badge bg="success">Disponible</Badge>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            className="w-100 d-flex align-items-center justify-content-center"
                            onClick={() => handleAddToCart(item)}
                          >
                            <MdShoppingCart size={18} className="me-2" />
                            Agregar al carrito
                            {quantityInCart > 0 && (
                              <Badge bg="light" text="dark" className="ms-2">
                                {quantityInCart}
                              </Badge>
                            )}
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
            </Row>
          </div>
        ))
      )}
    </Container>
  );
}

export default Menu;
