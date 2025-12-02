// src/pages/Orders.jsx
import { useState } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import CartSection from "../components/CartSection";
import OrderHistory from "../components/OrderHistory";

function Orders() {
  const [activeTab, setActiveTab] = useState("cart");

  return (
    <Container className="py-4 py-md-5">
      <div className="mb-4">
        <h3 className="mb-1">Mis pedidos</h3>
        <small>
          Administra tu carrito actual y revisa el historial de órdenes.
        </small>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || "cart")}
        className="mb-3"
      >
        <Tab eventKey="cart" title="Mi carrito">
          <div className="pt-3">
            <CartSection />
          </div>
        </Tab>
        <Tab eventKey="history" title="Historial de órdenes">
          <div className="pt-3">
            <OrderHistory />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default Orders;
