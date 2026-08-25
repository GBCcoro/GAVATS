/**
 * ============================================
 * ADMIN CATEGORÍAS PAGE
 * ============================================
 * Gestión CRUD de categorías
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { exportarCategoriasAPDF, exportarCategoriasAExcel } from '../../utils/exportUtils';
import SvgIcon from '../../components/SvgIcon';

const AdminCategoriasPage = () => {
  useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos'
  });
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });
  
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;
  
  // Categorías filtradas y paginadas
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter(cat => {
      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const coincide = cat.nombre.toLowerCase().includes(busqueda) ||
            cat.descripcion?.toLowerCase().includes(busqueda);
        if (!coincide) return false;
      }
      
      // Filtro por estado
      if (filtros.estado !== 'todos') {
        if (filtros.estado === 'activos' && !cat.activo) return false;
        if (filtros.estado === 'inactivos' && cat.activo) return false;
      }
      
      return true;
    });
  }, [categorias, filtros.busqueda, filtros.estado]);
  
  // Aplicar paginación
  const totalPaginas = Math.ceil(categoriasFiltradas.length / registrosPorPagina);
  const categoriasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    return categoriasFiltradas.slice(inicio, fin);
  }, [categoriasFiltradas, paginaActual, registrosPorPagina]);
  
  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros.busqueda, filtros.estado]);

  const loadCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/categorias');
      const categoriasData = response.data?.data?.categorias || response.data?.categorias || response.data?.data || [];
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar las categorías' });
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handleShowModal = (categoria = null) => {
    if (categoria) {
      setEditando(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        activo: Boolean(categoria.activo)
      });
    } else {
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setMensaje({ tipo: 'danger', texto: 'El nombre es obligatorio' });
      return;
    }

    try {
      if (editando) {
        await api.put(`/admin/categorias/${editando.id}`, formData);
        setMensaje({ tipo: 'success', texto: 'Categoría actualizada exitosamente' });
      } else {
        await api.post('/admin/categorias', formData);
        setMensaje({ tipo: 'success', texto: 'Categoría creada exitosamente' });
      }
      
      handleCloseModal();
      await loadCategorias();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      setMensaje({ 
        tipo: 'danger', 
        texto: error.response?.data?.message || 'Error al guardar la categoría' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      return;
    }

    try {
      await api.delete(`/admin/categorias/${id}`);
      setMensaje({ tipo: 'success', texto: 'Categoría eliminada exitosamente' });
      await loadCategorias();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      setMensaje({ 
        tipo: 'danger', 
        texto: error.response?.data?.message || 'Error al eliminar la categoría' 
      });
    }
  };

  const handleToggleActivo = async (categoria) => {
    try {
      await api.put(`/admin/categorias/${categoria.id}`, {
        ...categoria,
        activo: !categoria.activo
      });
      
      setMensaje({ 
        tipo: 'success', 
        texto: `Categoría ${!categoria.activo ? 'activada' : 'desactivada'} exitosamente` 
      });
      
      await loadCategorias();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar el estado' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando categorías..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <i className="bi bi-tags me-2 text-gold" />
            Gestión de Categorías
          </h1>
          <p className="text-muted mb-0">
            Total: {categoriasFiltradas.length} de {categorias.length} categoría{categorias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              onClick={() => {
                setTipoExportacion('pdf');
                exportarCategoriasAPDF(categoriasFiltradas);
              }}
            >
              <i className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} />
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="primary" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                exportarCategoriasAPDF(categoriasFiltradas);
              }}>
                <i className="bi bi-file-earmark-pdf me-2" /> Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={async () => {
                setTipoExportacion('excel');
                await exportarCategoriasAExcel(categoriasFiltradas);
              }}>
                <i className="bi bi-file-earmark-excel me-2" /> Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1" /> Volver
          </Button>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle me-1" /> Nueva Categoría
          </Button>
        </div>
      </div>

      {mensaje.texto && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4 admin-card-table">
        <Card.Body className="p-3 p-md-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-navy">
            <i className="bi bi-funnel text-gold" /> Filtros de Búsqueda
          </h6>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Buscar Categoría</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <i className="bi bi-search" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por nombre o descripción..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
                <Form.Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => setFiltros({ busqueda: '', estado: 'todos' })}
              >
                <i className="bi bi-arrow-clockwise me-1" /> Limpiar filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Categorías */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th className="d-none d-md-table-cell" style={{ width: '50px' }}>ID</th>
                <th>Nombre</th>
                <th className="d-none d-sm-table-cell">Descripción</th>
                <th style={{ width: '110px' }}>Estado</th>
                <th className="text-center" style={{ minWidth: '110px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No hay categorías registradas
                  </td>
                </tr>
              ) : (
                categoriasPaginadas.map((cat) => (
                  <tr key={cat.id}>
                    <td className="align-middle d-none d-md-table-cell">{cat.id}</td>
                    <td className="align-middle fw-bold">
                      <div>{cat.nombre}</div>
                      {cat.descripcion && (
                        <small className="d-sm-none text-muted d-block">{cat.descripcion}</small>
                      )}
                    </td>
                    <td className="align-middle d-none d-sm-table-cell">{cat.descripcion || '-'}</td>
                    <td className="align-middle">
                      <Badge bg={cat.activo ? 'success' : 'secondary'}>
                        {cat.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="align-middle text-center">
                      <div className="action-btn-group">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="btn-action-table"
                          onClick={() => handleShowModal(cat)}
                          title="Editar categoría"
                        >
                          <SvgIcon name="pencil" />
                          <span className="btn-text">Editar</span>
                        </Button>
                        <Button
                          variant={cat.activo ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          className="btn-action-table"
                          onClick={() => handleToggleActivo(cat)}
                          title={cat.activo ? 'Desactivar categoría' : 'Activar categoría'}
                        >
                          <SvgIcon name={cat.activo ? 'x-circle' : 'check-circle'} />
                          <span className="btn-text">{cat.activo ? 'Pausar' : 'Activar'}</span>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="btn-action-table"
                          onClick={() => handleDelete(cat.id)}
                          title="Eliminar categoría"
                        >
                          <SvgIcon name="trash" />
                          <span className="btn-text">Eliminar</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Página {paginaActual} de {totalPaginas} - Mostrando {categoriasPaginadas.length} de {categoriasFiltradas.length} registros
          </small>
          <ButtonGroup size="sm">
            <Button variant="outline-primary" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1}>
              ««
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(p => p - 1)} disabled={paginaActual === 1}>
              Anterior
            </Button>
            <Button variant="primary" disabled>
              {paginaActual} / {totalPaginas}
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual === totalPaginas}>
              Siguiente
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas}>
              »»
            </Button>
          </ButtonGroup>
        </div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-navy">
            {editando ? 'Editar Categoría' : 'Nueva Categoría'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Nombre <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Joyería Fina"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional de la categoría..."
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              id="categoria-activo"
              name="activo"
              label="Categoría activa"
              checked={formData.activo}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editando ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminCategoriasPage;
