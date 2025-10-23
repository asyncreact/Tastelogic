// pages/admin/MenuAdmin.jsx

import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useMenu } from "../../hooks/useMenu";
import { useAuth } from "../../hooks/useAuth";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getItems,
  createItem,
  updateItem,
  deleteItem,
  uploadImage,
} from "../../api/menu";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaTimes
} from "react-icons/fa";
import "./MenuAdmin.css";

export default function MenuAdmin() {
  const { user } = useAuth();
  const { refreshMenu } = useMenu();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("items");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para manejo de imágenes
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, itemsRes] = await Promise.all([
        getCategories(token),
        getItems(token),
      ]);
      
      setCategories(categoriesRes.data.data?.categories || categoriesRes.data.categories || []);
      setItems(itemsRes.data.data?.items || itemsRes.data.items || []);
    } catch (error) {
      console.error("Error al cargar el menú:", error);
      alert("Error al cargar el menú");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormErrors({});
    
    if (type === "addItem") {
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_url: "",
        is_available: true,
        ingredients: "",
      });
      setImagePreview(null);
      setImageFile(null);
    } else if (type === "editItem") {
      setFormData({
        ...item,
        ingredients: item.ingredients || "",
      });
      setImagePreview(item.image_url || null);
      setImageFile(null);
    } else if (type === "addCategory") {
      setFormData({
        name: "",
        description: "",
        is_active: true,
      });
    } else if (type === "editCategory") {
      setFormData(item);
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setFormErrors({});
    setModalType("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        return;
      }

      // Validar tipo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("Solo se permiten imágenes JPG, PNG, GIF o WEBP");
        return;
      }

      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return null;
    
    setUploading(true);
    try {
      const response = await uploadImage(imageFile, token);
      // ✅ CORREGIDO: Quitar /api de la URL
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      const imageUrl = `${baseUrl}${response.data.url}`;
      setUploading(false);
      return imageUrl;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir la imagen");
      setUploading(false);
      return null;
    }
  };

  const validateItemForm = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "El nombre es requerido";
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = "El precio debe ser mayor a 0";
    }
    
    if (!formData.category_id) {
      errors.category_id = "Debe seleccionar una categoría";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCategoryForm = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "El nombre es requerido";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    
    if (!validateItemForm()) return;
    
    setSubmitting(true);
    
    try {
      let imageUrl = formData.image_url;
      
      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        imageUrl = await handleUploadImage();
        if (!imageUrl) {
          setSubmitting(false);
          return;
        }
      }

      const itemData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        image_url: imageUrl,
        is_available: Boolean(formData.is_available),
        ingredients: formData.ingredients || null,
      };
      
      if (modalType === "addItem") {
        await createItem(itemData, token);
        alert("Plato creado exitosamente");
      } else {
        await updateItem(formData.id, itemData, token);
        alert("Plato actualizado exitosamente");
      }
      
      await fetchMenuData();
      await refreshMenu();
      closeModal();
    } catch (error) {
      console.error("Error al guardar el plato:", error);
      alert(error.response?.data?.message || "Error al guardar el plato");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    
    if (!validateCategoryForm()) return;
    
    setSubmitting(true);
    
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        is_active: Boolean(formData.is_active),
      };
      
      if (modalType === "addCategory") {
        await createCategory(categoryData, token);
        alert("Categoría creada exitosamente");
      } else {
        await updateCategory(formData.id, categoryData, token);
        alert("Categoría actualizada exitosamente");
      }
      
      await fetchMenuData();
      await refreshMenu();
      closeModal();
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
      alert(error.response?.data?.message || "Error al guardar la categoría");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este plato?")) return;

    try {
      await deleteItem(id, token);
      await fetchMenuData();
      await refreshMenu();
      alert("Plato eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar el plato:", error);
      alert(error.response?.data?.message || "Error al eliminar el plato");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
      await deleteCategory(id, token);
      await fetchMenuData();
      await refreshMenu();
      alert("Categoría eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
      alert(error.response?.data?.message || "Error al eliminar la categoría");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="menu-admin">
          <div className="loading">Cargando menú...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="menu-admin">
        <div className="menu-admin-header">
          <h1>Gestión de Menú</h1>
          <div className="menu-tabs">
            <button
              className={`tab-btn ${activeTab === "items" ? "active" : ""}`}
              onClick={() => setActiveTab("items")}
            >
              Platos ({items.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              Categorías ({categories.length})
            </button>
          </div>
        </div>

        {activeTab === "items" && (
          <div className="menu-section">
            <div className="section-header">
              <h2>Platos del Menú</h2>
              <button className="btn-add" onClick={() => openModal("addItem")}>
                <FaPlus /> Agregar Plato
              </button>
            </div>

            <div className="items-grid">
              {items.map((item) => {
                const category = categories.find((cat) => cat.id === item.category_id);
                return (
                  <div key={item.id} className="item-card">
                    {item.image_url && (
                      <div className="item-image-preview">
                        <img src={item.image_url} alt={item.name} />
                      </div>
                    )}
                    
                    <div className="item-header">
                      <h3>{item.name}</h3>
                      <span className={`badge ${item.is_available ? "active" : "inactive"}`}>
                        {item.is_available ? <FaEye /> : <FaEyeSlash />}
                        {item.is_available ? "Disponible" : "No disponible"}
                      </span>
                    </div>
                    
                    <p className="item-category">{category?.name || "Sin categoría"}</p>
                    <p className="item-description">{item.description}</p>
                    <p className="item-price">${item.price}</p>
                    
                    {item.ingredients && (
                      <div className="item-allergens">
                        <small>Ingredientes: {item.ingredients}</small>
                      </div>
                    )}

                    <div className="item-actions">
                      <button className="btn-edit" onClick={() => openModal("editItem", item)}>
                        <FaEdit /> Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteItem(item.id)}>
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length === 0 && (
              <div className="empty-state">
                <p>No hay platos registrados</p>
                <button className="btn-add" onClick={() => openModal("addItem")}>
                  Agregar primer plato
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "categories" && (
          <div className="menu-section">
            <div className="section-header">
              <h2>Categorías</h2>
              <button className="btn-add" onClick={() => openModal("addCategory")}>
                <FaPlus /> Agregar Categoría
              </button>
            </div>

            <div className="categories-list">
              {categories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <span className={`badge ${category.is_active ? "active" : "inactive"}`}>
                      {category.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <div className="category-actions">
                    <button className="btn-edit" onClick={() => openModal("editCategory", category)}>
                      <FaEdit />
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteCategory(category.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="empty-state">
                <p>No hay categorías registradas</p>
                <button className="btn-add" onClick={() => openModal("addCategory")}>
                  Agregar primera categoría
                </button>
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {modalType === "addItem" && "Agregar Nuevo Plato"}
                  {modalType === "editItem" && "Editar Plato"}
                  {modalType === "addCategory" && "Agregar Nueva Categoría"}
                  {modalType === "editCategory" && "Editar Categoría"}
                </h2>
                <button className="btn-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              {(modalType === "addItem" || modalType === "editItem") && (
                <form onSubmit={handleSubmitItem} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="name">Nombre del Plato *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className={formErrors.name ? "error" : ""}
                      placeholder="Ej: Pizza Margherita"
                    />
                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Descripción del plato..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price">Precio *</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price || ""}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={formErrors.price ? "error" : ""}
                        placeholder="0.00"
                      />
                      {formErrors.price && <span className="error-message">{formErrors.price}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="category_id">Categoría *</label>
                      <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id || ""}
                        onChange={handleInputChange}
                        className={formErrors.category_id ? "error" : ""}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.category_id && <span className="error-message">{formErrors.category_id}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="image">Imagen del Plato</label>
                    
                    {imagePreview && (
                      <div className="image-preview">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginBottom: "1rem"
                          }}
                        />
                      </div>
                    )}
                    
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ marginBottom: "0.5rem" }}
                    />
                    
                    <small style={{ color: "#7f8c8d", display: "block" }}>
                      Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)
                    </small>
                    
                    {uploading && <p style={{ color: "#ff6b35", marginTop: "0.5rem" }}>Subiendo imagen...</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="ingredients">Ingredientes</label>
                    <textarea
                      id="ingredients"
                      name="ingredients"
                      value={formData.ingredients || ""}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Ej: Masa de pizza, tomate, mozzarella, albahaca..."
                    />
                  </div>

                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="is_available"
                        checked={formData.is_available === true}
                        onChange={handleInputChange}
                      />
                      <span>Disponible para ordenar</span>
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitting || uploading}>
                      {submitting ? "Guardando..." : modalType === "addItem" ? "Crear Plato" : "Actualizar Plato"}
                    </button>
                  </div>
                </form>
              )}

              {(modalType === "addCategory" || modalType === "editCategory") && (
                <form onSubmit={handleSubmitCategory} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="name">Nombre de la Categoría *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className={formErrors.name ? "error" : ""}
                      placeholder="Ej: Entradas"
                    />
                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Descripción de la categoría..."
                    />
                  </div>

                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active === true}
                        onChange={handleInputChange}
                      />
                      <span>Categoría activa</span>
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitting}>
                      {submitting ? "Guardando..." : modalType === "addCategory" ? "Crear Categoría" : "Actualizar Categoría"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
