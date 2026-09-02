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

const AdminComentariosPage = () => {
  useAuth();
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [seleccionados, setSeleccionados] = useState(new Set());
  
  // Modal de confirmación en pantalla
  const [modalConfirmacion, setModalConfirmacion] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    tipo: 'danger',
    icono: 'trash3-fill',
    textoConfirmar: 'Borrar',
    textoCancelar: 'Cancelar',
    onConfirm: null,
    onCancel: null
  });
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos'
  });
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;

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

  // Toggle visibilidad individual con modal
  const solicitarToggleVisibilidad = (comentario) => {
    const nuevoEstado = !comentario.estado;
    setModalConfirmacion({
      show: true,
      titulo: nuevoEstado ? '¿Aprobar y mostrar comentario?' : '¿Ocultar comentario?',
      mensaje: `¿Deseas cambiar el estado del comentario de "${comentario.usuario?.nombre || 'Usuario'}" a "${nuevoEstado ? 'Visible' : 'Oculto'}"?`,
      tipo: nuevoEstado ? 'success' : 'warning',
      icono: nuevoEstado ? 'eye-fill' : 'eye-slash-fill',
      textoConfirmar: nuevoEstado ? 'Aprobar' : 'Ocultar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          setComentarios(prev => 
            prev.map(c => c.id === comentario.id ? { ...c, estado: nuevoEstado } : c)
          );
          if (comentarioSeleccionado?.id === comentario.id) {
            setComentarioSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : prev);
          }

          await comentariosService.toggleComentario(comentario.id);
          setMensaje({ tipo: 'success', texto: `Comentario ${nuevoEstado ? 'activado y visible' : 'ocultado'} exitosamente` });
          await loadComentarios();
        } catch (error) {
          console.error('Error al actualizar visibilidad:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al actualizar visibilidad del comentario' });
          await loadComentarios();
        }
      }
    });
  };

  // Eliminar individual con modal
  const solicitarEliminar = (comentario) => {
    setModalConfirmacion({
      show: true,
      titulo: '¿Eliminar comentario?',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente el comentario de "${comentario.usuario?.nombre || 'Usuario'}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          setComentarios(prev => prev.filter(c => c.id !== comentario.id));
          setSeleccionados(prev => {
            const next = new Set(prev);
            next.delete(comentario.id);
            return next;
          });

          await comentariosService.eliminarComentario(comentario.id);
          setMensaje({ tipo: 'success', texto: 'Comentario eliminado exitosamente' });
          setShowDetalleModal(false);
          await loadComentarios();
        } catch (error) {
          console.error('Error al eliminar comentario:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al eliminar el comentario' });
          await loadComentarios();
        }
      }
    });
  };

  // Eliminación masiva con modal
  const solicitarEliminacionMasiva = () => {
    const count = seleccionados.size;
    if (count === 0) return;

    setModalConfirmacion({
      show: true,
      titulo: `¿Eliminar ${count} comentario${count !== 1 ? 's' : ''}?`,
      mensaje: `Se eliminarán permanentemente los ${count} comentarios seleccionados. ¿Deseas continuar?`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          const idsSet = new Set(ids);
          
          setComentarios(prev => prev.filter(c => !idsSet.has(c.id)));
          setSeleccionados(new Set());

          const resultados = await Promise.allSettled(ids.map(id => comentariosService.eliminarComentario(id)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;

          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} de ${ids.length} comentarios eliminados exitosamente` 
          });

          await loadComentarios();
        } catch (error) {
          console.error('Error en eliminación masiva:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar la eliminación masiva' });
          await loadComentarios();
        }
      }
    });
  };

  // Toggle masivo con modal
  const solicitarCambioEstadoMasivo = () => {
    const count = seleccionados.size;
    if (count === 0) return;

    setModalConfirmacion({
      show: true,
      titulo: `¿Alternar visibilidad a ${count} comentario${count !== 1 ? 's' : ''}?`,
      mensaje: `Se cambiará el estado de visualización (visible/oculto) para los ${count} comentarios seleccionados.`,
      tipo: 'warning',
      icono: 'arrow-repeat',
      textoConfirmar: 'Actualizar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          setSeleccionados(new Set());

          const resultados = await Promise.allSettled(ids.map(id => comentariosService.toggleComentario(id)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;

          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `Visibilidad actualizada en ${exitosos} de ${ids.length} comentarios` 
          });

          await loadComentarios();
        } catch (error) {
          console.error('Error al cambiar visibilidad masiva:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar la actualización masiva' });
          await loadComentarios();
        }
      }
    });
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
        <span key={i} className={`bi bi-star${i <= calificacion ? '-fill' : ''}`} style={{ color: '#f5c271' }} aria-hidden="true"></span>
      );
    }
    return estrellas;
  };

  // Selección de filas
  const todosPaginaSeleccionados = useMemo(() => {
    return comentariosPaginados.length > 0 && comentariosPaginados.every(c => seleccionados.has(c.id));
  }, [comentariosPaginados, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        comentariosPaginados.forEach(c => nuevo.delete(c.id));
      } else {
        comentariosPaginados.forEach(c => nuevo.add(c.id));
      }
      return nuevo;
    });
  };

  const toggleSeleccionarComentario = (id) => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando comentarios..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar Responsivo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <span className="bi bi-chat-dots-fill me-2 text-gold" aria-hidden="true"></span> Moderación de Comentarios
          </h1>
          <p className="text-muted mb-0">
            Total: {comentariosFiltrados.length} de {comentarios.length} comentario{comentarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              onClick={async () => {
                if (tipoExportacion === 'pdf') {
                  exportarComentariosAPDF(comentariosFiltrados);
                } else {
                  await exportarComentariosAExcel(comentariosFiltrados);
                }
              }}
            >
              <span className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} aria-hidden="true"></span>
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="secondary" className="btn-dark dropdown-toggle-split" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                exportarComentariosAPDF(comentariosFiltrados);
              }}>
                <span className="bi bi-file-earmark-pdf me-2" aria-hidden="true"></span> Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={async () => {
                setTipoExportacion('excel');
                await exportarComentariosAExcel(comentariosFiltrados);
              }}>
                <span className="bi bi-file-earmark-excel me-2" aria-hidden="true"></span> Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1"></i> Volver
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
            <span className="bi bi-funnel text-gold" aria-hidden="true"></span> Filtros de Búsqueda
          </h6>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Buscar Comentarios</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <span className="bi bi-search" aria-hidden="true"></span>
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
                <span className="bi bi-arrow-clockwise me-1" aria-hidden="true"></span> Limpiar filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Barra de Acciones de Selección Múltiple */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 px-1">
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={todosPaginaSeleccionados ? "secondary" : "outline-secondary"}
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={handleToggleSeleccionarTodos}
            title={todosPaginaSeleccionados ? "Deseleccionar todos en esta página" : "Seleccionar todos en esta página"}
          >
            <i className={`bi bi-${todosPaginaSeleccionados ? 'check-square-fill text-primary' : 'square'}`} />
            <span>{todosPaginaSeleccionados ? 'Deseleccionar página' : `Seleccionar todo (${comentariosPaginados.length})`}</span>
          </Button>
          {seleccionados.size > 0 && (
            <Badge bg="danger" className="p-2 d-flex align-items-center gap-1 fs-7">
              <i className="bi bi-check-circle-fill"></i> {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {seleccionados.size > 0 && (
          <div className="d-flex flex-wrap align-items-center gap-2">
            {seleccionados.size === 1 && (
              <Button
                variant="outline-primary"
                size="sm"
                className="d-inline-flex align-items-center gap-1 fw-semibold"
                onClick={() => {
                  const idSel = Array.from(seleccionados)[0];
                  const comSel = comentarios.find(c => c.id === idSel);
                  if (comSel) handleVerDetalle(comSel);
                }}
                title="Ver detalle del comentario seleccionado"
              >
                <i className="bi bi-eye-fill"></i>
                <span>Ver Detalle</span>
              </Button>
            )}
            <Button
              variant="outline-warning"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={solicitarCambioEstadoMasivo}
              title="Aprobar u ocultar comentarios seleccionados"
            >
              <i className="bi bi-arrow-repeat"></i>
              <span>Aprobar / Ocultar ({seleccionados.size})</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={solicitarEliminacionMasiva}
              title="Eliminar los comentarios seleccionados"
            >
              <i className="bi bi-trash-fill"></i>
              <span>Eliminar ({seleccionados.size})</span>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setSeleccionados(new Set())}
              title="Limpiar selección"
            >
              <i className="bi bi-x-lg me-1"></i> Deseleccionar
            </Button>
          </div>
        )}
      </div>

      {/* Tabla de Comentarios Responsiva */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '140px' }}>Usuario</th>
                <th>Producto</th>
                <th style={{ width: '110px' }}>Calificación</th>
                <th className="d-none d-sm-table-cell">Comentario</th>
                <th style={{ width: '100px' }}>Estado</th>
                <th className="d-none d-md-table-cell" style={{ width: '120px' }}>Fecha</th>
                <th className="text-center" style={{ width: '140px', minWidth: '100px' }}>Acciones</th>
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
                comentariosPaginados.map((comentario) => {
                  const estaSeleccionado = seleccionados.has(comentario.id);
                  return (
                    <tr 
                      key={comentario.id}
                      onClick={() => toggleSeleccionarComentario(comentario.id)}
                      className={`fila-admin ${estaSeleccionado ? 'fila-admin-seleccionada' : ''}`}
                      title="Haz clic para seleccionar/deseleccionar este comentario"
                    >
                      <td className="align-middle fw-bold">
                        <div className="d-flex align-items-center gap-2">
                          <i 
                            className={`bi bi-${estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted'} fs-6 d-inline-block`}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{comentario.usuario?.nombre || 'Usuario'}</span>
                        </div>
                      </td>
                      <td className="align-middle fw-medium">{comentario.producto?.nombre || 'Producto'}</td>
                      <td className="align-middle">
                        <div className="d-flex gap-1">
                          {renderizarEstrellas(comentario.calificacion)}
                        </div>
                      </td>
                      <td className="align-middle d-none d-sm-table-cell">
                        <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {comentario.comentario}
                        </div>
                      </td>
                      <td className="align-middle">
                        <Badge bg={comentario.estado ? 'success' : 'warning'}>
                          {comentario.estado ? 'Visible' : 'Oculto'}
                        </Badge>
                      </td>
                      <td className="align-middle d-none d-md-table-cell">{formatearFecha(comentario.fecha)}</td>
                      <td className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="action-btn-group">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerDetalle(comentario);
                            }}
                            title="Ver detalles del comentario"
                          >
                            <i className="bi bi-eye" />
                            <span className="btn-text">Ver</span>
                          </Button>
                          <Button 
                            variant={comentario.estado ? 'outline-warning' : 'outline-success'} 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarToggleVisibilidad(comentario);
                            }}
                            title={comentario.estado ? 'Ocultar comentario' : 'Aprobar/Mostrar comentario'}
                          >
                            <i className={`bi bi-${comentario.estado ? 'eye-slash' : 'check-circle'}`} />
                            <span className="btn-text">{comentario.estado ? 'Ocultar' : 'Aprobar'}</span>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarEliminar(comentario);
                            }}
                            title="Eliminar comentario"
                          >
                            <i className="bi bi-trash" />
                            <span className="btn-text">Eliminar</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Modal Detalle Comentario Minimalista */}
      <Modal 
        show={showDetalleModal} 
        onHide={() => setShowDetalleModal(false)} 
        centered
        dialogClassName="modal-producto-form"
      >
        <div className="product-minimal-header">
          <div>
            <h6 className="fw-bold mb-0 text-navy fs-6">
              Detalle del Comentario
            </h6>
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
              {comentarioSeleccionado ? formatearFecha(comentarioSeleccionado.fecha) : ''}
            </small>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowDetalleModal(false)}
            aria-label="Cerrar"
          />
        </div>

        {comentarioSeleccionado && (
          <Modal.Body className="p-3 p-sm-4">
            <Row className="g-3 mb-3">
              <Col sm={6}>
                <div className="p-3 rounded-3 bg-light border">
                  <h6 className="fw-bold text-navy mb-1 small text-uppercase">Autor</h6>
                  <p className="mb-0 small text-secondary">
                    <strong>Nombre:</strong> {comentarioSeleccionado.usuario?.nombre || 'Anónimo'}<br/>
                    <strong>Email:</strong> {comentarioSeleccionado.usuario?.email || '-'}
                  </p>
                </div>
              </Col>
              <Col sm={6}>
                <div className="p-3 rounded-3 bg-light border">
                  <h6 className="fw-bold text-navy mb-1 small text-uppercase">Producto</h6>
                  <p className="mb-0 small text-secondary">
                    <strong className="text-navy">{comentarioSeleccionado.producto?.nombre || 'Producto'}</strong><br/>
                    <Badge bg={comentarioSeleccionado.estado ? 'success' : 'warning'} className="mt-1">
                      {comentarioSeleccionado.estado ? 'Visible en tienda' : 'Oculto al público'}
                    </Badge>
                  </p>
                </div>
              </Col>
            </Row>

            <div className="mb-3 p-2 px-3 rounded-3 bg-light border d-flex align-items-center justify-content-between">
              <span className="small fw-semibold text-secondary">Calificación otorgada:</span>
              <div className="d-inline-flex gap-1">
                {renderizarEstrellas(comentarioSeleccionado.calificacion)}
              </div>
            </div>

            <div className="mb-2">
              <span className="small fw-semibold text-secondary d-block mb-1">Contenido del Comentario:</span>
              <div className="p-3 rounded-3 bg-light border small text-dark" style={{ lineHeight: '1.6' }}>
                {comentarioSeleccionado.comentario}
              </div>
            </div>
          </Modal.Body>
        )}

        <div className="product-minimal-footer">
          <button 
            type="button" 
            className="btn-minimal-cancel"
            onClick={() => setShowDetalleModal(false)}
          >
            Cerrar
          </button>
          {comentarioSeleccionado && (
            <>
              <Button 
                variant={comentarioSeleccionado.estado ? 'warning' : 'success'} 
                size="sm"
                className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
                onClick={() => solicitarToggleVisibilidad(comentarioSeleccionado)}
              >
                <i className={`bi bi-${comentarioSeleccionado.estado ? 'eye-slash' : 'check-circle'}`}></i>
                {comentarioSeleccionado.estado ? 'Ocultar' : 'Aprobar'}
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
                onClick={() => solicitarEliminar(comentarioSeleccionado)}
              >
                <i className="bi bi-trash"></i> Eliminar
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de Confirmación Compacto Estilo Dashboard */}
      <Modal 
        show={modalConfirmacion.show} 
        onHide={() => setModalConfirmacion(prev => ({ ...prev, show: false }))} 
        centered
        backdrop="static"
        dialogClassName="modal-confirmacion-compacto"
      >
        <Modal.Body className="text-center p-3 p-sm-4">
          <div 
            className={`confirm-icon-wrapper mb-3 mx-auto bg-${
              modalConfirmacion.tipo === 'danger' ? 'danger-subtle' :
              modalConfirmacion.tipo === 'warning' ? 'warning-subtle' :
              modalConfirmacion.tipo === 'primary' || modalConfirmacion.tipo === 'info' ? 'primary-subtle' :
              'success-subtle'
            } text-${modalConfirmacion.tipo || 'primary'}`}
          >
            <i className={`bi bi-${modalConfirmacion.icono || 'exclamation-circle-fill'} confirm-icon`} />
          </div>
          
          <h5 className="fw-bold text-navy mb-2 fs-5">
            {modalConfirmacion.titulo}
          </h5>
          
          <p className="text-muted small mb-3 mb-sm-4 px-1" style={{ maxWidth: '300px', margin: '0 auto' }}>
            {modalConfirmacion.mensaje}
          </p>

          <div className="d-flex gap-2 justify-content-center w-100 mt-2">
            <Button 
              variant="outline-secondary" 
              className="px-3 py-2 fw-semibold flex-fill"
              onClick={() => {
                setModalConfirmacion(prev => ({ ...prev, show: false }));
                if (modalConfirmacion.onCancel) modalConfirmacion.onCancel();
              }}
            >
              {modalConfirmacion.textoCancelar || 'Cancelar'}
            </Button>
            <Button 
              variant={modalConfirmacion.tipo || 'primary'} 
              className="px-3 py-2 fw-semibold flex-fill shadow-sm"
              onClick={async () => {
                const action = modalConfirmacion.onConfirm;
                setModalConfirmacion(prev => ({ ...prev, show: false }));
                if (action) await action();
              }}
            >
              {modalConfirmacion.textoConfirmar || 'Confirmar'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminComentariosPage;
