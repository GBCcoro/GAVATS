/**
 * ============================================
 * ADMIN SUBCATEGORÍAS PAGE
 * ============================================
 * Gestión CRUD de subcategorías
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Badge, Row, Col, InputGroup, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import FloatingToast from '../../components/FloatingToast';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import BotonExportar from '../../components/BotonExportar';
import ToolbarSeleccionLote from '../../components/ToolbarSeleccionLote';
import PaginacionTabla from '../../components/PaginacionTabla';
import { exportarSubcategoriasAPDF, exportarSubcategoriasAExcel } from '../../utils/exportUtils';

const AdminSubcategoriasPage = () => {
  const navigate = useNavigate();
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [seleccionados, setSeleccionados] = useState(new Set());
  
  // Modal de confirmación en pantalla
  const [modalConfirmacion, setModalConfirmacion] = useState({ show: false });
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoriaId: 'todas',
    estado: 'todos'
  });
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    activo: true
  });
  
  // Subcategorías filtradas
  const subcategoriasFiltradas = useMemo(() => {
    return subcategorias.filter(sub => {
      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const categoria = categorias.find(c => c.id === sub.categoriaId);
        const coincide = sub.nombre.toLowerCase().includes(busqueda) ||
                        (sub.descripcion?.toLowerCase().includes(busqueda)) ||
                        (categoria?.nombre?.toLowerCase().includes(busqueda));
        if (!coincide) return false;
      }
      
      // Filtro por categoría
      if (filtros.categoriaId !== 'todas' && sub.categoriaId !== Number.parseInt(filtros.categoriaId)) {
        return false;
      }
      
      // Filtro por estado
      if (filtros.estado !== 'todos') {
        if (filtros.estado === 'activos' && !sub.activo) return false;
        if (filtros.estado === 'inactivos' && sub.activo) return false;
      }
      
      return true;
    });
  }, [subcategorias, filtros.busqueda, filtros.categoriaId, filtros.estado, categorias]);

  // Aplicar paginación
  const totalPaginas = Math.ceil(subcategoriasFiltradas.length / registrosPorPagina);
  const subcategoriasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    return subcategoriasFiltradas.slice(inicio, fin);
  }, [subcategoriasFiltradas, paginaActual, registrosPorPagina]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros.busqueda, filtros.categoriaId, filtros.estado]);

  const handleExportar = useCallback(async (tipo = tipoExportacion) => {
    if (tipo === 'pdf') {
      exportarSubcategoriasAPDF(subcategoriasFiltradas, categorias);
    } else {
      await exportarSubcategoriasAExcel(subcategoriasFiltradas, categorias);
    }
  }, [tipoExportacion, subcategoriasFiltradas, categorias]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subcatResponse, catResponse] = await Promise.all([
        api.get('/admin/subcategorias'),
        api.get('/admin/categorias')
      ]);
      const subcatData = subcatResponse.data?.data?.subcategorias || subcatResponse.data?.subcategorias || subcatResponse.data?.data || [];
      const catData = catResponse.data?.data?.categorias || catResponse.data?.categorias || catResponse.data?.data || [];
      setSubcategorias(Array.isArray(subcatData) ? subcatData : []);
      setCategorias(Array.isArray(catData) ? catData : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los datos' });
      setSubcategorias([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShowModal = (subcategoria = null) => {
    if (subcategoria) {
      setEditando(subcategoria);
      setFormData({
        nombre: subcategoria.nombre,
        descripcion: subcategoria.descripcion || '',
        categoriaId: subcategoria.categoriaId,
        activo: subcategoria.activo
      });
    } else {
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        categoriaId: categorias.length > 0 ? categorias[0].id : '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({ nombre: '', descripcion: '', categoriaId: '', activo: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Guardado
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setMensaje({ tipo: 'danger', texto: 'El nombre es obligatorio' });
      return;
    }
    if (!formData.categoriaId) {
      setMensaje({ tipo: 'danger', texto: 'Debes seleccionar una categoría' });
      return;
    }

    try {
      const endpoint = editando ? `/admin/subcategorias/${editando.id}` : '/admin/subcategorias';
      const method = editando ? api.put : api.post;
      await method(endpoint, formData);
      setMensaje({
        tipo: 'success',
        texto: `Subcategoría "${formData.nombre}" ${editando ? 'actualizada' : 'creada'} exitosamente`
      });
      handleCloseModal();
      await loadData();
    } catch (error) {
      console.error('Error al guardar subcategoría:', error);
      setMensaje({ 
        tipo: 'danger', 
        texto: error.response?.data?.message || 'Error al guardar la subcategoría' 
      });
    }
  };

  // Selección de filas
  const todosPaginaSeleccionados = useMemo(() => {
    return subcategoriasPaginadas.length > 0 && subcategoriasPaginadas.every(s => seleccionados.has(s.id));
  }, [subcategoriasPaginadas, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        subcategoriasPaginadas.forEach(s => nuevo.delete(s.id));
      } else {
        subcategoriasPaginadas.forEach(s => nuevo.add(s.id));
      }
      return nuevo;
    });
  };

  const toggleSeleccionarSubcategoria = (id) => {
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
  const solicitarEliminar = (subcategoria) => {
    setModalConfirmacion({
      show: true,
      titulo: '¿Eliminar subcategoría?',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente la subcategoría "${subcategoria.nombre}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          setSubcategorias(prev => prev.filter(s => s.id !== subcategoria.id));
          setSeleccionados(prev => {
            const next = new Set(prev);
            next.delete(subcategoria.id);
            return next;
          });

          await api.delete(`/admin/subcategorias/${subcategoria.id}`);
          setMensaje({ tipo: 'success', texto: `Subcategoría "${subcategoria.nombre}" eliminada exitosamente` });
          await loadData();
        } catch (error) {
          console.error('Error al eliminar subcategoría:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: error.response?.data?.message || 'Error al eliminar la subcategoría' 
          });
          await loadData();
        }
      }
    });
  };

  // Toggle estado individual con modal
  const solicitarCambioEstado = (subcategoria) => {
    const nuevoEstado = !subcategoria.activo;
    setModalConfirmacion({
      show: true,
      titulo: nuevoEstado ? '¿Activar subcategoría?' : '¿Desactivar subcategoría?',
      mensaje: `¿Deseas cambiar el estado de "${subcategoria.nombre}" a "${nuevoEstado ? 'Activo' : 'Inactivo'}"?`,
      tipo: nuevoEstado ? 'success' : 'warning',
      icono: nuevoEstado ? 'check-circle-fill' : 'x-circle-fill',
      textoConfirmar: nuevoEstado ? 'Activar' : 'Desactivar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/subcategorias/${subcategoria.id}/toggle`);
          const nuevoEstadoRes = res.data?.data?.subcategoria?.activo ?? nuevoEstado;
          
          setSubcategorias(prev => 
            prev.map(s => 
              s.id === subcategoria.id ? { ...s, activo: nuevoEstadoRes } : s
            )
          );
          
          setMensaje({ 
            tipo: 'success', 
            texto: res.data?.message || `Subcategoría "${subcategoria.nombre}" ${nuevoEstadoRes ? 'activada' : 'desactivada'} exitosamente` 
          });
        } catch (error) {
          console.error('Error al cambiar estado:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: error.response?.data?.message || 'Error al cambiar el estado de la subcategoría' 
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
      titulo: `¿Eliminar ${count} subcategoría${count !== 1 ? 's' : ''}?`,
      mensaje: `Se eliminarán permanentemente las ${count} subcategorías seleccionadas. ¿Deseas continuar?`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          const idsSet = new Set(ids);
          
          setSubcategorias(prev => prev.filter(s => !idsSet.has(s.id)));
          setSeleccionados(new Set());
          
          const resultados = await Promise.allSettled(ids.map(id => api.delete(`/admin/subcategorias/${id}`)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} de ${ids.length} subcategorías eliminadas exitosamente` 
          });
          
          await loadData();
        } catch (error) {
          console.error('Error en eliminación masiva:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar la eliminación masiva' });
          await loadData();
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
      titulo: `¿Cambiar estado a ${count} subcategoría${count !== 1 ? 's' : ''}?`,
      mensaje: `Se alternará el estado (activado/desactivado) de las ${count} subcategorías seleccionadas.`,
      tipo: 'warning',
      icono: 'arrow-repeat',
      textoConfirmar: 'Actualizar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          setSeleccionados(new Set());
          
          const resultados = await Promise.allSettled(ids.map(id => api.patch(`/admin/subcategorias/${id}/toggle`)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `Estado actualizado en ${exitosos} de ${ids.length} subcategorías` 
          });
          
          await loadData();
        } catch (error) {
          console.error('Error al cambiar estado masivo:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar el cambio de estado masivo' });
          await loadData();
        }
      }
    });
  };

  const categoriasMap = useMemo(() => {
    const map = new Map();
    categorias.forEach(c => map.set(Number(c.id), c.nombre));
    return map;
  }, [categorias]);

  const obtenerNombreCategoria = useCallback((categoriaId) => {
    return categoriasMap.get(Number(categoriaId)) || '-';
  }, [categoriasMap]);

  if (loading) {
    return <LoadingSpinner message="Cargando subcategorías..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar Responsivo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <span className="bi bi-folder2 me-2 text-gold" aria-hidden="true"></span> Gestión de Subcategorías
          </h1>
          <p className="text-muted mb-0">
            Total: {subcategoriasFiltradas.length} de {subcategorias.length} subcategoría{subcategorias.length !== 1 ? 's' : ''}
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
            <i className="bi bi-plus-circle me-1"></i> Nueva Subcategoría
          </Button>
        </div>
      </div>

      {/* Notificación flotante inferior izquierda mediante FloatingToast */}
      <FloatingToast mensaje={mensaje} onClose={() => setMensaje({ tipo: '', texto: '' })} />

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4 admin-card-table">
        <Card.Body className="p-3 p-md-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-navy">
            <span className="bi bi-funnel text-gold" aria-hidden="true"></span> Filtros de Búsqueda
          </h6>
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Group controlId="filtroBusquedaSubcat">
                <Form.Label className="small fw-semibold mb-1">Buscar Subcategoría</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <span className="bi bi-search" aria-hidden="true"></span>
                  </InputGroup.Text>
                  <Form.Control
                    id="filtroBusquedaSubcat"
                    placeholder="Buscar por nombre, descripción..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="filtroCategoriaSubcat">
                <Form.Label className="small fw-semibold mb-1">Categoría</Form.Label>
                <Form.Select
                  id="filtroCategoriaSubcat"
                  value={filtros.categoriaId}
                  onChange={(e) => setFiltros(prev => ({ ...prev, categoriaId: e.target.value }))}
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filtroEstadoSubcat">
                <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
                <Form.Select
                  id="filtroEstadoSubcat"
                  value={filtros.estado}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Barra de Acciones de Selección Múltiple */}
      <ToolbarSeleccionLote
        totalItems={subcategoriasPaginadas.length}
        todosSeleccionados={todosPaginaSeleccionados}
        cantidadSeleccionados={seleccionados.size}
        etiquetaItem="subcategoría"
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
              const subSel = subcategorias.find(s => s.id === idSel);
              if (subSel) handleShowModal(subSel);
            }}
            title="Editar la subcategoría seleccionada"
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
          title="Activar o desactivar las subcategorías seleccionadas"
        >
          <i className="bi bi-arrow-repeat"></i>
          <span>Activar / Desactivar ({seleccionados.size})</span>
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="d-inline-flex align-items-center gap-1 fw-semibold"
          onClick={solicitarEliminacionMasiva}
          title="Eliminar las subcategorías seleccionadas"
        >
          <i className="bi bi-trash-fill"></i>
          <span>Eliminar ({seleccionados.size})</span>
        </Button>
      </ToolbarSeleccionLote>

      {/* Tabla de Subcategorías Responsiva */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>Nombre</th>
                <th className="d-none d-sm-table-cell">Categoría</th>
                <th className="d-none d-md-table-cell">Descripción</th>
                <th className="d-none d-md-table-cell" style={{ width: '110px' }}>Estado</th>
                <th className="text-center" style={{ width: '130px', minWidth: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subcategoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No hay subcategorías registradas
                  </td>
                </tr>
              ) : (
                subcategoriasPaginadas.map((sub) => {
                  const estaSeleccionado = seleccionados.has(sub.id);
                  return (
                    <tr 
                      key={sub.id}
                      onClick={() => toggleSeleccionarSubcategoria(sub.id)}
                      className={`fila-admin ${estaSeleccionado ? 'fila-admin-seleccionada' : ''}`}
                      title="Haz clic para seleccionar/deseleccionar esta subcategoría"
                    >
                      <td className="align-middle fw-bold">
                        <div className="d-flex align-items-center gap-2">
                          <i 
                            className={`bi bi-${estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted'} fs-6 d-inline-block`}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{sub.id}</span>
                        </div>
                      </td>
                      <td className="align-middle fw-bold">
                        <div>{sub.nombre}</div>
                        <small className="d-sm-none text-muted d-block">
                          {obtenerNombreCategoria(sub.categoriaId)}
                        </small>
                      </td>
                      <td className="align-middle d-none d-sm-table-cell">
                        <Badge bg="info">
                          {obtenerNombreCategoria(sub.categoriaId)}
                        </Badge>
                      </td>
                      <td className="align-middle d-none d-md-table-cell">{sub.descripcion || '-'}</td>
                      <td className="align-middle d-none d-md-table-cell">
                        <Badge bg={sub.activo ? 'success' : 'secondary'}>
                          {sub.activo ? 'Activo' : 'Inactivo'}
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
                              handleShowModal(sub);
                            }}
                            title="Editar subcategoría"
                          >
                            <i className="bi bi-pencil" />
                            <span className="btn-text">Editar</span>
                          </Button>
                          <Button
                            variant={sub.activo ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarCambioEstado(sub);
                            }}
                            title={sub.activo ? 'Desactivar subcategoría' : 'Activar subcategoría'}
                          >
                            <i className={`bi bi-${sub.activo ? 'x-circle' : 'check-circle'}`} />
                            <span className="btn-text">{sub.activo ? 'Desactivar' : 'Activar'}</span>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarEliminar(sub);
                            }}
                            title="Eliminar subcategoría"
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
        totalItems={subcategoriasFiltradas.length}
        itemsActuales={subcategoriasPaginadas.length}
        etiquetaItems="registros"
        onCambiarPagina={setPaginaActual}
        loading={loading}
      />

      {/* Modal Crear / Editar Minimalista */}
      <SubcategoriaModal
        show={showModal}
        onHide={handleCloseModal}
        editando={editando}
        formData={formData}
        categorias={categorias}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {/* Modal de Confirmación Compacto Estilo Dashboard */}
      <ModalConfirmacion
        modal={modalConfirmacion}
        onClose={() => setModalConfirmacion(prev => ({ ...prev, show: false }))}
      />
    </Container>
  );
};

