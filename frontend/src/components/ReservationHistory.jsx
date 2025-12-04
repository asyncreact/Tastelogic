// src/components/ReservationHistory.jsx
import { useEffect, useState } from "react";
import {
  Spinner,
  Alert,
  Button,
  Modal,
  Row,
  Col,
  Card,
  ListGroup,
} from "react-bootstrap";
import { BiCommentDetail } from "react-icons/bi";
import { MdOutlineCancel } from "react-icons/md";
import Swal from "sweetalert2";

import { useAuth } from "../hooks/useAuth";
import { useReservation } from "../hooks/useReservation";

function getStatusText(status) {
  const map = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
    expired: "Expirada",
  };
  return map[status] || status || "N/A";
}

const canCancelReservation = (reservation) =>
  reservation?.status === "pending";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
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
  return zones[zoneId] || "N/A";
};

function ReservationHistory() {
  const { user } = useAuth();
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
      try {
        if (!user) {
          setLoadingReservations(false);
          return;
        }
        await fetchReservations({ user_id: user.id });
      } finally {
        setLoadingReservations(false);
      }
    };
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      const data =
        reservationData?.reservation ||
        reservationData?.data?.reservation ||
        reservationData?.data ||
        reservationData;
      setSelectedReservation(data);
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
        await fetchReservations({ user_id: user.id });
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

  if (loadingReservations || loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando reservas...</p>
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
      <div className="d-flex flex-column gap-3">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="d-flex flex-column flex-md-row align-items-md-center justify-content-between border rounded px-3 py-2"
          >
            <div className="mb-2 mb-md-0">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">
                  {reservation.reservation_number
                    ? `Reserva ${reservation.reservation_number}`
                    : `Reserva #${reservation.id}`}
                </span>
                <span
                  className={`badge text-uppercase badge-status-${
                    reservation.status || "pending"
                  }`}
                >
                  {getStatusText(reservation.status)}
                </span>
              </div>

              <div className="small text-muted">
                {formatDate(reservation.reservation_date)} ·{" "}
                {formatTime(reservation.reservation_time)}
              </div>
              <div className="small text-muted">
                Mesa: {reservation.table_number} · Zona:{" "}
                {reservation.zone_name || getZoneName(reservation.zone_id)}
              </div>
              <div className="small text-muted">
                Personas: {reservation.guest_count}
              </div>
              {reservation.user_name && (
                <div className="small mt-1 text-muted">
                  Cliente: {reservation.user_name} ({reservation.user_email})
                </div>
              )}
            </div>

            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleViewDetails(reservation.id)}
              >
                <BiCommentDetail className="me-1" />
                Ver detalles
              </Button>
              {canCancelReservation(reservation) && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleCancelReservation(reservation.id)}
                  disabled={loadingAction}
                >
                  <MdOutlineCancel className="me-1" />
                  {loadingAction ? "Cancelando..." : "Cancelar"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="md"
        centered
      >
        <Modal.Header closeButton className="py-2">
          <Modal.Title className="fs-6">
            Detalles de la reserva{" "}
            {selectedReservation?.reservation_number ||
              `#${selectedReservation?.id || ""}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="py-3"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedReservation && (
            <Row>
              <Col md={12}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-light border-0 py-2">
                    <strong className="small">Información de la reserva</strong>
                  </Card.Header>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Código</span>
                      <span className="small">
                        {selectedReservation.reservation_number ||
                          `#${selectedReservation.id}`}
                      </span>
                    </ListGroup.Item>

                    {selectedReservation.user_name && (
                      <ListGroup.Item className="d-flex justify-content-between py-2">
                        <span className="small text-muted">Cliente</span>
                        <span className="text-end small">
                          <div>{selectedReservation.user_name}</div>
                          <div className="text-muted">
                            ({selectedReservation.user_email})
                          </div>
                        </span>
                      </ListGroup.Item>
                    )}

                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Fecha</span>
                      <span className="small">
                        {formatDate(selectedReservation.reservation_date)}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Hora</span>
                      <span className="small">
                        {formatTime(selectedReservation.reservation_time)}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Mesa</span>
                      <span className="small">
                        {selectedReservation.table_number}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Zona</span>
                      <span className="small">
                        {selectedReservation.zone_name ||
                          getZoneName(selectedReservation.zone_id)}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Personas</span>
                      <span className="small">
                        {selectedReservation.guest_count}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Estado</span>
                      <span className="small fw-semibold">
                        {getStatusText(selectedReservation.status)}
                      </span>
                    </ListGroup.Item>
                    {selectedReservation.special_requirements && (
                      <ListGroup.Item className="py-2">
                        <span className="small text-muted d-block mb-1">
                          Notas
                        </span>
                        <p className="mb-0 small">
                          {selectedReservation.special_requirements}
                        </p>
                      </ListGroup.Item>
                    )}
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Creada</span>
                      <span className="small">
                        {formatDate(selectedReservation.created_at)}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="py-2 d-flex justify-content-between">
          {selectedReservation &&
            canCancelReservation(selectedReservation) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  handleCancelReservation(selectedReservation.id)
                }
                disabled={loadingAction}
              >
                <MdOutlineCancel className="me-2" />
                {loadingAction ? "Cancelando..." : "Cancelar reserva"}
              </Button>
            )}

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowModal(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReservationHistory;
