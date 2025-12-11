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

  const categoryById = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      map.set(String(cat.id), cat);
    });
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "" ||
        String(item.category_id) === String(selectedCategory);

      const category = categoryById.get(String(item.category_id));
      const categoryName = category?.name?.toLowerCase() || "";

      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchLower) ||
        (item.description &&
          item.description.toLowerCase().includes(searchLower)) ||
        (item.ingredients &&
          item.ingredients.toLowerCase().includes(searchLower)) ||
        categoryName.includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [items, searchTerm, selectedCategory, categoryById]);

  const visibleCategories = useMemo(
    () =>
      categories.filter((cat) =>
        filteredItems.some(
          (item) => String(item.category_id) === String(cat.id)
        )
      ),
    [categories, filteredItems]
  );

  const itemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // color naranja base (por si lo sigues usando en otros sitios)
  const orange = "#ff7a18";

  return (
    <Container className="py-4" style={{ maxWidth: "1280px" }}>
      {/* === ENCABEZADO CENTRADO === */}
      {/* Se cambió justify-content-between por justify-content-center */}
      <div className="d-flex flex-wrap justify-content-center align-items-center mb-5 gap-4">
        <div className="d-flex align-items-center">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 me-3 shadow-sm icon-orange"
            style={{ width: 56, height: 56 }}
          >
            <MdOutlineFastfood size={28} />
          </div>
          <div>
            <h2 className="h4 mb-0 fw-bold text-dark">Menú</h2>
            <small className="text-muted">
              Explora y añade platos a tu pedido.
            </small>
          </div>
        </div>

        {/* El indicador del carrito ahora aparece al lado del título, centrado */}
        {itemsInCart > 0 && (
          <div className="bg-white border rounded-pill ps-2 pe-4 py-2 shadow-sm d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle icon-orange"
              style={{ width: 36, height: 36 }}
            >
              <RiShoppingBag4Line size={18} />
            </div>
            <div className="d-flex flex-column" style={{ lineHeight: 1.2 }}>
              <span className="fw-bold text-dark small">Tu Bolsa</span>
              <span
                className="text-muted small"
                style={{ fontSize: "0.75rem" }}
              >
                {itemsInCart} ítem{itemsInCart > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* === BÚSQUEDA Y FILTROS CENTRADOS === */}
      {/* Se agregó mx-auto y maxWidth para que no se estire demasiado */}
      <Row className="mb-5 g-3 mx-auto" style={{ maxWidth: "1000px" }}>
        <Col md={8}>
          <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
            <InputGroup.Text className="bg-white border-0 ps-3">
              <BiSearchAlt className="text-orange" size={20} />
            </InputGroup.Text>
            <Form.Control
              type="search"
              className="border-0 py-2"
              placeholder="Buscar plato, ingrediente o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            className="border-0 shadow-sm py-2 rounded-3 text-secondary fw-semibold"
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

      {/* ERRORES */}
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" className="mb-0 rounded-3 border-0 shadow-sm">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* LISTADO */}
      <Row>
        <Col>
          {filteredItems.length === 0 ? (
            <Alert
              variant="light"
              className="text-center border-0 bg-transparent py-5"
            >
              <div
                className="mb-2 d-flex align-items-center justify-content-center icon-orange"
                style={{ width: 56, height: 56, margin: "0 auto" }}
              >
                <BiSearchAlt size={28} />
              </div>
              <p className="h6 text-muted mb-0">
                No se encontraron resultados para tu búsqueda.
              </p>
            </Alert>
          ) : visibleCategories.length === 0 ? (
            <Alert variant="light" className="border-0">
              No hay categorías.
            </Alert>
          ) : (
            visibleCategories.map((category) => (
              <div key={category.id} className="mb-5">
                {/* Cabecera de Categoría */}
                <div className="d-flex align-items-center mb-4 border-bottom pb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 me-3 shadow-sm icon-orange"
                    style={{ width: 42, height: 42 }}
                  >
                    <BiCategory size={22} />
                  </div>
                  <h4 className="h5 mb-0 fw-bold text-dark">
                    {category.name}
                  </h4>
                </div>

                <Row className="g-4">
                  {filteredItems
                    .filter(
                      (item) =>
                        String(item.category_id) === String(category.id)
                    )
                    .map((item) => (
                      <Col key={item.id} xs={12} md={6} lg={4} xl={3}>
                        <div className="h-100">
                          <MenuItemCard item={item} />
                        </div>
                      </Col>
                    ))}
                </Row>
              </div>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Menu;