// Subcomponente Formulario Crear / Editar Minimalista
const SubcategoriaModal = ({
  show,
  onHide,
  editando,
  formData,
  categorias,
  onChange,
  onSubmit
}) => (
  <Modal 
    show={show} 
    onHide={onHide} 
    centered
    dialogClassName="modal-producto-form"
    backdrop="static"
  >
    <div className="product-minimal-header">
      <div>
        <h6 className="fw-bold mb-0 text-navy fs-6">
          {editando ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
        </h6>
        <small className="text-muted" style={{ fontSize: '0.8rem' }}>
          {editando ? `ID #${editando.id} — ${editando.nombre}` : 'Ingresa los datos para registrar la subcategoría'}
        </small>
      </div>
      <button 
        type="button" 
        className="btn-close" 
        onClick={onHide}
        aria-label="Cerrar"
      />
    </div>

    <Form onSubmit={onSubmit}>
      <Modal.Body className="p-3 p-sm-4">
        <Form.Group controlId="subcat-modal-categoriaId" className="mb-3">
          <Form.Label className="small fw-semibold text-secondary mb-1">
            Categoría Principal <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            id="subcat-modal-categoriaId"
            name="categoriaId"
            value={formData.categoriaId}
            onChange={onChange}
            required
            className="product-minimal-input"
          >
            <option value="">Selecciona una categoría...</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="subcat-modal-nombre" className="mb-3">
          <Form.Label className="small fw-semibold text-secondary mb-1">
            Nombre de la Subcategoría <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            id="subcat-modal-nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            required
            placeholder="Ej: Anillos de Oro, Pulseras..."
            className="product-minimal-input"
          />
        </Form.Group>

        <Form.Group controlId="subcat-modal-descripcion" className="mb-3">
          <Form.Label className="small fw-semibold text-secondary mb-1">
            Descripción (Opcional)
          </Form.Label>
          <Form.Control
            id="subcat-modal-descripcion"
            as="textarea"
            rows={3}
            name="descripcion"
            value={formData.descripcion}
            onChange={onChange}
            placeholder="Descripción detallada de la subcategoría..."
            className="product-minimal-input"
          />
        </Form.Group>

        <div className="pt-1">
          <Form.Check
            type="switch"
            id="subcategoria-switch-activo"
            label="Subcategoría activa (visible en catálogo)"
            name="activo"
            checked={formData.activo}
            onChange={onChange}
            className="small text-secondary fw-medium"
          />
        </div>
      </Modal.Body>

      <div className="product-minimal-footer">
        <button 
          type="button" 
          onClick={onHide}
          className="btn-minimal-cancel"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-minimal-submit"
        >
          <i className={`bi bi-${editando ? 'check2' : 'plus-lg'}`} />
          {editando ? 'Actualizar Subcategoría' : 'Guardar Subcategoría'}
        </button>
      </div>
    </Form>
  </Modal>
);

export default AdminSubcategoriasPage;
