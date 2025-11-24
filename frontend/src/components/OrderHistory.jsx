// src/components/OrderHistory.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
  Modal,
  Row,
  Col,
  Card,
  ListGroup,
} from "react-bootstrap";
import { useOrder } from "../hooks/useOrder";
import { MdVisibility, MdCancel } from "react-icons/md";
import Swal from "sweetalert2";

function OrderHistory() {
  const { orders, fetchOrders, fetchOrder, cancelOrderById, loading, error } = useOrder();
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      await fetchOrders();
      setLoadingOrders(false);
    };
    loadOrders();
  }, []);

  const handleViewDetails = async (orderId) => {
    try {
      const response = await fetchOrder(orderId);
      const orderData = response?.order || response?.data?.order || response?.data || response;
      
      console.log("Order data received:", orderData);
      setSelectedOrder(orderData);
      setShowModal(true);
    } catch (error) {
      console.error("Error loading order details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar los detalles de la orden",
      });
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "¿Cancelar orden?",
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
        await cancelOrderById(orderId);
        await fetchOrders();
        setShowModal(false);
        Swal.fire({
          icon: "success",
          title: "Orden cancelada",
          text: "La orden ha sido cancelada exitosamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo cancelar la orden",
        });
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: "warning", text: "Pendiente" },
      confirmed: { bg: "info", text: "Confirmada" },
      preparing: { bg: "primary", text: "En preparación" },
      ready: { bg: "success", text: "Lista" },
      completed: { bg: "success", text: "Completada" },
      delivered: { bg: "success", text: "Entregada" },
      cancelled: { bg: "danger", text: "Cancelada" },
    };
    const config = statusMap[status] || { bg: "secondary", text: status || "N/A" };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getOrderTypeBadge = (type) => {
    const typeMap = {
      "dine-in": { bg: "primary", text: "En mesa" },
      takeout: { bg: "info", text: "Para llevar" },
      delivery: { bg: "success", text: "Delivery" },
    };
    const config = typeMap[type] || { bg: "secondary", text: type || "N/A" };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getPaymentMethodBadge = (method) => {
    if (!method) return <span className="text-muted">No especificado</span>;
    const methodMap = {
      cash: { bg: "success", text: "Efectivo" },
      card: { bg: "primary", text: "Tarjeta" },
      transfer: { bg: "info", text: "Transferencia" },
      mobile: { bg: "warning", text: "Pago Móvil" },
    };
    const config = methodMap[method] || { bg: "secondary", text: method };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: "warning", text: "Pendiente" },
      paid: { bg: "success", text: "Pagado" },
      refunded: { bg: "danger", text: "Reembolsado" },
    };
    const config = statusMap[status] || { bg: "secondary", text: status || "Pendiente" };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const canCancelOrder = (status) => {
    return ["pending", "confirmed"].includes(status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  if (loadingOrders) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando órdenes...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  if (orders.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        <h5>No tienes órdenes aún</h5>
        <p>Tus pedidos aparecerán aquí una vez que realices tu primera orden</p>
      </Alert>
    );
  }

  return (
    <>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Pago</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.order_number}</td>
              <td>{formatDate(order.created_at)}</td>
              <td>{getOrderTypeBadge(order.order_type)}</td>
              <td>{getStatusBadge(order.status)}</td>
              <td>{getPaymentStatusBadge(order.payment_status)}</td>
              <td>${formatPrice(order.total_amount)}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleViewDetails(order.id)}
                  className="me-2"
                >
                  <MdVisibility /> Ver
                </Button>
                {canCancelOrder(order.status) && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
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
          <Modal.Title>Detalles de la Orden ID: {selectedOrder?.order_number || ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card>
                    <Card.Header className="bg-light">
                      <strong>Información General</strong>
                    </Card.Header>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Fecha:</strong> {formatDate(selectedOrder.created_at)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Tipo:</strong> {getOrderTypeBadge(selectedOrder.order_type)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Estado:</strong> {getStatusBadge(selectedOrder.status)}
                      </ListGroup.Item>
                      {selectedOrder.table_number && (
                        <ListGroup.Item>
                          <strong>Mesa:</strong> ID {selectedOrder.table_number}
                        </ListGroup.Item>
                      )}
                      {selectedOrder.delivery_address && (
                        <ListGroup.Item>
                          <strong>Dirección:</strong> {selectedOrder.delivery_address}
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header className="bg-light">
                      <strong>Información de Pago</strong>
                    </Card.Header>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Método:</strong> {getPaymentMethodBadge(selectedOrder.payment_method)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Estado de Pago:</strong>{" "}
                        {getPaymentStatusBadge(selectedOrder.payment_status)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Total:</strong>{" "}
                        <span className="text-primary h5">
                          ${formatPrice(selectedOrder.total_amount)}
                        </span>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card>
                </Col>
              </Row>

              {selectedOrder.special_instructions && (
                <Alert variant="info">
                  <strong>Notas especiales:</strong> {selectedOrder.special_instructions}
                </Alert>
              )}

              <Card>
                <Card.Header className="bg-light">
                  <strong>Items del Pedido</strong>
                </Card.Header>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <Table responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.menu_item_name || item.name || "N/A"}</td>
                          <td>{item.quantity}</td>
                          <td>${formatPrice(item.unit_price)}</td>
                          <td>${formatPrice(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>Total:</strong>
                        </td>
                        <td>
                          <strong>${formatPrice(selectedOrder.total_amount)}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                ) : (
                  <Card.Body>
                    <Alert variant="warning">No hay items para mostrar</Alert>
                  </Card.Body>
                )}
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder && canCancelOrder(selectedOrder.status) && (
            <Button
              variant="danger"
              onClick={() => handleCancelOrder(selectedOrder.id)}
              disabled={loadingAction}
            >
              <MdCancel className="me-2" />
              {loadingAction ? "Cancelando..." : "Cancelar Orden"}
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

export default OrderHistory;
