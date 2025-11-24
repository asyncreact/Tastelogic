// src/pages/Menu.jsx
import { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Badge, Spinner, Alert, Form, InputGroup } from "react-bootstrap";
import { MdRestaurantMenu, MdCategory, MdSearch, MdShoppingCart } from "react-icons/md";
import { useMenu } from "../hooks/useMenu";
import { useOrder } from "../hooks/useOrder";
import MenuItemCard from "../components/MenuItemCard";

function Menu() {
  const { categories, items, loading, error, fetchCategories, fetchItems } = useMenu();
  const { cart } = useOrder();

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
                .map((item) => (
                  <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
                    <MenuItemCard item={item} />
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
