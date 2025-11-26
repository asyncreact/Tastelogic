import { useState } from "react";
import { Container, Card, Tabs, Tab } from "react-bootstrap";
import { MdEventNote, MdHistory } from "react-icons/md";
import { RxCalendar } from "react-icons/rx";
import NewReservationForm from "../components/NewReservationForm";
import ReservationHistory from "../components/ReservationHistory";
import "./css/Reservation.css";

function Reservations() {
  const [activeTab, setActiveTab] = useState("new");

  return (
    <div className="reservations-page">
      <Container fluid className="px-0">
        <div className="reservations-header">
          <h1 className="reservations-title">
            <RxCalendar className="me-2" />
            Reservas
          </h1>
          <p className="reservations-subtitle">
            Gestiona nuevas reservas y revisa el historial de manera rápida y elegante.
          </p>
        </div>

        <Card className="reservations-card-flat">
          <Card.Body className="reservations-card-body">
            <Tabs
              id="reservations-tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || "new")}
              className="reservations-tabs"
              justify
            >
              <Tab
                eventKey="new"
                title={
                  <span className="reservations-tab-label">
                    <MdEventNote />
                    Nueva reserva
                  </span>
                }
              >
                <div className="reservations-tab-content">
                  <NewReservationForm onSuccess={() => setActiveTab("history")} />
                </div>
              </Tab>

              <Tab
                eventKey="history"
                title={
                  <span className="reservations-tab-label">
                    <MdHistory />
                    Mis reservas
                  </span>
                }
              >
                <div className="reservations-tab-content">
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
