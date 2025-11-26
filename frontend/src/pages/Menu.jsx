import { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Spinner, Alert, Form, InputGroup, Badge } from "react-bootstrap";

// Iconos
import { MdOutlineFastfood } from "react-icons/md";
import { BiCategory, BiSearchAlt } from "react-icons/bi";
import { RiShoppingBag4Line } from "react-icons/ri";

import { useMenu } from "../hooks/useMenu";
import { useOrder } from "../hooks/useOrder";
import MenuItemCard from "../components/MenuItemCard";

import "./css/Menu.css"; 

function Menu() {
  const { categories, items, loading, error, fetchCategories, fetchItems } = useMenu();
  const { cart } = useOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

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

  const visibleCategories = useMemo(() => {
    return categories.filter((cat) =>
      filteredItems.some((item) => String(item.category_id) === String(cat.id))
    );
  }, [categories, filteredItems]);

  if (loading) {
    return (
      <Container className="menu-page d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="secondary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="menu-page">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="menu-page">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="menu-title d-flex align-items-center">
          <MdOutlineFastfood className="me-2" /> Menú
        </h2>
        {cart.length > 0 && (
          <Badge
            bg="light"
            text="dark"
            className="menu-cart-badge d-flex align-items-center border"
          >
            <RiShoppingBag4Line className="me-2" />
            {cart.reduce((total, item) => total + item.quantity, 0)} items
          </Badge>
        )}
      </div>

      {/* Buscador y Filtros con estilo Flat */}
      <Row className="mb-5 g-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text className="input-group-text-flat">
              <BiSearchAlt />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Buscar plato, ingrediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="menu-search-input"
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="menu-select"
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

      {/* Listado */}
      {filteredItems.length === 0 ? (
        <Alert variant="light" className="text-center text-muted">No se encontraron resultados.</Alert>
      ) : visibleCategories.length === 0 ? (
        <Alert variant="light">No hay categorías.</Alert>
      ) : (
        visibleCategories.map((category) => (
          <div key={category.id} className="mb-5">
            {/* Título de categoría con estilo */}
            <h4 className="category-title">
              <BiCategory /> {category.name}
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
