// src/pages/Reservations.jsx
import { useState } from "react";
import { Container, Card, Tabs, Tab } from "react-bootstrap";
import { MdEventNote, MdHistory } from "react-icons/md";
import { RxCalendar } from "react-icons/rx";
import NewReservationForm from "../components/NewReservationForm";
import ReservationHistory from "../components/ReservationHistory";

function Reservations() {
  const [activeTab, setActiveTab] = useState("new");

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container>
        {/* Encabezado */}
        <div className="mb-4">
          <h1 className="h3 d-flex align-items-center mb-2">
            <RxCalendar className="me-2" />
            Reservas
          </h1>
          <p className="text-muted mb-0">
            Gestiona nuevas reservas y revisa el historial de manera rápida y elegante.
          </p>
        </div>

        {/* Card con Tabs */}
        <Card className="shadow-sm">
          <Card.Body>
            <Tabs
              id="reservations-tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || "new")}
              justify
              className="mb-3"
            >
              <Tab
                eventKey="new"
                title={
                  <span className="d-flex align-items-center gap-1">
                    <MdEventNote />
                    <span>Nueva reserva</span>
                  </span>
                }
              >
                <div className="pt-3">
                  <NewReservationForm onSuccess={() => setActiveTab("history")} />
                </div>
              </Tab>

              <Tab
                eventKey="history"
                title={
                  <span className="d-flex align-items-center gap-1">
                    <MdHistory />
                    <span>Mis reservas</span>
                  </span>
                }
              >
                <div className="pt-3">
                  <ReservationHistory />
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Reservations;
