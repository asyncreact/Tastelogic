// src/components/ReservationHistory.jsx
import { useEffect, useState } from "react";
import {
  Spinner,
  Alert,
  Button,
  Modal,
  Card,
  ListGroup,
} from "react-bootstrap";
import { MdVisibility, MdCancel } from "react-icons/md";
import Swal from "sweetalert2";

import { useAuth } from "../hooks/useAuth";
import { useReservation } from "../hooks/useReservation";

function ReservationHistory() {
  const { user } = useAuth();
  const {
    reservations,
    fetchReservations,
    fetchReservation,
    removeReservation,
    loading,
    error, // sigue disponible si quieres hacer console.log(error)
  } = useReservation();

  const [loadingReservations, setLoadingReservations] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        // Si no hay usuario, no llamamos al backend
        if (!user) {
          setLoadingReservations(false);
          return;
        }
        await fetchReservations();
      } finally {
        setLoadingReservations(false);
      }
    };
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // ✅ se recalcula solo si cambia el usuario

  const handleViewDetails = async (reservationId) => {
    if (!user) {
      await Swal.fire({
        icon: "info",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para ver los detalles de tus reservas.",
      });
      return;
    }

    try {
      const reservationData = await fetchReservation(reservationId);
      setSelectedReservation(reservationData);
      setShowModal(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo cargar los detalles de la reserva",
      });
    }
  };

  const handleCancelReservation = async (reservationId) => {
    const result = await Swal.fire({
      title: "¿Cancelar reserva?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        setLoadingAction(true);
        const resp = await removeReservation(reservationId);
        setShowModal(false);
        Swal.fire({
          icon: "success",
          title: "Reserva cancelada",
          text: resp?.message || "La reserva ha sido cancelada exitosamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo cancelar la reserva",
        });
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const getStatusText = (status) => {
    const map = {
      pending: "Pendiente",
      confirmed: "Confirmada",
      completed: "Completada",
      cancelled: "Cancelada",
      expired: "Expirada",
    };
    return map[status] || status || "N/A";
  };

  const canCancelReservation = (reservation) =>
    reservation?.status === "pending";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes, seconds = "00"] = timeString.split(":");
      const date = new Date();
      date.setHours(Number(hours), Number(minutes), Number(seconds || 0), 0);
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString.slice(0, 5);
    }
  };

  const getZoneName = (zoneId) => {
    const zones = {
      1: "Terraza",
      2: "Interior",
      3: "VIP",
      4: "Bar",
    };
    return zones[zoneId] || `Zona #${zoneId}`;
  };

  if (loadingReservations || loading) {
    return (
      <div className="d-flex flex-column align-items-center py-4">
        <Spinner animation="border" />
        <p className="mt-2">Cargando reservas...</p>
      </div>
    );
  }

  // Mensaje para usuarios no autenticados (sin botón)
  if (!user) {
    return (
      <Alert variant="light" className="text-center border-0">
        <h5 className="mb-1">Para ver esta página debes iniciar sesión</h5>
        <p className="mb-0">
          Inicia sesión para ver el historial de tus reservas.
        </p>
      </Alert>
    );
  }

  // Si el usuario está autenticado pero no tiene reservas
  if (reservations.length === 0) {
    return (
      <Alert variant="light" className="text-center border-0">
        <h5 className="mb-1">No tienes reservas aún</h5>
        <p className="mb-0">
          Tus reservas aparecerán aquí una vez que realices tu primera reserva.
        </p>
      </Alert>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="mb-3">
            <h2 className="h5 mb-1">Mis reservas</h2>
            <p className="small mb-0">
              Consulta, revisa y cancela tus reservas activas.
            </p>
          </div>

          <div className="d-flex flex-column gap-3">
            {reservations.map((reservation) => (
              <Card
                key={reservation.id}
                className="border-0 border-top pt-3"
                style={{ borderColor: "#ddd" }}
              >
                <Card.Body className="p-0 d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <div className="fw-semibold mb-1">
                      {reservation.reservation_number
                        ? `Reserva ${reservation.reservation_number}`
                        : `Reserva #${reservation.id}`}
                    </div>
                    <div className="small">
                      Fecha: {formatDate(reservation.reservation_date)} · Hora:{" "}
                      {formatTime(reservation.reservation_time)}
                    </div>
                    <div className="small">
                      Estado: {getStatusText(reservation.status)}
                    </div>
                    {reservation.user_name && (
                      <div className="small mt-1 text-muted">
                        Cliente: {reservation.user_name} (
                        {reservation.user_email})
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-2 ms-md-3">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleViewDetails(reservation.id)}
                    >
                      <MdVisibility className="me-1" />
                      Ver detalles
                    </Button>
                    {canCancelReservation(reservation) && (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          handleCancelReservation(reservation.id)
                        }
                        disabled={loadingAction}
                      >
                        <MdCancel className="me-1" />
                        {loadingAction ? "Cancelando..." : "Cancelar"}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Modal de detalles */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedReservation?.reservation_number
              ? `Detalles de la reserva ${selectedReservation.reservation_number}`
              : `Detalles de la reserva #${selectedReservation?.id}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <Card className="border-0 shadow-sm">
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Código</span>
                  <span>
                    {selectedReservation.reservation_number ||
                      `#${selectedReservation.id}`}
                  </span>
                </ListGroup.Item>

                {selectedReservation.user_name && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Cliente</span>
                    <span className="text-end">
                      <div>{selectedReservation.user_name}</div>
                      <div className="text-muted small">
                        ({selectedReservation.user_email})
                      </div>
                    </span>
                  </ListGroup.Item>
                )}

                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Fecha</span>
                  <span>{formatDate(selectedReservation.reservation_date)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Hora</span>
                  <span>{formatTime(selectedReservation.reservation_time)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Mesa</span>
                  <span>{selectedReservation.table_number}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Zona</span>
                  <span>
                    {selectedReservation.zone_name ||
                      getZoneName(selectedReservation.zone_id)}
                  </span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Personas</span>
                  <span>{selectedReservation.guest_count}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Estado</span>
                  <span>{getStatusText(selectedReservation.status)}</span>
                </ListGroup.Item>
                {selectedReservation.special_requirements && (
                  <ListGroup.Item>
                    <span className="d-block mb-1">Notas</span>
                    <p className="mb-0">
                      {selectedReservation.special_requirements}
                    </p>
                  </ListGroup.Item>
                )}
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Creada</span>
                  <span>{formatDate(selectedReservation.created_at)}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedReservation &&
            canCancelReservation(selectedReservation) && (
              <Button
                variant="outline-secondary"
                onClick={() =>
                  handleCancelReservation(selectedReservation.id)
                }
                disabled={loadingAction}
              >
                <MdCancel className="me-2" />
                {loadingAction ? "Cancelando..." : "Cancelar reserva"}
              </Button>
            )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReservationHistory;
