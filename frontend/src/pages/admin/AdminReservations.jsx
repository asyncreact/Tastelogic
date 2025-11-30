// src/pages/AdminReservation.jsx
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
  Badge,
} from "react-bootstrap";
import { MdEventSeat, MdOutlineTableBar, MdPeople } from "react-icons/md";
import { useReservation } from "../../hooks/useReservation";
import api from "../../api/auth";

function UserInfoHint({ userId, users }) {
  const user = users.find((u) => String(u.id) === String(userId));

  if (!user) {
    return (
      <Form.Text className="text-danger">
        No se encontró un usuario con ese ID.
      </Form.Text>
    );
  }

  return (
    <Form.Text className="text-muted">
      {user.name} · {user.email}
    </Form.Text>
  );
}

function AdminReservation() {
  const {
    reservations,
    loading,
    error,
    fetchReservations,
    addReservation,
    editReservation,
    changeReservationStatus,
    deleteReservationById,
    fetchAvailableTables,
    clearError,
  } = useReservation();

  const [searchAdmin, setSearchAdmin] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    user_id: "",
    zone_id: "",
    table_id: "",
    reservation_date: "",
    reservation_time: "",
    guest_count: 2,
    status: "pending",
    special_requirements: "",
  });

  const [zones, setZones] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingZones, setLoadingZones] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoadingZones(true);
        const response = await api.get("/zones/public");
        setZones(response.data?.zones || response.data?.data || []);
      } catch {
        console.error("No se pudieron cargar las zonas disponibles");
      } finally {
        setLoadingZones(false);
      }
    };
    loadZones();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get("/users?role=customer");
        setUsers(res.data?.users || res.data?.data || []);
      } catch (err) {
        console.error("No se pudieron cargar los usuarios", err);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (
      reservationForm.zone_id &&
      reservationForm.reservation_date &&
      reservationForm.reservation_time &&
      reservationForm.guest_count
    ) {
      loadAvailableTables();
    } else {
      setAvailableTables([]);
      setReservationForm((prev) => ({
        ...prev,
        table_id: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reservationForm.zone_id,
    reservationForm.reservation_date,
    reservationForm.reservation_time,
    reservationForm.guest_count,
  ]);

  const loadAvailableTables = async () => {
    try {
      setLoadingTables(true);
      const tables = await fetchAvailableTables({
        zone_id: reservationForm.zone_id,
        reservation_date: reservationForm.reservation_date,
        reservation_time: reservationForm.reservation_time,
        guest_count: reservationForm.guest_count,
      });

      const guestCount = parseInt(reservationForm.guest_count, 10) || 0;
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

      const filtered = allTables.filter((t) => t.capacity === minSuitableCapacity);
      setAvailableTables(filtered);
    } catch {
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  // ========== Helpers ==========

  const openModal = (reservation = null) => {
    setEditingReservation(reservation);
    setReservationForm({
      user_id: reservation?.user_id || "",
      zone_id: reservation?.zone_id || "",
      table_id: reservation?.table_id || "",
      reservation_date: reservation?.reservation_date?.slice(0, 10) || "",
      reservation_time: reservation?.reservation_time?.slice(0, 5) || "",
      guest_count: reservation?.guest_count || 2,
      status: reservation?.status || "pending",
      special_requirements: reservation?.special_requirements || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReservation(null);
    setReservationForm({
      user_id: "",
      zone_id: "",
      table_id: "",
      reservation_date: "",
      reservation_time: "",
      guest_count: 2,
      status: "pending",
      special_requirements: "",
    });
    setAvailableTables([]);
    clearError();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReservationForm((prev) => ({
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

    if (!reservationForm.table_id) {
      alert("Por favor, selecciona una mesa disponible");
      return;
    }

    const payload = {
      ...reservationForm,
      guest_count: Number(reservationForm.guest_count) || 1,
    };

    try {
      if (editingReservation) {
        await editReservation(editingReservation.id, payload);
      } else {
        await addReservation(payload);
      }
      closeModal();
    } catch {
      // manejado en el contexto
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta reserva?")) return;
    try {
      await deleteReservationById(id);
    } catch {
      // manejado en contexto
    }
  };

  const handleChangeStatus = async (reservation, newStatus) => {
    if (reservation.status === newStatus) return;
    try {
      await changeReservationStatus(reservation.id, newStatus);
    } catch {
      // manejado en contexto
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "cancelled":
        return "danger";
      case "seated":
        return "primary";
      case "completed":
        return "secondary";
      case "expired":
        return "dark";
      default:
        return "warning";
    }
  };

  // ========== Filtros de búsqueda ==========

  const searchLower = searchAdmin.toLowerCase().trim();

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!searchLower) return true;

    const number = r.reservation_number?.toLowerCase() || "";
    const name =
      `${r.customer_name || ""} ${r.customer_lastname || ""}`.toLowerCase();
    const email = r.customer_email?.toLowerCase() || "";
    const phone = r.customer_phone?.toLowerCase() || "";
    const table = String(r.table_id || "");
    const zone = String(r.zone_id || "");

    return (
      number.includes(searchLower) ||
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchLower) ||
      table.includes(searchLower) ||
      zone.includes(searchLower)
    );
  });

  // ========== UI ==========

  if (loading && reservations.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 mb-0">Cargando reservas...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Encabezado */}
      <Row className="mb-3">
        <Col>
          <h1 className="h3 d-flex align-items-center gap-2 mb-1">
            <MdEventSeat />
            Admin Reservas
          </h1>
          <p className="text-muted mb-0">
            Gestiona reservas, estados y asignación de mesas.
          </p>
        </Col>
        <Col className="text-end d-none d-md-block">
          <Button onClick={() => openModal()}>Nueva reserva</Button>
        </Col>
      </Row>

      {/* Barra de filtros */}
      <Row className="mb-4">
        <Col md={6} className="mb-2 mb-md-0">
          <Form.Control
            type="search"
            placeholder="Buscar por número, cliente, email, teléfono, mesa o zona..."
            value={searchAdmin}
            onChange={(e) => setSearchAdmin(e.target.value)}
          />
        </Col>
        <Col md={3} className="mb-2 mb-md-0">
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="seated">En mesa</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="expired">Expirada</option>
          </Form.Select>
        </Col>
        <Col md={3} className="text-md-end">
          <Button onClick={() => openModal()}>Nueva reserva</Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert
              variant="danger"
              dismissible
              onClose={() => clearError()}
              className="mb-0"
            >
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Lista de reservas */}
      <Row>
        <Col>
          {filteredReservations.length === 0 ? (
            <p className="text-muted mb-0">
              No hay reservas (o ninguna coincide con la búsqueda / filtro).
            </p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredReservations.map((r) => (
                <div
                  key={r.id}
                  className="d-flex flex-column flex-md-row align-items-md-center justify-content-between border rounded px-3 py-2"
                >
                  <div className="mb-2 mb-md-0">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-semibold">
                        {r.reservation_number || `Reserva #${r.id}`}
                      </span>
                      <Badge bg={getStatusVariant(r.status)}>
                        {r.status}
                      </Badge>
                    </div>
                    <div className="small text-muted">
                      {r.customer_name} {r.customer_lastname} ·{" "}
                      {r.customer_phone} · {r.customer_email}
                    </div>
                    <div className="small">
                      {r.reservation_date} {r.reservation_time} · Mesa{" "}
                      {r.table_id} · Zona {r.zone_id} ·{" "}
                      {r.guest_count ?? r.guests} personas
                    </div>
                    {r.special_requirements && (
                      <div className="small text-muted">
                        Requerimientos: {r.special_requirements}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    <Form.Select
                      size="sm"
                      value={r.status}
                      onChange={(e) => handleChangeStatus(r, e.target.value)}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="seated">En mesa</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="expired">Expirada</option>
                    </Form.Select>

                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => openModal(r)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(r.id)}
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

      {/* Modal crear/editar reserva */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingReservation ? "Editar reserva" : "Nueva reserva"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="reservationUserId">
              <Form.Label>ID usuario (solo admin)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="user_id"
                value={reservationForm.user_id}
                onChange={handleFormChange}
                placeholder="ID del cliente"
              />
              {reservationForm.user_id && (
                <UserInfoHint userId={reservationForm.user_id} users={users} />
              )}
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="reservationZoneId">
                  <Form.Label>Zona</Form.Label>
                  {loadingZones ? (
                    <div className="d-flex align-items-center gap-2">
                      <Spinner animation="border" size="sm" />
                      <span className="small">Cargando...</span>
                    </div>
                  ) : (
                    <Form.Select
                      name="zone_id"
                      value={reservationForm.zone_id}
                      onChange={handleFormChange}
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
                <Form.Group controlId="reservationGuestCount">
                  <Form.Label>Personas (guest_count)</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <MdPeople />
                    </span>
                    <Form.Control
                      type="number"
                      name="guest_count"
                      min="1"
                      value={reservationForm.guest_count}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="reservationDate">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="reservation_date"
                    value={reservationForm.reservation_date}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="reservationTime">
                  <Form.Label>Hora</Form.Label>
                  <Form.Control
                    type="time"
                    name="reservation_time"
                    value={reservationForm.reservation_time}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="reservationTableId">
              <Form.Label>Mesa</Form.Label>
              {loadingTables ? (
                <div className="d-flex align-items-center gap-2">
                  <Spinner animation="border" size="sm" />
                  <span className="small">Buscando mesas...</span>
                </div>
              ) : availableTables.length === 0 &&
                reservationForm.zone_id &&
                reservationForm.reservation_date &&
                reservationForm.reservation_time &&
                reservationForm.guest_count ? (
                <Alert variant="light" className="border">
                  No hay mesas para estos datos. Prueba otra hora o zona.
                </Alert>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {availableTables.map((table) => {
                    const isActive =
                      String(reservationForm.table_id) === String(table.id);
                    return (
                      <button
                        key={table.id}
                        type="button"
                        className={`btn btn-outline-secondary d-flex align-items-center p-2 rounded-3 ${
                          isActive ? "btn-secondary text-white" : ""
                        }`}
                        style={{ minWidth: "200px" }}
                        onClick={() =>
                          setReservationForm((prev) => ({
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
                            {table.capacity} max · {table.zone_name || "Zona"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="reservationStatus">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="status"
                value={reservationForm.status}
                onChange={handleFormChange}
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="seated">En mesa</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
                <option value="expired">Expirada</option>
              </Form.Select>
            </Form.Group>

            <Form.Group
              className="mb-0"
              controlId="reservationSpecialRequirements"
            >
              <Form.Label>
                Requerimientos especiales (special_requirements)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="special_requirements"
                value={reservationForm.special_requirements}
                onChange={handleFormChange}
                placeholder="Alergias, celebración, accesibilidad, etc."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingReservation ? "Guardar cambios" : "Crear reserva"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminReservation;
