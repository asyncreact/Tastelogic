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
} from "react-bootstrap";
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
        ["zone_id", "reservation_date", "reservation_time", "guest_count"].includes(
          name
        ) && {
          table_id: "",
        }
      ),
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

      // Si la hora actual es antes de la apertura, usar apertura
      return current < OPEN_TIME ? OPEN_TIME : current;
    }

    return OPEN_TIME;
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
                  <small>Completa los datos para realizar tu reserva.</small>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="zone_id">
                      <Form.Label>Zona</Form.Label>
                      {loadingZones ? (
                        <div className="d-flex align-items-center gap-2">
                          <Spinner animation="border" size="sm" />
                          <span className="small">Cargando...</span>
                        </div>
                      ) : (
                        <Form.Select
                          name="zone_id"
                          value={formData.zone_id}
                          onChange={handleChange}
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
                    disabled={loading || loadingTables || loadingZones}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default NewReservationForm;
