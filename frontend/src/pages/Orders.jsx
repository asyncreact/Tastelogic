import { useState } from "react";
import { Container, Tabs, Tab, Card } from "react-bootstrap";
import CartSection from "../components/CartSection";
import OrderHistory from "../components/OrderHistory";

import { MdOutlineReceiptLong, MdHistory } from "react-icons/md";
import { RiShoppingBag3Line } from "react-icons/ri";

function Orders() {
  const [activeTab, setActiveTab] = useState("cart");

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Container className="pt-4" style={{ maxWidth: "1280px" }}>
        <div className="d-flex flex-wrap justify-content-center align-items-center mb-4 gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm icon-orange"
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

        <Card
          className="border-0 shadow-sm rounded-4 overflow-hidden mx-auto"
          style={{ maxWidth: "1200px" }}
        >
          <Card.Header className="bg-white border-bottom-0 p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || "cart")}
              className="px-4 pt-3 border-bottom justify-content-center"
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

          <Card.Body
            className="p-4 d-flex justify-content-center align-items-center"
            style={{ minHeight: "320px" }}
          >
            {activeTab === "cart" && (
              <div className="animate-fade-in w-100" style={{ maxWidth: "800px" }}>
                <CartSection />
              </div>
            )}

            {activeTab === "history" && (
              <div className="animate-fade-in w-100" style={{ maxWidth: "800px" }}>
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
