import { Container } from "react-bootstrap";
import { LuLayoutDashboard } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import Ai from "../components/Ai";

function Dashboard() {
  const { user } = useAuth();

  return (
    <Container className="py-4 animate-fade-in" style={{ maxWidth: "1280px" }}>
      <div className="d-flex flex-wrap justify-content-center align-items-center mb-5 gap-3">
        <div className="d-flex align-items-center">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 me-3 shadow-sm icon-orange"
            style={{ width: 56, height: 56 }}
          >
            <LuLayoutDashboard size={28} />
          </div>
          <div>
            <h2 className="h4 mb-0 fw-bold text-dark">
              Hola, {user?.name ? user.name.split(" ")[0] : "visitante"}
            </h2>
            <small className="text-muted">
              ¿Qué se te antoja hoy? Aquí tienes recomendaciones para ti.
            </small>
          </div>
        </div>
      </div>

      <Ai />
    </Container>
  );
}

export default Dashboard;
