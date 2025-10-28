// pages/customer/TablesCustomer.jsx
import { useState, useEffect, useCallback } from "react";
import CustomerLayout from "../../layouts/CustomerLayout";
import { useAuth } from "../../hooks/useAuth";
import { getZones, getTables } from "../../api/tables";
import {
  MdOutlineTableBar,
  MdOutlineMap,
  MdOutlinePeople,
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdArrowBack,
} from "react-icons/md";
import "./TablesCustomer.css";

// Constantes
const TABLE_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
};

export default function TablesCustomer() {
  const { user } = useAuth();
  const token = user?.token || localStorage.getItem("token");

  // Estados
  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  // ============================================================
  // EFECTOS
  // ============================================================

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // ============================================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [zonesRes, tablesRes] = await Promise.all([
        getZones(token),
        getTables(token),
      ]);

      const zonesData = zonesRes.data.data?.zones || zonesRes.data.zones || [];
      const tablesData = tablesRes.data.data?.tables || tablesRes.data.tables || [];

      // Solo zonas y mesas activas
      setZones(zonesData.filter((z) => z.is_active));
      setTables(tablesData.filter((t) => t.is_active));
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ============================================================
  // FUNCIONES AUXILIARES
  // ============================================================

  const getSelectedZoneData = useCallback(() => {
    if (!selectedZone) return null;
    
    const zone = zones.find((z) => z.id === selectedZone);
    const zoneTables = tables.filter((t) => t.zone_id === selectedZone);
    const availableTables = zoneTables.filter((t) => t.status === TABLE_STATUS.AVAILABLE);
    const occupiedTables = zoneTables.filter((t) => t.status === TABLE_STATUS.OCCUPIED);
    const reservedTables = zoneTables.filter((t) => t.status === TABLE_STATUS.RESERVED);

    return {
      zone,
      allTables: zoneTables,
      available: availableTables,
      occupied: occupiedTables,
      reserved: reservedTables,
    };
  }, [selectedZone, zones, tables]);

  // ============================================================
  // COMPONENTES AUXILIARES
  // ============================================================

  const SummaryCard = ({ icon: Icon, value, label }) => (
    <div className="tablescustomer-summary-card">
      <div className="tablescustomer-summary-icon">
        <Icon />
      </div>
      <div className="tablescustomer-summary-content">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );

  const ZoneCard = ({ zone }) => {
    const zoneTables = tables.filter((t) => t.zone_id === zone.id);
    const availableCount = zoneTables.filter((t) => t.status === TABLE_STATUS.AVAILABLE).length;
    const totalCapacity = zoneTables
      .filter((t) => t.status === TABLE_STATUS.AVAILABLE)
      .reduce((sum, t) => sum + t.capacity, 0);

    return (
      <div className="tablescustomer-zone-card" onClick={() => setSelectedZone(zone.id)}>
        <div className="tablescustomer-zone-image">
          {zone.image_url ? (
            <img src={zone.image_url} alt={zone.name} />
          ) : (
            <div className="tablescustomer-zone-placeholder">
              <MdOutlineMap />
            </div>
          )}
          <div className="tablescustomer-zone-badge">
            <MdCheckCircle />
            <span>{availableCount} disponibles</span>
          </div>
        </div>

        <div className="tablescustomer-zone-content">
          <h3>{zone.name}</h3>
          <p>{zone.description || "Zona del restaurante"}</p>

          <div className="tablescustomer-zone-info">
            <div className="tablescustomer-info-item">
              <MdOutlineTableBar />
              <span>{zoneTables.length} mesas</span>
            </div>
            <div className="tablescustomer-info-item">
              <MdOutlinePeople />
              <span>Hasta {totalCapacity} personas</span>
            </div>
          </div>

          <button className="tablescustomer-btn-explore">
            Ver mesas disponibles →
          </button>
        </div>
      </div>
    );
  };

  const TableCard = ({ table }) => (
    <div className={`tablescustomer-table-card ${table.status}`}>
      <div className="tablescustomer-table-number">{table.table_number}</div>

      <div className="tablescustomer-table-status">
        {table.status === TABLE_STATUS.AVAILABLE && (
          <>
            <MdCheckCircle className="tablescustomer-status-icon available" />
            <span className="tablescustomer-status-label">Disponible</span>
          </>
        )}
        {table.status === TABLE_STATUS.OCCUPIED && (
          <>
            <MdCancel className="tablescustomer-status-icon occupied" />
            <span className="tablescustomer-status-label">Ocupada</span>
          </>
        )}
        {table.status === TABLE_STATUS.RESERVED && (
          <>
            <MdAccessTime className="tablescustomer-status-icon reserved" />
            <span className="tablescustomer-status-label">Reservada</span>
          </>
        )}
      </div>

      <div className="tablescustomer-table-capacity">
        <MdOutlinePeople />
        <span>{table.capacity} personas</span>
      </div>
    </div>
  );

  const EmptyState = ({ icon: Icon, message }) => (
    <div className="tablescustomer-empty-state">
      <Icon className="tablescustomer-empty-icon" />
      <p>{message}</p>
    </div>
  );

  // ============================================================
  // RENDER
  // ============================================================

  const selectedZoneData = getSelectedZoneData();

  if (loading) {
    return (
      <CustomerLayout>
        <div className="tablescustomer-container">
          <div className="tablescustomer-loading">
            <div className="tablescustomer-spinner"></div>
            <p>Cargando instalaciones...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="tablescustomer-container">
        {/* Vista de zonas */}
        {!selectedZone && (
          <>
            <div className="tablescustomer-header">
              <h1>Nuestras Instalaciones</h1>
              <p>Selecciona una zona para ver las mesas disponibles</p>
            </div>

            {/* Resumen general */}
            <div className="tablescustomer-summary-cards">
              <SummaryCard
                icon={MdOutlineMap}
                value={zones.length}
                label="Zonas Disponibles"
              />
              <SummaryCard
                icon={MdOutlineTableBar}
                value={tables.filter((t) => t.status === TABLE_STATUS.AVAILABLE).length}
                label="Mesas Libres"
              />
              <SummaryCard
                icon={MdOutlinePeople}
                value={tables
                  .filter((t) => t.status === TABLE_STATUS.AVAILABLE)
                  .reduce((sum, t) => sum + t.capacity, 0)}
                label="Personas"
              />
            </div>

            {/* Grid de zonas */}
            {zones.length > 0 ? (
              <div className="tablescustomer-zones-grid">
                {zones.map((zone) => (
                  <ZoneCard key={zone.id} zone={zone} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MdOutlineMap}
                message="No hay zonas disponibles en este momento"
              />
            )}
          </>
        )}

        {/* Vista de mesas por zona */}
        {selectedZone && selectedZoneData && (
          <>
            <div className="tablescustomer-zone-detail-header">
              <button
                className="tablescustomer-btn-back"
                onClick={() => setSelectedZone(null)}
              >
                <MdArrowBack /> Volver a zonas
              </button>

              <div className="tablescustomer-zone-detail-info">
                <h1>{selectedZoneData.zone.name}</h1>
                <p>{selectedZoneData.zone.description}</p>
              </div>

              <div className="tablescustomer-zone-detail-stats">
                <div className="tablescustomer-stat-item success">
                  <MdCheckCircle />
                  <span>{selectedZoneData.available.length} Disponibles</span>
                </div>
                <div className="tablescustomer-stat-item warning">
                  <MdAccessTime />
                  <span>{selectedZoneData.reserved.length} Reservadas</span>
                </div>
                <div className="tablescustomer-stat-item danger">
                  <MdCancel />
                  <span>{selectedZoneData.occupied.length} Ocupadas</span>
                </div>
              </div>
            </div>

            {/* Grid de mesas */}
            {selectedZoneData.allTables.length > 0 ? (
              <div className="tablescustomer-tables-grid">
                {selectedZoneData.allTables.map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MdOutlineTableBar}
                message="Esta zona no tiene mesas configuradas"
              />
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
