// src/pages/Dashboard.jsx
import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const { user } = useAuth();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="text-center shadow">
            <Card.Body>
              <h3>Bienvenido, {user?.name || "usuario"}!</h3>
              <p>Este es tu panel de control.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
