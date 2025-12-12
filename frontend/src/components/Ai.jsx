// src/components/Ai.jsx
import { useEffect, useContext, useMemo, useState } from "react";
import { Row, Col, Card, Badge, Pagination, Carousel } from "react-bootstrap";
import {
  MdLocalFireDepartment,
  MdRecommend,
  MdTrendingUp,
} from "react-icons/md";
import { BiStar } from "react-icons/bi";
import { AiContext } from "../context/AiContext";
import { useMenu } from "../hooks/useMenu";
import MenuItemCard from "./MenuItemCard";
import "./css/Ai.css";

function Ai() {
  const {
    topSold,
    todayTop,
    topPredicted,
    seasonTop,
    seasonFilter,
    fetchTopSold,
    fetchTodayTop,
    fetchTopPredicted,
    fetchSeasonTop,
    loading,
  } = useContext(AiContext);

  const { items, fetchItems } = useMenu();

  const [popularPage, setPopularPage] = useState(1);
  const [seasonPage, setSeasonPage] = useState(1);

  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    fetchItems();
    fetchTodayTop();
    fetchTopSold();
    fetchTopPredicted();
    fetchSeasonTop("winter");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSeasonName = (filter) => {
    const map = {
      winter: "Invierno",
      summer: "Verano",
      spring: "Primavera",
      autumn: "Otoño",
    };
    return map[filter] || filter || "Actual";
  };

  const itemById = useMemo(() => {
    const map = new Map();
    items.forEach((it) => map.set(Number(it.id), it));
    return map;
  }, [items]);

  const todayTopItems = useMemo(() => {
    if (!todayTop) return [];
    if (Array.isArray(todayTop)) {
      return todayTop
        .slice(0, 3)
        .map((r) => itemById.get(Number(r.menuitemid)))
        .filter(Boolean);
    }
    const item = itemById.get(Number(todayTop.menuitemid));
    return item ? [item] : [];
  }, [todayTop, itemById]);

  const topSoldItems = useMemo(
    () =>
      topSold
        .map((r) => itemById.get(Number(r.menuitemid)))
        .filter(Boolean),
    [topSold, itemById]
  );

  const topPredictedItems = useMemo(
    () =>
      topPredicted
        .map((r) => itemById.get(Number(r.menuitemid)))
        .filter(Boolean),
    [topPredicted, itemById]
  );

  const seasonTopItems = useMemo(
    () =>
      seasonTop
        .map((r) => itemById.get(Number(r.menuitemid)))
        .filter(Boolean),
    [seasonTop, itemById]
  );

  const paginate = (list, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return list.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalPages = (list) =>
    list.length === 0 ? 1 : Math.ceil(list.length / ITEMS_PER_PAGE);

  return (
    <>
      {todayTopItems.length > 0 && (
        <Card className="border-0 shadow-sm rounded-4 mb-5 overflow-hidden hero-card-container">
          <div style={{ backgroundColor: "#fcfcfc" }}> 
            <Card.Body className="p-0">
              <Carousel
                variant="dark"
                indicators={todayTopItems.length > 1}
                controls={todayTopItems.length > 1}
                interval={5000}
                className="custom-hero-carousel h-100"
              >
                {todayTopItems.map((item, index) => (
                  <Carousel.Item key={item.id} className="h-100">
                    <div className="p-4 py-lg-5 px-lg-5 h-100 d-flex align-items-center">
                      <Row className="align-items-center g-4 w-100 mx-0">
                        <Col md={6} lg={7} className="text-start ps-lg-5">
                          <div className="d-inline-flex align-items-center mb-3 bg-white px-3 py-2 rounded-pill shadow-sm border">
                            <MdLocalFireDepartment className="text-danger me-2" size={20} />
                            <span className="fw-bold text-dark small text-uppercase ls-1">
                              Top del día #{index + 1}
                            </span>
                          </div>
                          
                          <h2 className="display-5 fw-bolder mb-3 text-dark" style={{ letterSpacing: '-1px' }}>
                            {item.name || "Plato destacado"}
                          </h2>
                          
                          <p className="lead text-muted mb-4 fs-5" style={{ maxWidth: "90%", fontWeight: "400" }}>
                            {item.description || "Delicioso plato recomendado."}
                          </p>

                          <div className="d-flex align-items-center gap-3">
                             <Badge bg="light" text="dark" className="px-3 py-2 fw-normal rounded-2 border">
                                MÁS VENDIDO HOY
                             </Badge>
                             <span className="text-muted small fw-semibold">
                               <BiStar className="text-warning mb-1 me-1" size={18} /> Recomendado por la IA
                             </span>
                          </div>
                        </Col>

                        <Col md={6} lg={5} className="pe-lg-5">
                          <div className="position-relative" style={{ zIndex: 1 }}>
                             
                             <MenuItemCard item={item} />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card.Body>
          </div>
        </Card>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white pt-4 px-4 card-section-header border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div
                    className="icon-container me-3 d-flex align-items-center justify-content-center shadow-sm rounded-circle"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      backgroundImage: 'var(--btn-orange-1)',
                      color: '#fff', // Icono blanco
                      boxShadow: '0 4px 10px rgba(255, 122, 24, 0.3)'
                    }}
                  >
                    <MdTrendingUp size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark h6">Tendencias</h5>
                    <small className="text-muted">Lo más vendido globalmente</small>
                  </div>
                </div>
                <div>
                  <span className="text-muted small">
                    Página {popularPage} de {getTotalPages(topSoldItems)}
                  </span>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              {loading && <p>Cargando menú...</p>}
              {topSoldItems.length > 0 ? (
                <>
                  <Row className="g-3 mb-3">
                    {paginate(topSoldItems, popularPage).map((item) => (
                      <Col md={6} key={item.id}>
                        <MenuItemCard
                          item={item}
                          highlightBadge={
                            <Badge bg="warning" text="dark" className="rounded-1">
                              Popular
                            </Badge>
                          }
                        />
                      </Col>
                    ))}
                  </Row>

                  {topSoldItems.length > ITEMS_PER_PAGE && (
                    <Pagination className="justify-content-center custom-pagination mb-0">
                      <Pagination.Prev
                        disabled={popularPage === 1}
                        onClick={() => setPopularPage((p) => Math.max(1, p - 1))}
                      />
                      <Pagination.Item active>{popularPage}</Pagination.Item>
                      <Pagination.Next
                        disabled={popularPage === getTotalPages(topSoldItems)}
                        onClick={() => setPopularPage((p) => Math.min(getTotalPages(topSoldItems), p + 1))}
                      />
                    </Pagination>
                  )}
                </>
              ) : (
                <p className="text-muted">No hay datos de tendencias hoy.</p>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white pt-4 px-4 card-section-header border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div
                    className="icon-container me-3 d-flex align-items-center justify-content-center shadow-sm rounded-circle"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      backgroundImage: 'var(--btn-orange-1)',
                      color: '#fff',
                      boxShadow: '0 4px 10px rgba(255, 122, 24, 0.3)' 
                    }}
                  >
                    <BiStar size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark h6">Temporada</h5>
                    <small className="text-muted text-capitalize">
                      {getSeasonName(seasonFilter)}
                    </small>
                  </div>
                </div>
                <div>
                  <span className="text-muted small">
                    Página {seasonPage} de {getTotalPages(seasonTopItems)}
                  </span>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              <Row className="g-3 mb-3">
                {seasonTopItems.length > 0 ? (
                  paginate(seasonTopItems, seasonPage).map((item) => (
                    <Col md={6} key={item.id}>
                      <MenuItemCard
                        item={item}
                        highlightBadge={<Badge bg="info" className="text-white rounded-1">Season</Badge>}
                        SeasonBadge
                      />
                    </Col>
                  ))
                ) : (
                  <Col>
                    <p className="text-muted">
                      No hay especiales de temporada.
                    </p>
                  </Col>
                )}
              </Row>

              {seasonTopItems.length > ITEMS_PER_PAGE && (
                <Pagination className="justify-content-center custom-pagination mb-0">
                  <Pagination.Prev
                    disabled={seasonPage === 1}
                    onClick={() => setSeasonPage((p) => Math.max(1, p - 1))}
                  />
                  <Pagination.Item active>{seasonPage}</Pagination.Item>
                  <Pagination.Next
                    disabled={seasonPage === getTotalPages(seasonTopItems)}
                    onClick={() => setSeasonPage((p) => Math.min(getTotalPages(seasonTopItems), p + 1))}
                  />
                </Pagination>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white pt-4 px-4 card-section-header border-0">
              <div className="d-flex align-items-center">
                <div
                  className="icon-container me-3 d-flex align-items-center justify-content-center shadow-sm rounded-circle"
                  style={{ 
                    width: 48, 
                    height: 48, 
                    backgroundImage: 'var(--btn-orange-1)',
                    color: '#fff',
                    boxShadow: '0 4px 10px rgba(255, 122, 24, 0.3)'
                  }}
                >
                  <MdRecommend size={24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 h6">Sugeridos</h5>
                  <small className="text-muted">Selección de la IA</small>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              {topPredictedItems.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {topPredictedItems.slice(0, 5).map((item) => (
                    <div key={item.id}>
                      <MenuItemCard item={item} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">
                  Aún estamos aprendiendo tus gustos.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Ai;