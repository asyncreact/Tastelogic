// src/pages/Dashboard.jsx
import { LuLayoutDashboard } from "react-icons/lu";
import { useEffect, useContext, useMemo, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Pagination,
  Carousel,
} from "react-bootstrap";

import { useAuth } from "../hooks/useAuth";
import { AiContext } from "../context/AiContext";
import { useMenu } from "../hooks/useMenu";
import MenuItemCard from "../components/MenuItemCard";

import {
  MdLocalFireDepartment,
  MdRecommend,
  MdTrendingUp,
} from "react-icons/md";
import { BiStar } from "react-icons/bi";

function Dashboard() {
  const { user } = useAuth();

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

  const ITEMS_PER_PAGE = 5;

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
    <Container className="py-4" style={{ maxWidth: "1280px" }}>
      {/* === ENCABEZADO CENTRADO === */}
      {/* Se cambió justify-content-between por justify-content-center */}
      <div className="d-flex flex-wrap justify-content-center align-items-center mb-5 gap-3">
        <div className="d-flex align-items-center">
          {/* Icono Dashboard con mismo tamaño/estilo que Menú */}
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
              ¿Qué se te antoja hoy? Aquí tienes recomendaciones basadas en tus
              pedidos.
            </small>
          </div>
        </div>
      </div>

      {/* --- TOP DEL DÍA (CON CARRUSEL) --- */}
      {todayTopItems.length > 0 && (
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              {/* ICONO CON DEGRADADO NARANJA */}
              <div
                className="icon-orange me-3"
                style={{ width: 56, height: 56 }}
              >
                <MdLocalFireDepartment size={28} />
              </div>

              <div>
                <small className="text-uppercase text-warning fw-bold d-block">
                  Top del día
                </small>
                <small className="text-muted">
                  Los platos más pedidos en las últimas órdenes.
                </small>
              </div>
            </div>

            <Carousel
              variant="dark"
              indicators={todayTopItems.length > 1}
              controls={todayTopItems.length > 1}
              interval={4000}
              className="pb-2"
            >
              {todayTopItems.map((item) => (
                <Carousel.Item key={item.id}>
                  <Row className="justify-content-center">
                    <Col md={8} lg={5}>
                      <MenuItemCard item={item} />
                    </Col>
                  </Row>
                </Carousel.Item>
              ))}
            </Carousel>
          </Card.Body>
        </Card>
      )}

      {/* GRID PRINCIPAL */}
      <Row className="g-4">
        {/* IZQUIERDA */}
        <Col lg={8}>
          {/* 1. TENDENCIAS & POPULARES */}
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white pt-4 px-4 card-section-header">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  {/* ICONO TENDENCIAS CON DEGRADADO NARANJA */}
                  <div
                    className="icon-orange me-3"
                    style={{ width: 48, height: 48 }}
                  >
                    <MdTrendingUp size={28} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark h6">Tendencias</h5>
                    <small className="text-muted">Lo más vendido</small>
                  </div>
                </div>
                <div>
                  <span className="text-muted">
                    <small>
                      Página {popularPage} de {getTotalPages(topSoldItems)}
                    </small>
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
                            <Badge bg="warning" text="dark">
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
                        onClick={() =>
                          setPopularPage((p) => Math.max(1, p - 1))
                        }
                      />
                      <Pagination.Item active>{popularPage}</Pagination.Item>
                      <Pagination.Next
                        disabled={
                          popularPage === getTotalPages(topSoldItems)
                        }
                        onClick={() =>
                          setPopularPage((p) =>
                            Math.min(getTotalPages(topSoldItems), p + 1)
                          )
                        }
                      />
                    </Pagination>
                  )}
                </>
              ) : (
                <p className="text-muted">No hay datos de tendencias hoy.</p>
              )}
            </Card.Body>
          </Card>

          {/* 2. ESPECIALES DE TEMPORADA */}
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white pt-4 px-4 card-section-header">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  {/* ICONO TEMPORADA CON DEGRADADO NARANJA */}
                  <div
                    className="icon-orange me-3"
                    style={{ width: 48, height: 48 }}
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
                  <span className="text-muted">
                    <small>
                      Página {seasonPage} de {getTotalPages(seasonTopItems)}
                    </small>
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
                        highlightBadge={<Badge bg="info">Season</Badge>}
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
                    onClick={() =>
                      setSeasonPage((p) => Math.max(1, p - 1))
                    }
                  />
                  <Pagination.Item active>{seasonPage}</Pagination.Item>
                  <Pagination.Next
                    disabled={seasonPage === getTotalPages(seasonTopItems)}
                    onClick={() =>
                      setSeasonPage((p) =>
                        Math.min(getTotalPages(seasonTopItems), p + 1)
                      )
                    }
                  />
                </Pagination>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* DERECHA */}
        <Col lg={4}>
          {/* 3. SUGERIDOS PARA TI */}
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white pt-4 px-4 card-section-header">
              <div className="d-flex align-items-center">
                {/* ICONO SUGERIDOS CON DEGRADADO NARANJA */}
                <div
                  className="icon-orange me-3"
                  style={{ width: 48, height: 48 }}
                >
                  <MdRecommend size={26} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 h6">Sugeridos</h5>
                  <small className="text-muted">Para ti</small>
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
    </Container>
  );
}

export default Dashboard;