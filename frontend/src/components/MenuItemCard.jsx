// src/components/MenuItemCard.jsx
import { Card, Badge, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { MdImage, MdList, MdTimer, MdShoppingCart } from "react-icons/md";
import { useOrder } from "../hooks/useOrder";
import Swal from "sweetalert2";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

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
      title: "¡Agregado al carrito!",
      text: `${item.name} ha sido agregado al carrito`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const getItemQuantityInCart = () => {
    const cartItem = cart.find((i) => i.id === item.id);
    return cartItem ? cartItem.quantity : 0;
  };

  const quantityInCart = getItemQuantityInCart();

  return (
    <Card className="h-100 shadow-sm">
      {item.image_url ? (
        <Card.Img
          variant="top"
          src={getImageUrl(item.image_url)}
          alt={item.name}
          style={{ height: "180px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/180?text=Sin+Imagen";
          }}
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center bg-secondary text-white"
          style={{ height: "180px" }}
        >
          <MdImage size={48} />
        </div>
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title>{item.name}</Card.Title>
        <Card.Text className="flex-grow-1">{item.description}</Card.Text>

        {item.ingredients && (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-ingredients-${item.id}`}>
                {item.ingredients}
              </Tooltip>
            }
          >
            <div className="mb-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
              <MdList size={18} className="me-2" />
              <small>Ingredientes</small>
            </div>
          </OverlayTrigger>
        )}

        {item.estimated_prep_time && (
          <div className="mb-2 d-flex align-items-center">
            <MdTimer size={18} className="me-2" />
            <small>Tiempo prep.: {item.estimated_prep_time} min</small>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-auto mb-2">
          <strong>${parseFloat(item.price).toFixed(2)}</strong>
          <Badge bg="success">Disponible</Badge>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="w-100 d-flex align-items-center justify-content-center"
          onClick={handleAddToCart}
        >
          <MdShoppingCart size={18} className="me-2" />
          Agregar al carrito
          {quantityInCart > 0 && (
            <Badge bg="light" text="dark" className="ms-2">
              {quantityInCart}
            </Badge>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
}

export default MenuItemCard;
