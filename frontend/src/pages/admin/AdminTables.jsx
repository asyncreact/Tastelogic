// src/pages/admin/AdminTables.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, Tabs, Tab, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  MdTableRestaurant,
  MdAdd,
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdLocationOn,
  MdImage,
  MdCheckCircle,
  MdPeople
} from "react-icons/md";
import {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  getTables,
  createTable,
  updateTable,
  deleteTable
} from "../../api/tables";

function AdminTables() {
  const [activeTab, setActiveTab] = useState('tables');
  
  // Estados para mesas
  const [tables, setTables] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableForm, setTableForm] = useState({
    table_number: '',
    capacity: '',
    zone_id: '',
    status: 'available'
  });

  // Estados para zonas
  const [loadingZones, setLoadingZones] = useState(true);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    description: '',
    is_active: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Estados generales
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    loadZones();
    loadTables();
  }, []);

  const loadZones = async () => {
    try {
      setLoadingZones(true);
      const response = await getZones();
      let zonesData = response.data?.zones || response.data?.data || [];
      if (!Array.isArray(zonesData)) zonesData = [];
      setZones(zonesData);
    } catch (err) {
      setError('Error al cargar zonas');
      console.error(err);
      setZones([]);
    } finally {
      setLoadingZones(false);
    }
  };

  const loadTables = async () => {
    try {
      setLoadingTables(true);
      const response = await getTables();
      let tablesData = response.data?.tables || response.data?.data || [];
      if (!Array.isArray(tablesData)) tablesData = [];
      setTables(tablesData);
    } catch (err) {
      setError('Error al cargar mesas');
      console.error(err);
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  // ============ ZONAS ============
  const handleZoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingZone) {
        await updateZone(editingZone.id, zoneForm);
        setSuccess('Zona actualizada exitosamente');
      } else {
        await createZone(zoneForm);
        setSuccess('Zona creada exitosamente');
      }
      setShowZoneModal(false);
      setZoneForm({ name: '', description: '', is_active: true, image: null });
      setImagePreview(null);
      setEditingZone(null);
      loadZones();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar zona');
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      description: zone.description || '',
      is_active: zone.is_active,
      image: null
    });
    if (zone.image_url) {
      setImagePreview(getImageUrl(zone.image_url));
    }
    setShowZoneModal(true);
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta zona?')) return;
    try {
      await deleteZone(zoneId);
      setSuccess('Zona eliminada exitosamente');
      loadZones();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar zona');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setZoneForm({ ...zoneForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ============ MESAS ============
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingTable) {
        await updateTable(editingTable.id, tableForm);
        setSuccess('Mesa actualizada exitosamente');
      } else {
        await createTable(tableForm);
        setSuccess('Mesa creada exitosamente');
      }
      setShowTableModal(false);
      setTableForm({
        table_number: '',
        capacity: '',
        zone_id: '',
        status: 'available'
      });
      setEditingTable(null);
      loadTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar mesa');
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setTableForm({
      table_number: table.table_number,
      capacity: table.capacity,
      zone_id: table.zone_id,
      status: table.status
    });
    setShowTableModal(true);
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta mesa?')) return;
    try {
      await deleteTable(tableId);
      setSuccess('Mesa eliminada exitosamente');
      loadTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar mesa');
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${API_URL}${cleanPath}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { bg: 'success', text: 'Disponible' },
      occupied: { bg: 'danger', text: 'Ocupada' },
      reserved: { bg: 'warning', text: 'Reservada' },
      maintenance: { bg: 'secondary', text: 'Mantenimiento' }
    };
    return badges[status] || { bg: 'secondary', text: status };
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0">
        <Card.Header 
          className="text-white border-0" 
          style={{ 
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            padding: '1.5rem'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <MdTableRestaurant size={32} className="me-2" />
              <h4 className="mb-0">Gestión de Mesas y Zonas</h4>
            </div>
            <Button 
              as={Link} 
              to="/admin/dashboard" 
              variant="light" 
              size="sm"
              className="d-flex align-items-center"
            >
              <MdArrowBack size={18} className="me-1" />
              Volver
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            {/* TAB DE MESAS */}
            <Tab 
              eventKey="tables" 
              title={
                <span className="d-flex align-items-center">
                  <MdTableRestaurant size={18} className="me-2" />
                  Mesas
                </span>
              }
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Lista de Mesas</h5>
                <Button 
                  style={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#1f2937'
                  }}
                  onClick={() => {
                    setEditingTable(null);
                    setTableForm({
                      table_number: '',
                      capacity: '',
                      zone_id: '',
                      status: 'available'
                    });
                    setShowTableModal(true);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                  className="d-flex align-items-center"
                >
                  <MdAdd size={20} className="me-1" />
                  Agregar Mesa
                </Button>
              </div>

              {loadingTables ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: '#1f2937' }} />
                </div>
              ) : tables.length === 0 ? (
                <Alert variant="info">No hay mesas registradas.</Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead style={{ backgroundColor: '#f3f4f6' }}>
                    <tr>
                      <th>ID</th>
                      <th>N° Mesa</th>
                      <th>Zona</th>
                      <th>Capacidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table) => (
                      <tr key={table.id}>
                        <td>{table.id}</td>
                        <td><strong>Mesa {table.table_number}</strong></td>
                        <td>{zones.find(z => z.id === table.zone_id)?.name || 'N/A'}</td>
                        <td>
                          <MdPeople size={16} className="me-1" />
                          {table.capacity} personas
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(table.status).bg}>
                            {getStatusBadge(table.status).text}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="warning" 
                            size="sm" 
                            className="me-2" 
                            onClick={() => handleEditTable(table)}
                          >
                            <MdEdit size={16} />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteTable(table.id)}
                          >
                            <MdDelete size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            {/* TAB DE ZONAS */}
            <Tab 
              eventKey="zones" 
              title={
                <span className="d-flex align-items-center">
                  <MdLocationOn size={18} className="me-2" />
                  Zonas
                </span>
              }
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Lista de Zonas</h5>
                <Button 
                  style={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#1f2937'
                  }}
                  onClick={() => {
                    setEditingZone(null);
                    setZoneForm({ name: '', description: '', is_active: true, image: null });
                    setImagePreview(null);
                    setShowZoneModal(true);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                  className="d-flex align-items-center"
                >
                  <MdAdd size={20} className="me-1" />
                  Agregar Zona
                </Button>
              </div>

              {loadingZones ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: '#1f2937' }} />
                </div>
              ) : zones.length === 0 ? (
                <Alert variant="info">No hay zonas registradas.</Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead style={{ backgroundColor: '#f3f4f6' }}>
                    <tr>
                      <th>ID</th>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => (
                      <tr key={zone.id}>
                        <td>{zone.id}</td>
                        <td>
                          {zone.image_url ? (
                            <Image 
                              src={getImageUrl(zone.image_url)} 
                              alt={zone.name}
                              rounded
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              onError={(e) => e.target.src = 'https://via.placeholder.com/60?text=Sin+Imagen'}
                            />
                          ) : (
                            <div 
                              className="bg-secondary text-white rounded d-flex align-items-center justify-content-center" 
                              style={{ width: '60px', height: '60px' }}
                            >
                              <MdImage size={24} />
                            </div>
                          )}
                        </td>
                        <td>{zone.name}</td>
                        <td>{zone.description || '-'}</td>
                        <td>
                          <Badge bg={zone.is_active ? 'success' : 'secondary'}>
                            {zone.is_active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="warning" 
                            size="sm" 
                            className="me-2" 
                            onClick={() => handleEditZone(zone)}
                          >
                            <MdEdit size={16} />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteZone(zone.id)}
                          >
                            <MdDelete size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* MODAL DE MESA */}
      <Modal show={showTableModal} onHide={() => setShowTableModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <MdTableRestaurant size={24} className="me-2" />
            {editingTable ? 'Editar Mesa' : 'Agregar Mesa'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleTableSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Número de Mesa *</Form.Label>
              <Form.Control
                type="text"
                value={tableForm.table_number}
                onChange={(e) => setTableForm({ ...tableForm, table_number: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacidad *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={tableForm.capacity}
                onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Zona *</Form.Label>
              <Form.Select
                value={tableForm.zone_id}
                onChange={(e) => setTableForm({ ...tableForm, zone_id: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estado *</Form.Label>
              <Form.Select
                value={tableForm.status}
                onChange={(e) => setTableForm({ ...tableForm, status: e.target.value })}
                required
              >
                <option value="available">Disponible</option>
                <option value="occupied">Ocupada</option>
                <option value="reserved">Reservada</option>
                <option value="maintenance">Mantenimiento</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTableModal(false)}>
              Cancelar
            </Button>
            <Button 
              style={{ 
                backgroundColor: '#1f2937', 
                borderColor: '#1f2937'
              }}
              type="submit"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
              className="d-flex align-items-center"
            >
              <MdCheckCircle size={18} className="me-1" />
              {editingTable ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL DE ZONA */}
      <Modal show={showZoneModal} onHide={() => setShowZoneModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <MdLocationOn size={24} className="me-2" />
            {editingZone ? 'Editar Zona' : 'Agregar Zona'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleZoneSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={zoneForm.description}
                onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imagen</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              <Form.Text className="text-muted">
                Formatos aceptados: JPG, PNG. Máx 5MB
              </Form.Text>
              {imagePreview && (
                <div className="mt-3">
                  <p className="mb-2"><strong>Vista previa:</strong></p>
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    rounded 
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} 
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Zona activa"
                checked={zoneForm.is_active}
                onChange={(e) => setZoneForm({ ...zoneForm, is_active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => { 
                setShowZoneModal(false); 
                setImagePreview(null); 
              }}
            >
              Cancelar
            </Button>
            <Button 
              style={{ 
                backgroundColor: '#1f2937', 
                borderColor: '#1f2937'
              }}
              type="submit"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
              className="d-flex align-items-center"
            >
              <MdCheckCircle size={18} className="me-1" />
              {editingZone ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminTables;
