// src/pages/admin/AdminMenu.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Badge,
  Tabs,
  Tab,
  Image,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  MdRestaurantMenu,
  MdAdd,
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdCategory,
  MdImage,
  MdCheckCircle,
} from "react-icons/md";
import { useMenu } from "../../hooks/useMenu";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

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

  const [activeTab, setActiveTab] = useState("items");

  // Modal states and forms
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    ingredients: "",
    price: "",
    category_id: "",
    estimated_prep_time: "",
    is_available: true,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, categoryForm);
        setShowCategoryModal(false);
        await MySwal.fire({ icon: "success", title: "Categoría actualizada" });
      } else {
        await addCategory(categoryForm);
        setShowCategoryModal(false);
        await MySwal.fire({ icon: "success", title: "Categoría creada" });
      }
      setCategoryForm({ name: "", description: "" });
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al guardar categoría",
      });
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    clearError();
    const result = await MySwal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la categoría permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await removeCategory(categoryId);
        await fetchCategories();
        await MySwal.fire({
          icon: "success",
          title: "Categoría eliminada",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "No se pudo eliminar la categoría",
        });
      }
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      if (editingItem) {
        await editItem(editingItem.id, itemForm);
        setShowItemModal(false);
        await MySwal.fire({ icon: "success", title: "Plato actualizado" });
      } else {
        await addItem(itemForm);
        setShowItemModal(false);
        await MySwal.fire({ icon: "success", title: "Plato creado" });
      }
      setItemForm({
        name: "",
        description: "",
        ingredients: "",
        price: "",
        category_id: "",
        estimated_prep_time: "",
        is_available: true,
        image: null,
      });
      setImagePreview(null);
      setEditingItem(null);
      await fetchItems();
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al guardar plato",
      });
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || "",
      ingredients: item.ingredients || "",
      price: item.price,
      category_id: item.category_id,
      estimated_prep_time: item.estimated_prep_time || "",
      is_available: item.is_available,
      image: null,
    });
    if (item.image_url) {
      setImagePreview(getImageUrl(item.image_url));
    } else {
      setImagePreview(null);
    }
    setShowItemModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    clearError();
    const result = await MySwal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el plato permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await removeItem(itemId);
        await fetchItems();
        await MySwal.fire({
          icon: "success",
          title: "Plato eliminado",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "No se pudo eliminar el plato",
        });
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm({ ...itemForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    return `${API_URL}${cleanPath}`;
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0">
        <Card.Header
          className="text-white border-0"
          style={{
            background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
            padding: "1.5rem",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <MdRestaurantMenu size={32} className="me-2" />
              <h4 className="mb-0">Gestión de Menú</h4>
            </div>
            <Button
              as={Link}
              to="/admin/dashboard"
              variant="light"
              size="sm"
              className="d-flex align-items-center"
            >
              <MdArrowBack size={18} className="me-1" />
              Volver
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={clearError}>
              {error}
            </Alert>
          )}

          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            <Tab
              eventKey="items"
              title={
                <span className="d-flex align-items-center">
                  <MdRestaurantMenu size={18} className="me-2" />
                  Platos
                </span>
              }
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Lista de Platos</h5>
                <Button
                  style={{
                    backgroundColor: "#1f2937",
                    borderColor: "#1f2937",
                  }}
                  onClick={() => {
                    setEditingItem(null);
                    setItemForm({
                      name: "",
                      description: "",
                      ingredients: "",
                      price: "",
                      category_id: "",
                      estimated_prep_time: "",
                      is_available: true,
                      image: null,
                    });
                    setImagePreview(null);
                    setShowItemModal(true);
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
                  className="d-flex align-items-center"
                >
                  <MdAdd size={20} className="me-1" />
                  Agregar Plato
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: "#1f2937" }} />
                </div>
              ) : items.length === 0 ? (
                <Alert variant="info">No hay platos registrados. Crea el primero.</Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead style={{ backgroundColor: "#f3f4f6" }}>
                    <tr>
                      <th>ID</th>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Ingredientes</th>
                      <th>Tiempo Prep.</th>
                      <th>Precio</th>
                      <th>Disponible</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                          {item.image_url ? (
                            <Image
                              src={getImageUrl(item.image_url)}
                              alt={item.name}
                              rounded
                              style={{ width: "60px", height: "60px", objectFit: "cover" }}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/60?text=Sin+Imagen";
                              }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center bg-secondary text-white rounded"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <MdImage size={24} />
                            </div>
                          )}
                        </td>
                        <td>{item.name}</td>
                        <td>{categories.find((c) => c.id === item.category_id)?.name || "N/A"}</td>
                        <td>{item.ingredients || "-"}</td>
                        <td>{item.estimated_prep_time ? `${item.estimated_prep_time} min` : "-"}</td>
                        <td>${parseFloat(item.price).toFixed(2)}</td>
                        <td>
                          <Badge bg={item.is_available ? "success" : "secondary"}>
                            {item.is_available ? "Sí" : "No"}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditItem(item)}
                          >
                            <MdEdit size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <MdDelete size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            <Tab
              eventKey="categories"
              title={
                <span className="d-flex align-items-center">
                  <MdCategory size={18} className="me-2" />
                  Categorías
                </span>
              }
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Lista de Categorías</h5>
                <Button
                  style={{
                    backgroundColor: "#1f2937",
                    borderColor: "#1f2937",
                  }}
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: "", description: "" });
                    setShowCategoryModal(true);
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
                  className="d-flex align-items-center"
                >
                  <MdAdd size={20} className="me-1" />
                  Agregar Categoría
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: "#1f2937" }} />
                </div>
              ) : categories.length === 0 ? (
                <Alert variant="info">No hay categorías registradas. Crea la primera.</Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead style={{ backgroundColor: "#f3f4f6" }}>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>{category.description || "-"}</td>
                        <td>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditCategory(category)}
                          >
                            <MdEdit size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <MdDelete size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* MODAL DE PLATO */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <MdRestaurantMenu size={24} className="me-2" />
            {editingItem ? "Editar Plato" : "Agregar Plato"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleItemSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del plato *</Form.Label>
              <Form.Control
                type="text"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ingredientes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={itemForm.ingredients}
                onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Select
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Tiempo estimado de preparación (minutos)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={itemForm.estimated_prep_time}
                onChange={(e) => setItemForm({ ...itemForm, estimated_prep_time: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imagen</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              <Form.Text className="text-muted">Formatos aceptados: JPG, PNG. Máx 5MB</Form.Text>

              {imagePreview && (
                <div className="mt-3">
                  <p className="mb-2"><strong>Vista previa:</strong></p>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    rounded
                    style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }}
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Disponible"
                checked={itemForm.is_available}
                onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowItemModal(false); setImagePreview(null); }}>
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: "#1f2937", borderColor: "#1f2937" }}
              type="submit"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
              className="d-flex align-items-center"
            >
              <MdCheckCircle size={18} className="me-1" />
              {editingItem ? "Actualizar" : "Crear"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL DE CATEGORÍA */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <MdCategory size={24} className="me-2" />
            {editingCategory ? "Editar Categoría" : "Agregar Categoría"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCategorySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: "#1f2937", borderColor: "#1f2937" }}
              type="submit"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
              className="d-flex align-items-center"
            >
              <MdCheckCircle size={18} className="me-1" />
              {editingCategory ? "Actualizar" : "Crear"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminMenu;
