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
      title: "¡Agregado!",
      text: `${item.name} agregado al carrito`,
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
    <Card className="menu-card-flat h-100">
      {item.image_url ? (
        <Card.Img
          variant="top"
          src={getImageUrl(item.image_url)}
          alt={item.name}
          className="menu-card-img"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/180?text=Sin+Imagen";
          }}
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center bg-light"
          style={{
            height: "200px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <BiImage size={32} className="text-muted" />
        </div>
      )}

      <Card.Body className="menu-card-body">
        <h3 className="menu-card-title">{item.name}</h3>

        <div className="menu-card-desc">{item.description}</div>

        <div className="mt-auto">
          {item.ingredients && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`t-${item.id}`}>{item.ingredients}</Tooltip>}
            >
              <div className="menu-card-detail" style={{ cursor: "pointer" }}>
                <BiListUl /> <small>Ingredientes</small>
              </div>
            </OverlayTrigger>
          )}

          {item.estimated_prep_time && (
            <div className="menu-card-detail">
              <BiTime /> <small>{item.estimated_prep_time} min</small>
            </div>
          )}

          <div className="menu-divider"></div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="menu-price">
              ${parseFloat(item.price).toFixed(2)}
            </span>

            <span className="menu-status-flat status-available">
              Disponible
            </span>
          </div>

          <Button className="btn-menu-action w-100" onClick={handleAddToCart}>
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
