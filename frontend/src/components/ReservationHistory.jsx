// src/components/ReservationHistory.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Badge,
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
  const { reservations, fetchReservations, fetchReservation, removeReservation, loading, error } =
    useReservation();
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

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: "warning", text: "Pendiente" },
      confirmed: { bg: "success", text: "Confirmada" },
      completed: { bg: "info", text: "Completada" },
      cancelled: { bg: "danger", text: "Cancelada" },
    };
    const config = statusMap[status] || { bg: "secondary", text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const canCancelReservation = (reservation) => {
    if (reservation.status === "cancelled" || reservation.status === "completed") {
      return false;
    }
    const reservationDateTime = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`);
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
    } catch (error) {
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

  if (loadingReservations) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  if (reservations.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        <h5>No tienes reservas aún</h5>
        <p>Tus reservas aparecerán aquí una vez que realices tu primera reserva</p>
      </Alert>
    );
  }

  return (
    <>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Mesa</th>
            <th>Personas</th>
            <th>Estado</th>
            <th>Acciones</th>
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
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleViewDetails(reservation.id)}
                  className="me-2"
                >
                  <MdVisibility /> Ver
                </Button>
                {canCancelReservation(reservation) && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleCancelReservation(reservation.id)}
                    disabled={loadingAction}
                  >
                    <MdCancel /> Cancelar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de detalles */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Reserva #{selectedReservation?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Fecha:</strong> {formatDate(selectedReservation.reservation_date)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Hora:</strong> {formatTime(selectedReservation.reservation_time)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Mesa:</strong> #{selectedReservation.table_number || selectedReservation.table_id}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Zona:</strong> {selectedReservation.zone_name || getZoneName(selectedReservation.zone_id)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Número de personas:</strong> {selectedReservation.guest_count}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Estado:</strong> {getStatusBadge(selectedReservation.status)}
                </ListGroup.Item>
                {selectedReservation.special_requirements && (
                  <ListGroup.Item>
                    <strong>Requisitos especiales:</strong>
                    <p className="mt-2 mb-0">{selectedReservation.special_requirements}</p>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <strong>Creada:</strong> {formatDate(selectedReservation.created_at)}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedReservation && canCancelReservation(selectedReservation) && (
            <Button
              variant="danger"
              onClick={() => handleCancelReservation(selectedReservation.id)}
              disabled={loadingAction}
            >
              <MdCancel className="me-2" />
              {loadingAction ? "Cancelando..." : "Cancelar Reserva"}
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
