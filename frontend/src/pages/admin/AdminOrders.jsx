// src/pages/admin/AdminOrders.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Modal, Alert, Badge, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  MdShoppingCart,
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdRefresh
} from "react-icons/md";
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  updateOrderPayment,
  cancelOrder,
  deleteOrder
} from "../../api/orders";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (paymentFilter !== 'all') {
        params.payment_status = paymentFilter;
      }
      
      const response = await getOrders(params);
      let ordersData = response.data?.orders || response.data?.data || [];
      
      if (!Array.isArray(ordersData)) {
        console.warn('Orders no es un array:', ordersData);
        ordersData = [];
      }
      
      setOrders(ordersData);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.response?.data?.message || 'Error al cargar órdenes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      const response = await getOrder(orderId);
      setSelectedOrder(response.data?.order || response.data);
    } catch (err) {
      setError('Error al cargar detalles de la orden');
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setSuccess(`Estado actualizado a ${getStatusText(newStatus)}`);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        handleViewOrder(orderId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleUpdatePayment = async (orderId, newPaymentStatus) => {
    try {
      await updateOrderPayment(orderId, newPaymentStatus);
      setSuccess('Estado de pago actualizado');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        handleViewOrder(orderId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar pago');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta orden?')) return;
    try {
      await cancelOrder(orderId);
      setSuccess('Orden cancelada exitosamente');
      loadOrders();
      setShowDetailModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar orden');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.')) return;
    try {
      await deleteOrder(orderId);
      setSuccess('Orden eliminada exitosamente');
      loadOrders();
      setShowDetailModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar orden');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'warning', text: 'Pendiente' },
      confirmed: { bg: 'info', text: 'Confirmada' },
      preparing: { bg: 'primary', text: 'Preparando' },
      ready: { bg: 'success', text: 'Lista' },
      completed: { bg: 'success', text: 'Completada' }, // ✅ Cambiado de "delivered" a "completed"
      cancelled: { bg: 'danger', text: 'Cancelada' }
    };
    return badges[status] || { bg: 'secondary', text: status };
  };

  const getStatusText = (status) => {
    return getStatusBadge(status).text;
  };

  const getPaymentBadge = (paymentStatus) => {
    const badges = {
      pending: { bg: 'warning', text: 'Pendiente' },
      paid: { bg: 'success', text: 'Pagado' },
      refunded: { bg: 'info', text: 'Reembolsado' }
    };
    return badges[paymentStatus] || { bg: 'secondary', text: paymentStatus };
  };

  const getOrderTypeBadge = (type) => {
    const badges = {
      'dine-in': { bg: 'primary', text: 'En Mesa' },
      'takeout': { bg: 'info', text: 'Para Llevar' },
      'delivery': { bg: 'success', text: 'Delivery' }
    };
    return badges[type] || { bg: 'secondary', text: type };
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
              <MdShoppingCart size={32} className="me-2" />
              <h4 className="mb-0">Gestión de Órdenes</h4>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="light" 
                size="sm"
                onClick={loadOrders}
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
                  <option value="preparing">Preparando</option>
                  <option value="ready">Lista</option>
                  <option value="completed">Completada</option> {/* ✅ Cambiado */}
                  <option value="cancelled">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filtrar por Pago</Form.Label>
                <Form.Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                  <option value="all">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="refunded">Reembolsado</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#1f2937' }} />
            </div>
          ) : orders.length === 0 ? (
            <Alert variant="info">No hay órdenes que mostrar.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Mesa</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Pago</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>
                      <Badge bg={getOrderTypeBadge(order.order_type).bg}>
                        {getOrderTypeBadge(order.order_type).text}
                      </Badge>
                    </td>
                    <td>{order.table?.table_number ? `Mesa ${order.table.table_number}` : '-'}</td>
                    <td><strong>${parseFloat(order.total).toFixed(2)}</strong></td>
                    <td>
                      <Badge bg={getStatusBadge(order.status).bg}>
                        {getStatusBadge(order.status).text}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getPaymentBadge(order.payment_status).bg}>
                        {getPaymentBadge(order.payment_status).text}
                      </Badge>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
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
            <MdShoppingCart size={24} className="me-2" />
            Detalles de Orden #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#1f2937' }} />
            </div>
          ) : selectedOrder && (
            <>
              {/* Info General */}
              <Row className="mb-4">
                <Col md={6}>
                  <p><strong>Cliente:</strong> {selectedOrder.user?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p><strong>Tipo:</strong>{' '}
                    <Badge bg={getOrderTypeBadge(selectedOrder.order_type).bg}>
                      {getOrderTypeBadge(selectedOrder.order_type).text}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <p><strong>Mesa:</strong> {selectedOrder.table?.table_number ? `Mesa ${selectedOrder.table.table_number}` : '-'}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p><strong>Total:</strong> <strong>${parseFloat(selectedOrder.total).toFixed(2)}</strong></p>
                </Col>
              </Row>

              {/* Items de la Orden */}
              <h6 className="mb-3">Items de la Orden</h6>
              <Table bordered size="sm" className="mb-4">
                <thead style={{ backgroundColor: '#f3f4f6' }}>
                  <tr>
                    <th>Item</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.order_items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.menu_item?.name || item.item_name}</td>
                      <td>{item.quantity}</td>
                      <td>${parseFloat(item.price).toFixed(2)}</td>
                      <td>${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Actualizar Estado */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><strong>Estado de la Orden</strong></Form.Label>
                    <Form.Select 
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      disabled={selectedOrder.status === 'cancelled'}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Lista</option>
                      <option value="completed">Completada</option> {/* ✅ Cambiado */}
                      <option value="cancelled">Cancelada</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><strong>Estado de Pago</strong></Form.Label>
                    <Form.Select 
                      value={selectedOrder.payment_status}
                      onChange={(e) => handleUpdatePayment(selectedOrder.id, e.target.value)}
                      disabled={selectedOrder.status === 'cancelled'}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="refunded">Reembolsado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {selectedOrder.notes && (
                <Alert variant="info">
                  <strong>Notas:</strong> {selectedOrder.notes}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder?.status !== 'cancelled' && (
            <Button 
              variant="warning" 
              onClick={() => handleCancelOrder(selectedOrder.id)}
              className="d-flex align-items-center"
            >
              <MdCancel size={18} className="me-1" />
              Cancelar Orden
            </Button>
          )}
          <Button 
            variant="danger" 
            onClick={() => handleDeleteOrder(selectedOrder.id)}
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

export default AdminOrders;
