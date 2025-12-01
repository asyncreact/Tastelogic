// src/pages/Menu.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Form,
  InputGroup,
} from "react-bootstrap";

import { MdOutlineFastfood } from "react-icons/md";
import { BiCategory, BiSearchAlt } from "react-icons/bi";
import { RiShoppingBag4Line } from "react-icons/ri";

import { useMenu } from "../hooks/useMenu";
import { useOrder } from "../hooks/useOrder";
import MenuItemCard from "../components/MenuItemCard";

function Menu() {
  const { categories, items, loading, error, fetchCategories, fetchItems } =
    useMenu();
  const { cart } = useOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "" ||
        String(item.category_id) === String(selectedCategory);

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchLower) ||
        (item.description &&
          item.description.toLowerCase().includes(searchLower)) ||
        (item.ingredients &&
          item.ingredients.toLowerCase().includes(searchLower));

      // 👇 ya no filtramos por item.is_available
      return matchesCategory && matchesSearch;
    });
  }, [items, searchTerm, selectedCategory]);

  const visibleCategories = useMemo(() => {
    return categories.filter((cat) =>
      filteredItems.some(
        (item) => String(item.category_id) === String(cat.id)
      )
    );
  }, [categories, filteredItems]);

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  const itemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Container className="py-4">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <MdOutlineFastfood size={24} />
          <div>
            <h2 className="h4 mb-0">Menú</h2>
            <small>
              Explora los platos disponibles y añade lo que desees a tu pedido.
            </small>
          </div>
        </div>

        {itemsInCart > 0 && (
          <div className="small d-flex align-items-center gap-1">
            <RiShoppingBag4Line size={18} />
            <span>
              {itemsInCart} ítem{itemsInCart > 1 ? "s" : ""} en tu bolsa
            </span>
          </div>
        )}
      </div>

      {/* Buscador y filtros */}
      <Row className="mb-4 g-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <BiSearchAlt />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Buscar plato, ingrediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
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

      {/* Errores globales */}
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" className="mb-0">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Listado */}
      {filteredItems.length === 0 ? (
        <Alert variant="light" className="text-center border-0">
          No se encontraron resultados.
        </Alert>
      ) : visibleCategories.length === 0 ? (
        <Alert variant="light" className="border-0">
          No hay categorías.
        </Alert>
      ) : (
        visibleCategories.map((category) => (
          <div key={category.id} className="mb-5">
            {/* Título de categoría */}
            <h4 className="h5 mb-3 d-flex align-items-center gap-2">
              <BiCategory />
              <span>{category.name}</span>
            </h4>

            <Row className="g-4">
              {filteredItems
                .filter(
                  (item) =>
                    String(item.category_id) === String(category.id)
                )
                .map((item) => (
                  <Col key={item.id} xs={12} md={4}>
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
