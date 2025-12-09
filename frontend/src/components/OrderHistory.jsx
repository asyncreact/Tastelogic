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
import { BiCommentDetail } from "react-icons/bi";
import { MdOutlineCancel } from "react-icons/md";
import Swal from "sweetalert2";

import { useAuth } from "../hooks/useAuth";
import { useOrder } from "../hooks/useOrder";

function mapOrderType(type) {
  switch (type) {
    case "dine-in":
      return "En el local";
    case "takeaway":
    case "pickup":
      return "Para llevar";
    case "delivery":
      return "Entrega a domicilio";
    default:
      return type || "N/A";
  }
}

function mapPaymentMethod(method) {
  switch (method) {
    case "cash":
      return "Efectivo";
    case "card":
    case "credit_card":
    case "debit_card":
      return "Tarjeta";
    case "online":
    case "online_payment":
      return "Pago en línea";
    default:
      return method || "No especificado";
  }
}

function mapOrderStatus(status) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmado";
    case "preparing":
      return "En preparación";
    case "ready":
      return "Listo";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return status || "N/A";
  }
}

function mapPaymentStatus(status) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "paid":
      return "Pagado";
    case "refunded":
      return "Reembolsado";
    default:
      return "Pendiente";
  }
}

function OrderHistory() {
  const { user } = useAuth();
  const {
    orders,
    ordersMeta,
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

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadPage = async (pageToLoad = 1) => {
    if (!user) {
      setLoadingOrders(false);
      return;
    }
    setLoadingOrders(true);
    try {
      await fetchOrders({ page: pageToLoad, limit: pageSize });
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadPage(currentPage);
  }, [currentPage]);

  const handleViewDetails = async (orderId) => {
    if (!user) {
      await Swal.fire({
        icon: "info",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para ver los detalles de tus órdenes.",
      });
      return;
    }

    try {
      const response = await fetchOrder(orderId);
      const orderData =
        response?.order || response?.data?.order || response?.data || response;

      setSelectedOrder(orderData);
      setShowModal(true);
    } catch {
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
        await loadPage(currentPage);
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

  const total = ordersMeta?.total || 0;
  const totalPages = Math.max(
    1,
    Math.ceil(total / (ordersMeta?.limit || pageSize))
  );

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

  if (!user) {
    return (
      <Alert variant="light" className="text-center border-0">
        <h5 className="mb-1">Para ver esta página debes iniciar sesión</h5>
        <p className="mb-0">
          Inicia sesión para ver el historial de tus pedidos.
        </p>
      </Alert>
    );
  }

  if (!orders || orders.length === 0) {
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
      <div style={{ paddingBottom: "60px" }}>
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="d-flex flex-column flex-md-row align-items-md-center justify-content-between border rounded px-3 py-2"
            >
              <div className="mb-2 mb-md-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold">
                    Orden {order.order_number || `#${order.id}`}
                  </span>
                  <span className="badge text-uppercase">
                    {mapOrderStatus(order.status)}
                  </span>
                </div>

                <div className="small text-muted">
                  {formatDate(order.order_date || order.created_at)} ·{" "}
                  {formatTime(order.order_time || order.created_at)}
                </div>
                {order.order_type && (
                  <div className="small text-muted">
                    Tipo: {mapOrderType(order.order_type)}
                  </div>
                )}
                {order.user_name && (
                  <div className="small mt-1 text-muted">
                    Cliente: {order.user_name} ({order.user_email})
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleViewDetails(order.id)}
                >
                  <BiCommentDetail className="me-1" />
                  Ver detalles
                </Button>
                {canCancelOrder(order.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
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
      </div>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1030,
          background: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          padding: "8px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="small text-muted">
          Mostrando {orders.length} de {total} órdenes · página {currentPage} de{" "}
          {totalPages}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            size="sm"
            variant="primary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="md"
        centered
      >
        <Modal.Header closeButton className="py-2">
          <Modal.Title className="fs-6">
            Detalles de la orden{" "}
            {selectedOrder?.order_number || `#${selectedOrder?.id || ""}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="py-3"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedOrder && (
            <div className="d-flex flex-column gap-3">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-0 py-2">
                  <strong className="small">Información general</strong>
                </Card.Header>
                <ListGroup variant="flush">
                  {selectedOrder.user_name && (
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Cliente</span>
                      <span className="text-end small">
                        <div>{selectedOrder.user_name}</div>
                        <div className="text-muted">
                          ({selectedOrder.user_email})
                        </div>
                      </span>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item className="d-flex justify-content-between py-2">
                    <span className="small text-muted">Fecha</span>
                    <span className="small">
                      {formatDate(
                        selectedOrder.order_date || selectedOrder.created_at
                      )}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between py-2">
                    <span className="small text-muted">Hora</span>
                    <span className="small">
                      {formatTime(
                        selectedOrder.order_time || selectedOrder.created_at
                      )}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between py-2">
                    <span className="small text-muted">Tipo</span>
                    <span className="small">
                      {mapOrderType(selectedOrder.order_type) || "N/A"}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between py-2">
                    <span className="small text-muted">Estado</span>
                    <span className="small fw-semibold">
                      <span className="badge text-uppercase">
                        {mapOrderStatus(selectedOrder.status) || "N/A"}
                      </span>
                    </span>
                  </ListGroup.Item>
                  {selectedOrder.table_number && (
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="small text-muted">Mesa</span>
                      <span className="small">
                        {selectedOrder.table_number}
                      </span>
                    </ListGroup.Item>
                  )}
                  {selectedOrder.delivery_address && (
                    <ListGroup.Item className="py-2">
                      <span className="small text-muted d-block mb-1">
                        Dirección
                      </span>
                      <span className="small">
                        {selectedOrder.delivery_address}
                      </span>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-0 py-2">
                  <strong className="small">Pago</strong>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between py-2">
                    <span className="small text-muted">Método</span>
                    <span className="small">
                      {mapPaymentMethod(selectedOrder.payment_method)}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between py-2">
                    <span className="small text-muted">Estado de pago</span>
                    <span className="small">
                      {mapPaymentStatus(selectedOrder.payment_status)}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between py-2">
                    <span className="small text-muted">Total</span>
                    <span className="fw-bold small">
                      ${formatPrice(selectedOrder.total_amount)}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card>

              {selectedOrder.special_instructions && (
                <Alert variant="light" className="border mb-0 py-2 small">
                  <strong>Notas especiales:</strong>{" "}
                  {selectedOrder.special_instructions}
                </Alert>
              )}

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-0 py-2">
                  <strong className="small">Ítems del pedido</strong>
                </Card.Header>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ListGroup variant="flush">
                    {selectedOrder.items.map((item) => (
                      <ListGroup.Item
                        key={item.id}
                        className="d-flex justify-content-between align-items-start py-2"
                      >
                        <div>
                          <div className="fw-semibold small">
                            {item.menu_item_name ||
                              item.name ||
                              "Producto"}
                          </div>
                          <div className="small text-muted">
                            Cantidad: {item.quantity} · Precio unit.: $
                            {formatPrice(item.unit_price)}
                          </div>
                        </div>
                        <div className="fw-semibold small">
                          ${formatPrice(item.subtotal)}
                        </div>
                      </ListGroup.Item>
                    ))}
                    <ListGroup.Item className="d-flex justify-content-between py-2">
                      <span className="fw-semibold small">Total</span>
                      <span className="fw-bold small">
                        ${formatPrice(selectedOrder.total_amount)}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>
                ) : (
                  <Card.Body className="py-2">
                    <Alert variant="light" className="border mb-0 small">
                      No hay ítems para mostrar.
                    </Alert>
                  </Card.Body>
                )}
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="py-2 d-flex justify-content-between">
          {selectedOrder && canCancelOrder(selectedOrder.status) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleCancelOrder(selectedOrder.id)}
              disabled={loadingAction}
            >
              <MdOutlineCancel className="me-2" />
              {loadingAction ? "Cancelando..." : "Cancelar orden"}
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

export default OrderHistory;
