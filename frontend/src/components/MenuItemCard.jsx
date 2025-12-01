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
  const n = parseFloat(price);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

function MenuItemCard({ item }) {
  const { addToCart, cart } = useOrder();
  const [showModal, setShowModal] = useState(false);

  const quantityInCart = cart.find((i) => i.id === item.id)?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(item, 1);
    Swal.fire({
      icon: "success",
      title: "Agregado",
      text: `${item.name} agregado al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const imageSrc = getImageUrl(item.image_url);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      {/* CARD CON HOVER */}
      <Card
        className="border-0 shadow-sm mb-3"
        style={{
          cursor: "pointer",
          transition: "box-shadow 0.15s ease, transform 0.15s ease",
        }}
        onClick={handleOpenModal}
        onMouseEnter={(e) => {
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

          {/* Texto en columna */}
          <div className="flex-grow-1">
            <div className="fw-semibold">{item.name}</div>
            <div className="small text-muted">
              {item.description || item.name} · {formatPrice(item.price)}
            </div>
            <div className="small">
              {item.is_available ? "Disponible" : "No disponible"}
            </div>
          </div>

          {/* Botón circular con + y contador */}
          <div
            style={{
              position: "relative",
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()} // evitar abrir modal al usar el botón
          >
            <Button
              variant="outline-secondary"
              onClick={handleAddToCart}
              disabled={!item.is_available}
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

          <p className="mb-2">
            <strong>Precio: </strong>${formatPrice(item.price)}
          </p>

          <p className="mb-0">
            <strong>Estado: </strong>
            {item.is_available ? "Disponible" : "No disponible"}
          </p>
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
            disabled={!item.is_available}
          >
            Añadir al carrito
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MenuItemCard;
