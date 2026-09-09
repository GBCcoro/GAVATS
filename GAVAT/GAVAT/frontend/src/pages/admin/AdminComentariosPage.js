/**
 * ============================================
 * ADMIN COMENTARIOS PAGE
 * ============================================
 * Moderación y gestión de comentarios de productos
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import comentariosService from '../../services/comentariosService';
import LoadingSpinner from '../../components/LoadingSpinner';
import FloatingToast from '../../components/FloatingToast';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import BotonExportar from '../../components/BotonExportar';
import ToolbarSeleccionLote from '../../components/ToolbarSeleccionLote';
import PaginacionTabla from '../../components/PaginacionTabla';
import { exportarComentariosAPDF, exportarComentariosAExcel } from '../../utils/exportUtils';

const normalizarComentario = (comentario) => ({
  ...comentario,
  estado: comentario.estado === true || comentario.estado === 'visible',
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
      <span key={i} className={`bi bi-star${i <= calificacion ? '-fill' : ''}`} style={{ color: '#f5c271' }} aria-hidden="true" />
    );
  }
  return estrellas;
};

const AdminComentariosPage = () => {
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [exportando, setExportando] = useState(false);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [modalConfirmacion, setModalConfirmacion] = useState({ show: false });
  const [filtros, setFiltros] = useState({ busqueda: '', estado: 'todos' });
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const registrosPorPagina = 25;

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(filtros.busqueda);
    }, 350);
    return () => clearTimeout(timer);
  }, [filtros.busqueda]);

  // Resetear página al filtrar o buscar
  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaDebounced, filtros.estado]);

  const loadComentarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pagina: paginaActual,
        limite: registrosPorPagina
      };
      if (busquedaDebounced.trim()) params.buscar = busquedaDebounced.trim();
      if (filtros.estado && filtros.estado !== 'todos') params.estado = filtros.estado;

      const response = await comentariosService.obtenerTodosComentarios(params);
      const comentariosData = response.data?.comentarios || response.data || [];
      const paginacion = response.data?.paginacion || response.paginacion || {};
      const total = paginacion.total ?? paginacion.totalComentarios ?? comentariosData.length;
      const numPags = paginacion.totalPaginas || Math.max(1, Math.ceil(total / registrosPorPagina));

      setComentarios(Array.isArray(comentariosData) ? comentariosData.map(normalizarComentario) : []);
      setTotalComentarios(total);
      setTotalPaginas(numPags);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar comentarios' });
      setComentarios([]);
      setTotalComentarios(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  }, [paginaActual, busquedaDebounced, filtros.estado]);

  useEffect(() => {
    loadComentarios();
  }, [loadComentarios, reloadKey]);

  const recargarComentarios = useCallback(() => {
    setReloadKey(prev => prev + 1);
  }, []);

  const handleExportar = useCallback(async (formato) => {
    setExportando(true);
    try {
      const params = {
        pagina: 1,
        limite: 1000,
        ...(busquedaDebounced.trim() && { buscar: busquedaDebounced.trim() }),
        ...(filtros.estado && filtros.estado !== 'todos' && { estado: filtros.estado })
      };
      const res = await comentariosService.obtenerTodosComentarios(params);
      const items = res.data?.comentarios || res.data || [];
      const datos = Array.isArray(items) ? items.map(normalizarComentario) : comentarios;
      if (formato === 'pdf') {
        exportarComentariosAPDF(datos);
      } else {
        await exportarComentariosAExcel(datos);
      }
    } catch (error) {
      console.error('Error al exportar comentarios:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al exportar comentarios' });
    } finally {
      setExportando(false);
    }
  }, [busquedaDebounced, filtros.estado, comentarios]);

  const handleVerDetalle = (comentario) => {
    setComentarioSeleccionado(comentario);
    setShowDetalleModal(true);
  };

  // Toggle visibilidad individual
  const ejecutarToggleVisibilidad = async (comentario) => {
    const nuevoEstado = !comentario.estado;
    try {
      setComentarios(prev =>
        prev.map(c => c.id === comentario.id ? { ...c, estado: nuevoEstado } : c)
      );
      if (comentarioSeleccionado?.id === comentario.id) {
        setComentarioSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : prev);
      }
      await comentariosService.toggleComentario(comentario.id);
      setMensaje({ tipo: 'success', texto: `Comentario ${nuevoEstado ? 'activado y visible' : 'ocultado'} exitosamente` });
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar visibilidad del comentario' });
    } finally {
      recargarComentarios();
    }
  };

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
      onConfirm: () => ejecutarToggleVisibilidad(comentario)
    });
  };

  // Eliminar individual
  const ejecutarEliminar = async (comentario) => {
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
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar el comentario' });
    } finally {
      recargarComentarios();
    }
  };

  const solicitarEliminar = (comentario) => {
    setModalConfirmacion({
      show: true,
      titulo: '¿Eliminar comentario?',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente el comentario de "${comentario.usuario?.nombre || 'Usuario'}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: () => ejecutarEliminar(comentario)
    });
  };

  // Eliminación masiva
  const ejecutarEliminacionMasiva = async (ids) => {
    try {
      setComentarios(prev => prev.filter(c => !ids.includes(c.id)));
      setSeleccionados(new Set());
      const res = await comentariosService.eliminarComentariosMasivo(ids);
      const eliminados = res.data?.eliminados || ids.length;
      setMensaje({ tipo: 'success', texto: `${eliminados} comentarios eliminados exitosamente` });
    } catch (error) {
      console.error('Error al eliminar comentarios masivos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar los comentarios seleccionados' });
    } finally {
      recargarComentarios();
    }
  };

  const solicitarEliminacionMasiva = () => {
    const count = seleccionados.size;
    if (count === 0) return;
    const ids = Array.from(seleccionados);
    setModalConfirmacion({
      show: true,
      titulo: `¿Eliminar ${count} comentario${count !== 1 ? 's' : ''}?`,
      mensaje: `Se eliminarán permanentemente los ${count} comentarios seleccionados. ¿Deseas continuar?`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar todo',
      textoCancelar: 'Cancelar',
      onConfirm: () => ejecutarEliminacionMasiva(ids)
    });
  };

  // Visibilidad masiva
  const ejecutarCambioVisibilidadMasiva = async (ids) => {
    try {
      setSeleccionados(new Set());
      const resultados = await Promise.allSettled(ids.map(id => comentariosService.toggleComentario(id)));
      const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
      setMensaje({ 
        tipo: exitosos > 0 ? 'success' : 'danger', 
        texto: `Visibilidad actualizada en ${exitosos} de ${ids.length} comentarios` 
      });
    } catch (error) {
      console.error('Error al cambiar visibilidad masiva:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al procesar la actualización masiva' });
    } finally {
      recargarComentarios();
    }
  };

  const solicitarCambioEstadoMasivo = () => {
    const count = seleccionados.size;
    if (count === 0) return;
    const ids = Array.from(seleccionados);
    setModalConfirmacion({
      show: true,
      titulo: `¿Alternar visibilidad a ${count} comentario${count !== 1 ? 's' : ''}?`,
      mensaje: `Se cambiará el estado de visibilidad de los ${count} comentarios seleccionados. ¿Deseas continuar?`,
      tipo: 'warning',
      icono: 'arrow-repeat',
      textoConfirmar: 'Cambiar estado',
      textoCancelar: 'Cancelar',
      onConfirm: () => ejecutarCambioVisibilidadMasiva(ids)
    });
  };

  // Selección de filas
  const todosPaginaSeleccionados = useMemo(() => {
    return comentarios.length > 0 && comentarios.every(c => seleccionados.has(c.id));
  }, [comentarios, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        comentarios.forEach(c => nuevo.delete(c.id));
      } else {
        comentarios.forEach(c => nuevo.add(c.id));
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

  const esCargaInicial = loading && comentarios.length === 0 && !busquedaDebounced && filtros.estado === 'todos';
  if (esCargaInicial) {
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
            Total: <strong>{totalComentarios}</strong> comentario{totalComentarios !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <BotonExportar
            tipoExportacion={tipoExportacion}
            onTipoChange={setTipoExportacion}
            onExportar={handleExportar}
            exportando={exportando}
          />
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1"></i> Volver
          </Button>
        </div>
      </div>

      {/* Notificación flotante inferior izquierda */}
      <FloatingToast
        mensaje={mensaje}
        onClose={() => setMensaje({ tipo: '', texto: '' })}
      />

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4 admin-card-table">
        <Card.Body className="p-3 p-md-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-navy">
            <span className="bi bi-funnel text-gold" aria-hidden="true"></span> Filtros de Búsqueda
          </h6>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Group controlId="filtroBuscarComentario">
                <Form.Label className="small fw-semibold mb-1">Buscar Comentarios</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <span className="bi bi-search" aria-hidden="true"></span>
                  </InputGroup.Text>
                  <Form.Control
                    id="filtroBuscarComentario"
                    placeholder="Buscar por usuario, producto o contenido..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroEstadoComentario">
                <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
                <Form.Select
                  id="filtroEstadoComentario"
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
      <ToolbarSeleccionLote
        totalItems={comentarios.length}
        todosSeleccionados={todosPaginaSeleccionados}
        cantidadSeleccionados={seleccionados.size}
        etiquetaItem="comentario"
        onToggleTodos={handleToggleSeleccionarTodos}
        onLimpiar={() => setSeleccionados(new Set())}
      >
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
      </ToolbarSeleccionLote>

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
              {comentarios.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No hay comentarios registrados
                  </td>
                </tr>
              ) : (
                comentarios.map((comentario) => {
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
      <PaginacionTabla
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={totalComentarios}
        itemsActuales={comentarios.length}
        etiquetaItems="comentarios"
        onCambiarPagina={setPaginaActual}
        loading={loading}
      />

      <ComentarioDetalleModal
        show={showDetalleModal}
        comentario={comentarioSeleccionado}
        onClose={() => setShowDetalleModal(false)}
        onToggleVisibilidad={solicitarToggleVisibilidad}
        onEliminar={solicitarEliminar}
      />

      <ModalConfirmacion
        modal={modalConfirmacion}
        onClose={() => setModalConfirmacion(prev => ({ ...prev, show: false }))}
      />
    </Container>
  );
};

// Subcomponente Detalle Comentario
const ComentarioDetalleModal = ({
  show,
  comentario,
  onClose,
  onToggleVisibilidad,
  onEliminar,
}) => (
  <Modal 
    show={show} 
    onHide={onClose} 
    centered
    dialogClassName="modal-producto-form"
  >
    <div className="product-minimal-header">
      <div>
        <h6 className="fw-bold mb-0 text-navy fs-6">
          Detalle del Comentario
        </h6>
        <small className="text-muted" style={{ fontSize: '0.8rem' }}>
          {formatearFecha(comentario?.fecha)}
        </small>
      </div>
      <button 
        type="button" 
        className="btn-close" 
        onClick={onClose}
        aria-label="Cerrar"
      />
    </div>

    {comentario && (
      <Modal.Body className="p-3 p-sm-4">
        <Row className="g-3 mb-3">
          <Col sm={6}>
            <div className="p-3 rounded-3 bg-light border">
              <h6 className="fw-bold text-navy mb-1 small text-uppercase">Autor</h6>
              <p className="mb-0 small text-secondary">
                <strong>Nombre:</strong> {comentario.usuario?.nombre || 'Anónimo'}<br/>
                <strong>Email:</strong> {comentario.usuario?.email || '-'}
              </p>
            </div>
          </Col>
          <Col sm={6}>
            <div className="p-3 rounded-3 bg-light border">
              <h6 className="fw-bold text-navy mb-1 small text-uppercase">Producto</h6>
              <p className="mb-0 small text-secondary">
                <strong className="text-navy">{comentario.producto?.nombre || 'Producto'}</strong><br/>
                <Badge bg={comentario.estado ? 'success' : 'warning'} className="mt-1">
                  {comentario.estado ? 'Visible en tienda' : 'Oculto al público'}
                </Badge>
              </p>
            </div>
          </Col>
        </Row>

        <div className="mb-3 p-2 px-3 rounded-3 bg-light border d-flex align-items-center justify-content-between">
          <span className="small fw-semibold text-secondary">Calificación otorgada:</span>
          <div className="d-inline-flex gap-1">
            {renderizarEstrellas(comentario.calificacion)}
          </div>
        </div>

        <div className="mb-2">
          <span className="small fw-semibold text-secondary d-block mb-1">Contenido del Comentario:</span>
          <div className="p-3 rounded-3 bg-light border small text-dark" style={{ lineHeight: '1.6' }}>
            {comentario.comentario}
          </div>
        </div>
      </Modal.Body>
    )}

    <div className="product-minimal-footer">
      <button 
        type="button" 
        className="btn-minimal-cancel"
        onClick={onClose}
      >
        Cerrar
      </button>
      {comentario && (
        <>
          <Button 
            variant={comentario.estado ? 'warning' : 'success'} 
            size="sm"
            className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
            onClick={() => onToggleVisibilidad(comentario)}
          >
            <i className={`bi bi-${comentario.estado ? 'eye-slash' : 'check-circle'}`}></i>
            {comentario.estado ? 'Ocultar' : 'Aprobar'}
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
            onClick={() => onEliminar(comentario)}
          >
            <i className="bi bi-trash"></i> Eliminar
          </Button>
        </>
      )}
    </div>
  </Modal>
);

export default AdminComentariosPage;
