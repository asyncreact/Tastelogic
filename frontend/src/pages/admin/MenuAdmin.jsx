// pages/admin/MenuAdmin.jsx
import { useState, useEffect, useCallback } from "react";
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
  getItemPrepTime,
} from "../../api/menu";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaTimes,
  FaUtensils,
  FaList,
  FaImage,
  FaClock,
} from "react-icons/fa";
import MessageModal from "../../components/MessageModal";
import "./MenuAdmin.css";


// Constantes
const MODAL_TYPES = {
  ADD_ITEM: "addItem",
  EDIT_ITEM: "editItem",
  ADD_CATEGORY: "addCategory",
  EDIT_CATEGORY: "editCategory",
};


const TAB_TYPES = {
  ITEMS: "items",
  CATEGORIES: "categories",
};


const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB


export default function MenuAdmin() {
  const { user } = useAuth();
  const { refreshMenu } = useMenu();
  const token = user?.token || localStorage.getItem("token");


  // Estados de UI
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TAB_TYPES.ITEMS);


  // Estados de Modal
  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
    isSubmitting: false,
    isUploadingImage: false,
  });


  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);


  // Estado para tiempos de preparación
  const [prepTimeData, setPrepTimeData] = useState({});
  const [prepTimeLoading, setPrepTimeLoading] = useState(false);


  // Estado para MessageModal
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    type: "info",
    message: "",
    details: [],
  });


  // Estados para confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });


  // ============================================================
  // EFECTOS
  // ============================================================


  useEffect(() => {
    if (token) {
      fetchMenuData();
    }
  }, [token]);


  // 🆕 Cargar tiempos de preparación después de cargar los items
  useEffect(() => {
    if (items.length > 0 && token) {
      const loadPrepTimes = async () => {
        for (const item of items) {
          await fetchItemPrepTime(item.id);
        }
      };
      loadPrepTimes();
    }
  }, [items, token]);


  // ============================================================
  // FUNCIONES DE MENSAJE
  // ============================================================


  const showMessage = useCallback((type, message, details = []) => {
    setMessageModal({ isOpen: true, type, message, details });
  }, []);


  const closeMessage = useCallback(() => {
    setMessageModal({ isOpen: false, type: "info", message: "", details: [] });
  }, []);


  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  }, []);


  const closeConfirm = useCallback(() => {
    setConfirmModal({ isOpen: false, message: "", onConfirm: null });
  }, []);


  // ============================================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================================


  const fetchMenuData = useCallback(async () => {
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
      showMessage("error", "Error al cargar el menú");
    } finally {
      setLoading(false);
    }
  }, [token, showMessage]);


  // Función para cargar el tiempo de preparación de un item
  const fetchItemPrepTime = useCallback(async (itemId) => {
    try {
      setPrepTimeLoading(true);
      const response = await getItemPrepTime(itemId, token);
      const data = response.data.data || response.data;
      setPrepTimeData(prev => ({ ...prev, [itemId]: data }));
      return data;
    } catch (error) {
      console.error(`Error al cargar tiempo de preparación para ${itemId}:`, error);
      return null;
    } finally {
      setPrepTimeLoading(false);
    }
  }, [token]);


  // ============================================================
  // FUNCIONES DE MODAL
  // ============================================================


  const getInitialFormData = useCallback((type, item) => {
    const formDataMap = {
      [MODAL_TYPES.ADD_ITEM]: {
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_url: "",
        is_available: true,
        ingredients: "",
        prep_time_minutes: 30,
      },
      [MODAL_TYPES.EDIT_ITEM]: {
        ...item,
        ingredients: item.ingredients || "",
        prep_time_minutes: item.estimated_prep_time || 30,
      },
      [MODAL_TYPES.ADD_CATEGORY]: {
        name: "",
        description: "",
        is_active: true,
      },
      [MODAL_TYPES.EDIT_CATEGORY]: item,
    };

    return formDataMap[type] || {};
  }, []);


  const openModal = useCallback(
    (type, item = null) => {
      setModal({ isOpen: true, type, isSubmitting: false, isUploadingImage: false });
      setFormErrors({});
      setImageFile(null);
      setImagePreview(item?.image_url || null);
      setFormData(getInitialFormData(type, item));
    },
    [getInitialFormData]
  );


  const closeModal = useCallback(() => {
    setModal({ isOpen: false, type: "", isSubmitting: false, isUploadingImage: false });
    setFormData({});
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
  }, []);


  // ============================================================
  // MANEJO DE INPUTS
  // ============================================================


  // 🆕 Manejo mejorado de inputs con conversión de tipos
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      let newValue = value;
      
      // 🆕 Convertir prep_time_minutes a número
      if (name === "prep_time_minutes") {
        newValue = value ? parseInt(value, 10) : "";
      }
      // Convertir price a número también
      else if (name === "price") {
        newValue = value ? parseFloat(value) : "";
      }
      // Convertir category_id a número
      else if (name === "category_id") {
        newValue = value ? parseInt(value, 10) : "";
      }
      // Para checkboxes
      else if (type === "checkbox") {
        newValue = checked;
      }
      
      return {
        ...prev,
        [name]: newValue,
      };
    });

    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);


  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      showMessage("error", "La imagen no debe superar los 5MB");
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showMessage("error", "Solo se permiten imágenes JPG, PNG, GIF o WEBP");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }, [showMessage]);


  // ============================================================
  // VALIDACIONES
  // ============================================================


  // 🆕 Validación mejorada
  const validateItemForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = "El nombre es requerido";
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = "El precio debe ser mayor a 0";
    }
    
    if (!formData.category_id) {
      errors.category_id = "Debe seleccionar una categoría";
    }

    // 🆕 Validar prep_time_minutes como número
    if (!formData.prep_time_minutes || formData.prep_time_minutes <= 0) {
      errors.prep_time_minutes = "El tiempo debe ser mayor a 0";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);


  const validateCategoryForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = "El nombre es requerido";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);


  // ============================================================
  // SUBIR IMAGEN
  // ============================================================


  const handleUploadImage = useCallback(async () => {
    if (!imageFile) return formData.image_url || null;
    
    try {
      setModal((prev) => ({ ...prev, isUploadingImage: true }));
      const response = await uploadImage(imageFile, token);
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      const imageUrl = `${baseUrl}${response.data.url}`;
      return imageUrl;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      showMessage("error", "Error al subir la imagen");
      return null;
    } finally {
      setModal((prev) => ({ ...prev, isUploadingImage: false }));
    }
  }, [imageFile, formData.image_url, token, showMessage]);


  // ============================================================
  // SUBMIT FORMS
  // ============================================================


  // 🆕 ACTUALIZADO - Incluir estimated_prep_time al crear item
  const handleSubmitItem = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateItemForm()) return;

      setModal((prev) => ({ ...prev, isSubmitting: true }));

      try {
        let imageUrl = formData.image_url;
        
        if (imageFile) {
          imageUrl = await handleUploadImage();
          if (!imageUrl && imageFile) {
            setModal((prev) => ({ ...prev, isSubmitting: false }));
            return;
          }
        }

        // 🆕 INCLUIR estimated_prep_time aquí
        const itemData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id),
          image_url: imageUrl || null,
          is_available: Boolean(formData.is_available),
          ingredients: formData.ingredients?.trim() || null,
          estimated_prep_time: formData.prep_time_minutes || 30, // 🆕 AGREGAR
        };
        
        let createdItemId = formData.id;

        if (modal.type === MODAL_TYPES.ADD_ITEM) {
          const createResponse = await createItem(itemData, token);
          createdItemId = createResponse.data.data?.id || createResponse.data.id;
          showMessage("success", "Plato creado exitosamente");
        } else {
          await updateItem(formData.id, itemData, token);
          showMessage("success", "Plato actualizado exitosamente");
        }
        
        // 🆕 YA NO NECESITAS ESTO - se guarda en la creación del item
        
        await fetchMenuData();
        await refreshMenu();
        closeModal();
      } catch (error) {
        console.error("Error al guardar el plato:", error);
        showMessage("error", error.response?.data?.message || "Error al guardar el plato");
      } finally {
        setModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [validateItemForm, formData, imageFile, modal.type, token, handleUploadImage, fetchMenuData, refreshMenu, closeModal, showMessage]
  );


  const handleSubmitCategory = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateCategoryForm()) return;

      setModal((prev) => ({ ...prev, isSubmitting: true }));

      try {
        const categoryData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          is_active: Boolean(formData.is_active),
        };
        
        if (modal.type === MODAL_TYPES.ADD_CATEGORY) {
          await createCategory(categoryData, token);
          showMessage("success", "Categoría creada exitosamente");
        } else {
          await updateCategory(formData.id, categoryData, token);
          showMessage("success", "Categoría actualizada exitosamente");
        }
        
        await fetchMenuData();
        await refreshMenu();
        closeModal();
      } catch (error) {
        console.error("Error al guardar la categoría:", error);
        showMessage("error", error.response?.data?.message || "Error al guardar la categoría");
      } finally {
        setModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [validateCategoryForm, formData, modal.type, token, fetchMenuData, refreshMenu, closeModal, showMessage]
  );


  // ============================================================
  // DELETE
  // ============================================================


  const handleDeleteItem = useCallback(
    async (id) => {
      showConfirm("¿Estás seguro de eliminar este plato?", async () => {
        try {
          await deleteItem(id, token);
          await fetchMenuData();
          await refreshMenu();
          showMessage("success", "Plato eliminado exitosamente");
        } catch (error) {
          console.error("Error al eliminar el plato:", error);
          showMessage("error", error.response?.data?.message || "Error al eliminar el plato");
        } finally {
          closeConfirm();
        }
      });
    },
    [token, fetchMenuData, refreshMenu, showMessage, showConfirm, closeConfirm]
  );


  const handleDeleteCategory = useCallback(
    async (id) => {
      showConfirm(
        "¿Estás seguro de eliminar esta categoría? Los platos asociados quedarán sin categoría.",
        async () => {
          try {
            await deleteCategory(id, token);
            await fetchMenuData();
            await refreshMenu();
            showMessage("success", "Categoría eliminada exitosamente");
          } catch (error) {
            console.error("Error al eliminar la categoría:", error);
            showMessage("error", error.response?.data?.message || "Error al eliminar la categoría");
          } finally {
            closeConfirm();
          }
        }
      );
    },
    [token, fetchMenuData, refreshMenu, showMessage, showConfirm, closeConfirm]
  );


  // ============================================================
  // COMPONENTES AUXILIARES
  // ============================================================


  const ItemCard = ({ item }) => {
    const category = categories.find((cat) => cat.id === item.category_id);
    const itemPrepTime = prepTimeData[item.id];
    
    return (
      <div className="menuadmin-item-card">
        {item.image_url && (
          <div className="menuadmin-item-image-preview">
            <img src={item.image_url} alt={item.name} />
          </div>
        )}
        
        <div className="menuadmin-item-header">
          <h3>{item.name}</h3>
          <span className={`menuadmin-badge ${item.is_available ? "active" : "inactive"}`}>
            {item.is_available ? <FaEye /> : <FaEyeSlash />}
            {item.is_available ? "Disponible" : "No disponible"}
          </span>
        </div>
        
        <p className="menuadmin-item-category">{category?.name || "Sin categoría"}</p>
        <p className="menuadmin-item-description">{item.description}</p>
        <p className="menuadmin-item-price">${item.price}</p>
        
        {item.ingredients && (
          <div className="item-allergens">
            <small>Ingredientes: {item.ingredients}</small>
          </div>
        )}

        {itemPrepTime && (
          <div className="menuadmin-prep-time-info">
            <FaClock /> {itemPrepTime.estimated_prep_time} min
          </div>
        )}

        <div className="menuadmin-item-actions">
          <button className="menuadmin-btn-edit" onClick={() => openModal(MODAL_TYPES.EDIT_ITEM, item)}>
            <FaEdit /> Editar
          </button>
          <button className="menuadmin-btn-delete" onClick={() => handleDeleteItem(item.id)}>
            <FaTrash /> Eliminar
          </button>
        </div>
      </div>
    );
  };


  const CategoryCard = ({ category }) => (
    <div className="menuadmin-category-card">
      <div className="menuadmin-category-info">
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <span className={`menuadmin-badge ${category.is_active ? "active" : "inactive"}`}>
          {category.is_active ? "Activa" : "Inactiva"}
        </span>
      </div>
      <div className="menuadmin-category-actions">
        <button className="menuadmin-btn-edit" onClick={() => openModal(MODAL_TYPES.EDIT_CATEGORY, category)}>
          <FaEdit />
        </button>
        <button className="menuadmin-btn-delete" onClick={() => handleDeleteCategory(category.id)}>
          <FaTrash />
        </button>
      </div>
    </div>
  );


  const EmptyState = ({ icon: Icon, message, buttonText, onButtonClick }) => (
    <div className="menuadmin-empty-state">
      <Icon className="menuadmin-empty-icon" />
      <p>{message}</p>
      <button className="menuadmin-btn-add" onClick={onButtonClick}>
        <FaPlus /> {buttonText}
      </button>
    </div>
  );


  // ============================================================
  // RENDER
  // ============================================================


  if (loading) {
    return (
      <AdminLayout>
        <div className="menuadmin-container">
          <div className="menuadmin-loading">
            <div className="menuadmin-spinner"></div>
            <span>Cargando menú...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }


  return (
    <AdminLayout>
      <div className="menuadmin-container">
        <div className="menuadmin-header">
          <h1>Gestión de Menú</h1>
        </div>

        <div className="menuadmin-tabs">
          <button
            className={`menuadmin-tab-btn ${activeTab === TAB_TYPES.ITEMS ? "active" : ""}`}
            onClick={() => setActiveTab(TAB_TYPES.ITEMS)}
          >
            <FaUtensils />
            Platos ({items.length})
          </button>
          <button
            className={`menuadmin-tab-btn ${activeTab === TAB_TYPES.CATEGORIES ? "active" : ""}`}
            onClick={() => setActiveTab(TAB_TYPES.CATEGORIES)}
          >
            <FaList />
            Categorías ({categories.length})
          </button>
        </div>

        {activeTab === TAB_TYPES.ITEMS && (
          <div className="menuadmin-section">
            <div className="menuadmin-section-header">
              <h2>Platos del Menú</h2>
              <button className="menuadmin-btn-add" onClick={() => openModal(MODAL_TYPES.ADD_ITEM)}>
                <FaPlus /> Agregar Plato
              </button>
            </div>

            {items.length > 0 ? (
              <div className="menuadmin-items-grid">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FaUtensils}
                message="No hay platos registrados"
                buttonText="Agregar primer plato"
                onButtonClick={() => openModal(MODAL_TYPES.ADD_ITEM)}
              />
            )}
          </div>
        )}

        {activeTab === TAB_TYPES.CATEGORIES && (
          <div className="menuadmin-section">
            <div className="menuadmin-section-header">
              <h2>Categorías</h2>
              <button className="menuadmin-btn-add" onClick={() => openModal(MODAL_TYPES.ADD_CATEGORY)}>
                <FaPlus /> Agregar Categoría
              </button>
            </div>

            {categories.length > 0 ? (
              <div className="menuadmin-categories-list">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FaList}
                message="No hay categorías registradas"
                buttonText="Agregar primera categoría"
                onButtonClick={() => openModal(MODAL_TYPES.ADD_CATEGORY)}
              />
            )}
          </div>
        )}

        {/* MODAL DE FORMULARIO */}
        {modal.isOpen && (
          <div className="menuadmin-modal-overlay" onClick={closeModal}>
            <div className="menuadmin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="menuadmin-modal-header">
                <h2>
                  {modal.type === MODAL_TYPES.ADD_ITEM && "Agregar Nuevo Plato"}
                  {modal.type === MODAL_TYPES.EDIT_ITEM && "Editar Plato"}
                  {modal.type === MODAL_TYPES.ADD_CATEGORY && "Agregar Nueva Categoría"}
                  {modal.type === MODAL_TYPES.EDIT_CATEGORY && "Editar Categoría"}
                </h2>
                <button className="menuadmin-btn-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="menuadmin-modal-body">
                {(modal.type === MODAL_TYPES.ADD_ITEM || modal.type === MODAL_TYPES.EDIT_ITEM) && (
                  <form onSubmit={handleSubmitItem} className="menuadmin-modal-form">
                    <div className="menuadmin-form-group">
                      <label htmlFor="name">Nombre del Plato *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className={formErrors.name ? "error" : ""}
                        placeholder="Ej: Pizza Margherita"
                        required
                      />
                      {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                    </div>

                    <div className="menuadmin-form-group">
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

                    <div className="menuadmin-form-row">
                      <div className="menuadmin-form-group">
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
                          required
                        />
                        {formErrors.price && <span className="error-message">{formErrors.price}</span>}
                      </div>

                      <div className="menuadmin-form-group">
                        <label htmlFor="category_id">Categoría *</label>
                        <select
                          id="category_id"
                          name="category_id"
                          value={formData.category_id || ""}
                          onChange={handleInputChange}
                          className={formErrors.category_id ? "error" : ""}
                          required
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

                    <div className="menuadmin-form-row">
                      <div className="menuadmin-form-group">
                        <label htmlFor="prep_time_minutes">
                          <FaClock /> Tiempo de Preparación (min) *
                        </label>
                        <input
                          type="number"
                          id="prep_time_minutes"
                          name="prep_time_minutes"
                          value={formData.prep_time_minutes || ""}
                          onChange={handleInputChange}
                          min="1"
                          className={formErrors.prep_time_minutes ? "error" : ""}
                          placeholder="Ej: 30"
                          required
                        />
                        {formErrors.prep_time_minutes && <span className="error-message">{formErrors.prep_time_minutes}</span>}
                      </div>
                    </div>

                    <div className="menuadmin-form-group">
                      <label htmlFor="image">
                        <FaImage /> Imagen del Plato
                      </label>
                      
                      {imagePreview && (
                        <div className="menuadmin-image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                      
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="input file-input"
                      />
                      <small className="menuadmin-form-helper">
                        Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)
                      </small>
                    </div>

                    <div className="menuadmin-form-group">
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

                    <div className="menuadmin-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="item_is_available"
                        name="is_available"
                        checked={formData.is_available || false}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="item_is_available">Disponible para ordenar</label>
                    </div>

                    <div className="menuadmin-modal-actions">
                      <button type="button" className="menuadmin-btn-cancel" onClick={closeModal}>
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="menuadmin-btn-submit" 
                        disabled={modal.isSubmitting || modal.isUploadingImage}
                      >
                        {modal.isSubmitting || modal.isUploadingImage
                          ? modal.isUploadingImage
                            ? "Subiendo imagen..."
                            : "Guardando..."
                          : modal.type === MODAL_TYPES.ADD_ITEM
                          ? "Crear Plato"
                          : "Actualizar Plato"}
                      </button>
                    </div>
                  </form>
                )}

                {(modal.type === MODAL_TYPES.ADD_CATEGORY || modal.type === MODAL_TYPES.EDIT_CATEGORY) && (
                  <form onSubmit={handleSubmitCategory} className="menuadmin-modal-form">
                    <div className="menuadmin-form-group">
                      <label htmlFor="name">Nombre de la Categoría *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className={formErrors.name ? "error" : ""}
                        placeholder="Ej: Entradas"
                        required
                      />
                      {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                    </div>

                    <div className="menuadmin-form-group">
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

                    <div className="menuadmin-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="category_is_active"
                        name="is_active"
                        checked={formData.is_active || false}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="category_is_active">Categoría activa</label>
                    </div>

                    <div className="menuadmin-modal-actions">
                      <button type="button" className="menuadmin-btn-cancel" onClick={closeModal}>
                        Cancelar
                      </button>
                      <button type="submit" className="menuadmin-btn-submit" disabled={modal.isSubmitting}>
                        {modal.isSubmitting
                          ? "Guardando..."
                          : modal.type === MODAL_TYPES.ADD_CATEGORY
                          ? "Crear Categoría"
                          : "Actualizar Categoría"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMACIÓN */}
        {confirmModal.isOpen && (
          <div className="menuadmin-modal-overlay" onClick={closeConfirm}>
            <div className="menuadmin-modal-content menuadmin-modal-confirm" onClick={(e) => e.stopPropagation()}>
              <div className="menuadmin-modal-header">
                <h3>Confirmar Acción</h3>
                <button className="menuadmin-btn-close" onClick={closeConfirm}>
                  <FaTimes />
                </button>
              </div>
              <div className="menuadmin-modal-body">
                <p>{confirmModal.message}</p>
              </div>
              <div className="menuadmin-modal-actions">
                <button className="menuadmin-btn-cancel" onClick={closeConfirm}>
                  Cancelar
                </button>
                <button className="menuadmin-btn-submit" onClick={confirmModal.onConfirm}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGE MODAL */}
        {messageModal.isOpen && (
          <MessageModal
            type={messageModal.type}
            message={messageModal.message}
            details={messageModal.details}
            onClose={closeMessage}
          />
        )}
      </div>
    </AdminLayout>
  );
}
