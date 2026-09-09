/**
 * ============================================
 * ADMIN CATEGORÍAS PAGE
 * ============================================
 * Gestión CRUD de categorías
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import FloatingToast from '../../components/FloatingToast';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import BotonExportar from '../../components/BotonExportar';
import ToolbarSeleccionLote from '../../components/ToolbarSeleccionLote';
import PaginacionTabla from '../../components/PaginacionTabla';
import { exportarCategoriasAPDF, exportarCategoriasAExcel } from '../../utils/exportUtils';

const AdminCategoriasPage = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [modalConfirmacion, setModalConfirmacion] = useState({ show: false });
  const [filtros, setFiltros] = useState({ busqueda: '', estado: 'todos' });
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });
  
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;
  
  // Categorías filtradas
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

  const handleExportar = useCallback(async (tipo = tipoExportacion) => {
    if (tipo === 'pdf') {
      exportarCategoriasAPDF(categoriasFiltradas);
    } else {
      await exportarCategoriasAExcel(categoriasFiltradas);
    }
  }, [tipoExportacion, categoriasFiltradas]);

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
      const endpoint = editando ? `/admin/categorias/${editando.id}` : '/admin/categorias';
      const method = editando ? api.put : api.post;
      await method(endpoint, formData);
      setMensaje({
        tipo: 'success',
        texto: `Categoría "${formData.nombre}" ${editando ? 'actualizada' : 'creada'} exitosamente`
      });
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

  // Selección de filas
  const todosPaginaSeleccionados = useMemo(() => {
    return categoriasPaginadas.length > 0 && categoriasPaginadas.every(c => seleccionados.has(c.id));
  }, [categoriasPaginadas, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        categoriasPaginadas.forEach(c => nuevo.delete(c.id));
      } else {
        categoriasPaginadas.forEach(c => nuevo.add(c.id));
      }
      return nuevo;
    });
  };

  const toggleSeleccionarCategoria = (id) => {
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

  // Eliminar individual con modal
  const solicitarEliminar = (categoria) => {
    setModalConfirmacion({
      show: true,
      titulo: '¿Eliminar categoría?',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          // Eliminación inmediata de estado local
          setCategorias(prev => prev.filter(c => c.id !== categoria.id));
          setSeleccionados(prev => {
            const next = new Set(prev);
            next.delete(categoria.id);
            return next;
          });

          await api.delete(`/admin/categorias/${categoria.id}`);
          setMensaje({ tipo: 'success', texto: `Categoría "${categoria.nombre}" eliminada exitosamente` });
          await loadCategorias();
        } catch (error) {
          console.error('Error al eliminar categoría:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: error.response?.data?.message || 'Error al eliminar la categoría' 
          });
          await loadCategorias();
        }
      }
    });
  };

  // Toggle estado individual con modal
  const solicitarCambioEstado = (categoria) => {
    const nuevoEstado = !categoria.activo;
    setModalConfirmacion({
      show: true,
      titulo: nuevoEstado ? '¿Activar categoría?' : '¿Desactivar categoría?',
      mensaje: `¿Deseas cambiar el estado de "${categoria.nombre}" a "${nuevoEstado ? 'Activo' : 'Inactivo'}"?`,
      tipo: nuevoEstado ? 'success' : 'warning',
      icono: nuevoEstado ? 'check-circle-fill' : 'x-circle-fill',
      textoConfirmar: nuevoEstado ? 'Activar' : 'Desactivar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/categorias/${categoria.id}/toggle`);
          const nuevoEstadoRes = res.data?.data?.categoria?.activo ?? nuevoEstado;
          
          setCategorias(prevCategorias => 
            prevCategorias.map(c => 
              c.id === categoria.id ? { ...c, activo: nuevoEstadoRes } : c
            )
          );
          
          setMensaje({ 
            tipo: 'success', 
            texto: res.data?.message || `Categoría "${categoria.nombre}" ${nuevoEstadoRes ? 'activada' : 'desactivada'} exitosamente` 
          });
        } catch (error) {
          console.error('Error al cambiar estado:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: error.response?.data?.message || 'Error al cambiar el estado de la categoría' 
          });
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
      titulo: `¿Eliminar ${count} categoría${count !== 1 ? 's' : ''}?`,
      mensaje: `Se eliminarán permanentemente las ${count} categorías seleccionadas. ¿Deseas continuar?`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          const idsSet = new Set(ids);
          
          setCategorias(prev => prev.filter(c => !idsSet.has(c.id)));
          setSeleccionados(new Set());
          
          const resultados = await Promise.allSettled(ids.map(id => api.delete(`/admin/categorias/${id}`)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} de ${ids.length} categorías eliminadas exitosamente` 
          });
          
          await loadCategorias();
        } catch (error) {
          console.error('Error en eliminación masiva:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar la eliminación masiva' });
          await loadCategorias();
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
      titulo: `¿Cambiar estado a ${count} categoría${count !== 1 ? 's' : ''}?`,
      mensaje: `Se alternará el estado (activado/desactivado) de las ${count} categorías seleccionadas.`,
      tipo: 'warning',
      icono: 'arrow-repeat',
      textoConfirmar: 'Actualizar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          setSeleccionados(new Set());
          
          const resultados = await Promise.allSettled(ids.map(id => api.patch(`/admin/categorias/${id}/toggle`)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `Estado actualizado en ${exitosos} de ${ids.length} categorías` 
          });
          
          await loadCategorias();
        } catch (error) {
          console.error('Error al cambiar estado masivo:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar el cambio de estado masivo' });
          await loadCategorias();
        }
      }
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando categorías..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar Responsivo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <span className="bi bi-tags me-2 text-gold" aria-hidden="true"></span> Gestión de Categorías
          </h1>
          <p className="text-muted mb-0">
            Total: {categoriasFiltradas.length} de {categorias.length} categoría{categorias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <BotonExportar
            tipoExportacion={tipoExportacion}
            onTipoChange={setTipoExportacion}
            onExportar={handleExportar}
          />
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1"></i> Volver
          </Button>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle me-1"></i> Nueva Categoría
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
              <Form.Group controlId="filtroBusquedaCategoria">
                <Form.Label className="small fw-semibold mb-1">Buscar Categoría</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <span className="bi bi-search" aria-hidden="true"></span>
                  </InputGroup.Text>
                  <Form.Control
                    id="filtroBusquedaCategoria"
                    placeholder="Buscar por nombre o descripción..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroEstadoCategoria">
                <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
                <Form.Select
                  id="filtroEstadoCategoria"
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
                <span className="bi bi-arrow-clockwise me-1" aria-hidden="true"></span> Limpiar filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Barra de Acciones de Selección Múltiple */}
      <ToolbarSeleccionLote
        totalItems={categoriasPaginadas.length}
        todosSeleccionados={todosPaginaSeleccionados}
        cantidadSeleccionados={seleccionados.size}
        etiquetaItem="categoría"
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
              const catSel = categorias.find(c => c.id === idSel);
              if (catSel) handleShowModal(catSel);
            }}
            title="Editar la categoría seleccionada"
          >
            <i className="bi bi-pencil-fill"></i>
            <span>Editar</span>
          </Button>
        )}
        <Button
          variant="outline-warning"
          size="sm"
          className="d-inline-flex align-items-center gap-1 fw-semibold"
          onClick={solicitarCambioEstadoMasivo}
          title="Activar o desactivar las categorías seleccionadas"
        >
          <i className="bi bi-arrow-repeat"></i>
          <span>Activar / Desactivar ({seleccionados.size})</span>
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="d-inline-flex align-items-center gap-1 fw-semibold"
          onClick={solicitarEliminacionMasiva}
          title="Eliminar las categorías seleccionadas"
        >
          <i className="bi bi-trash-fill"></i>
          <span>Eliminar ({seleccionados.size})</span>
        </Button>
      </ToolbarSeleccionLote>

      {/* Tabla de Categorías Responsiva */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>Nombre</th>
                <th className="d-none d-sm-table-cell">Descripción</th>
                <th className="d-none d-md-table-cell" style={{ width: '110px' }}>Estado</th>
                <th className="text-center" style={{ width: '130px', minWidth: '100px' }}>Acciones</th>
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
                categoriasPaginadas.map((cat) => {
                  const estaSeleccionado = seleccionados.has(cat.id);
                  return (
                    <tr 
                      key={cat.id}
                      onClick={() => toggleSeleccionarCategoria(cat.id)}
                      className={`fila-admin ${estaSeleccionado ? 'fila-admin-seleccionada' : ''}`}
                      title="Haz clic para seleccionar/deseleccionar esta categoría"
                    >
                      <td className="align-middle fw-bold">
                        <div className="d-flex align-items-center gap-2">
                          <i 
                            className={`bi bi-${estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted'} fs-6 d-inline-block`}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{cat.id}</span>
                        </div>
                      </td>
                      <td className="align-middle fw-bold">
                        <div>{cat.nombre}</div>
                        {cat.descripcion && (
                          <small className="d-sm-none text-muted d-block">{cat.descripcion}</small>
                        )}
                      </td>
                      <td className="align-middle d-none d-sm-table-cell">{cat.descripcion || '-'}</td>
                      <td className="align-middle d-none d-md-table-cell">
                        <Badge bg={cat.activo ? 'success' : 'secondary'}>
                          {cat.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="action-btn-group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowModal(cat);
                            }}
                            title="Editar categoría"
                          >
                            <i className="bi bi-pencil" />
                            <span className="btn-text">Editar</span>
                          </Button>
                          <Button
                            variant={cat.activo ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarCambioEstado(cat);
                            }}
                            title={cat.activo ? 'Desactivar categoría' : 'Activar categoría'}
                          >
                            <i className={`bi bi-${cat.activo ? 'x-circle' : 'check-circle'}`} />
                            <span className="btn-text">{cat.activo ? 'Desactivar' : 'Activar'}</span>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarEliminar(cat);
                            }}
                            title="Eliminar categoría"
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
        totalItems={categoriasFiltradas.length}
        itemsActuales={categoriasPaginadas.length}
        etiquetaItems="registros"
        onCambiarPagina={setPaginaActual}
        loading={loading}
      />

      {/* Modal Crear / Editar Minimalista */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        centered
        dialogClassName="modal-producto-form"
        backdrop="static"
      >
        <div className="product-minimal-header">
          <div>
            <h6 className="fw-bold mb-0 text-navy fs-6">
              {editando ? 'Editar Categoría' : 'Nueva Categoría'}
            </h6>
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
              {editando ? `ID #${editando.id} — ${editando.nombre}` : 'Ingresa los datos para registrar la categoría'}
            </small>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleCloseModal}
            aria-label="Cerrar"
          />
        </div>

        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-3 p-sm-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Nombre de la Categoría <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Joyería Fina, Accesorios..."
                className="product-minimal-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Descripción (Opcional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción detallada de la categoría..."
                className="product-minimal-input"
              />
            </Form.Group>

            <div className="pt-1">
              <Form.Check
                type="switch"
                id="categoria-switch-activo"
                label="Categoría activa (visible en tienda)"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="small text-secondary fw-medium"
              />
            </div>
          </Modal.Body>

          <div className="product-minimal-footer">
            <button 
              type="button"
              onClick={handleCloseModal}
              className="btn-minimal-cancel"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn-minimal-submit"
            >
              <i className={`bi bi-${editando ? 'check2' : 'plus-lg'}`} />
              {editando ? 'Actualizar Categoría' : 'Guardar Categoría'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Modal de Confirmación Compacto Estilo Dashboard */}
      <ModalConfirmacion
        modal={modalConfirmacion}
        onClose={() => setModalConfirmacion(prev => ({ ...prev, show: false }))}
      />
    </Container>
  );
};

export default AdminCategoriasPage;
