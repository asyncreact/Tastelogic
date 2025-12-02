// pages/AdminTable.jsx
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
import { BiMap } from "react-icons/bi";
import { MdOutlineTableBar } from "react-icons/md";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useTables } from "../../hooks/useTable";

const BASE_URL = import.meta.env.VITE_API_URL;
const MySwal = withReactContent(Swal);

const buildImageUrl = (relativeOrAbsolute) => {
  if (!relativeOrAbsolute) return null;
  if (relativeOrAbsolute.startsWith("http")) return relativeOrAbsolute;
  const base = BASE_URL.replace(/\/$/, "");
  return `${base}${relativeOrAbsolute}`;
};

function AdminTable() {
  const {
    zones,
    tables,
    loading,
    error,
    fetchZones,
    fetchTables,
    addZone,
    editZone,
    removeZone,
    addTable,
    editTable,
    removeTable,
    clearError,
  } = useTables();

  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneForm, setZoneForm] = useState({
    name: "",
    description: "",
    is_active: true,
    image: null,
    imagePreview: null,
  });

  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableForm, setTableForm] = useState({
    capacity: 2,
    zone_id: "",
    status: "available",
    is_active: true,
  });

  const [searchAdmin, setSearchAdmin] = useState("");

  // Cargar zonas y mesas solo una vez al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchZones();
        await fetchTables();
      } catch (e) {
        console.error("Error cargando zonas/mesas:", e);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSuccessToast = (title) => {
    const Toast = MySwal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: false,
    });

    Toast.fire({
      icon: "success",
      title: title || "Operación realizada correctamente",
    });
  };

  const showBackendError = (
    err,
    fallback = "Por favor, verifica los datos ingresados"
  ) => {
    const baseMessage = err?.message || fallback;
    let details = [];

    if (Array.isArray(err?.details)) {
      details = err.details.map((d) =>
        typeof d === "string"
          ? d
          : d.mensaje || d.message || JSON.stringify(d)
      );
    }

    let errorDetailsHtml = "";
    if (details.length) {
      const listItems = details
        .map((d) => `<li style="text-align:left">${d}</li>`)
        .join("");
      errorDetailsHtml = `<ul style="margin:0;padding-left:1.2rem">${listItems}</ul>`;
    }

    MySwal.fire({
      icon: "error",
      title: "Error",
      html: `<p>${baseMessage}</p>${errorDetailsHtml}`,
    });
  };

  const filteredZones = zones.filter((z) =>
    `${z.name ?? ""} ${z.description ?? ""}`
      .toLowerCase()
      .includes(searchAdmin.toLowerCase())
  );

  const filteredTables = tables.filter((t) =>
    `${t.table_number ?? ""} ${t.status ?? ""}`
      .toLowerCase()
      .includes(searchAdmin.toLowerCase())
  );

  const handleOpenCreateZone = () => {
    setEditingZone(null);
    setZoneForm({
      name: "",
      description: "",
      is_active: true,
      image: null,
      imagePreview: null,
    });
    setShowZoneModal(true);
  };

  const handleOpenEditZone = (zone) => {
    const existingImage = buildImageUrl(zone.image_url || zone.image);
    setEditingZone(zone);
    setZoneForm({
      name: zone.name || "",
      description: zone.description || "",
      is_active: zone.is_active ?? true,
      image: null,
      imagePreview: existingImage || null,
    });
    setShowZoneModal(true);
  };

  const handleCloseZoneModal = () => {
    if (zoneForm.imagePreview && zoneForm.image instanceof File) {
      URL.revokeObjectURL(zoneForm.imagePreview);
    }
    setShowZoneModal(false);
    setEditingZone(null);
    setZoneForm({
      name: "",
      description: "",
      is_active: true,
      image: null,
      imagePreview: null,
    });
    clearError();
  };

  const handleZoneChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" || type === "switch") {
      setZoneForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files?.[0] || null;

      setZoneForm((prev) => {
        if (prev.imagePreview && prev.image instanceof File) {
          URL.revokeObjectURL(prev.imagePreview);
        }

        return {
          ...prev,
          image: file,
          imagePreview: file ? URL.createObjectURL(file) : null,
        };
      });
    } else {
      setZoneForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitZone = async (e) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await editZone(editingZone.id, zoneForm);
        showSuccessToast("Zona actualizada correctamente");
      } else {
        await addZone(zoneForm);
        showSuccessToast("Zona creada correctamente");
      }
      handleCloseZoneModal();
    } catch (err) {
      showBackendError(
        err,
        editingZone ? "Error al actualizar la zona" : "Error al crear la zona"
      );
    }
  };

  const handleDeleteZone = (zone) => {
    MySwal.fire({
      title: "¿Eliminar zona?",
      text: `Se eliminará la zona "${zone.name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeZone(zone.id);
          showSuccessToast("Zona eliminada correctamente");
        } catch (err) {
          showBackendError(err);
        }
      }
    });
  };

  const handleOpenCreateTable = () => {
    setEditingTable(null);
    setTableForm({
      capacity: 2,
      zone_id: zones[0]?.id || "",
      status: "available",
      is_active: true,
    });
    setShowTableModal(true);
  };

  const handleOpenEditTable = (table) => {
    setEditingTable(table);
    setTableForm({
      table_number: table.table_number || "",
      capacity: table.capacity ?? 2,
      zone_id: table.zone_id || "",
      status: table.status || "available",
      is_active: table.is_active ?? true,
    });
    setShowTableModal(true);
  };

  const handleCloseTableModal = () => {
    setShowTableModal(false);
    setEditingTable(null);
    setTableForm({
      capacity: 2,
      zone_id: "",
      status: "available",
      is_active: true,
    });
    clearError();
  };

  const handleTableChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" || type === "switch") {
      setTableForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "capacity") {
      setTableForm((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setTableForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitTable = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...tableForm };
      if (!payload.table_number) {
        delete payload.table_number;
      }

      if (editingTable) {
        await editTable(editingTable.id, payload);
        showSuccessToast("Mesa actualizada correctamente");
      } else {
        await addTable(payload);
        showSuccessToast("Mesa creada correctamente");
      }
      handleCloseTableModal();
    } catch (err) {
      showBackendError(err);
    }
  };

  const handleDeleteTable = (table) => {
    MySwal.fire({
      title: "¿Eliminar mesa?",
      text: `Se eliminará la mesa "${table.table_number}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeTable(table.id);
          showSuccessToast("Mesa eliminada correctamente");
        } catch (err) {
          showBackendError(err);
        }
      }
    });
  };

  if (loading && zones.length === 0 && tables.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 mb-0">Cargando administración de mesas...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col md={8}>
          <h2 className="d-flex align-items-center gap-2">
            <MdOutlineTableBar />
            Administración de mesas
          </h2>
          <p className="text-muted mb-2">
            Gestiona zonas y mesas del restaurante de forma sencilla.
          </p>
          <Form.Control
            type="text"
            placeholder="Buscar por número de mesa o estado..."
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
              onClose={clearError}
              className="mb-0"
            >
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="g-4">
        <Col md={6}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="d-flex align-items-center gap-2 mb-0">
              <BiMap />
              Zonas
            </h4>
            <Button size="sm" onClick={handleOpenCreateZone}>
              + Nueva zona
            </Button>
          </div>

          {filteredZones.length === 0 ? (
            <p className="text-muted mb-0">
              No hay zonas (o ninguna coincide con la búsqueda).
            </p>
          ) : (
            <div
              className="border rounded p-2"
              style={{ maxHeight: 400, overflowY: "auto" }}
            >
              {filteredZones.map((zone) => {
                const imageSrc = buildImageUrl(zone.image_url || zone.image);

                return (
                  <div
                    key={zone.id}
                    className="d-flex align-items-center justify-content-between border-bottom py-2"
                  >
                    <div className="d-flex align-items-center gap-3">
                      {imageSrc && (
                        <img
                          src={imageSrc}
                          alt={zone.name}
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <div>
                        <div className="fw-semibold">{zone.name}</div>
                        <div className="small text-muted">
                          {zone.description || "Sin descripción"}
                        </div>
                        <div className="small">
                          Estado: {zone.is_active ? "Activa" : "Inactiva"}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleOpenEditZone(zone)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteZone(zone)}
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

        <Col md={6}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="d-flex align-items-center gap-2 mb-0">
              <MdOutlineTableBar />
              Mesas
            </h4>
            <Button size="sm" onClick={handleOpenCreateTable}>
              + Nueva mesa
            </Button>
          </div>

          {filteredTables.length === 0 ? (
            <p className="text-muted mb-0">
              No hay mesas (o ninguna coincide con la búsqueda).
            </p>
          ) : (
            <div
              className="border rounded p-2"
              style={{ maxHeight: 400, overflowY: "auto" }}
            >
              {filteredTables.map((table) => (
                <div
                  key={table.id}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >
                  <div>
                    <strong>{table.table_number}</strong>
                    <div className="small text-muted">
                      Capacidad: {table.capacity ?? 0} personas
                    </div>
                    <div className="small">
                      Estado:{" "}
                      {table.status === "available"
                        ? "Disponible"
                        : "Reservada"}
                    </div>
                    <div className="small">
                      Activa: {table.is_active ? "Sí" : "No"}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleOpenEditTable(table)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteTable(table)}
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

      <Modal
        show={showZoneModal}
        onHide={handleCloseZoneModal}
        centered
      >
        <Form onSubmit={handleSubmitZone}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingZone ? "Editar zona" : "Nueva zona"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="name"
                value={zoneForm.name}
                onChange={handleZoneChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={zoneForm.description}
                onChange={handleZoneChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Zona activa"
                name="is_active"
                checked={zoneForm.is_active}
                onChange={handleZoneChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imagen (opcional)</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleZoneChange}
              />
              {zoneForm.imagePreview && (
                <div className="mt-2">
                  <img
                    src={zoneForm.imagePreview}
                    alt="Previsualización"
                    style={{
                      maxWidth: 120,
                      maxHeight: 180,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseZoneModal}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingZone ? "Guardar cambios" : "Crear zona"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showTableModal}
        onHide={handleCloseTableModal}
        centered
      >
        <Form onSubmit={handleSubmitTable}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingTable ? "Editar mesa" : "Nueva mesa"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Número de mesa</Form.Label>
              <Form.Control
                name="table_number"
                value={tableForm.table_number || ""}
                onChange={handleTableChange}
                placeholder={
                  editingTable
                    ? "Ej: 1, 2, 10A"
                    : "Se generará automáticamente si lo dejas vacío"
                }
                required={!!editingTable}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacidad</Form.Label>
              <Form.Control
                type="number"
                min={1}
                name="capacity"
                value={tableForm.capacity}
                onChange={handleTableChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Zona</Form.Label>
              <Form.Select
                name="zone_id"
                value={tableForm.zone_id}
                onChange={handleTableChange}
                required
              >
                <option value="">Selecciona una zona</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="status"
                value={tableForm.status}
                onChange={handleTableChange}
              >
                <option value="available">Disponible</option>
                <option value="reserved">Reservada</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Mesa activa"
                name="is_active"
                checked={tableForm.is_active}
                onChange={handleTableChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseTableModal}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingTable ? "Guardar cambios" : "Crear mesa"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminTable;
