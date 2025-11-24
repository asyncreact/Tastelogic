// src/pages/Reservations.jsx
import { useState } from "react";
import { Container, Card, Tabs, Tab } from "react-bootstrap";
import { MdEventNote, MdHistory } from "react-icons/md";
import NewReservationForm from "../components/NewReservationForm";
import ReservationHistory from "../components/ReservationHistory";

function Reservations() {
  const [activeTab, setActiveTab] = useState("new");

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
          <h4 className="mb-0">Reservas</h4>
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab
              eventKey="new"
              title={
                <span className="d-flex align-items-center">
                  <MdEventNote size={20} className="me-2" />
                  Nueva Reserva
                </span>
              }
            >
              <NewReservationForm onSuccess={() => setActiveTab("history")} />
            </Tab>
            <Tab
              eventKey="history"
              title={
                <span className="d-flex align-items-center">
                  <MdHistory size={20} className="me-2" />
                  Mis Reservas
                </span>
              }
            >
              <ReservationHistory />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Reservations;
