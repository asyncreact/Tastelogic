// src/components/MenuItemCard.jsx
import { useState } from "react";
import { Card, Button, Modal } from "react-bootstrap";
import { BiImage } from "react-icons/bi";
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

const formatPrice = (price) => {
  const n = Number(price) || 0;
  return n
    .toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\s*/g, "")
    .replace(/^DOP/, "RD$");
};

function MenuItemCard({ item }) {
  const { addToCart, cart } = useOrder();
  const [showModal, setShowModal] = useState(false);

  const quantityInCart = cart.find((i) => i.id === item.id)?.quantity || 0;
  const imageSrc = getImageUrl(item.image_url);

  // Lógica para bloquear ítems
  const isUnavailable =
    !item.is_available ||
    item.stock === 0 ||
    item.category_is_disabled === true ||
    item.category?.is_active === false;

  const unavailableReason =
    item.stock === 0
      ? "Se acabaron las unidades"
      : "No disponible por el momento";

  const handleAddToCart = () => {
    if (isUnavailable) return;
    addToCart(item, 1);
    Swal.fire({
      icon: "success",
      title: "Agregado",
      text: `${item.name} agregado a tu pedido`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleOpenModal = () => {
    if (isUnavailable) return;
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      {/* CARD CON HOVER Y ESTADO BLOQUEADO */}
      <Card
        className={`border-0 shadow-sm mb-3 ${
          isUnavailable ? "bg-light text-muted" : ""
        }`}
        style={{
          cursor: isUnavailable ? "not-allowed" : "pointer",
          transition: "box-shadow 0.15s ease, transform 0.15s ease",
          opacity: isUnavailable ? 0.6 : 1,
        }}
        onClick={handleOpenModal}
        onMouseEnter={(e) => {
          if (isUnavailable) return;
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.12)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "";
          e.currentTarget.style.transform = "";
        }}
      >
        <Card.Body className="d-flex align-items-center">
          {/* Imagen cuadrada a la izquierda */}
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.name}
              style={{
                width: 56,
                height: 56,
                objectFit: "cover",
                borderRadius: 8,
                marginRight: 12,
                filter: isUnavailable ? "grayscale(1)" : "none",
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/56?text=Sin+Img";
              }}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center bg-light"
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                marginRight: 12,
              }}
            >
              <BiImage size={24} />
            </div>
          )}

          {/* Texto en columna: Nombre -> Precio -> Descripción -> Estado si no disponible */}
          <div className="flex-grow-1">
            {/* 1. Nombre */}
            <div className="fw-semibold">{item.name}</div>

            {/* 2. Precio */}
            <div className="small">{formatPrice(item.price)}</div>

            {/* 3. Descripción */}
            {item.description && (
              <div className="small text-muted">{item.description}</div>
            )}

            {/* Estado solo si NO disponible */}
            <div className="small">
              {isUnavailable && unavailableReason}
            </div>
          </div>

          {/* Botón circular con + y contador */}
          <div
            style={{
              position: "relative",
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline-secondary"
              onClick={handleAddToCart}
              disabled={isUnavailable}
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                padding: 0,
              }}
            >
              <span
                style={{
                  lineHeight: 1,
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                }}
              >
                +
              </span>
            </Button>

            {quantityInCart > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  fontSize: "0.65rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                }}
              >
                {quantityInCart}
              </span>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* MODAL DE DETALLES */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{item.name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.name}
              style={{
                width: "100%",
                maxHeight: 240,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 16,
              }}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center bg-light mb-3"
              style={{
                width: "100%",
                height: 180,
                borderRadius: 8,
              }}
            >
              <BiImage size={40} />
            </div>
          )}

          <p className="mb-2">
            <strong>Precio: </strong>
            {formatPrice(item.price)}
          </p>

          <p className="mb-2">
            <strong>Descripción: </strong>
            {item.description || "Sin descripción"}
          </p>

          {item.ingredients && (
            <p className="mb-2">
              <strong>Ingredientes: </strong>
              {item.ingredients}
            </p>
          )}

          {item.estimated_prep_time && (
            <p className="mb-2">
              <strong>Tiempo estimado: </strong>
              {item.estimated_prep_time} min
            </p>
          )}

          {isUnavailable && (
            <p className="mb-0">
              <strong>Estado: </strong>
              {unavailableReason}
            </p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleAddToCart();
              handleCloseModal();
            }}
            disabled={isUnavailable}
          >
            Añadir al carrito
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MenuItemCard;
