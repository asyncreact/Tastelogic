// src/pages/Orders.jsx
import { useState, useEffect } from "react";
import { Container, Card, Tabs, Tab } from "react-bootstrap";
import { MdShoppingCart, MdReceipt } from "react-icons/md";
import CartSection from "../components/CartSection";
import OrderHistory from "../components/OrderHistory";

function Orders() {
  const [activeTab, setActiveTab] = useState("cart");

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
          <h4 className="mb-0">Mis Pedidos</h4>
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab
              eventKey="cart"
              title={
                <span className="d-flex align-items-center">
                  <MdShoppingCart size={20} className="me-2" />
                  Mi Carrito
                </span>
              }
            >
              <CartSection />
            </Tab>
            <Tab
              eventKey="history"
              title={
                <span className="d-flex align-items-center">
                  <MdReceipt size={20} className="me-2" />
                  Historial de Órdenes
                </span>
              }
            >
              <OrderHistory />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Orders;
