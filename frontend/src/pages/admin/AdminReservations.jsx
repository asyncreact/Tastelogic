// src/pages/admin/AdminReservations.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Modal, Alert, Badge, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  MdEventNote,
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdPeople,
  MdAccessTime
} from "react-icons/md";
import {
  getReservations,
  getReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation
} from "../../api/reservations";

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadReservations();
  }, [statusFilter, dateFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (dateFilter) {
        params.date = dateFilter;
      }
      
      const response = await getReservations(params);
      let reservationsData = response.data?.reservations || response.data?.data || [];
      
      if (!Array.isArray(reservationsData)) {
        console.warn('Reservations no es un array:', reservationsData);
        reservationsData = [];
      }
      
      setReservations(reservationsData);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError(err.response?.data?.message || 'Error al cargar reservas');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReservation = async (reservationId) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      const response = await getReservation(reservationId);
      setSelectedReservation(response.data?.reservation || response.data);
    } catch (err) {
      setError('Error al cargar detalles de la reserva');
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (reservationId, newStatus) => {
    try {
      await updateReservationStatus(reservationId, newStatus);
      setSuccess(`Estado actualizado a ${getStatusText(newStatus)}`);
      loadReservations();
      if (selectedReservation?.id === reservationId) {
        handleViewReservation(reservationId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;
    try {
      await cancelReservation(reservationId);
      setSuccess('Reserva cancelada exitosamente');
      loadReservations();
      setShowDetailModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar reserva');
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.')) return;
    try {
      await deleteReservation(reservationId);
      setSuccess('Reserva eliminada exitosamente');
      loadReservations();
      setShowDetailModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar reserva');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'warning', text: 'Pendiente' },
      confirmed: { bg: 'success', text: 'Confirmada' },
      completed: { bg: 'info', text: 'Completada' }, // ✅ Cambiado de success a info
      cancelled: { bg: 'danger', text: 'Cancelada' }
    };
    return badges[status] || { bg: 'secondary', text: status };
  };

  const getStatusText = (status) => {
    return getStatusBadge(status).text;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0">
        <Card.Header 
          className="text-white border-0" 
          style={{ 
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            padding: '1.5rem'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <MdEventNote size={32} className="me-2" />
              <h4 className="mb-0">Gestión de Reservas</h4>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="light" 
                size="sm"
                onClick={loadReservations}
                className="d-flex align-items-center"
              >
                <MdRefresh size={18} className="me-1" />
                Actualizar
              </Button>
              <Button 
                as={Link} 
                to="/admin/dashboard" 
                variant="light" 
                size="sm"
                className="d-flex align-items-center"
              >
                <MdArrowBack size={18} className="me-1" />
                Volver
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Filtros */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filtrar por Estado</Form.Label>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filtrar por Fecha</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#1f2937' }} />
            </div>
          ) : reservations.length === 0 ? (
            <Alert variant="info">No hay reservas que mostrar.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Mesa</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Personas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td><strong>#{reservation.id}</strong></td>
                    <td>{reservation.user?.name || 'N/A'}</td>
                    <td>Mesa {reservation.table?.table_number || 'N/A'}</td>
                    <td>{formatDate(reservation.reservation_date)}</td>
                    <td>
                      <MdAccessTime size={16} className="me-1" />
                      {formatTime(reservation.reservation_time)}
                    </td>
                    <td>
                      <MdPeople size={16} className="me-1" />
                      {reservation.party_size}
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(reservation.status).bg}>
                        {getStatusBadge(reservation.status).text}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleViewReservation(reservation.id)}
                      >
                        <MdVisibility size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* MODAL DE DETALLES */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <MdEventNote size={24} className="me-2" />
            Detalles de Reserva #{selectedReservation?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#1f2937' }} />
            </div>
          ) : selectedReservation && (
            <>
              {/* Info General */}
              <Row className="mb-4">
                <Col md={6}>
                  <p><strong>Cliente:</strong> {selectedReservation.user?.name}</p>
                  <p><strong>Email:</strong> {selectedReservation.user?.email}</p>
                  <p><strong>Teléfono:</strong> {selectedReservation.user?.phone || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Mesa:</strong> Mesa {selectedReservation.table?.table_number}</p>
                  <p><strong>Zona:</strong> {selectedReservation.table?.zone?.name || 'N/A'}</p>
                  <p>
                    <strong>Personas:</strong>{' '}
                    <MdPeople size={18} className="me-1" />
                    {selectedReservation.party_size}
                  </p>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <p><strong>Fecha:</strong> {formatDate(selectedReservation.reservation_date)}</p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Hora:</strong>{' '}
                    <MdAccessTime size={18} className="me-1" />
                    {formatTime(selectedReservation.reservation_time)}
                  </p>
                </Col>
              </Row>

              {/* Actualizar Estado */}
              <Form.Group className="mb-3">
                <Form.Label><strong>Estado de la Reserva</strong></Form.Label>
                <Form.Select 
                  value={selectedReservation.status}
                  onChange={(e) => handleUpdateStatus(selectedReservation.id, e.target.value)}
                  disabled={selectedReservation.status === 'cancelled'}
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </Form.Select>
              </Form.Group>

              {selectedReservation.special_requests && (
                <Alert variant="info">
                  <strong>Solicitudes Especiales:</strong> {selectedReservation.special_requests}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedReservation?.status !== 'cancelled' && selectedReservation?.status !== 'completed' && (
            <Button 
              variant="warning" 
              onClick={() => handleCancelReservation(selectedReservation.id)}
              className="d-flex align-items-center"
            >
              <MdCancel size={18} className="me-1" />
              Cancelar Reserva
            </Button>
          )}
          <Button 
            variant="danger" 
            onClick={() => handleDeleteReservation(selectedReservation.id)}
            className="d-flex align-items-center"
          >
            <MdDelete size={18} className="me-1" />
            Eliminar
          </Button>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminReservations;
