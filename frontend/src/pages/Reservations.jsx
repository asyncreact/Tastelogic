// src/pages/Reservations.jsx
import { useState } from "react";
import { Container, Tabs, Tab, Card } from "react-bootstrap";
import NewReservationForm from "../components/NewReservationForm";
import ReservationHistory from "../components/ReservationHistory";

import { IoCalendarNumberOutline } from "react-icons/io5";
import { MdHistory, MdAddCircleOutline } from "react-icons/md";

function Reservations() {
  const [activeTab, setActiveTab] = useState("new");

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Container className="py-4" style={{ maxWidth: "1280px" }}>

        <div className="d-flex flex-wrap justify-content-center align-items-center mb-5 gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm icon-orange"
            style={{ width: 56, height: 56 }}
          >
            <IoCalendarNumberOutline size={28} />
          </div>
          <div>
            <h2 className="h4 mb-0 fw-bold text-dark">Mis Reservas</h2>
            <small className="text-muted">
              Agenda tu visita o revisa tus reservas pasadas.
            </small>
          </div>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mx-auto" style={{ maxWidth: "1200px" }}>
          <Card.Header className="bg-white border-bottom-0 p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(key) => setActiveTab(key || "new")}
              className="px-4 pt-3 border-bottom justify-content-center"
              id="reservations-tabs"
            >
              <Tab
                eventKey="new"
                title={
                  <span className="d-flex align-items-center gap-2 py-2">
                    <MdAddCircleOutline size={20} /> Nueva Reserva
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

          <Card.Body className="p-4 d-flex justify-content-center">
            {activeTab === "new" && (
              <div className="animate-fade-in w-100" style={{ maxWidth: "800px" }}>
                <NewReservationForm onSuccess={() => setActiveTab("history")} />
              </div>
            )}

            {activeTab === "history" && (
              <div className="animate-fade-in w-100" style={{ maxWidth: "800px" }}>
                <ReservationHistory />
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Reservations;