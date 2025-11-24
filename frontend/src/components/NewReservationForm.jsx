// src/components/NewReservationForm.jsx
import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert, Card, Badge, Spinner } from "react-bootstrap";
import { useReservation } from "../hooks/useReservation";
import api from "../api/auth";
import Swal from "sweetalert2";
import { MdEventAvailable, MdPeople, MdRestaurant } from "react-icons/md";

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

  // Cargar zonas al montar el componente
  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoadingZones(true);
        const response = await api.get('/zones/public'); // Ruta pública
        setZones(response.data?.zones || response.data?.data || []);
      } catch (error) {
        console.error("Error loading zones:", error);
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
    if (formData.zone_id && formData.reservation_date && formData.reservation_time && formData.guest_count) {
      loadAvailableTables();
    } else {
      setAvailableTables([]);
      setFormData((prev) => ({ ...prev, table_id: "" }));
    }
  }, [formData.zone_id, formData.reservation_date, formData.reservation_time, formData.guest_count]);

  const loadAvailableTables = async () => {
    try {
      setLoadingTables(true);
      const tables = await fetchAvailableTables({
        zone_id: formData.zone_id,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        guest_count: formData.guest_count,
      });
      setAvailableTables(tables);
    } catch (error) {
      console.error("Error loading tables:", error);
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
      ...(["zone_id", "reservation_date", "reservation_time", "guest_count"].includes(name) && { table_id: "" }),
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

    const reservationDate = new Date(`${formData.reservation_date}T${formData.reservation_time}`);
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

      // Limpiar formulario
      setFormData({
        zone_id: "",
        table_id: "",
        reservation_date: "",
        reservation_time: "",
        guest_count: "",
        special_requirements: "",
      });
      setAvailableTables([]);

      // Llamar callback para cambiar a tab de historial
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
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return "09:00";
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <MdRestaurant className="me-2" />
              Zona *
            </Form.Label>
            <Form.Select
              name="zone_id"
              value={formData.zone_id}
              onChange={handleChange}
              required
              disabled={loadingZones}
            >
              <option value="">
                {loadingZones ? "Cargando zonas..." : "Selecciona una zona"}
              </option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </Form.Select>
            {loadingZones && (
              <Form.Text className="text-muted">
                <Spinner animation="border" size="sm" className="me-2" />
                Cargando zonas disponibles...
              </Form.Text>
            )}
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <MdPeople className="me-2" />
              Número de personas *
            </Form.Label>
            <Form.Control
              type="number"
              name="guest_count"
              value={formData.guest_count}
              onChange={handleChange}
              min="1"
              max="20"
              placeholder="¿Cuántas personas?"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <MdEventAvailable className="me-2" />
              Fecha *
            </Form.Label>
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
          <Form.Group className="mb-3">
            <Form.Label>Hora *</Form.Label>
            <Form.Control
              type="time"
              name="reservation_time"
              value={formData.reservation_time}
              onChange={handleChange}
              min={getMinTime()}
              required
            />
            <Form.Text className="text-muted">
              Horario: 09:00 AM - 10:00 PM
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Mesas disponibles */}
      {formData.zone_id && formData.reservation_date && formData.reservation_time && formData.guest_count && (
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <strong>Mesas Disponibles</strong>
          </Card.Header>
          <Card.Body>
            {loadingTables ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" /> Buscando mesas disponibles...
              </div>
            ) : availableTables.length === 0 ? (
              <Alert variant="warning">
                No hay mesas disponibles para la fecha, hora y número de personas seleccionados.
                Por favor intenta con otra combinación.
              </Alert>
            ) : (
              <Row>
                {availableTables.map((table) => (
                  <Col key={table.id} xs={6} md={4} lg={3} className="mb-3">
                    <Card
                      className={`text-center h-100 ${
                        formData.table_id === table.id.toString() ? "border-primary border-2" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setFormData((prev) => ({ ...prev, table_id: table.id.toString() }))}
                    >
                      <Card.Body>
                        <h5>Mesa #{table.table_number}</h5>
                        <Badge bg="info">Capacidad: {table.capacity}</Badge>
                        {formData.table_id === table.id.toString() && (
                          <div className="mt-2">
                            <Badge bg="success">✓ Seleccionada</Badge>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Requisitos especiales</Form.Label>
        <Form.Control
          as="textarea"
          name="special_requirements"
          value={formData.special_requirements}
          onChange={handleChange}
          rows={3}
          placeholder="Alergias, preferencias de ubicación, celebración especial, etc."
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setFormData({
              zone_id: "",
              table_id: "",
              reservation_date: "",
              reservation_time: "",
              guest_count: "",
              special_requirements: "",
            });
            setAvailableTables([]);
          }}
        >
          Limpiar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !formData.table_id}
        >
          {loading ? "Procesando..." : "Crear Reserva"}
        </Button>
      </div>
    </Form>
  );
}

export default NewReservationForm;
