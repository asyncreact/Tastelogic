// src/components/NewReservationForm.jsx
import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Alert,
  Card,
  Spinner,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { useReservation } from "../hooks/useReservation";
import api from "../api/auth";
import Swal from "sweetalert2";

// Iconos actualizados
import { MdPeople, MdOutlineTableBar, MdClose } from "react-icons/md";
import { BiCalendar, BiTimeFive, BiNote } from "react-icons/bi";
import { FaRegMap, FaCheckCircle } from "react-icons/fa";
// Nuevo icono solicitado
import { RiReservedLine } from "react-icons/ri";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

const getZoneImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${API_URL}${cleanPath}`;
};

function NewReservationForm({ onSuccess }) {
  const { addReservation, fetchAvailableTables, loading } = useReservation();

  const [formData, setFormData] = useState({
    zone_id: "",
    table_id: "",
    reservation_date: "",
    reservation_time: "",
    guest_count: "",
    special_requirements: "",
  });

  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingZones, setLoadingZones] = useState(true);

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoadingZones(true);
        const response = await api.get("/zones/public");
        const data = response.data?.zones || response.data?.data || [];
        setZones(data);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las zonas disponibles",
        });
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, []);

  useEffect(() => {
    if (
      formData.zone_id &&
      formData.reservation_date &&
      formData.reservation_time &&
      formData.guest_count
    ) {
      loadAvailableTables();
    } else {
      setAvailableTables([]);
      setFormData((prev) => ({
        ...prev,
        table_id: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.zone_id,
    formData.reservation_date,
    formData.reservation_time,
    formData.guest_count,
  ]);

  const loadAvailableTables = async () => {
    try {
      setLoadingTables(true);

      const tables = await fetchAvailableTables({
        zone_id: formData.zone_id,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        guest_count: formData.guest_count,
      });

      const guestCount = parseInt(formData.guest_count, 10) || 0;

      const allTables = (tables || []).map((t) => ({
        ...t,
        capacity: Number(t.capacity),
      }));

      let minSuitableCapacity = null;

      allTables.forEach((t) => {
        if (t.capacity >= guestCount) {
          if (minSuitableCapacity === null || t.capacity < minSuitableCapacity) {
            minSuitableCapacity = t.capacity;
          }
        }
      });

      if (minSuitableCapacity === null) {
        setAvailableTables([]);
        return;
      }

      const filtered = allTables.filter(
        (t) => t.capacity === minSuitableCapacity
      );

      setAvailableTables(filtered);
    } catch {
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(["reservation_date", "reservation_time", "guest_count"].includes(name) && {
        table_id: "",
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.zone_id || !selectedZone) {
      Swal.fire({
        icon: "warning",
        title: "Zona requerida",
        text: "Por favor selecciona una zona",
      });
      return;
    }

    if (!formData.table_id) {
      Swal.fire({
        icon: "warning",
        title: "Mesa requerida",
        text: "Por favor selecciona una mesa disponible",
      });
      return;
    }

    const reservationDate = new Date(
      `${formData.reservation_date}T${formData.reservation_time}`
    );
    const now = new Date();

    if (reservationDate <= now) {
      Swal.fire({
        icon: "warning",
        title: "Fecha inválida",
        text: "La reserva debe ser para una fecha y hora futura",
      });
      return;
    }

    try {
      const result = await addReservation({
        zone_id: parseInt(formData.zone_id),
        table_id: parseInt(formData.table_id),
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        guest_count: parseInt(formData.guest_count),
        special_requirements: formData.special_requirements || null,
      });

      await Swal.fire({
        icon: "success",
        title: "Reserva creada",
        text:
          result?.message ||
          "Tu reserva ha sido registrada exitosamente. Recibirás una confirmación pronto.",
        confirmButtonText: "Ok",
      });

      setFormData({
        zone_id: "",
        table_id: "",
        reservation_date: "",
        reservation_time: "",
        guest_count: "",
        special_requirements: "",
      });
      setAvailableTables([]);
      setSelectedZone(null);

      if (onSuccess) onSuccess();
    } catch (error) {
      if (error.details && Array.isArray(error.details)) {
        const htmlList = error.details
          .map((d) => `<li>${d.message}</li>`)
          .join("");

        Swal.fire({
          icon: "error",
          title: error.message || "Errores de validación",
          html: `<ul style="text-align:left;margin:0;padding-left:20px;">${htmlList}</ul>`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo crear la reserva",
        });
      }
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinTime = () => {
    const OPEN_TIME = "09:00";

    if (formData.reservation_date === getMinDate()) {
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      return current > OPEN_TIME ? current : OPEN_TIME;
    }

    return OPEN_TIME;
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    setFormData((prev) => ({
      ...prev,
      zone_id: String(zone.id),
      table_id: "",
    }));
    setAvailableTables([]);
    setShowZoneModal(false);
  };

  return (
    <div className="py-2">
      <Row className="justify-content-center">
        <Col lg={10} xl={9}>
          <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
            <Card.Body className="p-4 p-md-5">
              {/* === ENCABEZADO ACTUALIZADO CON RiReservedLine === */}
              <div className="mb-4 d-flex align-items-center gap-3 border-bottom pb-4">
                <div 
                  className="icon-orange rounded-circle flex-shrink-0" 
                  style={{ width: 48, height: 48 }}
                >
                  <RiReservedLine size={24} />
                </div>
                <div>
                  <h2 className="h5 mb-0 text-dark">Nueva Reserva</h2>
                  <small className="text-muted">
                    Selecciona tu zona preferida y verifica disponibilidad.
                  </small>
                </div>
              </div>

              {/* === PASO 1: SELECCIÓN DE ZONA (GRID) === */}
              <div className="mb-5">
                <h6 className="text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.05em', color: '#6b7280' }}>
                   1. Selecciona una Zona
                </h6>

                {loadingZones ? (
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <Spinner animation="border" size="sm" variant="warning" />
                    <span className="small">Cargando espacios...</span>
                  </div>
                ) : zones.length === 0 ? (
                  <Alert variant="light" className="border-0">
                    No hay zonas disponibles por el momento.
                  </Alert>
                ) : (
                  <Row className="g-3">
                    {zones.map((zone) => {
                      const img = getZoneImageUrl(zone.image_url);
                      const isSelected = selectedZone?.id === zone.id;
                      const isUnavailable =
                        zone.is_active === false || zone.is_disabled === true;

                      return (
                        <Col key={zone.id} xs={12} md={4}>
                          <div
                            className="card h-100 border-0 shadow-sm overflow-hidden position-relative"
                            style={{
                              cursor: isUnavailable ? "not-allowed" : "pointer",
                              opacity: isUnavailable ? 0.6 : 1,
                              // Borde naranja si seleccionado
                              border: isSelected ? "2px solid #ff7a18" : "1px solid rgba(0,0,0,0.05)",
                              // Fondo suave si seleccionado
                              backgroundColor: isSelected ? "#fff7ed" : "#fff",
                              transform: isSelected ? "translateY(-2px)" : "none",
                              transition: "all 0.2s ease"
                            }}
                            onClick={() => {
                              if (isUnavailable) return;
                              setSelectedZone(zone);
                              setShowZoneModal(true);
                            }}
                          >
                            {/* Checkmark en esquina superior derecha si está seleccionado */}
                            {isSelected && (
                              <div 
                                className="position-absolute top-0 end-0 m-2"
                                style={{ zIndex: 5 }}
                              >
                                <div className="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm">
                                  <FaCheckCircle size={20} color="#ff7a18" />
                                </div>
                              </div>
                            )}

                            <div className="d-flex align-items-center p-3 h-100">
                                {img ? (
                                    <img
                                    src={img}
                                    alt={zone.name}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        objectFit: "cover",
                                        borderRadius: 10,
                                        marginRight: 12,
                                    }}
                                    />
                                ) : (
                                    <div
                                    className="d-flex align-items-center justify-content-center bg-light text-secondary rounded-3 me-3"
                                    style={{ width: 48, height: 48 }}
                                    >
                                    <MdOutlineTableBar size={20} />
                                    </div>
                                )}
                                <div className="lh-sm pe-2">
                                    <div className={`mb-0 small ${isSelected ? 'text-orange fw-bold' : 'text-dark fw-semibold'}`}>
                                        {zone.name}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {isUnavailable ? "No disponible" : "Ver detalles"}
                                    </div>
                                </div>
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>

              {/* === PASO 2: FORMULARIO DE DETALLES === */}
              {selectedZone && (
                <Form onSubmit={handleSubmit} className="animate-fade-in">
                  <h6 className="text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.05em', color: '#6b7280' }}>
                    2. Detalles de la Reserva
                  </h6>
                  
                  <div className="bg-light rounded-4 p-4 mb-4">
                    <Row className="g-3">
                        {/* CAMPO ZONA BLOQUEADO (READ-ONLY) */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small text-muted mb-1">Zona Seleccionada</Form.Label>
                                <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                                    <InputGroup.Text className="bg-white border-0 ps-3">
                                        <FaRegMap className="text-orange" size={18} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        value={selectedZone.name}
                                        className="border-0 py-2 fw-semibold text-dark bg-white"
                                        readOnly
                                        style={{ cursor: "default" }}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small text-muted mb-1">Personas</Form.Label>
                                <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                                    <InputGroup.Text className="bg-white border-0 ps-3">
                                        <MdPeople className="text-orange" size={18} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        name="guest_count"
                                        className="border-0 py-2"
                                        value={formData.guest_count}
                                        onChange={handleChange}
                                        min={1}
                                        required
                                        placeholder="0"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small text-muted mb-1">Fecha</Form.Label>
                                <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                                    <InputGroup.Text className="bg-white border-0 ps-3">
                                        <BiCalendar className="text-orange" size={18} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        name="reservation_date"
                                        className="border-0 py-2"
                                        value={formData.reservation_date}
                                        onChange={handleChange}
                                        min={getMinDate()}
                                        required
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small text-muted mb-1">Hora</Form.Label>
                                <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                                    <InputGroup.Text className="bg-white border-0 ps-3">
                                        <BiTimeFive className="text-orange" size={18} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="time"
                                        name="reservation_time"
                                        className="border-0 py-2"
                                        value={formData.reservation_time}
                                        onChange={handleChange}
                                        min={getMinTime()}
                                        max="23:59"
                                        required
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                  </div>

                  <h6 className="text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.05em', color: '#6b7280' }}>
                    3. Selección de Mesa
                  </h6>

                  <div className="mb-4">
                    {loadingTables ? (
                      <div className="d-flex align-items-center gap-2 py-3">
                        <Spinner animation="border" size="sm" variant="warning" />
                        <span className="small text-muted">Buscando mesas disponibles...</span>
                      </div>
                    ) : availableTables.length === 0 &&
                      formData.zone_id &&
                      formData.reservation_date &&
                      formData.reservation_time &&
                      formData.guest_count ? (
                      <Alert variant="warning" className="border-0 shadow-sm rounded-3 small">
                        No hay mesas disponibles para esta capacidad en este horario. Intenta cambiar la hora.
                      </Alert>
                    ) : availableTables.length > 0 ? (
                      <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                        {availableTables.map((table) => {
                          const isActive = String(formData.table_id) === String(table.id);
                          return (
                            <div
                              key={table.id}
                              onClick={() => setFormData((prev) => ({ ...prev, table_id: String(table.id) }))}
                              className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${
                                isActive 
                                    ? "border-orange bg-white text-orange shadow-sm" 
                                    : "border-light bg-white text-muted hover-shadow"
                              }`}
                              style={{ 
                                cursor: 'pointer',
                                border: isActive ? '1px solid #ff7a18' : '1px solid #e5e7eb',
                              }}
                            >
                              <MdOutlineTableBar size={24} className={`mb-2 ${isActive ? 'text-orange' : 'text-secondary'}`} />
                              <div className="small fw-semibold text-dark">Mesa {table.table_number}</div>
                              <div style={{ fontSize: '0.7rem' }} className="text-muted">
                                {table.capacity} pers.
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                        <p className="text-muted small fst-italic">
                            Completa los campos de arriba para ver las mesas disponibles.
                        </p>
                    )}
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label className="small text-muted mb-1">Notas adicionales (opcional)</Form.Label>
                     <InputGroup className="shadow-sm rounded-3 overflow-hidden border-0">
                        <InputGroup.Text className="bg-white border-0 ps-3 align-items-start pt-2">
                             <BiNote className="text-orange" size={18} />
                        </InputGroup.Text>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="special_requirements"
                            className="border-0 py-2"
                            value={formData.special_requirements}
                            onChange={handleChange}
                            placeholder="Ej: Aniversario, alergias, requerimientos de accesibilidad..."
                        />
                     </InputGroup>
                  </Form.Group>

                  <div className="d-flex justify-content-end pt-3 border-top">
                    <Button
                      type="submit"
                      variant="primary"
                      className="px-5 py-2 rounded-pill fw-semibold shadow-sm"
                      disabled={
                        loading ||
                        loadingTables ||
                        loadingZones ||
                        !selectedZone ||
                        !formData.table_id
                      }
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Procesando...
                        </>
                      ) : (
                        "Confirmar Reserva"
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- MODAL DE ZONA --- */}
      <Modal
        show={showZoneModal && !!selectedZone}
        onHide={() => setShowZoneModal(false)}
        centered
        contentClassName="border-0 rounded-4 overflow-hidden"
      >
        <div className="position-relative bg-light">
             <button
                onClick={() => setShowZoneModal(false)}
                className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                style={{ width: 32, height: 32, zIndex: 10, border: 'none', opacity: 0.9 }}
            >
                <MdClose size={18} />
            </button>

             {selectedZone && getZoneImageUrl(selectedZone.image_url) ? (
                 <div style={{ width: "100%", height: "200px" }}>
                    <img
                        src={getZoneImageUrl(selectedZone.image_url)}
                        alt={selectedZone.name}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                    />
                 </div>
             ) : (
                <div 
                    className="d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-secondary"
                    style={{ width: "100%", height: "160px" }}
                >
                     <MdOutlineTableBar size={48} opacity={0.5} />
                </div>
             )}
        </div>

        <Modal.Body className="p-4">
          {selectedZone && (
            <>
              <h5 className="mb-2 text-dark" style={{ fontWeight: 600 }}>{selectedZone.name}</h5>
              <p className="text-muted small mb-0 leading-relaxed">
                {selectedZone.description || "Disfruta de un ambiente agradable en esta zona."}
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top-0 p-4 pt-0">
          <Button
            variant="primary"
            className="w-100 py-2 rounded-3"
            onClick={() => selectedZone && handleSelectZone(selectedZone)}
          >
            Seleccionar esta zona
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default NewReservationForm;