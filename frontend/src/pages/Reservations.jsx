// src/pages/Reservations.jsx
import { useState } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import NewReservationForm from "../components/NewReservationForm";
import ReservationHistory from "../components/ReservationHistory";

function Reservations() {
  const [activeTab, setActiveTab] = useState("new");

  return (
    <Container className="py-4 py-md-5">
      {/* Encabezado estilo Orders */}
      <div className="mb-4">
        <h3 className="mb-1">Mis reservas</h3>
        <small>
          Crea nuevas reservas y revisa el historial de tus visitas.
        </small>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key || "new")}
        className="mb-3"
      >
        <Tab eventKey="new" title="Nueva reserva">
          <div className="pt-3">
            <NewReservationForm onSuccess={() => setActiveTab("history")} />
          </div>
        </Tab>

        <Tab eventKey="history" title="Historial de reservas">
          <div className="pt-3">
            <ReservationHistory />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default Reservations;
