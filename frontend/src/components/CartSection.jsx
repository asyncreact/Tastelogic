// src/components/CartSection.jsx
import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Table,
  Form,
  Alert,
  Image,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  MdDelete,
  MdAdd,
  MdRemove,
  MdPayment,
} from "react-icons/md";
import { RiShoppingBag4Line } from "react-icons/ri";

import { useOrder } from "../hooks/useOrder";
import { useReservation } from "../hooks/useReservation";
import Swal from "sweetalert2";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${API_URL}${cleanPath}`;
};

function CartSection() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    addOrder,
    loading,
  } = useOrder();

  const { fetchMyActiveReservation } = useReservation();

  const [orderType, setOrderType] = useState("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const [activeReservation, setActiveReservation] = useState(null);
  const [reservationError, setReservationError] = useState("");

  useEffect(() => {
    const loadActiveReservation = async () => {
      if (orderType !== "dine-in") {
        setActiveReservation(null);
        setReservationError("");
        setTableNumber("");
        return;
      }

      try {
        setReservationError("");
        const reservation = await fetchMyActiveReservation();
        setActiveReservation(reservation);
        if (reservation?.table_number) {
          setTableNumber(reservation.table_number);
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Para comer aquí necesitas una reserva activa para hoy.";
        setReservationError(msg);
        setActiveReservation(null);
        setTableNumber("");
      }
    };

    loadActiveReservation();
  }, [orderType, fetchMyActiveReservation]);

  const handleRemoveItem = async (itemId, itemName) => {
    const result = await Swal.fire({
      title: "¿Eliminar ítem?",
      text: `¿Deseas eliminar ${itemName} de la bolsa?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      removeFromCart(itemId);
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: "¿Vaciar bolsa?",
      text: "Se eliminarán todos los ítems de tu bolsa",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      clearCart();
      Swal.fire({
        icon: "success",
        title: "Bolsa vaciada",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Bolsa vacía",
        text: "Agrega ítems a tu bolsa antes de continuar",
      });
      return;
    }

    if (orderType === "dine-in") {
      if (!activeReservation) {
        Swal.fire({
          icon: "warning",
          title: "Reserva requerida",
          text:
            reservationError ||
            "Para comer aquí debes tener una reserva activa para hoy.",
        });
        return;
      }
    }

    if (orderType === "delivery" && !deliveryAddress) {
      Swal.fire({
        icon: "warning",
        title: "Dirección requerida",
        text: "Por favor ingresa la dirección de entrega",
      });
      return;
    }

    try {
      const orderData = {
        order_type: orderType,
        reservation_id:
          orderType === "dine-in" && activeReservation
            ? activeReservation.id
            : null,
        table_id:
          orderType === "dine-in" && activeReservation
            ? activeReservation.table_id
            : null,
        delivery_address: orderType === "delivery" ? deliveryAddress : null,
        payment_method: paymentMethod,
        special_instructions: notes || null,
        items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
        })),
      };

      const result = await addOrder(orderData);

      await Swal.fire({
        icon: "success",
        title: "¡Orden creada!",
        text: result?.message || "Tu orden ha sido registrada exitosamente",
        confirmButtonText: "OK",
      });

      setOrderType("dine-in");
      setTableNumber("");
      setDeliveryAddress("");
      setPaymentMethod("cash");
      setNotes("");
      setActiveReservation(null);
      setReservationError("");

      window.location.reload();
    } catch (error) {
      if (error.details && Array.isArray(error.details)) {
        const htmlList = error.details
          .map((d) => `<li>${d.message || d}</li>`)
          .join("");
        Swal.fire({
          icon: "error",
          title: error.message || "Errores de validación",
          html: `<ul style="text-align:left;margin:0;padding-left:20px">${htmlList}</ul>`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo crear la orden",
        });
      }
    }
  };

  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <Alert variant="light" className="text-center border-0 py-5">
        <RiShoppingBag4Line size={48} className="mb-3" />
        <h5 className="mb-2">Tu bolsa está vacía</h5>
        <p className="mb-3">
          Agrega productos desde el menú para comenzar tu orden.
        </p>
        <Button as={Link} to="/menu" variant="secondary">
          Ir al menú
        </Button>
      </Alert>
    );
  }

  return (
    <Row className="gy-4">
      <Col lg={8}>
        <div className="mb-3">
          <h5 className="mb-0">Mi bolsa</h5>
          <small>
            {cart.length} ítem{cart.length > 1 ? "s" : ""} en tu orden
          </small>
        </div>

        <Table borderless responsive className="align-middle">
          <tbody>
            {cart.map((item, index) => (
              <tr
                key={item.id}
                className={index !== 0 ? "border-top" : ""}
                style={{ borderColor: "#ddd" }}
              >
                <td style={{ width: "80px" }}>
                  {item.image_url ? (
                    <Image
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      rounded
                      style={{
                        width: "72px",
                        height: "72px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/72?text=Sin+Imagen";
                      }}
                    />
                  ) : (
                    <div
                      className="border d-flex align-items-center justify-content-center rounded"
                      style={{ width: "72px", height: "72px" }}
                    >
                      <RiShoppingBag4Line size={22} />
                    </div>
                  )}
                </td>

                <td>
                  <div className="d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div>{item.name}</div>
                        {item.description && (
                          <div className="small mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div>
                        RD$
                        {(
                          parseFloat(item.price) * item.quantity
                        ).toFixed(2)}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="small">
                          RD${parseFloat(item.price).toFixed(2)} c/u
                        </span>
                        <div className="d-flex align-items-center gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <MdRemove size={16} />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                          >
                            <MdAdd size={16} />
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="link"
                        className="p-0 small"
                        onClick={() =>
                          handleRemoveItem(item.id, item.name)
                        }
                      >
                        <MdDelete className="me-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <Button
            variant="link"
            className="p-0 small"
            onClick={handleClearCart}
          >
            Vaciar bolsa
          </Button>
          <small>
            Los precios pueden variar según promociones y disponibilidad.
          </small>
        </div>
      </Col>

      <Col lg={4}>
        <div
          className="ps-lg-4 pt-3 pt-lg-0 border-top border-lg-top-0 border-lg-start"
          style={{ borderColor: "#ddd" }}
        >
          <h6 className="mb-3">Resumen de la orden</h6>

          <Form className="mb-3">
            <Form.Group className="mb-3">
              <Form.Label className="small">Tipo de orden *</Form.Label>
              <Form.Select
                size="sm"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="dine-in">Para comer aquí</option>
                <option value="takeout">Para llevar</option>
                <option value="delivery">Delivery</option>
              </Form.Select>
            </Form.Group>

            {orderType === "dine-in" && (
              <div className="mb-3">
                <Form.Label className="small">
                  Detalles de tu reserva
                </Form.Label>

                {reservationError && (
                  <Alert variant="warning" className="py-2 small">
                    {reservationError}
                  </Alert>
                )}

                {activeReservation && (
                  <div className="border rounded p-2 small">
                    <div>
                      <strong>Mesa:</strong>{" "}
                      {activeReservation.table_number}
                    </div>
                    <div>
                      <strong>Zona:</strong>{" "}
                      {activeReservation.zone_name}
                    </div>
                    <div>
                      <strong>Fecha:</strong>{" "}
                      {activeReservation.reservation_date}
                    </div>
                    <div>
                      <strong>Hora:</strong>{" "}
                      {activeReservation.reservation_time}
                    </div>
                    <div>
                      <strong>Personas:</strong>{" "}
                      {activeReservation.guest_count}
                    </div>
                  </div>
                )}
              </div>
            )}

            {orderType === "delivery" && (
              <Form.Group className="mb-3">
                <Form.Label className="small">
                  Dirección de entrega *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  placeholder="Ingresa tu dirección completa"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="small">Método de pago *</Form.Label>
              <Form.Select
                size="sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta crédito/débito</option>
                <option value="transfer">Transferencia bancaria</option>
                <option value="mobile">Pago móvil</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small">
                Notas para el restaurante
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                size="sm"
                placeholder="Instrucciones especiales (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Group>
          </Form>

          <div
            className="border-top pt-3 mb-3"
            style={{ borderColor: "#ddd" }}
          >
            <div className="d-flex justify-content-between mb-1 small">
              <span>Subtotal</span>
              <span>RD${total.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span>Envío</span>
              <span>Calculado en el lugar</span>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <span>Total</span>
              <span>RD${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <>Procesando...</>
            ) : (
              <>
                <MdPayment size={18} className="me-2" />
                Finalizar pedido
              </>
            )}
          </Button>
        </div>
      </Col>
    </Row>
  );
}

export default CartSection;
