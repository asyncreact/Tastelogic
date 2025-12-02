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
} from "react-bootstrap";
import { useReservation } from "../hooks/useReservation";
import api from "../api/auth";
import Swal from "sweetalert2";
import {
  MdEventAvailable,
  MdPeople,
  MdOutlineTableBar,
} from "react-icons/md";

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
        setZones(data.filter((z) => z.is_active !== false));
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
      ...(
        ["reservation_date", "reservation_time", "guest_count"].includes(
          name
        ) && {
          table_id: "",
        }
      ),
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
          .map((d) => `<li>${d.message || d}</li>`)
          .join("");
        Swal.fire({
          icon: "error",
          title: error.message || "Errores de validación",
          html: `<ul style="text-align:left;margin:0;padding-left:20px">${htmlList}</ul>`,
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

      return current < OPEN_TIME ? OPEN_TIME : current;
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
    <div className="py-3">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="mb-3 d-flex align-items-center gap-2">
                <MdEventAvailable size={22} />
                <div>
                  <h2 className="h5 mb-1">Crear reserva</h2>
                  <small>Selecciona una zona y luego completa los datos.</small>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="h6 mb-2">Zonas disponibles</h5>
                {loadingZones ? (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    <span className="small">Cargando zonas...</span>
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

                      return (
                        <Col key={zone.id} xs={12} md={4}>
                          <Card
                            className={`h-100 position-relative ${
                              isSelected
                                ? "border-2 border-secondary bg-light"
                                : "border"
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedZone(zone);
                              setShowZoneModal(true);
                            }}
                          >
                            {isSelected && (
                              <span
                                className="badge bg-secondary position-absolute"
                                style={{ top: 8, right: 8 }}
                              >
                                Zona seleccionada
                              </span>
                            )}
                            <Card.Body className="d-flex align-items-center">
                              {img && (
                                <img
                                  src={img}
                                  alt={zone.name}
                                  style={{
                                    width: 56,
                                    height: 56,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    marginRight: 12,
                                  }}
                                />
                              )}
                              <div>
                                <div className="fw-semibold">{zone.name}</div>
                                <div className="small text-muted">
                                  {zone.description || "Sin descripción"}
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>

              {selectedZone && (
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="zone_readonly">
                        <Form.Label>Zona seleccionada</Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedZone ? selectedZone.name : ""}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="guest_count">
                        <Form.Label>Personas</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <MdPeople />
                          </span>
                          <Form.Control
                            type="number"
                            name="guest_count"
                            value={formData.guest_count}
                            onChange={handleChange}
                            min={1}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="reservation_date">
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control
                          type="date"
                          name="reservation_date"
                          value={formData.reservation_date}
                          onChange={handleChange}
                          min={getMinDate()}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="reservation_time">
                        <Form.Label>Hora</Form.Label>
                        <Form.Control
                          type="time"
                          name="reservation_time"
                          value={formData.reservation_time}
                          onChange={handleChange}
                          min={getMinTime()}
                          max="23:59"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="table_id">
                        <Form.Label>Mesa</Form.Label>
                        {loadingTables ? (
                          <div className="d-flex align-items-center gap-2">
                            <Spinner animation="border" size="sm" />
                            <span className="small">Buscando mesas...</span>
                          </div>
                        ) : availableTables.length === 0 &&
                          formData.zone_id &&
                          formData.reservation_date &&
                          formData.reservation_time &&
                          formData.guest_count ? (
                          <Alert variant="light" className="border">
                            No hay mesas para estos datos. Prueba otra hora o
                            zona.
                          </Alert>
                        ) : (
                          <div className="d-flex flex-wrap gap-2">
                            {availableTables.map((table) => {
                              const isActive =
                                String(formData.table_id) ===
                                String(table.id);
                              return (
                                <button
                                  key={table.id}
                                  type="button"
                                  className={`btn btn-outline-secondary d-flex align-items-center p-2 rounded-3 ${
                                    isActive ? "btn-secondary text-white" : ""
                                  }`}
                                  style={{ minWidth: "200px" }}
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      table_id: String(table.id),
                                    }))
                                  }
                                >
                                  <MdOutlineTableBar className="me-2" />
                                  <div className="text-start">
                                    <div className="fw-semibold small">
                                      Mesa {table.table_number}
                                    </div>
                                    <div className="small">
                                      {table.capacity} max ·{" "}
                                      {table.zone_name || "Zona"}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="special_requirements">
                        <Form.Label>Notas (opcional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="special_requirements"
                          value={formData.special_requirements}
                          onChange={handleChange}
                          placeholder="Ej: aniversario, alergias, ubicación específica."
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={
                        loading || loadingTables || loadingZones || !selectedZone
                      }
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Guardando...
                        </>
                      ) : (
                        "Confirmar reserva"
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showZoneModal && !!selectedZone}
        onHide={() => setShowZoneModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedZone ? selectedZone.name : "Zona"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedZone && (
            <>
              {getZoneImageUrl(selectedZone.image_url) && (
                <img
                  src={getZoneImageUrl(selectedZone.image_url)}
                  alt={selectedZone.name}
                  style={{
                    width: "100%",
                    maxHeight: 240,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
              )}

              <p className="mb-2">
                <strong>Descripción: </strong>
                {selectedZone.description || "Sin descripción"}
              </p>

              {selectedZone.capacity && (
                <p className="mb-0">
                  <strong>Capacidad aproximada: </strong>
                  {selectedZone.capacity}
                </p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => handleSelectZone(selectedZone)}
          >
            Reservar en esta zona
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default NewReservationForm;
