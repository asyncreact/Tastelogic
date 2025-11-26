import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert, Card, Badge, Spinner } from "react-bootstrap";
import { useReservation } from "../hooks/useReservation";
import api from "../api/auth";
import Swal from "sweetalert2";
import { MdEventAvailable, MdPeople, MdOutlineTableBar } from "react-icons/md";

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
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingZones, setLoadingZones] = useState(true);

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoadingZones(true);
        const response = await api.get("/zones/public");
        setZones(response.data?.zones || response.data?.data || []);
      } catch (error) {
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
      setAvailableTables(tables || []);
    } catch (error) {
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
      ...(["zone_id", "reservation_date", "reservation_time", "guest_count"].includes(name) && {
        table_id: "",
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      await addReservation({
        zone_id: parseInt(formData.zone_id),
        table_id: parseInt(formData.table_id),
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        guest_count: parseInt(formData.guest_count),
        special_requirements: formData.special_requirements || null,
      });

      await Swal.fire({
        icon: "success",
        title: "¡Reserva creada!",
        text: "Tu reserva ha sido registrada exitosamente. Recibirás una confirmación pronto.",
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

      if (onSuccess) onSuccess();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear la reserva",
      });
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinTime = () => {
    if (formData.reservation_date === getMinDate()) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "09:00";
  };

  return (
    <div className="reservation-form-wrapper reservation-form-wrapper-narrow">
      <Card className="reservation-form-card-flat">
        <Card.Body className="reservation-form-card-body reservation-form-card-body-tight">
          <div className="reservation-form-header reservation-form-header-compact">
            <div className="reservation-form-header-main">
              <h2 className="reservation-form-title">
                <MdEventAvailable />
                Crear reserva
              </h2>
              <span className="reservation-form-chip">Formulario</span>
            </div>
            <p className="reservation-form-subtitle">
              Complete todos los datos para realizar su reserva.
            </p>
          </div>

          <Form onSubmit={handleSubmit} className="reservation-form reservation-form-compact">
            <Row className="g-3">
              {/* Fila 1: Zona + Personas */}
              <Col md={7}>
                <Form.Group controlId="zone_id" className="mb-2">
                  <Form.Label className="reservation-label">Zona</Form.Label>
                  {loadingZones ? (
                    <div className="reservation-inline-loading">
                      <Spinner animation="border" size="sm" />
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    <Form.Select
                      name="zone_id"
                      value={formData.zone_id}
                      onChange={handleChange}
                      className="reservation-input reservation-select"
                      required
                    >
                      <option value="">Selecciona</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group controlId="guest_count" className="mb-2">
                  <Form.Label className="reservation-label">Personas</Form.Label>
                  <div className="reservation-input-with-icon">
                    <span className="reservation-input-icon">
                      <MdPeople />
                    </span>
                    <Form.Control
                      type="number"
                      name="guest_count"
                      value={formData.guest_count}
                      onChange={handleChange}
                      className="reservation-input reservation-input-number"
                      min={1}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>

              {/* Fila 2: Fecha + Hora */}
              <Col md={6}>
                <Form.Group controlId="reservation_date" className="mb-2">
                  <Form.Label className="reservation-label">Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="reservation_date"
                    value={formData.reservation_date}
                    onChange={handleChange}
                    className="reservation-input"
                    min={getMinDate()}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="reservation_time" className="mb-2">
                  <Form.Label className="reservation-label">Hora</Form.Label>
                  <Form.Control
                    type="time"
                    name="reservation_time"
                    value={formData.reservation_time}
                    onChange={handleChange}
                    className="reservation-input"
                    min={getMinTime()}
                    required
                  />
                </Form.Group>
              </Col>

              {/* Fila 3: Mesa disponible (cards cuadradas y centradas) */}
              <Col md={12}>
                <Form.Group controlId="table_id" className="mb-2">
                  <Form.Label className="reservation-label">Mesa</Form.Label>
                  {loadingTables ? (
                    <div className="reservation-inline-loading">
                      <Spinner animation="border" size="sm" />
                      <span>Buscando mesas...</span>
                    </div>
                  ) : availableTables.length === 0 &&
                    formData.zone_id &&
                    formData.reservation_date &&
                    formData.reservation_time &&
                    formData.guest_count ? (
                    <Alert variant="outline-light" className="reservation-alert">
                      No hay mesas para estos datos. Prueba otra hora o zona.
                    </Alert>
                  ) : (
                    <div className="reservation-tables-list reservation-tables-list-tight">
                      {availableTables.map((table) => (
                        <button
                          key={table.id}
                          type="button"
                          className={`reservation-table-pill reservation-table-pill-square ${
                            String(formData.table_id) === String(table.id)
                              ? "reservation-table-pill-active"
                              : ""
                          }`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              table_id: String(table.id),
                            }))
                          }
                        >
                          <MdOutlineTableBar className="reservation-table-icon" />
                          <div className="reservation-table-text">
                            <span className="reservation-table-name">
                              Mesa {table.table_number}
                            </span>
                            <span className="reservation-table-meta">
                              {table.capacity} max · {table.zone_name || "Zona"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* Fila 4: Notas */}
              <Col md={12}>
                <Form.Group controlId="special_requirements" className="mb-2">
                  <Form.Label className="reservation-label">Notas (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="special_requirements"
                    value={formData.special_requirements}
                    onChange={handleChange}
                    className="reservation-input reservation-textarea reservation-textarea-small"
                    placeholder="Ej: Aniversario, alergias, ubicación específica."
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="reservation-form-footer reservation-form-footer-compact">
              <Button
                type="submit"
                className="btn-reservation-action btn-reservation-action-small"
                disabled={loading || loadingTables || loadingZones}
              >
                {loading ? "Guardando..." : "Confirmar reserva"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default NewReservationForm;
