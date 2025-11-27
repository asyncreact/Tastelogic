// src/pages/Cart.jsx
import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Form,
  Alert,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  MdShoppingCart,
  MdDelete,
  MdAdd,
  MdRemove,
  MdArrowBack,
  MdPayment,
} from "react-icons/md";
import { useOrder } from "../hooks/useOrder";
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

function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    addOrder,
    loading,
  } = useOrder();

  const [orderType, setOrderType] = useState("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  const handleRemoveItem = async (itemId, itemName) => {
    const result = await Swal.fire({
      title: "¿Eliminar ítem?",
      text: `¿Deseas eliminar ${itemName} del carrito?`,
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
      title: "¿Vaciar carrito?",
      text: "Se eliminarán todos los ítems del carrito",
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
        title: "Carrito vaciado",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Agrega ítems al carrito antes de continuar",
      });
      return;
    }

    if (orderType === "dine-in" && !tableNumber) {
      Swal.fire({
        icon: "warning",
        title: "Número de mesa requerido",
        text: "Por favor ingresa el número de mesa",
      });
      return;
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
        table_number: orderType === "dine-in" ? parseInt(tableNumber) : null,
        delivery_address: orderType === "delivery" ? deliveryAddress : null,
        notes: notes || null,
        items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
        })),
      };

      await addOrder(orderData);

      await Swal.fire({
        icon: "success",
        title: "¡Orden creada!",
        text: "Tu orden ha sido registrada exitosamente",
        confirmButtonText: "Ver mis órdenes",
      });

      navigate("/orders");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear la orden",
      });
    }
  };

  const total = getCartTotal();

  return (
    <Container className="py-4 py-md-5">
      {/* Encabezado minimalista */}
      <Row className="align-items-center mb-4">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <MdShoppingCart size={28} />
            <div>
              <h4 className="mb-0">Mi carrito</h4>
              <small>Revisa tus productos antes de confirmar tu orden.</small>
            </div>
          </div>
        </Col>
        <Col xs="auto">
          <Button
            as={Link}
            to="/menu"
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center"
          >
            <MdArrowBack size={18} className="me-1" />
            Volver al menú
          </Button>
        </Col>
      </Row>

      {cart.length === 0 ? (
        <Alert variant="light" className="text-center border-0 py-5">
          <MdShoppingCart size={48} className="mb-3" />
          <h5 className="mb-2">Tu carrito está vacío</h5>
          <p className="mb-3">
            Agrega productos desde el menú para comenzar tu orden.
          </p>
          <Button as={Link} to="/menu" variant="secondary">
            Ir al menú
          </Button>
        </Alert>
      ) : (
        <Row className="gy-4">
          {/* Lista de ítems */}
          <Col lg={8}>
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <span className="small">
                {cart.length} ítem{cart.length > 1 ? "s" : ""} en tu carrito
              </span>
              <Button
                variant="link"
                className="p-0 small"
                onClick={handleClearCart}
              >
                Vaciar carrito
              </Button>
            </div>

            <Table borderless responsive className="align-middle">
              <tbody>
                {cart.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index !== 0 ? "border-top" : ""}
                    style={{ borderColor: "#ddd" }}
                  >
                    <td style={{ width: "90px" }}>
                      {item.image_url ? (
                        <Image
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          rounded
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/80?text=Sin+Imagen";
                          }}
                        />
                      ) : (
                        <div
                          className="border d-flex align-items-center justify-content-center rounded"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <MdShoppingCart size={22} />
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="d-flex flex-column">
                        <div className="d-flex justify-content-between">
                          <div>
                            <div className="fw-semibold">{item.name}</div>
                            {item.description && (
                              <div className="small mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <div className="fw-semibold">
                            $
                            {(
                              parseFloat(item.price) * item.quantity
                            ).toFixed(2)}
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="small">
                              ${parseFloat(item.price).toFixed(2)} c/u
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
                            onClick={() => handleRemoveItem(item.id, item.name)}
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
          </Col>

          {/* Resumen, simple y claro */}
          <Col lg={4}>
            <div
              className="ps-lg-4 pt-3 pt-lg-0 border-top border-lg-top-0 border-lg-start"
              style={{ borderColor: "#ddd" }}
            >
              <h6 className="fw-semibold mb-3">Resumen de la orden</h6>

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
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Número de mesa *</Form.Label>
                    <Form.Control
                      size="sm"
                      type="number"
                      min={1}
                      placeholder="Ej: 5"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                    />
                  </Form.Group>
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
                  <Form.Label className="small">Notas especiales</Form.Label>
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
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span>Envío</span>
                  <span>Calculado en el lugar</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span className="fw-semibold">Total</span>
                  <span className="fw-bold">${total.toFixed(2)}</span>
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
                    Confirmar pedido
                  </>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Cart;
