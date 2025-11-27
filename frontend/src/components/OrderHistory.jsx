// src/components/OrderHistory.jsx
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
import { useOrder } from "../hooks/useOrder";
import { MdVisibility, MdCancel } from "react-icons/md";
import Swal from "sweetalert2";

function OrderHistory() {
  const {
    orders,
    fetchOrders,
    fetchOrder,
    cancelOrderById,
    loading,
    error,
  } = useOrder();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = async (orderId) => {
    try {
      const response = await fetchOrder(orderId);
      const orderData =
        response?.order || response?.data?.order || response?.data || response;

      setSelectedOrder(orderData);
      setShowModal(true);
    } catch (error) {
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
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
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

  const canCancelOrder = (status) => ["pending", "confirmed"].includes(status);

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [h, m, s = "00"] = timeString.split(":");
      const d = new Date();
      d.setHours(Number(h), Number(m), Number(s || 0), 0);
      return d.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString.slice(0, 5);
    }
  };

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

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  if (loadingOrders || loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando órdenes...</p>
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

  if (orders.length === 0) {
    return (
      <Alert variant="light" className="text-center border-0">
        <h5 className="mb-1">No tienes órdenes aún</h5>
        <p className="mb-0">
          Tus pedidos aparecerán aquí una vez que realices tu primera orden.
        </p>
      </Alert>
    );
  }

  return (
    <>
      {/* Lista */}
      <div className="d-flex flex-column gap-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="border-0 border-top pt-3"
            style={{ borderColor: "#ddd" }}
          >
            <Card.Body className="p-0 d-flex flex-column flex-md-row justify-content-between gap-3">
              <div>
                <div className="fw-semibold mb-1">
                  Orden {order.order_number || `#${order.id}`}
                </div>

                <div className="small">
                  Hora: {formatTime(order.order_time || order.created_at)}
                </div>
                <div className="small">
                  Tipo: {order.order_type || "N/A"}
                </div>
                <div className="small">
                  Estado: {order.status || "N/A"}
                </div>

                {/* Nombre/correo en la lista si el backend los envía */}
                {order.user_name && (
                  <div className="small mt-1 text-muted">
                    Cliente: {order.user_name} ({order.user_email})
                  </div>
                )}
              </div>

              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 ms-md-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleViewDetails(order.id)}
                >
                  <MdVisibility className="me-1" />
                  Ver detalles
                </Button>
                {canCancelOrder(order.status) && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
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

      {/* Modal de detalles */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Detalles de la orden{" "}
            {selectedOrder?.order_number || `#${selectedOrder?.id || ""}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-light border-0">
                      <strong>Información general</strong>
                    </Card.Header>
                    <ListGroup variant="flush">
                      {/* Cliente: nombre y correo */}
                      {selectedOrder.user_name && (
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span>Cliente</span>
                          <span className="text-end">
                            <div>{selectedOrder.user_name}</div>
                            <div className="text-muted small">
                              ({selectedOrder.user_email})
                            </div>
                          </span>
                        </ListGroup.Item>
                      )}

                      <ListGroup.Item>
                        <strong>Fecha:</strong>{" "}
                        {formatDate(
                          selectedOrder.order_date ||
                            selectedOrder.created_at
                        )}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Hora:</strong>{" "}
                        {formatTime(
                          selectedOrder.order_time ||
                            selectedOrder.created_at
                        )}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Tipo:</strong>{" "}
                        {selectedOrder.order_type || "N/A"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Estado:</strong>{" "}
                        {selectedOrder.status || "N/A"}
                      </ListGroup.Item>
                      {selectedOrder.table_number && (
                        <ListGroup.Item>
                          <strong>Mesa:</strong>{" "}
                          {selectedOrder.table_number}
                        </ListGroup.Item>
                      )}
                      {selectedOrder.delivery_address && (
                        <ListGroup.Item>
                          <strong>Dirección:</strong>{" "}
                          {selectedOrder.delivery_address}
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-light border-0">
                      <strong>Información de pago</strong>
                    </Card.Header>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Método:</strong>{" "}
                        {selectedOrder.payment_method || "No especificado"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Estado de pago:</strong>{" "}
                        {selectedOrder.payment_status || "Pendiente"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Total:</strong>{" "}
                        <span className="fw-bold">
                          ${formatPrice(selectedOrder.total_amount)}
                        </span>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card>
                </Col>
              </Row>

              {selectedOrder.special_instructions && (
                <Alert variant="light" className="border">
                  <strong>Notas especiales:</strong>{" "}
                  {selectedOrder.special_instructions}
                </Alert>
              )}

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-0">
                  <strong>Ítems del pedido</strong>
                </Card.Header>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ListGroup variant="flush">
                    {selectedOrder.items.map((item) => (
                      <ListGroup.Item
                        key={item.id}
                        className="d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <div className="fw-semibold">
                            {item.menu_item_name ||
                              item.name ||
                              "Producto"}
                          </div>
                          <div className="small">
                            Cantidad: {item.quantity} · Precio unit.: $
                            {formatPrice(item.unit_price)}
                          </div>
                        </div>
                        <div className="fw-semibold">
                          ${formatPrice(item.subtotal)}
                        </div>
                      </ListGroup.Item>
                    ))}
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span className="fw-semibold">Total</span>
                      <span className="fw-bold">
                        ${formatPrice(selectedOrder.total_amount)}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>
                ) : (
                  <Card.Body>
                    <Alert variant="light" className="border mb-0">
                      No hay ítems para mostrar.
                    </Alert>
                  </Card.Body>
                )}
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder && canCancelOrder(selectedOrder.status) && (
            <Button
              variant="outline-secondary"
              onClick={() => handleCancelOrder(selectedOrder.id)}
              disabled={loadingAction}
            >
              <MdCancel className="me-2" />
              {loadingAction ? "Cancelando..." : "Cancelar orden"}
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
