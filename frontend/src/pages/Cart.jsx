// src/pages/Cart.jsx
import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
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

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

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
      title: "¿Eliminar item?",
      text: `¿Deseas eliminar ${itemName} del carrito?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
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
      text: "Se eliminarán todos los items del carrito",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
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
        text: "Agrega items al carrito antes de continuar",
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
    <Container className="py-5">
      <Card className="shadow-lg border-0">
        <Card.Header
          className="text-white border-0"
          style={{
            background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
            padding: "1.5rem",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <MdShoppingCart size={32} className="me-2" />
              <h4 className="mb-0">Carrito de Compras</h4>
            </div>
            <Button
              as={Link}
              to="/menu"
              variant="light"
              size="sm"
              className="d-flex align-items-center"
            >
              <MdArrowBack size={18} className="me-1" />
              Volver al menú
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {cart.length === 0 ? (
            <Alert variant="info" className="text-center">
              <MdShoppingCart size={48} className="mb-3" />
              <h5>Tu carrito está vacío</h5>
              <p>Agrega items desde el menú para comenzar</p>
              <Button as={Link} to="/menu" variant="primary">
                Ir al menú
              </Button>
            </Alert>
          ) : (
            <>
              <Row>
                <Col lg={8}>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Imagen</th>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.image_url ? (
                              <Image
                                src={getImageUrl(item.image_url)}
                                alt={item.name}
                                rounded
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/60?text=Sin+Imagen";
                                }}
                              />
                            ) : (
                              <div
                                className="bg-secondary text-white rounded d-flex align-items-center justify-content-center"
                                style={{ width: "60px", height: "60px" }}
                              >
                                <MdShoppingCart size={24} />
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>{item.name}</strong>
                            {item.description && (
                              <div className="text-muted small">{item.description}</div>
                            )}
                          </td>
                          <td>${parseFloat(item.price).toFixed(2)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                  updateCartQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                <MdRemove />
                              </Button>
                              <Badge bg="secondary" style={{ minWidth: "30px" }}>
                                {item.quantity}
                              </Badge>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                  updateCartQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <MdAdd />
                              </Button>
                            </div>
                          </td>
                          <td>
                            <strong>
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </strong>
                          </td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id, item.name)}
                            >
                              <MdDelete />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="d-flex justify-content-end">
                    <Button variant="outline-danger" onClick={handleClearCart}>
                      Vaciar carrito
                    </Button>
                  </div>
                </Col>

                <Col lg={4}>
                  <Card className="shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Resumen de orden</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Tipo de orden *</Form.Label>
                          <Form.Select
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
                            <Form.Label>Número de mesa *</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="Ej: 5"
                              value={tableNumber}
                              onChange={(e) => setTableNumber(e.target.value)}
                            />
                          </Form.Group>
                        )}

                        {orderType === "delivery" && (
                          <Form.Group className="mb-3">
                            <Form.Label>Dirección de entrega *</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              placeholder="Ingresa tu dirección completa"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                            />
                          </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                          <Form.Label>Notas especiales</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Instrucciones especiales (opcional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </Form.Group>
                      </Form>

                      <hr />

                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <strong>${total.toFixed(2)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-3">
                        <span className="h5 mb-0">Total:</span>
                        <span className="h5 mb-0 text-primary">
                          ${total.toFixed(2)}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={handleCheckout}
                        disabled={loading}
                      >
                        {loading ? (
                          <>Procesando...</>
                        ) : (
                          <>
                            <MdPayment size={20} className="me-2" />
                            Realizar pedido
                          </>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Cart;
