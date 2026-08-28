/**
 * ============================================
 * ADMIN COMENTARIOS PAGE
 * ============================================
 * Moderación y gestión de comentarios de productos
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import comentariosService from '../../services/comentariosService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { exportarComentariosAPDF, exportarComentariosAExcel } from '../../utils/exportUtils';
import SvgIcon from '../../components/SvgIcon';

const AdminComentariosPage = () => {
  useAuth();
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos'
  });
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 20;

  const normalizarComentario = (comentario) => ({
    ...comentario,
    usuario: typeof comentario.usuario === 'object' && comentario.usuario !== null
      ? comentario.usuario
      : {
          nombre: comentario.usuario || comentario.autor || null,
          email: comentario.email || null
        },
    producto: typeof comentario.producto === 'object' && comentario.producto !== null
      ? comentario.producto
      : {
          nombre: comentario.producto || null
        }
  });
  
  const comentariosFiltrados = useMemo(() => {
    return comentarios.filter(comentario => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const coincide = 
          comentario.usuario?.nombre?.toLowerCase().includes(busqueda) ||
          comentario.producto?.nombre?.toLowerCase().includes(busqueda) ||
          comentario.comentario?.toLowerCase().includes(busqueda);
        if (!coincide) return false;
      }
      
      if (filtros.estado !== 'todos') {
        const estado = filtros.estado === 'visible';
        if (comentario.estado !== estado) return false;
      }
      
      return true;
    });
  }, [comentarios, filtros.busqueda, filtros.estado]);
  
  const totalPaginas = Math.ceil(comentariosFiltrados.length / registrosPorPagina);
  const comentariosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return comentariosFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [comentariosFiltrados, paginaActual, registrosPorPagina]);
  
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros.busqueda, filtros.estado]);

  const loadComentarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await comentariosService.obtenerTodosComentarios({ limite: 1000 });
      const comentariosData = response.data?.comentarios || response.data || [];
      setComentarios(Array.isArray(comentariosData) ? comentariosData.map(normalizarComentario) : []);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar comentarios' });
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComentarios();
  }, [loadComentarios]);

  const handleVerDetalle = (comentario) => {
    setComentarioSeleccionado(comentario);
    setShowDetalleModal(true);
  };

  const handleToggleVisibilidad = async (id) => {
    try {
      await comentariosService.toggleComentario(id);
      setMensaje({ tipo: 'success', texto: 'Visibilidad del comentario actualizada' });
      setShowDetalleModal(false);
      await loadComentarios();
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar visibilidad' });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;
    try {
      await comentariosService.eliminarComentario(id);
      setMensaje({ tipo: 'success', texto: 'Comentario eliminado exitosamente' });
      setShowDetalleModal(false);
      await loadComentarios();
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar el comentario' });
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderizarEstrellas = (calificacion) => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <i key={i} className={`bi bi-star${i <= calificacion ? '-fill' : ''}`} style={{ color: '#FFD700' }} />
      );
    }
    return estrellas;
  };

  if (loading) {
    return <LoadingSpinner message="Cargando comentarios..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <i className="bi bi-chat-dots-fill me-2 text-gold" />
            Moderación de Comentarios
          </h1>
          <p className="text-muted mb-0">
            Total: {comentariosFiltrados.length} de {comentarios.length} comentario{comentarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              onClick={() => {
                setTipoExportacion('pdf');
                exportarComentariosAPDF(comentariosFiltrados);
              }}
            >
              <i className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} />
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="primary" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                exportarComentariosAPDF(comentariosFiltrados);
              }}>
                <i className="bi bi-file-earmark-pdf me-2" /> Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={async () => {
                setTipoExportacion('excel');
                await exportarComentariosAExcel(comentariosFiltrados);
              }}>
                <i className="bi bi-file-earmark-excel me-2" /> Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1" /> Volver
          </Button>
        </div>
      </div>

      {/* Notificación flotante inferior izquierda */}
      {mensaje.texto && (
        <div className="toast-floating-container-bottom-left">
          <Alert 
            variant={mensaje.tipo} 
            dismissible 
            onClose={() => setMensaje({ tipo: '', texto: '' })}
            className={`toast-floating-alert alert-${mensaje.tipo} mb-0`}
          >
            <i className={`bi bi-${
              mensaje.tipo === 'success' ? 'check-circle-fill text-success' :
              mensaje.tipo === 'danger' ? 'exclamation-octagon-fill text-danger' :
              mensaje.tipo === 'warning' ? 'exclamation-triangle-fill text-warning' :
              'info-circle-fill text-info'
            } fs-5 flex-shrink-0`} />
            <div className="flex-grow-1 fw-medium text-start">
              {mensaje.texto}
            </div>
          </Alert>
        </div>
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
                <Form.Label className="small fw-semibold mb-1">Buscar Comentarios</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <i className="bi bi-search" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por usuario, producto o contenido..."
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
                  <option value="todos">Todos</option>
                  <option value="visible">Visible</option>
                  <option value="oculto">Oculto</option>
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

      {/* Tabla de Comentarios */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Usuario</th>
                <th>Producto</th>
                <th style={{ width: '110px' }}>Calificación</th>
                <th className="d-none d-sm-table-cell">Comentario</th>
                <th style={{ width: '100px' }}>Estado</th>
                <th className="d-none d-md-table-cell" style={{ width: '120px' }}>Fecha</th>
                <th className="text-center" style={{ minWidth: '110px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comentariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No hay comentarios registrados
                  </td>
                </tr>
              ) : (
                comentariosPaginados.map((comentario) => (
                  <tr key={comentario.id}>
                    <td className="align-middle fw-bold">{comentario.usuario?.nombre || '-'}</td>
                    <td className="align-middle">{comentario.producto?.nombre || '-'}</td>
                    <td className="align-middle">
                      <div className="d-flex gap-1">
                        {renderizarEstrellas(comentario.calificacion)}
                      </div>
                    </td>
                    <td className="align-middle d-none d-sm-table-cell">
                      <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {comentario.comentario}
                      </div>
                    </td>
                    <td className="align-middle">
                      <Badge bg={comentario.estado ? 'success' : 'warning'}>
                        {comentario.estado ? 'Visible' : 'Oculto'}
                      </Badge>
                    </td>
                    <td className="align-middle d-none d-md-table-cell">{formatearFecha(comentario.fecha)}</td>
                    <td className="align-middle text-center">
                      <div className="action-btn-group">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="btn-action-table" 
                          onClick={() => handleVerDetalle(comentario)}
                          title="Ver detalles del comentario"
                        >
                          <SvgIcon name="search" />
                          <span className="btn-text">Ver</span>
                        </Button>
                        <Button 
                          variant={comentario.estado ? 'outline-warning' : 'outline-success'} 
                          size="sm" 
                          className="btn-action-table" 
                          onClick={() => handleToggleVisibilidad(comentario.id)}
                          title={comentario.estado ? 'Ocultar comentario' : 'Aprobar/Mostrar comentario'}
                        >
                          <SvgIcon name={comentario.estado ? 'x-circle' : 'check-circle'} />
                          <span className="btn-text">{comentario.estado ? 'Ocultar' : 'Aprobar'}</span>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="btn-action-table" 
                          onClick={() => handleEliminar(comentario.id)}
                          title="Eliminar comentario"
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
            Página {paginaActual} de {totalPaginas} - Mostrando {comentariosPaginados.length} de {comentariosFiltrados.length} registros
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

      {/* Modal Detalle Comentario */}
      <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-navy">
            Detalle del Comentario
          </Modal.Title>
        </Modal.Header>
        {comentarioSeleccionado && (
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Usuario:</strong> {comentarioSeleccionado.usuario?.nombre || '-'}
              </Col>
              <Col md={6}>
                <strong>Email:</strong> {comentarioSeleccionado.usuario?.email || '-'}
              </Col>
            </Row>

            <div className="mb-3">
              <strong>Producto:</strong> {comentarioSeleccionado.producto?.nombre || '-'}
            </div>

            <Row className="mb-3">
              <Col md={6}>
                <strong>Calificación:</strong>{' '}
                <div className="d-inline-flex gap-1 ms-1">
                  {renderizarEstrellas(comentarioSeleccionado.calificacion)}
                </div>
              </Col>
              <Col md={6}>
                <strong>Estado:</strong>{' '}
                <Badge bg={comentarioSeleccionado.estado ? 'success' : 'warning'}>
                  {comentarioSeleccionado.estado ? 'Visible' : 'Oculto'}
                </Badge>
              </Col>
            </Row>

            <div className="mb-3">
              <strong>Fecha:</strong> {formatearFecha(comentarioSeleccionado.fecha)}
            </div>

            <hr />

            <div className="mb-2">
              <strong>Comentario:</strong>
              <div className="alert alert-light mt-2 mb-0">
                {comentarioSeleccionado.comentario}
              </div>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDetalleModal(false)}>
            Cerrar
          </Button>
          {comentarioSeleccionado && (
            <>
              <Button 
                variant={comentarioSeleccionado.estado ? 'warning' : 'success'} 
                onClick={() => handleToggleVisibilidad(comentarioSeleccionado.id)}
              >
                <i className={`bi bi-eye${comentarioSeleccionado.estado ? '-slash' : ''} me-1`} />
                {comentarioSeleccionado.estado ? 'Ocultar' : 'Aprobar/Mostrar'}
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleEliminar(comentarioSeleccionado.id)}
              >
                <i className="bi bi-trash me-1" /> Eliminar
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminComentariosPage;
