// src/pages/Orders.jsx
import { useState } from "react";
import { Container, Tabs, Tab, Card } from "react-bootstrap";
import CartSection from "../components/CartSection";
import OrderHistory from "../components/OrderHistory";

// Iconos estilo App
import { MdOutlineReceiptLong, MdHistory } from "react-icons/md";
import { RiShoppingBag3Line } from "react-icons/ri";

function Orders() {
  const [activeTab, setActiveTab] = useState("cart");

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Container className="py-4" style={{ maxWidth: "1280px" }}>
        {/* === ENCABEZADO CON ICONO ESTILO APP === */}
        <div className="d-flex flex-wrap align-items-center mb-5 gap-3">
          {/* Caja de Icono Principal con degradado naranja */}
          <div
            className="d-flex align-items-center justify-content-center rounded-3 me-3 shadow-sm icon-orange"
            style={{ width: 56, height: 56 }}
          >
            <MdOutlineReceiptLong size={28} />
          </div>
          <div>
            <h2 className="h4 mb-0 fw-bold text-dark">Mis Pedidos</h2>
            <small className="text-muted">
              Administra tu carrito actual y revisa tu historial.
            </small>
          </div>
        </div>

        {/* === CONTENEDOR DE PESTAÑAS (Estilo Tarjeta) === */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-bottom-0 p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || "cart")}
              className="px-4 pt-3 border-bottom"
              id="orders-tabs"
            >
              <Tab
                eventKey="cart"
                title={
                  <span className="d-flex align-items-center gap-2 py-2">
                    <RiShoppingBag3Line size={18} /> Mi Carrito
                  </span>
                }
              />
              <Tab
                eventKey="history"
                title={
                  <span className="d-flex align-items-center gap-2 py-2">
                    <MdHistory size={20} /> Historial
                  </span>
                }
              />
            </Tabs>
          </Card.Header>

          <Card.Body className="p-4">
            {/* Renderizado Condicional del Contenido */}
            {activeTab === "cart" && (
              <div className="animate-fade-in">
                <CartSection />
              </div>
            )}

            {activeTab === "history" && (
              <div className="animate-fade-in">
                <OrderHistory />
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Orders;
