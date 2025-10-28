// pages/admin/TablesAdmin.jsx
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useTables } from "../../hooks/useTables";
import { useAuth } from "../../hooks/useAuth";
import {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  uploadZoneImage,
} from "../../api/tables";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import { MdOutlineTableBar, MdOutlineMap } from "react-icons/md";
import MessageModal from "../../components/MessageModal";
import "./TablesAdmin.css";


// Constantes
const MODAL_TYPES = {
  ADD_TABLE: "addTable",
  EDIT_TABLE: "editTable",
  ADD_ZONE: "addZone",
  EDIT_ZONE: "editZone",
};


const TABLE_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
};


const TAB_TYPES = {
  TABLES: "tables",
  ZONES: "zones",
};


const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB


export default function TablesAdmin() {
  const { user } = useAuth();
  const { zones, tables, setZonesData, setTablesData, getStatistics } = useTables();
  const token = user?.token || localStorage.getItem("token");


  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TAB_TYPES.TABLES);
  const [filterZone, setFilterZone] = useState("");
  const [filterStatus, setFilterStatus] = useState("");


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
      fetchTablesData();
    }
  }, [token]);


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


  const fetchTablesData = useCallback(async () => {
    try {
      setLoading(true);
      const [zonesRes, tablesRes] = await Promise.all([
        getZones(token),
        getTables(token),
      ]);


      setZonesData(zonesRes.data.data?.zones || zonesRes.data.zones || []);
      setTablesData(tablesRes.data.data?.tables || tablesRes.data.tables || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showMessage("error", "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [token, setZonesData, setTablesData, showMessage]);


  // ============================================================
  // FUNCIONES DE MODAL
  // ============================================================


  const getInitialFormData = useCallback((type, item) => {
    const formDataMap = {
      [MODAL_TYPES.ADD_TABLE]: {
        zone_id: "",
        table_number: "",
        capacity: "",
        status: TABLE_STATUS.AVAILABLE,
        is_active: true,
      },
      [MODAL_TYPES.EDIT_TABLE]: item,
      [MODAL_TYPES.ADD_ZONE]: {
        name: "",
        description: "",
        image_url: "",
        is_active: true,
      },
      [MODAL_TYPES.EDIT_ZONE]: item,
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


  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));


    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);


  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;


    if (!file.type.startsWith("image/")) {
      showMessage("error", "Por favor selecciona un archivo de imagen válido");
      return;
    }


    if (file.size > MAX_IMAGE_SIZE) {
      showMessage("error", "La imagen no debe superar los 5MB");
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


  const validateTableForm = useCallback(() => {
    const errors = {};


    if (!formData.table_number?.trim()) {
      errors.table_number = "El número de mesa es requerido";
    }


    if (!formData.capacity || formData.capacity <= 0) {
      errors.capacity = "La capacidad debe ser mayor a 0";
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);


  const validateZoneForm = useCallback(() => {
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
      const response = await uploadZoneImage(imageFile, token);
      return response.data.url || response.data.image_url;
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


  const handleSubmitTable = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateTableForm()) return;


      setModal((prev) => ({ ...prev, isSubmitting: true }));


      try {
        const tableData = {
          zone_id: formData.zone_id ? parseInt(formData.zone_id) : null,
          table_number: formData.table_number.trim(),
          capacity: parseInt(formData.capacity),
          status: formData.status || TABLE_STATUS.AVAILABLE,
          is_active: Boolean(formData.is_active),
        };


        if (modal.type === MODAL_TYPES.ADD_TABLE) {
          await createTable(tableData, token);
          showMessage("success", "Mesa creada exitosamente");
        } else {
          await updateTable(formData.id, tableData, token);
          showMessage("success", "Mesa actualizada exitosamente");
        }


        await fetchTablesData();
        closeModal();
      } catch (error) {
        console.error("Error al guardar mesa:", error);
        showMessage("error", error.response?.data?.message || "Error al guardar la mesa");
      } finally {
        setModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [validateTableForm, formData, modal.type, token, fetchTablesData, closeModal, showMessage]
  );


  const handleSubmitZone = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateZoneForm()) return;


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


        const zoneData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          image_url: imageUrl || null,
          is_active: Boolean(formData.is_active),
        };


        if (modal.type === MODAL_TYPES.ADD_ZONE) {
          await createZone(zoneData, token);
          showMessage("success", "Zona creada exitosamente");
        } else {
          await updateZone(formData.id, zoneData, token);
          showMessage("success", "Zona actualizada exitosamente");
        }


        await fetchTablesData();
        closeModal();
      } catch (error) {
        console.error("Error al guardar zona:", error);
        showMessage("error", error.response?.data?.message || "Error al guardar la zona");
      } finally {
        setModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [
      validateZoneForm,
      formData,
      imageFile,
      modal.type,
      token,
      handleUploadImage,
      fetchTablesData,
      closeModal,
      showMessage,
    ]
  );


  // ============================================================
  // DELETE
  // ============================================================


  const handleDeleteTable = useCallback(
    async (id) => {
      showConfirm("¿Estás seguro de eliminar esta mesa?", async () => {
        try {
          await deleteTable(id, token);
          await fetchTablesData();
          showMessage("success", "Mesa eliminada exitosamente");
        } catch (error) {
          console.error("Error al eliminar mesa:", error);
          showMessage("error", error.response?.data?.message || "Error al eliminar la mesa");
        } finally {
          closeConfirm();
        }
      });
    },
    [token, fetchTablesData, showMessage, showConfirm, closeConfirm]
  );


  const handleDeleteZone = useCallback(
    async (id) => {
      showConfirm(
        "¿Estás seguro de eliminar esta zona? Se eliminarán también las mesas asociadas.",
        async () => {
          try {
            await deleteZone(id, token);
            await fetchTablesData();
            showMessage("success", "Zona eliminada exitosamente");
          } catch (error) {
            console.error("Error al eliminar zona:", error);
            showMessage("error", error.response?.data?.message || "Error al eliminar la zona");
          } finally {
            closeConfirm();
          }
        }
      );
    },
    [token, fetchTablesData, showMessage, showConfirm, closeConfirm]
  );


  // ============================================================
  // FILTROS
  // ============================================================


  const getFilteredTables = useCallback(() => {
    return tables.filter((table) => {
      const matchZone =
        !filterZone ||
        (filterZone === "null" ? !table.zone_id : table.zone_id?.toString() === filterZone);
      const matchStatus = !filterStatus || table.status === filterStatus;
      return matchZone && matchStatus;
    });
  }, [tables, filterZone, filterStatus]);


  const clearFilters = useCallback(() => {
    setFilterZone("");
    setFilterStatus("");
  }, []);


  // ============================================================
  // COMPONENTES AUXILIARES
  // ============================================================


  const StatCard = ({ icon: Icon, value, label, variant = "primary" }) => (
    <div className={`tablesadmin-stat-card tablesadmin-stat-${variant}`}>
      <Icon className="tablesadmin-stat-icon" />
      <div className="tablesadmin-stat-content">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );


  const TableCard = ({ table }) => (
    <div className={`tablesadmin-table-card tablesadmin-status-${table.status} ${!table.is_active ? "inactive" : ""}`}>
      <div className="tablesadmin-table-card-header">
        <h3>{table.table_number}</h3>
        <div className="tablesadmin-table-actions">
          <button
            className="tablesadmin-btn-icon tablesadmin-btn-icon-edit"
            onClick={() => openModal(MODAL_TYPES.EDIT_TABLE, table)}
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            className="tablesadmin-btn-icon tablesadmin-btn-icon-delete"
            onClick={() => handleDeleteTable(table.id)}
            title="Eliminar"
          >
            <FaTrash />
          </button>
        </div>
      </div>


      <div className="tablesadmin-table-card-body">
        <div className="tablesadmin-table-info">
          <span className="tablesadmin-info-label">Zona:</span>
          <span className="tablesadmin-info-value">{table.zone_name || "Sin zona"}</span>
        </div>


        <div className="tablesadmin-table-info">
          <span className="tablesadmin-info-label">Capacidad:</span>
          <span className="tablesadmin-info-value">{table.capacity} personas</span>
        </div>


        <div className="tablesadmin-table-info">
          <span className="tablesadmin-info-label">Estado:</span>
          <span className={`tablesadmin-badge tablesadmin-badge-${table.status}`}>
            {table.status === TABLE_STATUS.AVAILABLE && "Disponible"}
            {table.status === TABLE_STATUS.OCCUPIED && "Ocupada"}
            {table.status === TABLE_STATUS.RESERVED && "Reservada"}
          </span>
        </div>


        {!table.is_active && (
          <div className="tablesadmin-table-info">
            <span className="tablesadmin-badge">Inactiva</span>
          </div>
        )}
      </div>
    </div>
  );


  const ZoneCard = ({ zone }) => {
    const zoneTables = tables.filter((t) => t.zone_id === zone.id);

    return (
      <div className={`tablesadmin-zone-card ${!zone.is_active ? "inactive" : ""}`}>
        {zone.image_url ? (
          <div className="tablesadmin-zone-image">
            <img src={zone.image_url} alt={zone.name} />
          </div>
        ) : (
          <div className="zone-image zone-image-empty">
            <MdOutlineMap />
          </div>
        )}

        <div className="tablesadmin-zone-card-header">
          <h3>{zone.name}</h3>
          {zone.is_active ? (
            <FaEye className="tablesadmin-icon-active" />
          ) : (
            <FaEyeSlash className="tablesadmin-icon-inactive" />
          )}
        </div>

        <div className="tablesadmin-zone-card-body">
          <p className="tablesadmin-zone-description">{zone.description || "Sin descripción"}</p>

          {/* Stats Mesas | Capacidad */}
          <div className="tablesadmin-zone-stats">
            <div className="tablesadmin-zone-stat">
              <span className="tablesadmin-stat-label">Mesas:</span>
              <span className="tablesadmin-stat-value">{zoneTables.length}</span>
            </div>
            <div className="tablesadmin-zone-stat">
              <span className="tablesadmin-stat-label">Capacidad:</span>
              <span className="tablesadmin-stat-value">
                {zoneTables.reduce((sum, t) => sum + t.capacity, 0)} personas
              </span>
            </div>
          </div>

          <div className="tablesadmin-zone-status">
            <span className={`tablesadmin-badge ${zone.is_active ? "badge-success" : ""}`}>
              {zone.is_active ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>

        <div className="tablesadmin-zone-card-footer">
          <button
            className="tablesadmin-btn tablesadmin-btn-sm tablesadmin-btn-outline"
            onClick={() => openModal(MODAL_TYPES.EDIT_ZONE, zone)}
          >
            <FaEdit /> Editar
          </button>
          <button
            className="tablesadmin-btn tablesadmin-btn-sm tablesadmin-btn-danger"
            onClick={() => handleDeleteZone(zone.id)}
          >
            <FaTrash /> Eliminar
          </button>
        </div>
      </div>
    );
  };

  const EmptyState = ({ icon: Icon, message, buttonText, onButtonClick }) => (
    <div className="tablesadmin-empty-state">
      <Icon className="tablesadmin-empty-icon" />
      <p>{message}</p>
      <button className="tablesadmin-btn tablesadmin-btn-primary" onClick={onButtonClick}>
        <FaPlus /> {buttonText}
      </button>
    </div>
  );


  // ============================================================
  // RENDER
  // ============================================================


  const stats = getStatistics();
  const filteredTables = getFilteredTables();


  if (loading) {
    return (
      <AdminLayout>
        <div className="tablesadmin-loading">
          <div className="tablesadmin-spinner"></div>
          <span>Cargando datos...</span>
        </div>
      </AdminLayout>
    );
  }


  return (
    <AdminLayout>
      <div className="tablesadmin-container">
        <div className="tablesadmin-header">
          <h1>Gestión de Mesas y Zonas</h1>
        </div>


        <div className="tablesadmin-stats-grid">
          <StatCard icon={MdOutlineTableBar} value={stats.totalTables} label="Total Mesas" variant="primary" />
          <StatCard icon={MdOutlineTableBar} value={stats.availableTables} label="Disponibles" variant="success" />
          <StatCard icon={MdOutlineTableBar} value={stats.reservedTables} label="Reservadas" variant="warning" />
          <StatCard icon={MdOutlineTableBar} value={stats.occupiedTables} label="Ocupadas" variant="danger" />
          <StatCard icon={MdOutlineMap} value={zones.length} label="Zonas" variant="info" />
          <StatCard icon={MdOutlineTableBar} value={stats.totalCapacity} label="Capacidad Total" variant="secondary" />
        </div>


        <div className="tablesadmin-tabs">
          <button
            className={`tablesadmin-tab-btn ${activeTab === TAB_TYPES.TABLES ? "active" : ""}`}
            onClick={() => setActiveTab(TAB_TYPES.TABLES)}
          >
            <MdOutlineTableBar />
            Mesas ({tables.length})
          </button>
          <button
            className={`tablesadmin-tab-btn ${activeTab === TAB_TYPES.ZONES ? "active" : ""}`}
            onClick={() => setActiveTab(TAB_TYPES.ZONES)}
          >
            <MdOutlineMap />
            Zonas ({zones.length})
          </button>
        </div>


        {activeTab === TAB_TYPES.TABLES && (
          <div className="tablesadmin-section">
            <div className="tablesadmin-section-header">
              <h2>Mesas del Restaurante</h2>
              <button className="tablesadmin-btn tablesadmin-btn-primary" onClick={() => openModal(MODAL_TYPES.ADD_TABLE)}>
                <FaPlus /> Agregar Mesa
              </button>
            </div>


            {tables.length > 0 && (
              <div className="tablesadmin-filters">
                <div className="tablesadmin-filter-group">
                  <label className="tablesadmin-form-label">Filtrar por Zona:</label>
                  <select className="tablesadmin-input" value={filterZone} onChange={(e) => setFilterZone(e.target.value)}>
                    <option value="">Todas las zonas</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                    <option value="null">Sin zona asignada</option>
                  </select>
                </div>


                <div className="tablesadmin-filter-group">
                  <label className="tablesadmin-form-label">Filtrar por Estado:</label>
                  <select className="tablesadmin-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value={TABLE_STATUS.AVAILABLE}>Disponible</option>
                    <option value={TABLE_STATUS.OCCUPIED}>Ocupada</option>
                    <option value={TABLE_STATUS.RESERVED}>Reservada</option>
                  </select>
                </div>


                {(filterZone || filterStatus) && (
                  <div className="tablesadmin-filter-group">
                    <label className="tablesadmin-form-label">&nbsp;</label>
                    <button className="tablesadmin-btn tablesadmin-btn-outline" onClick={clearFilters}>
                      Limpiar Filtros
                    </button>
                  </div>
                )}
              </div>
            )}


            {filteredTables.length > 0 ? (
              <div className="tablesadmin-tables-grid">
                {filteredTables.map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MdOutlineTableBar}
                message="No hay mesas registradas"
                buttonText="Agregar primera mesa"
                onButtonClick={() => openModal(MODAL_TYPES.ADD_TABLE)}
              />
            )}
          </div>
        )}


        {activeTab === TAB_TYPES.ZONES && (
          <div className="tablesadmin-section">
            <div className="tablesadmin-section-header">
              <h2>Zonas del Restaurante</h2>
              <button className="tablesadmin-btn tablesadmin-btn-primary" onClick={() => openModal(MODAL_TYPES.ADD_ZONE)}>
                <FaPlus /> Agregar Zona
              </button>
            </div>


            {zones.length > 0 ? (
              <div className="tablesadmin-zones-grid">
                {zones.map((zone) => (
                  <ZoneCard key={zone.id} zone={zone} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MdOutlineMap}
                message="No hay zonas registradas"
                buttonText="Agregar primera zona"
                onButtonClick={() => openModal(MODAL_TYPES.ADD_ZONE)}
              />
            )}
          </div>
        )}


        {/* MODAL DE FORMULARIO */}
        {modal.isOpen && (
          <div className="tablesadmin-modal-overlay" onClick={closeModal}>
            <div className="tablesadmin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="tablesadmin-modal-header">
                <h2>
                  {modal.type === MODAL_TYPES.ADD_TABLE && "Agregar Nueva Mesa"}
                  {modal.type === MODAL_TYPES.EDIT_TABLE && "Editar Mesa"}
                  {modal.type === MODAL_TYPES.ADD_ZONE && "Agregar Nueva Zona"}
                  {modal.type === MODAL_TYPES.EDIT_ZONE && "Editar Zona"}
                </h2>
                <button className="tablesadmin-btn-icon tablesadmin-btn-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>


              <div className="tablesadmin-modal-body">
                {(modal.type === MODAL_TYPES.ADD_TABLE || modal.type === MODAL_TYPES.EDIT_TABLE) && (
                  <form onSubmit={handleSubmitTable}>
                    <div className="tablesadmin-form-group">
                      <label className="tablesadmin-form-label">Número de Mesa *</label>
                      <input
                        type="text"
                        name="table_number"
                        className="tablesadmin-input"
                        value={formData.table_number || ""}
                        onChange={handleInputChange}
                        placeholder="Ej: M01, T02, BARRA01"
                        required
                      />
                      {formErrors.table_number && (
                        <span className="tablesadmin-form-error">{formErrors.table_number}</span>
                      )}
                    </div>


                    <div className="tablesadmin-form-group">
                      <label className="tablesadmin-form-label">Capacidad *</label>
                      <input
                        type="number"
                        name="capacity"
                        className="tablesadmin-input"
                        value={formData.capacity || ""}
                        onChange={handleInputChange}
                        placeholder="Número de personas"
                        min="1"
                        required
                      />
                      {formErrors.capacity && <span className="tablesadmin-form-error">{formErrors.capacity}</span>}
                    </div>


                    <div className="tablesadmin-form-group">
                      <label className="tablesadmin-form-label">Zona</label>
                      <select name="zone_id" className="tablesadmin-input" value={formData.zone_id || ""} onChange={handleInputChange}>
                        <option value="">Sin zona asignada</option>
                        {zones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    <div className="tablesadmin-form-group">
                      <label className="tablesadmin-form-label">Estado</label>
                      <select
                        name="status"
                        className="tablesadmin-input"
                        value={formData.status || TABLE_STATUS.AVAILABLE}
                        onChange={handleInputChange}
                      >
                        <option value={TABLE_STATUS.AVAILABLE}>Disponible</option>
                        <option value={TABLE_STATUS.OCCUPIED}>Ocupada</option>
                        <option value={TABLE_STATUS.RESERVED}>Reservada</option>
                      </select>
                    </div>


                    <div className="tablesadmin-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="table_is_active"
                        name="is_active"
                        checked={formData.is_active || false}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="table_is_active">Mesa activa</label>
                    </div>


                    <div className="tablesadmin-modal-actions">
                      <button type="button" className="tablesadmin-btn tablesadmin-btn-outline" onClick={closeModal}>
                        Cancelar
                      </button>
                      <button type="submit" className="tablesadmin-btn tablesadmin-btn-primary" disabled={modal.isSubmitting}>
                        {modal.isSubmitting
                          ? "Guardando..."
                          : modal.type === MODAL_TYPES.ADD_TABLE
                          ? "Crear Mesa"
                          : "Actualizar Mesa"}
                      </button>
                    </div>
                  </form>
                )}


                {(modal.type === MODAL_TYPES.ADD_ZONE || modal.type === MODAL_TYPES.EDIT_ZONE) && (
                  <form onSubmit={handleSubmitZone}>
                    <div className="tablesadmin-form-group">
                      <label className="tablesadmin-form-label">Nombre de la Zona *</label>
                      <input
                        type="text"
                        name="name"
                        className="tablesadmin-input"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        placeholder="Ej: Salón Principal, Terraza, VIP"
                        required
                      />
                      {formErrors.name && <span className="tablesadmin-form-error">{formErrors.name}</span>}
                    </div>


                    <div className="tablesadmin-form-group">
                      <label className="tablesadmin-form-label">Descripción</label>
                      <textarea
                        name="description"
                        className="tablesadmin-input"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        placeholder="Descripción de la zona"
                        rows="3"
                      />
                    </div>


                    <div className="tablesadmin-form-group">
                      <label className="tablesadmin-form-label">
                        <FaImage /> Imagen de la Zona
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="tablesadmin-input tablesadmin-file-input"
                      />
                      <small className="tablesadmin-form-helper">Formatos: JPG, PNG, GIF. Máximo 5MB</small>
                    </div>


                    {imagePreview && (
                      <div className="tablesadmin-image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}


                    <div className="tablesadmin-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="zone_is_active"
                        name="is_active"
                        checked={formData.is_active || false}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="zone_is_active">Zona activa</label>
                    </div>


                    <div className="tablesadmin-modal-actions">
                      <button type="button" className="tablesadmin-btn tablesadmin-btn-outline" onClick={closeModal}>
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="tablesadmin-btn tablesadmin-btn-primary"
                        disabled={modal.isSubmitting || modal.isUploadingImage}
                      >
                        {modal.isSubmitting || modal.isUploadingImage
                          ? modal.isUploadingImage
                            ? "Subiendo imagen..."
                            : "Guardando..."
                          : modal.type === MODAL_TYPES.ADD_ZONE
                          ? "Crear Zona"
                          : "Actualizar Zona"}
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
          <div className="tablesadmin-modal-overlay" onClick={closeConfirm}>
            <div className="tablesadmin-modal-content tablesadmin-modal-confirm" onClick={(e) => e.stopPropagation()}>
              <div className="tablesadmin-modal-header">
                <h3>Confirmar Acción</h3>
                <button className="tablesadmin-btn-icon tablesadmin-btn-close" onClick={closeConfirm}>
                  <FaTimes />
                </button>
              </div>
              <div className="tablesadmin-modal-body">
                <p>{confirmModal.message}</p>
              </div>
              <div className="tablesadmin-modal-actions">
                <button className="tablesadmin-btn tablesadmin-btn-outline" onClick={closeConfirm}>
                  Cancelar
                </button>
                <button className="tablesadmin-btn tablesadmin-btn-danger" onClick={confirmModal.onConfirm}>
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