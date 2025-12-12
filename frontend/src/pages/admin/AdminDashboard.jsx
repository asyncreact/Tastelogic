import { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
  Tabs,
  Tab,
  ProgressBar,
} from "react-bootstrap";
import {
  LuLayoutDashboard,
  LuTrendingUp,
  LuBrainCircuit,
  LuCalendarCheck,
  LuFilter,
} from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";
import { AiContext } from "../../context/AiContext";

function money(n) {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(v);
}

const IconContainer = ({ children }) => (
  <div
    className="icon-orange shadow-sm rounded-circle me-3 flex-shrink-0"
    style={{
      width: 48,
      height: 48,
      color: "#fff",
      boxShadow: "0 4px 10px rgba(255, 122, 24, 0.3)",
      minWidth: 48,
    }}
  >
    {children}
  </div>
);

const TabTitle = ({ icon: Icon, text, rotateIcon = false }) => (
  <div className="d-flex align-items-center gap-2">
    <div style={rotateIcon ? { transform: "rotate(-45deg)", display: "flex" } : { display: "flex" }}>
      <Icon size={20} />
    </div>
    <span className="fw-bold" style={{ fontSize: "1rem" }}>
      {text}
    </span>
  </div>
);

const ConfidenceBadge = ({ score }) => {
  let val = Number(score || 0);
  if (val <= 1.0 && val > 0) val = val * 100;
  const formatted = val.toFixed(2);

  let variant = "danger";
  if (val >= 80) variant = "success";
  else if (val >= 50) variant = "warning";

  return (
    <div className="d-flex align-items-center gap-2" style={{ minWidth: "100px" }}>
      <ProgressBar
        now={val}
        variant={variant}
        style={{ height: "6px", width: "100%", backgroundColor: "#e9ecef" }}
        className="rounded-pill"
      />
      <small className="fw-bold text-muted" style={{ fontSize: "0.75rem" }}>
        {formatted}%
      </small>
    </div>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const {
    topSold,
    todayTop,
    topPredicted,
    seasonTop,
    seasonFilter,
    loading,
    error,
    fetchTopSold,
    fetchTodayTop,
    fetchTopPredicted,
    fetchSeasonTop,
    clearError,
  } = useContext(AiContext);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [season, setSeason] = useState(seasonFilter || "winter");
  const [key, setKey] = useState("overview");

  const dateParams = useMemo(() => {
    const params = {};
    if (fromDate) params.fromdate = fromDate;
    if (toDate) params.todate = toDate;
    return params;
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchTodayTop();
    fetchTopSold();
    fetchTopPredicted();
    fetchSeasonTop(season);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAll = async () => {
    await Promise.all([
      fetchTodayTop(),
      fetchTopSold(dateParams),
      fetchTopPredicted(dateParams),
      fetchSeasonTop(season),
    ]);
  };

  return (
    <Container
      className="py-5 animate-fade-in d-flex flex-column justify-content-center"
      style={{ maxWidth: "1280px", minHeight: "100vh" }}
    >
      <style>
        {`
          .custom-underline-tabs {
            border-bottom: 2px solid #f3f4f6;
            justify-content: center;
            margin-bottom: 2rem;
          }

          .custom-underline-tabs .nav-link {
            border: none;
            border-bottom: 3px solid transparent;
            background: transparent !important;
            color: #9CA3AF !important;
            border-radius: 0 !important;
            padding: 1rem 2rem;
            transition: all 0.2s ease;
            margin-bottom: -2px;
          }

          .custom-underline-tabs .nav-link:hover {
            color: #ff7a18 !important;
          }

          .custom-underline-tabs .nav-link.active {
            color: #ff7a18 !important;
            border-bottom: 3px solid #ff7a18 !important;
            background: transparent !important;
            font-weight: 700;
          }
        `}
      </style>

      <div className="d-flex flex-wrap justify-content-between align-items-end mb-5 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-orange shadow-sm rounded-3" style={{ width: 56, height: 56 }}>
            <LuLayoutDashboard size={28} />
          </div>
          <div>
            <h2 className="h4 mb-0 fw-bold text-dark">Panel Admin</h2>
            <small className="text-muted">
              Bienvenido, {user?.name ? user.name.split(" ")[0] : "Administrador"}.
            </small>
          </div>
        </div>
        <div className="d-none d-md-block text-end">
          <span className="text-muted small fw-bold text-uppercase ls-1">
            {new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={clearError} className="mb-4 shadow-sm rounded-4 border-0">
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm rounded-4 mb-5">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-3">
            <LuFilter className="text-orange me-2" />
            <h6 className="mb-0 fw-bold text-dark">Filtros de Análisis</h6>
          </div>

          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="small text-muted fw-bold">Desde</Form.Label>
              <Form.Control
                type="date"
                className="border-light bg-light rounded-3 px-3 shadow-none"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Label className="small text-muted fw-bold">Hasta</Form.Label>
              <Form.Control
                type="date"
                className="border-light bg-light rounded-3 px-3 shadow-none"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Label className="small text-muted fw-bold">Temporada (IA)</Form.Label>
              <Form.Select
                className="border-light bg-light rounded-3 px-3 shadow-none"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                <option value="spring">Primavera</option>
                <option value="summer">Verano</option>
                <option value="fall">Otoño</option>
                <option value="winter">Invierno</option>
              </Form.Select>
            </Col>

            <Col md={3} className="d-grid">
              <Button onClick={refreshAll} disabled={loading} variant="primary" className="rounded-3 fw-bold border-0">
                {loading ? <Spinner size="sm" animation="border" /> : "Actualizar"}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4 mb-5">
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <IconContainer>
                    <LuCalendarCheck size={24} />
                  </IconContainer>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark h6">Ventas Hoy</h5>
                    <small className="text-muted">Tiempo Real</small>
                  </div>
                </div>
                <Badge bg="white" className="text-orange border rounded-pill px-3 shadow-sm">
                  LIVE
                </Badge>
              </div>

              {todayTop && todayTop.length > 0 ? (
                <div>
                  <h2 className="display-6 fw-bold mb-1 text-orange">
                    {todayTop[0].totalquantity} <span className="fs-5 text-muted fw-normal">un.</span>
                  </h2>
                  <div className="text-truncate fw-semibold text-dark mb-2">{todayTop[0].itemname}</div>

                  <div className="mt-3 pt-3 border-top border-light">
                    {todayTop.slice(0, 3).map((t, i) => (
                      <div key={i} className="d-flex justify-content-between align-items-center mb-1 small">
                        <span className="text-muted text-truncate" style={{ maxWidth: "70%" }}>
                          {i + 1}. {t.itemname}
                        </span>
                        <span className="fw-bold text-dark">{t.totalquantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-muted">Sin datos hoy</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <IconContainer>
                    <LuTrendingUp size={24} />
                  </IconContainer>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark h6">Top Histórico</h5>
                    <small className="text-muted">Rango seleccionado</small>
                  </div>
                </div>
              </div>

              {topSold && topSold.length > 0 ? (
                <div>
                  <h2 className="display-6 fw-bold mb-1 text-orange">{money(topSold[0].totalsales)}</h2>
                  <div className="text-truncate fw-semibold text-dark mb-2">{topSold[0].itemname}</div>
                  <div className="mt-3 text-muted small">
                    <span className="fw-bold text-orange">{topSold[0].totalquantity}</span> unidades vendidas.
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-muted">Sin datos</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100" style={{ background: "linear-gradient(145deg, #ffffff, #fff7ed)" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <IconContainer>
                    <LuBrainCircuit size={24} />
                  </IconContainer>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark h6">IA Predictiva</h5>
                    <small className="text-muted">Tendencia Futura</small>
                  </div>
                </div>
                <Badge bg="white" className="text-orange border rounded-pill px-3 shadow-sm">
                  IA
                </Badge>
              </div>

              {topPredicted && topPredicted.length > 0 ? (
                <div>
                  <h2 className="display-6 fw-bold mb-1 text-orange">
                    {topPredicted[0].totalpredicted} <span className="fs-5 text-muted fw-normal">est.</span>
                  </h2>
                  <div className="text-truncate fw-semibold text-dark mb-2">{topPredicted[0].itemname}</div>
                  <div className="mt-3">
                    <ConfidenceBadge score={topPredicted[0].avgconfidence} />
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-muted">Calculando...</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="custom-underline-tabs" variant="tabs">
        <Tab eventKey="overview" title={<TabTitle icon={LuBrainCircuit} text="Predicciones IA" rotateIcon={true} />}>
          <Row className="g-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-white pt-4 px-4 border-0">
                  <div className="d-flex align-items-center">
                    <IconContainer>
                      <div style={{ transform: "rotate(-45deg)", display: "flex" }}>
                        <LuBrainCircuit size={24} />
                      </div>
                    </IconContainer>
                    <div>
                      <h5 className="fw-bold mb-0 text-dark h6">Demanda Prevista</h5>
                      <small className="text-muted">Análisis de próximos días</small>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="p-4">
                  <Table hover className="align-middle mb-0" responsive>
                    <thead className="text-muted small text-uppercase">
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th className="text-center">Confianza</th>
                        <th className="text-end">Predicción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(topPredicted || []).slice(0, 10).map((r, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold text-muted">{idx + 1}</td>
                          <td>
                            <div className="fw-semibold text-dark">{r.itemname}</div>
                            <small className="text-muted">{money(r.price)}</small>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center">
                              <ConfidenceBadge score={r.avgconfidence} />
                            </div>
                          </td>
                          <td className="text-end">
                            <span className="badge bg-white text-orange border px-3 py-2 rounded-pill shadow-sm">
                              {r.totalpredicted} un.
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!topPredicted?.length && (
                        <tr>
                          <td colSpan={4} className="text-center py-5 text-muted">
                            Sin datos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-white pt-4 px-4 border-0">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <IconContainer>
                        <LuCalendarCheck size={24} />
                      </IconContainer>
                      <div>
                        <h5 className="fw-bold mb-0 text-dark h6">Temporada</h5>
                        <small className="text-muted text-capitalize">{season}</small>
                      </div>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="p-4">
                  <div className="d-flex flex-column gap-3">
                    {(seasonTop || []).slice(0, 6).map((r, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border border-light">
                        <div className="d-flex align-items-center gap-3 overflow-hidden">
                          <span className="fw-bold text-muted small">#{idx + 1}</span>
                          <div className="text-truncate fw-semibold text-dark">{r.itemname}</div>
                        </div>
                        <Badge bg="white" className="text-orange border shadow-sm">
                          {r.totalpredicted}
                        </Badge>
                      </div>
                    ))}
                    {!seasonTop?.length && <div className="text-center text-muted py-4">Sin datos de temporada.</div>}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="sales" title={<TabTitle icon={LuTrendingUp} text="Ventas Reales" />}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white pt-4 px-4 border-0">
              <div className="d-flex align-items-center">
                <IconContainer>
                  <LuTrendingUp size={24} />
                </IconContainer>
                <div>
                  <h5 className="fw-bold mb-0 text-dark h6">Ventas Realizadas</h5>
                  <small className="text-muted">Datos históricos confirmados</small>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              <Table hover className="align-middle mb-0" responsive>
                <thead className="text-muted small text-uppercase">
                  <tr>
                    <th>Ranking</th>
                    <th>Producto</th>
                    <th className="text-end">Precio</th>
                    <th className="text-end">Cantidad</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(topSold || []).map((r, idx) => (
                    <tr key={idx}>
                      <td>
                        <Badge
                          bg="white"
                          className={`rounded-circle p-2 border ${idx < 3 ? "text-orange shadow-sm" : "text-muted"}`}
                          style={{ width: 30, height: 30 }}
                        >
                          {idx + 1}
                        </Badge>
                      </td>
                      <td className="fw-semibold text-dark">{r.itemname}</td>
                      <td className="text-end text-muted">{money(r.price)}</td>
                      <td className="text-end fw-bold text-dark">{r.totalquantity}</td>
                      <td className="text-end text-orange fw-bold">{money(r.totalsales)}</td>
                    </tr>
                  ))}
                  {!topSold?.length && (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        Sin ventas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
}
