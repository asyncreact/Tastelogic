// src/components/OrderHistory.jsx
import { useEffect, useState } from "react";
import {
  Spinner,
  Alert,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { BiReceipt, BiCalendar, BiTime, BiDetail } from "react-icons/bi";
import { MdOutlineCancel, MdPayment, MdLocationOn } from "react-icons/md";
import { RiFileList3Line } from "react-icons/ri";
import Swal from "sweetalert2";

import { useAuth } from "../hooks/useAuth";
import { useOrder } from "../hooks/useOrder";

function mapOrderType(type) {
  switch (type) {
    case "dine-in": return "En el local";
    case "takeaway":
    case "pickup":
    case "takeout": return "Para llevar";
    case "delivery": return "Entrega a domicilio";
    default: return type || "N/A";
  }
}

function mapPaymentMethod(method) {
  switch (method) {
    case "cash": return "Efectivo";
    case "card":
    case "credit_card":
    case "debit_card": return "Tarjeta";
    case "online":
    case "online_payment": return "Pago en línea";
    default: return method || "No especificado";
  }
}

function mapOrderStatus(status) {
  switch (status) {
    case "pending": return "Pendiente";
    case "confirmed": return "Confirmado";
    case "preparing": return "En preparación";
    case "ready": return "Listo";
    case "completed": return "Completado";
    case "cancelled": return "Cancelado";
    default: return status || "N/A";
  }
}

function mapPaymentStatus(status) {
  switch (status) {
    case "pending": return "Pendiente";
    case "paid": return "Pagado";
    case "refunded": return "Reembolsado";
    default: return "Pendiente";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadPage(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleViewDetails = async (orderId) => {
    if (!user) {
      await Swal.fire({
        icon: "info",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para ver los detalles.",
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
      confirmButtonColor: "#ef4444",
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
    return isNaN(numPrice)
      ? "0.00"
      : numPrice.toLocaleString("es-DO", { minimumFractionDigits: 2 });
  };

  const total = ordersMeta?.total || 0;
  const totalPages = Math.max(
    1,
    Math.ceil(total / (ordersMeta?.limit || pageSize))
  );

  if (loadingOrders || loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3 text-muted">Cargando tu historial...</p>
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
        <p className="mb-0 text-muted">Accede a tu cuenta para ver tus pedidos.</p>
      </Alert>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-5">
        <div
          className="d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto mb-3"
          style={{ width: 64, height: 64 }}
        >
          <BiReceipt size={32} className="text-muted" />
        </div>
        <h5 className="mb-1 text-dark">No tienes pedidos aún</h5>
        <p className="text-muted">¡Es un buen momento para pedir algo delicioso!</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ paddingBottom: "80px" }}>
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-4 p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center shadow-sm border-0 hover-shadow"
              style={{ transition: "all 0.2s ease" }}
            >
              <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                <div
                  className="icon-orange rounded-3 flex-shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  <BiReceipt size={24} />
                </div>

                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-bold text-dark">
                      Order #{order.order_number || order.id}
                    </span>
                    <span className="badge border fw-normal text-muted">
                      {mapOrderStatus(order.status)}
                    </span>
                  </div>
                  <div className="text-muted small">
                    {formatDate(order.order_date)} · RD$ {formatPrice(order.total_amount)}
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="white"
                  size="sm"
                  className="rounded-pill px-3 border shadow-sm text-dark bg-white"
                  onClick={() => handleViewDetails(order.id)}
                >
                  <BiDetail className="me-1" />
                  Ver detalle
                </Button>
                {canCancelOrder(order.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="rounded-pill px-3 shadow-sm"
                    onClick={() => handleCancelOrder(order.id)}
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
      </div>

      {/* Paginación flotante fija al fondo */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1030,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid #f3f4f6",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="small text-muted fw-medium">
          Página {currentPage} de {totalPages}
        </span>
        <div className="d-flex gap-2">
          <div className="custom-pagination d-flex gap-2">
            <button
              className="page-link rounded-circle border bg-white shadow-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ width: 32, height: 32, opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              &lt;
            </button>
            <button
              className="page-link rounded-circle border bg-white shadow-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: 32,
                height: 32,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName="border-0 rounded-4 overflow-hidden"
      >
        {selectedOrder && (
          <div className="bg-white">
            <div
              className="bg-light p-4 text-center"
              style={{
                borderBottom: "2px dashed #e5e7eb",
                position: "relative",
              }}
            >
              <div
                className="icon-orange rounded-circle mx-auto mb-3 shadow-sm"
                style={{ width: 56, height: 56 }}
              >
                <BiReceipt size={28} />
              </div>
              <h5 className="mb-0 fw-bold text-dark">Comprobante de Orden</h5>
              <p className="text-muted small mb-2">Gracias por tu preferencia</p>
              <div className="d-inline-block px-3 py-1 rounded-pill bg-white border shadow-sm mt-1">
                <span className="fw-bold" style={{ color: "#ff7a18" }}>
                  #{selectedOrder.order_number || selectedOrder.id}
                </span>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: -10,
                  width: 20,
                  height: 20,
                  background: "#fff",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  right: -10,
                  width: 20,
                  height: 20,
                  background: "#fff",
                  borderRadius: "50%",
                }}
              />
            </div>

            <Modal.Body className="p-0">
              <div className="p-4">
                <Row className="g-3 mb-4">
                  <Col xs={6}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <BiCalendar className="text-muted" />
                      <span className="small text-muted">Fecha</span>
                    </div>
                    <div className="small fw-semibold text-dark">
                      {formatDate(
                        selectedOrder.order_date || selectedOrder.created_at
                      )}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <BiTime className="text-muted" />
                      <span className="small text-muted">Hora</span>
                    </div>
                    <div className="small fw-semibold text-dark">
                      {formatTime(
                        selectedOrder.order_time || selectedOrder.created_at
                      )}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <MdPayment className="text-muted" />
                      <span className="small text-muted">Pago</span>
                    </div>
                    <div className="small fw-semibold text-dark">
                      {mapPaymentMethod(selectedOrder.payment_method)}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <MdLocationOn className="text-muted" />
                      <span className="small text-muted">Tipo</span>
                    </div>
                    <div className="small fw-semibold text-dark">
                      {mapOrderType(selectedOrder.order_type)}
                    </div>
                  </Col>
                </Row>

                <div className="mb-4" style={{ borderBottom: "1px dashed #e5e7eb" }} />

                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <RiFileList3Line style={{ color: "#ff7a18" }} />
                    <span className="small fw-bold text-uppercase text-muted">
                      Resumen
                    </span>
                  </div>

                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="d-flex justify-content-between align-items-start"
                        >
                          <div className="d-flex gap-2">
                            <span
                              className="fw-bold text-dark small"
                              style={{ minWidth: "20px" }}
                            >
                              {item.quantity}x
                            </span>
                            <div>
                              <div className="small text-dark lh-sm">
                                {item.menu_item_name ||
                                  item.name ||
                                  "Producto"}
                              </div>
                              {item.unit_price && (
                                <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                  RD$ {formatPrice(item.unit_price)} c/u
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="small fw-semibold text-dark">
                            RD$ {formatPrice(item.subtotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="small text-muted fst-italic">
                      No hay items registrados.
                    </p>
                  )}
                </div>

                {selectedOrder.special_instructions && (
                  <Alert
                    variant="warning"
                    className="small border-0 text-dark mb-4"
                    style={{ backgroundColor: "#fff7ed" }}
                  >
                    <strong>Nota:</strong> {selectedOrder.special_instructions}
                  </Alert>
                )}

                <div className="mb-4" style={{ borderBottom: "2px dashed #e5e7eb" }} />

                <div className="d-flex justify-content-between align-items-end">
                  <div className="text-muted small">Monto Total</div>
                  <div
                    className="h4 mb-0 fw-bold"
                    style={{ color: "#ff7a18" }}
                  >
                    RD$ {formatPrice(selectedOrder.total_amount)}
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-1">
                  <span
                    className={`badge ${
                      selectedOrder.payment_status === "paid"
                        ? "bg-success"
                        : "bg-secondary"
                    } bg-opacity-10 text-${
                      selectedOrder.payment_status === "paid"
                        ? "success"
                        : "secondary"
                    } border`}
                  >
                    {mapPaymentStatus(selectedOrder.payment_status)}
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
              {canCancelOrder(selectedOrder.status) && (
                <Button
                  variant="danger"
                  className="flex-grow-1 shadow-sm"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  disabled={loadingAction}
                >
                  {loadingAction ? "Procesando..." : "Cancelar Orden"}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default OrderHistory;
