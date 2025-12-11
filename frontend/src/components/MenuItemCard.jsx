// src/components/MenuItemCard.jsx
import { useState } from "react";
import { Card, Button, Modal, Row, Col } from "react-bootstrap";
// Agregamos iconos útiles para el detalle
import { BiImage, BiTimeFive, BiDish } from "react-icons/bi";
import { MdClose } from "react-icons/md"; 
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
      {/* --- TU CARD ORIGINAL (Sin cambios) --- */}
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

          <div className="flex-grow-1">
            <div className="fw-semibold">{item.name}</div>

            <div className="small">{formatPrice(item.price)}</div>

            {item.description && (
              <div className="small text-muted">{item.description}</div>
            )}

            <div className="small">
              {isUnavailable && unavailableReason}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="primary"
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

      {/* --- MODAL ACTUALIZADO CON ICONOS ICON-ORANGE --- */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        centered
        contentClassName="border-0 rounded-4 overflow-hidden" 
      >
        {/* Encabezado con Imagen "Hero" */}
        <div className="position-relative bg-light">
          <button
            onClick={handleCloseModal}
            className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32, zIndex: 10, border: 'none', opacity: 0.9 }}
          >
            <MdClose size={18} />
          </button>

          {imageSrc ? (
            <div style={{ width: "100%", height: "240px" }}>
              <img
                src={imageSrc}
                alt={item.name}
                className="w-100 h-100"
                style={{
                  objectFit: "cover",
                  filter: isUnavailable ? "grayscale(1)" : "none",
                }}
              />
            </div>
          ) : (
            <div
              className="d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-secondary"
              style={{ width: "100%", height: "200px" }}
            >
              <BiImage size={48} opacity={0.5} />
            </div>
          )}
        </div>

        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="mb-0 text-dark" style={{ fontWeight: 600 }}>{item.name}</h5>
            <span className="text-orange" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {formatPrice(item.price)}
            </span>
          </div>

          <p className="text-muted small mb-4">
            {item.description || "Sin descripción disponible."}
          </p>

          <Row className="g-3">
             {item.estimated_prep_time && (
                <Col xs={6}>
                    <div className="d-flex align-items-center p-2 rounded-3 bg-light">
                        {/* ICONO TIEMPO CON FONDO NARANJA GRADIENTE */}
                        <div 
                          className="icon-orange me-2 rounded-circle" 
                          style={{ width: 32, height: 32 }}
                        >
                          <BiTimeFive size={18} />
                        </div>
                        <span className="small text-dark fw-semibold">{item.estimated_prep_time} min</span>
                    </div>
                </Col>
             )}
             
             {item.ingredients && (
                <Col xs={12}>
                    <div className="d-flex align-items-start p-2 rounded-3 bg-light">
                        {/* ICONO INGREDIENTES CON FONDO NARANJA GRADIENTE */}
                        <div 
                          className="icon-orange me-2 mt-1 flex-shrink-0 rounded-circle" 
                          style={{ width: 32, height: 32 }}
                        >
                          <BiDish size={18} />
                        </div>
                        <span className="small text-dark pt-1">{item.ingredients}</span>
                    </div>
                </Col>
             )}
          </Row>

          {isUnavailable && (
            <div className="mt-3 p-2 bg-light text-danger rounded small text-center">
              {unavailableReason}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top-0 p-4 pt-0">
          <Button
            variant="primary"
            className="w-100 py-2 rounded-3"
            onClick={() => {
              handleAddToCart();
              handleCloseModal();
            }}
            disabled={isUnavailable}
          >
            {isUnavailable ? "No disponible" : "Agregar a la bolsa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MenuItemCard;