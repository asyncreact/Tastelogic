// src/components/ReservationHistory.jsx
import { useEffect, useState } from "react";
import {
  Table,
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
    } catch (error) {
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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
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

  // Estado en flat design
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: "Pendiente" },
      confirmed: { text: "Confirmada" },
      completed: { text: "Completada" },
      cancelled: { text: "Cancelada" },
    };
    const config = statusMap[status] || { text: status };

    return (
      <span className={`reservation-status-flat status-${status}`}>
        {config.text}
      </span>
    );
  };

  const canCancelReservation = (reservation) => {
    if (reservation.status === "cancelled" || reservation.status === "completed") {
      return false;
    }
    const reservationDateTime = new Date(
      `${reservation.reservation_date}T${reservation.reservation_time}`
    );
    const now = new Date();
    return reservationDateTime > now;
  };

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
      <div className="reservation-history-loading">
        <Spinner animation="border" variant="light" />
        <p>Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="reservation-history-alert">
        Error: {error}
      </Alert>
    );
  }

  if (reservations.length === 0) {
    return (
      <Alert variant="info" className="reservation-history-alert text-center">
        <h5 className="mb-1">No tienes reservas aún</h5>
        <p className="mb-0">
          Tus reservas aparecerán aquí una vez que realices tu primera reserva.
        </p>
      </Alert>
    );
  }

  return (
    <>
      <Card className="reservation-history-card">
        <Card.Body className="reservation-history-card-body">
          <div className="reservation-history-header">
            <h2 className="reservation-history-title">Mis reservas</h2>
            <p className="reservation-history-subtitle">
              Consulta, revisa y cancela tus reservas activas.
            </p>
          </div>

          <div className="reservation-history-table-wrapper">
            <Table responsive hover className="reservation-history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Mesa</th>
                  <th>Personas</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.id}</td>
                    <td>{formatDate(reservation.reservation_date)}</td>
                    <td>{formatTime(reservation.reservation_time)}</td>
                    <td>Mesa #{reservation.table_number || reservation.table_id}</td>
                    <td>{reservation.guest_count}</td>
                    <td>{getStatusBadge(reservation.status)}</td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        onClick={() => handleViewDetails(reservation.id)}
                        className="btn-history-action me-2"
                      >
                        <MdVisibility />
                        <span>Ver</span>
                      </Button>
                      {canCancelReservation(reservation) && (
                        <Button
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={loadingAction}
                          className="btn-history-action btn-history-action-danger"
                        >
                          <MdCancel />
                          <span>Cancelar</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de detalles */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        className="reservation-history-modal"
      >
        <Modal.Header closeButton className="reservation-history-modal-header">
          <Modal.Title className="reservation-history-modal-title">
            Detalles de la reserva #{selectedReservation?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="reservation-history-modal-body">
          {selectedReservation && (
            <Card className="reservation-history-detail-card">
              <ListGroup variant="flush">
                <ListGroup.Item className="reservation-history-detail-item">
                  <span>Fecha</span>
                  <strong>{formatDate(selectedReservation.reservation_date)}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="reservation-history-detail-item">
                  <span>Hora</span>
                  <strong>{formatTime(selectedReservation.reservation_time)}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="reservation-history-detail-item">
                  <span>Mesa</span>
                  <strong>
                    #{selectedReservation.table_number || selectedReservation.table_id}
                  </strong>
                </ListGroup.Item>
                <ListGroup.Item className="reservation-history-detail-item">
                  <span>Zona</span>
                  <strong>
                    {selectedReservation.zone_name ||
                      getZoneName(selectedReservation.zone_id)}
                  </strong>
                </ListGroup.Item>
                <ListGroup.Item className="reservation-history-detail-item">
                  <span>Personas</span>
                  <strong>{selectedReservation.guest_count}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="reservation-history-detail-item">
                  <span>Estado</span>
                  <strong>{getStatusBadge(selectedReservation.status)}</strong>
                </ListGroup.Item>
                {selectedReservation.special_requirements && (
                  <ListGroup.Item className="reservation-history-detail-notes">
                    <span>Notas</span>
                    <p>{selectedReservation.special_requirements}</p>
                  </ListGroup.Item>
                )}
                <ListGroup.Item className="reservation-history-detail-item">
                  <span>Creada</span>
                  <strong>{formatDate(selectedReservation.created_at)}</strong>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer className="reservation-history-modal-footer">
          {selectedReservation && canCancelReservation(selectedReservation) && (
            <Button
              onClick={() => handleCancelReservation(selectedReservation.id)}
              disabled={loadingAction}
              className="btn-history-action btn-history-action-danger"
            >
              <MdCancel className="me-2" />
              {loadingAction ? "Cancelando..." : "Cancelar reserva"}
            </Button>
          )}
          <Button
            onClick={() => setShowModal(false)}
            className="btn-history-action"
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReservationHistory;
