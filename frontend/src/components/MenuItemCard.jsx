// src/components/MenuItemCard.jsx
import { Card, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiImage, BiListUl, BiTime } from "react-icons/bi";
import { RiShoppingBag4Line } from "react-icons/ri";
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

function MenuItemCard({ item }) {
  const { addToCart, cart } = useOrder();

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

  const quantityInCart = cart.find((i) => i.id === item.id)?.quantity || 0;

  return (
    <Card className="h-100 border-0 shadow-sm">
      {item.image_url ? (
        <Card.Img
          variant="top"
          src={getImageUrl(item.image_url)}
          alt={item.name}
          style={{ height: "200px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200?text=Sin+Imagen";
          }}
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center border-bottom"
          style={{ height: "200px" }}
        >
          <BiImage size={32} />
        </div>
      )}

      <Card.Body className="d-flex flex-column">
        <h3 className="h6 mb-2 text-truncate">{item.name}</h3>

        {item.description && (
          <p className="small mb-3" style={{ minHeight: "2.5rem" }}>
            {item.description}
          </p>
        )}

        <div className="mt-auto">
          {item.ingredients && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`t-${item.id}`}>{item.ingredients}</Tooltip>
              }
            >
              <div
                className="d-flex align-items-center small mb-2"
                style={{ cursor: "pointer" }}
              >
                <BiListUl className="me-1" />
                <span>Ingredientes</span>
              </div>
            </OverlayTrigger>
          )}

          {item.estimated_prep_time && (
            <div className="d-flex align-items-center small mb-2">
              <BiTime className="me-1" />
              <span>{item.estimated_prep_time} min</span>
            </div>
          )}

          <hr className="my-2" />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold">
              ${parseFloat(item.price).toFixed(2)}
            </span>
            <span className="small">
              {item.is_available ? "Disponible" : "No disponible"}
            </span>
          </div>

          <Button
            variant="secondary"
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={handleAddToCart}
            disabled={!item.is_available}
          >
            <RiShoppingBag4Line className="me-2" />
            {quantityInCart > 0
              ? `Agregar (+${quantityInCart})`
              : "Agregar"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default MenuItemCard;
