// src/components/ReservationHistory.jsx
import { useEffect, useState } from "react";
import {
  Spinner,
  Alert,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
// Iconos
import { BiCalendarEvent, BiTimeFive, BiDetail, BiUser } from "react-icons/bi";
import { MdOutlineCancel, MdOutlineTableRestaurant } from "react-icons/md";
import { FaRegMap } from "react-icons/fa";
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
  return zones[zoneId] || "Zona General";
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
      confirmButtonColor: "#ef4444",
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
        <Spinner animation="border" variant="warning" />
        <p className="mt-3 text-muted">Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center border-0 shadow-sm">
        Error: {error}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="light" className="text-center border-0">
        <h5 className="mb-1">Debes iniciar sesión</h5>
        <p className="mb-0 text-muted">Accede a tu cuenta para ver tus reservas.</p>
      </Alert>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-5">
        <div 
          className="d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto mb-3" 
          style={{ width: 64, height: 64 }}
        >
          <BiCalendarEvent size={32} className="text-muted" />
        </div>
        <h5 className="mb-1 text-dark">No tienes reservas aún</h5>
        <p className="text-muted">¡Reserva una mesa y disfruta con nosotros!</p>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-column gap-3">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-4 p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center shadow-sm border-0 transition-all hover-shadow"
          >
            <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
              {/* Icono de calendario con tu degradado naranja */}
              <div
                className="icon-orange rounded-3 flex-shrink-0"
                style={{ width: 48, height: 48 }}
              >
                <BiCalendarEvent size={24} />
              </div>

              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="fw-bold text-dark">
                    {reservation.reservation_number
                      ? `Reserva ${reservation.reservation_number}`
                      : `Reserva #${reservation.id}`}
                  </span>
                  <span className="badge border fw-normal text-muted">
                    {getStatusText(reservation.status)}
                  </span>
                </div>
                <div className="text-muted small">
                  {formatDate(reservation.reservation_date)} · {formatTime(reservation.reservation_time)}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="white"
                size="sm"
                className="rounded-pill px-3 border shadow-sm text-dark bg-white"
                onClick={() => handleViewDetails(reservation.id)}
              >
                <BiDetail className="me-1" />
                Ver detalle
              </Button>
              {canCancelReservation(reservation) && (
                <Button
                  variant="danger"
                  size="sm"
                  className="rounded-pill px-3 shadow-sm"
                  onClick={() => handleCancelReservation(reservation.id)}
                  disabled={loadingAction}
                >
                  <MdOutlineCancel className="me-1" />
                  {loadingAction ? "..." : "Cancelar"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* === MODAL ESTILO TICKET DE RESERVA === */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName="border-0 rounded-4 overflow-hidden"
      >
        {selectedReservation && (
          <div className="bg-white">
             {/* Cabecera Tipo Ticket */}
             <div 
              className="bg-light p-4 text-center"
              style={{ 
                borderBottom: '2px dashed #e5e7eb',
                position: 'relative'
              }}
            >
                <div 
                    className="icon-orange rounded-circle mx-auto mb-3 shadow-sm" 
                    style={{ width: 56, height: 56 }}
                >
                    <BiCalendarEvent size={28} />
                </div>
                <h5 className="mb-0 fw-bold text-dark">Confirmación de Reserva</h5>
                <p className="text-muted small mb-2">Presenta tu ticket al llegar al local</p>
                <div className="d-inline-block px-3 py-1 rounded-pill bg-white border shadow-sm mt-1">
                    <span className="fw-bold text-orange">
                      {selectedReservation.reservation_number || `#${selectedReservation.id}`}
                    </span>
                </div>

                {/* Decoración semicírculos (opcional) */}
                <div style={{ position: 'absolute', bottom: -10, left: -10, width: 20, height: 20, background: '#fff', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: -10, right: -10, width: 20, height: 20, background: '#fff', borderRadius: '50%' }}></div>
            </div>

            <Modal.Body className="p-0">
               <div className="p-4">
                  {/* Grid de Información */}
                  <Row className="g-3 mb-4">
                      <Col xs={6}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                              <BiCalendarEvent className="text-muted" />
                              <span className="small text-muted">Fecha</span>
                          </div>
                          <div className="small fw-semibold text-dark">
                              {formatDate(selectedReservation.reservation_date)}
                          </div>
                      </Col>
                      <Col xs={6}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                              <BiTimeFive className="text-muted" />
                              <span className="small text-muted">Hora</span>
                          </div>
                          <div className="small fw-semibold text-dark">
                              {formatTime(selectedReservation.reservation_time)}
                          </div>
                      </Col>
                      <Col xs={6}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                              <MdOutlineTableRestaurant className="text-muted" />
                              <span className="small text-muted">Mesa</span>
                          </div>
                          <div className="small fw-semibold text-dark">
                             Mesa {selectedReservation.table_number}
                          </div>
                      </Col>
                      <Col xs={6}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                              <FaRegMap className="text-muted" />
                              <span className="small text-muted">Zona</span>
                          </div>
                          <div className="small fw-semibold text-dark">
                             {selectedReservation.zone_name || getZoneName(selectedReservation.zone_id)}
                          </div>
                      </Col>
                      <Col xs={6}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                              <BiUser className="text-muted" />
                              <span className="small text-muted">Personas</span>
                          </div>
                          <div className="small fw-semibold text-dark">
                             {selectedReservation.guest_count} max
                          </div>
                      </Col>
                  </Row>

                  {/* Notas */}
                  {selectedReservation.special_requirements && (
                      <Alert variant="warning" className="small border-0 text-dark mb-4 bg-orange-subtle">
                          <strong>Nota especial:</strong> {selectedReservation.special_requirements}
                      </Alert>
                  )}

                  {/* Separador Punteado */}
                  <div className="mb-4" style={{ borderBottom: '1px dashed #e5e7eb' }}></div>

                  <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted">Estado actual</span>
                      <span className="badge bg-light text-dark border px-3 py-2">
                          {getStatusText(selectedReservation.status)}
                      </span>
                  </div>
               </div>
            </Modal.Body>

            <div className="p-4 bg-light border-top d-flex gap-2">
                <Button 
                    variant="white" 
                    className="flex-grow-1 border shadow-sm text-muted bg-white"
                    onClick={() => setShowModal(false)}
                >
                    Cerrar
                </Button>
                {canCancelReservation(selectedReservation) && (
                    <Button 
                        variant="danger" 
                        className="flex-grow-1 shadow-sm"
                        onClick={() => handleCancelReservation(selectedReservation.id)}
                        disabled={loadingAction}
                    >
                        {loadingAction ? "Procesando..." : "Cancelar Reserva"}
                    </Button>
                )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default ReservationHistory;