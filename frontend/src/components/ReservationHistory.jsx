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
import { useReservation } from "../hooks/useReservation";
import { MdVisibility, MdCancel } from "react-icons/md";
import Swal from "sweetalert2";

function ReservationHistory() {
  const {
    reservations,
    fetchReservations,
    fetchReservation,
    removeReservation,
    loading,
    error,
  } = useReservation();

  const [loadingReservations, setLoadingReservations] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const loadReservations = async () => {
      await fetchReservations();
      setLoadingReservations(false);
    };
    loadReservations();
  }, []);

  const handleViewDetails = async (reservationId) => {
    try {
      const reservationData = await fetchReservation(reservationId);
      setSelectedReservation(reservationData);
      setShowModal(true);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar los detalles de la reserva",
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
        await removeReservation(reservationId);
        setShowModal(false);
        Swal.fire({
          icon: "success",
          title: "Reserva cancelada",
          text: "La reserva ha sido cancelada exitosamente",
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
    return timeString.slice(0, 5);
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

  if (error) {
    return (
      <Alert variant="light" className="text-center border">
        Error: {error}
      </Alert>
    );
  }

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
                    <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 mb-1">
                      <span className="fw-semibold">
                        {reservation.reservation_number
                          ? `Reserva ${reservation.reservation_number}`
                          : `Reserva #${reservation.id}`}
                      </span>
                      <span>·</span>
                      <span>Estado: {getStatusText(reservation.status)}</span>
                    </div>
                    <div className="small mb-1">
                      Fecha: {formatDate(reservation.reservation_date)} · Hora:{" "}
                      {formatTime(reservation.reservation_time)}
                    </div>
                    <div className="small">
                      Zona:{" "}
                      {reservation.zone_name ||
                        getZoneName(reservation.zone_id)}{" "}
                      · Mesa: {reservation.table_number} · Personas:{" "}
                      {reservation.guest_count}
                    </div>
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
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Fecha</span>
                  <span>
                    {formatDate(selectedReservation.reservation_date)}
                  </span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Hora</span>
                  <span>
                    {formatTime(selectedReservation.reservation_time)}
                  </span>
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
