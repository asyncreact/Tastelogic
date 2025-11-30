// src/pages/admin/AdminOrders.jsx
import { useEffect, useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Form,
  Badge,
  Modal,
} from "react-bootstrap";
import { MdShoppingCart } from "react-icons/md";
import { OrderContext } from "../../context/OrderContext";
import { useUsers } from "../../hooks/useUsers";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Componente reutilizable para mostrar info del usuario
function UserInfoInline({ userId, users }) {
  const user = users.find((u) => String(u.id) === String(userId));

  if (!user) {
    return <span className="text-danger">Usuario no encontrado</span>;
  }

  return (
    <span className="text-muted">
      {user.name} ({user.email})
    </span>
  );
}

// Helpers para fecha y hora
const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (timeString) => {
  if (!timeString) return "";
  const [h, m] = timeString.split(":");
  const hourNum = Number(h);
  const suffix = hourNum >= 12 ? "pm" : "am";
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  const hh = String(hour12).padStart(2, "0");
  return `${hh}:${m} ${suffix}`;
};

function AdminOrders() {
  const {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrder,
    changeOrderStatus,
    changePaymentStatus,
    cancelOrderById,
    removeOrder,
    clearError,
  } = useContext(OrderContext);

  const { users } = useUsers();

  const [searchAdmin, setSearchAdmin] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case "confirmed":
      case "preparing":
      case "ready":
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "warning";
    }
  };

  const getPaymentVariant = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "success";
      case "refunded":
        return "info";
      default:
        return "secondary";
    }
  };

  const showSuccessToast = (title) => {
    const Toast = MySwal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: false,
    });

    Toast.fire({
      icon: "success",
      title: title || "Operación realizada correctamente",
    });
  };

  const showBackendError = (
    err,
    fallback = "Por favor, verifica los datos ingresados."
  ) => {
    const baseMessage = err?.message || fallback;
    let details = [];

    if (Array.isArray(err?.details)) {
      details = err.details.map((d) =>
        typeof d === "string" ? d : d.mensaje || d.message || JSON.stringify(d)
      );
    }

    let errorDetailsHtml;
    if (details.length) {
      const listItems = details.map((d) => `<li>${d}</li>`).join("");
      errorDetailsHtml = `<ul class="mt-2 mb-0 small" style="list-style:none;padding-left:0">${listItems}</ul>`;
    }

    MySwal.fire({
      title: "ERROR",
      text: !errorDetailsHtml ? baseMessage : undefined,
      html: errorDetailsHtml ? `<div>${baseMessage}${errorDetailsHtml}</div>` : undefined,
      icon: "error",
      confirmButtonText: "CERRAR",
    });
  };

  const handleDelete = async (id) => {
    const confirmResult = await MySwal.fire({
      title: "Eliminar orden?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const result = await removeOrder(id);
      showSuccessToast((result && result.message) || "Orden eliminada correctamente");
    } catch (err) {
      showBackendError(err, "Error al eliminar la orden");
    }
  };

  const handleChangeStatus = async (order, newStatus) => {
    if (order.status === newStatus) return;
    try {
      const result = await changeOrderStatus(order.id, newStatus);
      showSuccessToast((result && result.message) || "Estado de la orden actualizado");
    } catch (err) {
      showBackendError(err, "Error al cambiar el estado de la orden");
    }
  };

  const handleChangePayment = async (order, newStatus) => {
    const currentPayment = order.payment_status ?? "pending";
    if (currentPayment === newStatus) return;
    try {
      const result = await changePaymentStatus(order.id, newStatus);
      showSuccessToast((result && result.message) || "Estado de pago actualizado");
    } catch (err) {
      showBackendError(err, "Error al cambiar el estado de pago");
    }
  };

  const handleCancelOrder = async (order) => {
    const confirmResult = await MySwal.fire({
      title: "Cancelar orden?",
      text: "Se marcará como cancelada y no podrá modificarse.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const result = await cancelOrderById(order.id);
      showSuccessToast((result && result.message) || "Orden cancelada correctamente");
    } catch (err) {
      showBackendError(err, "Error al cancelar la orden");
    }
  };

  const handleOpenDetail = async (orderId) => {
    try {
      setLoadingDetail(true);
      await fetchOrder(orderId);
      setShowDetailModal(true);
    } catch (err) {
      showBackendError(err, "Error al cargar el detalle de la orden");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
  };

  const getUserById = (userId) =>
    users.find((u) => String(u.id) === String(userId));

  const searchLower = searchAdmin.toLowerCase().trim();
  const filteredOrders = (orders || []).filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;

    const paymentStatusOrder = o.payment_status ?? "pending";
    if (paymentFilter !== "all" && paymentStatusOrder !== paymentFilter) return false;

    if (!searchLower) return true;

    const number = (o.order_number || o.id || "").toString().toLowerCase();
    const owner = getUserById(o.user_id);
    const userName = (owner?.name ?? "").toLowerCase();
    const userEmail = (owner?.email ?? "").toLowerCase();
    const total = (o.total_amount ?? "").toString().toLowerCase();

    return (
      number.includes(searchLower) ||
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      total.includes(searchLower)
    );
  });

  if (loading && (!orders || orders.length === 0)) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 mb-0">Cargando órdenes...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Encabezado */}
      <Row className="mb-3">
        <Col>
          <h1 className="h3 d-flex align-items-center gap-2 mb-1">
            <MdShoppingCart /> Admin Órdenes
          </h1>
          <p className="text-muted mb-0">Gestiona pedidos, estados y pagos.</p>
        </Col>
      </Row>

      {/* Barra de filtros */}
      <Row className="mb-4">
        <Col md={6} className="mb-2 mb-md-0">
          <Form.Control
            type="search"
            placeholder="Buscar por número, usuario o total..."
            value={searchAdmin}
            onChange={(e) => setSearchAdmin(e.target.value)}
          />
        </Col>
        <Col md={3} className="mb-2 mb-md-0">
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="preparing">En preparación</option>
            <option value="ready">Listo</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">Pago: todos</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="refunded">Reembolsado</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Error global */}
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={clearError} className="mb-0">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Lista de órdenes */}
      <Row>
        <Col>
          {filteredOrders.length === 0 ? (
            <p className="text-muted mb-0">
              No hay órdenes o ninguna coincide con la búsqueda/filtro.
            </p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredOrders.map((o) => {
                const paymentStatusOrder = o.payment_status ?? "pending";
                const owner = getUserById(o.user_id);

                return (
                  <div
                    key={o.id}
                    className="d-flex flex-column flex-md-row align-items-md-center justify-content-between border rounded px-3 py-2"
                  >
                    <div className="mb-2 mb-md-0">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">
                          {o.order_number ? `Orden ${o.order_number}` : `Orden #${o.id}`}
                        </span>
                        <Badge bg={getStatusVariant(o.status)}>{o.status}</Badge>
                        <Badge bg={getPaymentVariant(paymentStatusOrder)}>
                          {paymentStatusOrder}
                        </Badge>
                      </div>

                      <div className="small text-muted">
                        {owner ? (
                          <>
                            <UserInfoInline userId={o.user_id} users={users} /> · Total:{" "}
                            {(o.total_amount ?? 0).toString()} {o.currency || "RD$"}
                          </>
                        ) : (
                          <>
                            Usuario no encontrado · Total:{" "}
                            {(o.total_amount ?? 0).toString()} {o.currency || "RD$"}
                          </>
                        )}
                      </div>

                      {o.special_instructions && (
                        <div className="small text-muted mt-1">
                          Notas: {o.special_instructions}
                        </div>
                      )}
                    </div>

                    <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                      <Form.Select
                        size="sm"
                        value={o.status}
                        onChange={(e) => handleChangeStatus(o, e.target.value)}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="preparing">En preparación</option>
                        <option value="ready">Listo</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </Form.Select>

                      <Form.Select
                        size="sm"
                        value={paymentStatusOrder}
                        onChange={(e) => handleChangePayment(o, e.target.value)}
                      >
                        <option value="pending">Pago pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="refunded">Reembolsado</option>
                      </Form.Select>

                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleOpenDetail(o.id)}
                      >
                        Ver detalle
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => handleCancelOrder(o)}
                        disabled={o.status === "cancelled" || o.status === "completed"}
                      >
                        Cancelar
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(o.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Col>
      </Row>

      {/* Modal de detalle de orden */}
      <Modal show={showDetailModal} onHide={handleCloseDetail} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de la orden</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail || !currentOrder ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />{" "}
              <span className="ms-2">Cargando detalle...</span>
            </div>
          ) : (
            <>
              <p className="mb-1">
                <strong>Número:</strong>{" "}
                {currentOrder.order_number || `#${currentOrder.id}`}
              </p>
              <p className="mb-1">
                <strong>Cliente:</strong>{" "}
                <UserInfoInline userId={currentOrder.user_id} users={users} />
              </p>
              <p className="mb-1">
                <strong>Tipo:</strong> {currentOrder.order_type}
              </p>
              <p className="mb-1">
                <strong>Fecha:</strong> {formatDate(currentOrder.order_date)}{" "}
                · <strong>Hora:</strong> {formatTime(currentOrder.order_time)}
              </p>
              <p className="mb-1">
                <strong>Estado:</strong>{" "}
                <Badge bg={getStatusVariant(currentOrder.status)}>
                  {currentOrder.status}
                </Badge>{" "}
                · <strong>Pago:</strong>{" "}
                <Badge bg={getPaymentVariant(currentOrder.payment_status ?? "pending")}>
                  {currentOrder.payment_status ?? "pending"}
                </Badge>
              </p>
              <p className="mb-1">
                <strong>Total:</strong>{" "}
                {(currentOrder.total_amount ?? 0).toString()}{" "}
                {currentOrder.currency || "RD$"}
              </p>
              {currentOrder.table_id && (
                <p className="mb-1">
                  <strong>Mesa:</strong> {currentOrder.table_id}
                </p>
              )}
              {currentOrder.special_instructions && (
                <p className="mb-1">
                  <strong>Notas:</strong> {currentOrder.special_instructions}
                </p>
              )}
              {Array.isArray(currentOrder.items) && currentOrder.items.length > 0 && (
                <div className="mt-3">
                  <strong>Items:</strong>
                  <ul className="small mt-2 mb-0">
                    {currentOrder.items.map((it) => (
                      <li key={it.id || `${it.menu_item_id}-${it.special_notes || ""}`}>
                        {it.quantity} x {it.menu_item_name || it.menu_item_id} ·{" "}
                        {it.unit_price} · Subtotal: {it.subtotal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseDetail}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminOrders;
