// pages/AdminMenu.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { BiCategory } from "react-icons/bi";
import { MdOutlineFastfood } from "react-icons/md";
import { useMenu } from "../../hooks/useMenu";

const BASE_URL = import.meta.env.VITE_API_URL; // ej: http://localhost:4000/

function AdminMenu() {
  const {
    categories,
    items,
    loading,
    error,
    fetchCategories,
    fetchItems,
    addCategory,
    editCategory,
    removeCategory,
    addItem,
    editItem,
    removeItem,
    clearError,
  } = useMenu();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    ingredients: "",
    estimated_prep_time: 10,
    is_available: true,
    image: null,
    imagePreview: null,
  });

  const [searchAdmin, setSearchAdmin] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildImageUrl = (relativeOrAbsolute) => {
    if (!relativeOrAbsolute) return null;
    if (relativeOrAbsolute.startsWith("http")) return relativeOrAbsolute;
    const base = BASE_URL.replace(/\/$/, "");
    return `${base}${relativeOrAbsolute}`;
  };

  // ========= Filtros =========

  const searchLower = searchAdmin.toLowerCase().trim();

  const filteredCategories = searchLower
    ? categories.filter((cat) => {
        const name = cat.name?.toLowerCase() || "";
        const desc = cat.description?.toLowerCase() || "";
        return name.includes(searchLower) || desc.includes(searchLower);
      })
    : categories;

  const filteredItems = (() => {
    if (!searchLower) return items;

    const matchingCategoryIds = new Set(
      filteredCategories.map((cat) => String(cat.id))
    );

    return items.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const desc = item.description?.toLowerCase() || "";
      const ing = item.ingredients?.toLowerCase() || "";
      const inCategory = matchingCategoryIds.has(String(item.category_id));

      const textMatch =
        name.includes(searchLower) ||
        desc.includes(searchLower) ||
        ing.includes(searchLower);

      return textMatch || inCategory;
    });
  })();

  // ========= Categorías =========

  const handleOpenCategoryModal = (category = null) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category?.name || "",
      description: category?.description || "",
      is_active: category?.is_active ?? true,
    });
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      description: "",
      is_active: true,
    });
    clearError();
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, categoryForm);
      } else {
        await addCategory(categoryForm);
      }
      handleCloseCategoryModal();
    } catch {
      // manejado en el contexto
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await removeCategory(id);
    } catch {
      // manejado en el contexto
    }
  };

  // ========= Items =========

  const handleOpenItemModal = (item = null) => {
    setEditingItem(item);
    setItemForm({
      name: item?.name || "",
      price: item?.price || "",
      category_id: item?.category_id || "",
      description: item?.description || "",
      ingredients: item?.ingredients || "",
      estimated_prep_time: item?.estimated_prep_time ?? 10,
      is_available: item?.is_available ?? true,
      image: null,
      imagePreview: buildImageUrl(item?.image_url) || null,
    });
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    if (itemForm.imagePreview && itemForm.image instanceof File) {
      URL.revokeObjectURL(itemForm.imagePreview);
    }

    setShowItemModal(false);
    setEditingItem(null);
    setItemForm({
      name: "",
      price: "",
      category_id: "",
      description: "",
      ingredients: "",
      estimated_prep_time: 10,
      is_available: true,
      image: null,
      imagePreview: null,
    });
    clearError();
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", itemForm.name);
    formData.append("price", String(itemForm.price));
    formData.append("category_id", String(itemForm.category_id));
    formData.append("description", itemForm.description || "");
    formData.append("ingredients", itemForm.ingredients || "");
    formData.append(
      "estimated_prep_time",
      String(itemForm.estimated_prep_time || 10)
    );
    formData.append("is_available", itemForm.is_available ? "true" : "false");

    if (itemForm.image) {
      formData.append("image", itemForm.image);
    }

    try {
      if (editingItem) {
        await editItem(editingItem.id, formData);
      } else {
        await addItem(formData);
      }
      handleCloseItemModal();
    } catch {
      // manejado en el contexto
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este item?")) return;
    try {
      await removeItem(id);
    } catch {
      // manejado en el contexto
    }
  };

  // ========= UI =========

  if (loading && categories.length === 0 && items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 mb-0">Cargando menú de administración...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Encabezado */}
      <Row className="mb-3">
        <Col>
          <h1 className="h3 d-flex align-items-center gap-2 mb-1">
            <MdOutlineFastfood />
            Admin Menú
          </h1>
          <p className="text-muted mb-0">
            Gestiona categorías e items del menú de forma sencilla.
          </p>
        </Col>
      </Row>

      {/* Buscador admin */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="search"
            placeholder="Buscar en categorías e items..."
            value={searchAdmin}
            onChange={(e) => setSearchAdmin(e.target.value)}
          />
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert
              variant="danger"
              dismissible
              onClose={() => clearError()}
              className="mb-0"
            >
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Categorías */}
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h2 className="h5 d-flex align-items-center gap-2 mb-0">
            <BiCategory />
            Categorías
          </h2>
          <Button size="sm" onClick={() => handleOpenCategoryModal()}>
            Nueva categoría
          </Button>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          {filteredCategories.length === 0 ? (
            <p className="text-muted mb-0">
              No hay categorías (o ninguna coincide con la búsqueda).
            </p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="d-flex align-items-center justify-content-between border rounded px-3 py-2"
                >
                  <div>
                    <div className="fw-semibold">{cat.name}</div>

                    {cat.description && (
                      <div className="small text-muted">
                        {cat.description}
                      </div>
                    )}

                    <div className="small">
                      {cat.is_active ? "Activa" : "Inactiva"}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleOpenCategoryModal(cat)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* Items */}
      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <h2 className="h5 d-flex align-items-center gap-2 mb-0">
            <MdOutlineFastfood />
            Items del menú
          </h2>
          <Button size="sm" onClick={() => handleOpenItemModal()}>
            Nuevo item
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {filteredItems.length === 0 ? (
            <p className="text-muted mb-0">
              No hay items (o ninguno coincide con la búsqueda).
            </p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredItems.map((item) => {
                const cat = filteredCategories.find(
                  (c) => String(c.id) === String(item.category_id)
                );
                const imageSrc = buildImageUrl(item.image_url);

                return (
                  <div
                    key={item.id}
                    className="d-flex align-items-center justify-content-between border rounded px-3 py-2"
                  >
                    <div className="d-flex align-items-center gap-3">
                      {imageSrc && (
                        <img
                          src={imageSrc}
                          alt={item.name}
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <div>
                        <div className="fw-semibold">{item.name}</div>
                        <div className="small text-muted">
                          {cat ? cat.name : "Sin categoría"} ·{" "}
                          {Number(item.price).toFixed(2)}
                        </div>
                        <div className="small">
                          {item.is_available ? "Disponible" : "No disponible"}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleOpenItemModal(item)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Col>
      </Row>

      {/* Modal categoría */}
      <Modal show={showCategoryModal} onHide={handleCloseCategoryModal} centered>
        <Form onSubmit={handleSubmitCategory}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="categoryName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                required
                placeholder="Ej: Pizzas"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="categoryDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                placeholder="Descripción opcional de la categoría"
              />
            </Form.Group>

            <Form.Group controlId="categoryActive">
              <Form.Check
                type="switch"
                label="Activa"
                checked={categoryForm.is_active}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    is_active: e.target.checked,
                  })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseCategoryModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingCategory ? "Guardar cambios" : "Crear"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal item */}
      <Modal show={showItemModal} onHide={handleCloseItemModal} centered>
        <Form onSubmit={handleSubmitItem}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingItem ? "Editar item" : "Nuevo item"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="itemName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm({ ...itemForm, name: e.target.value })
                }
                required
                placeholder="Ej: Hamburguesa clásica"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="itemPrice">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={itemForm.price}
                onChange={(e) =>
                  setItemForm({ ...itemForm, price: e.target.value })
                }
                required
                placeholder="Ej: 9.99"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="itemCategory">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={itemForm.category_id}
                onChange={(e) =>
                  setItemForm({ ...itemForm, category_id: e.target.value })
                }
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="itemDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="Descripción breve del plato"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="itemIngredients">
              <Form.Label>Ingredientes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={itemForm.ingredients}
                onChange={(e) =>
                  setItemForm({ ...itemForm, ingredients: e.target.value })
                }
                placeholder="Lista de ingredientes (texto libre)"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="itemPrepTime">
              <Form.Label>Tiempo estimado de preparación (minutos)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={itemForm.estimated_prep_time}
                onChange={(e) =>
                  setItemForm({
                    ...itemForm,
                    estimated_prep_time: e.target.value,
                  })
                }
                placeholder="Ej: 10"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="itemImage">
              <Form.Label>Imagen</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setItemForm((prev) => ({
                    ...prev,
                    image: file,
                    imagePreview: file
                      ? URL.createObjectURL(file)
                      : prev.imagePreview,
                  }));
                }}
              />
              {itemForm.imagePreview && (
                <div className="mt-2">
                  <img
                    src={itemForm.imagePreview}
                    alt="Previsualización"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 180,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group controlId="itemAvailable">
              <Form.Check
                type="switch"
                label="Disponible"
                checked={itemForm.is_available}
                onChange={(e) =>
                  setItemForm({ ...itemForm, is_available: e.target.checked })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseItemModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingItem ? "Guardar cambios" : "Crear"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminMenu;
