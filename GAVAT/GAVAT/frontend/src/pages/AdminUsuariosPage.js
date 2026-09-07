/**
 * ============================================
 * ADMIN USUARIOS PAGE
 * ============================================
 * Gestión CRUD de usuarios y roles
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import usuarioService from '../services/usuarioService';
import { exportarUsuariosAPDF, exportarUsuariosAExcel } from '../utils/exportUtils';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminUsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editando, setEditando] = useState(false);
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
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
  
  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    rol: 'cliente',
    activo: true
  });
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    rol: 'todos',
    estado: 'todos'
  });
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
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

  const filtrosAnteriores = useRef({ busquedaDebounced, rol: filtros.rol, estado: filtros.estado });
  useEffect(() => {
    const prev = filtrosAnteriores.current;
    if (
      prev.busquedaDebounced !== busquedaDebounced ||
      prev.rol !== filtros.rol ||
      prev.estado !== filtros.estado
    ) {
      filtrosAnteriores.current = { busquedaDebounced, rol: filtros.rol, estado: filtros.estado };
      setPaginaActual(1);
    }
  }, [busquedaDebounced, filtros.rol, filtros.estado]);

  const getRolBadgeVariant = (rol) => {
    if (rol === 'administrador') return 'danger';
    if (rol === 'auxiliar') return 'warning';
    return 'info';
  };

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pagina: paginaActual,
        limite: registrosPorPagina
      };
      if (busquedaDebounced.trim()) params.buscar = busquedaDebounced.trim();
      if (filtros.rol && filtros.rol !== 'todos') params.rol = filtros.rol;
      if (filtros.estado && filtros.estado !== 'todos') {
        params.activo = filtros.estado === 'activo';
      }

      const res = await usuarioService.obtenerUsuariosPaginados(params);
      const usus = res.data?.usuarios || res.usuarios || res.data || [];
      const paginacion = res.data?.paginacion || res.paginacion || {};

      setUsuarios(Array.isArray(usus) ? usus : []);
      const total = paginacion.total !== undefined ? paginacion.total : usus.length;
      const numPags = paginacion.totalPaginas || Math.max(1, Math.ceil(total / registrosPorPagina));
      setTotalUsuarios(total);
      setTotalPaginas(numPags);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los usuarios' });
      setUsuarios([]);
      setTotalUsuarios(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  }, [paginaActual, busquedaDebounced, filtros.rol, filtros.estado]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios, reloadKey]);

  const recargarUsuarios = useCallback(() => {
    setReloadKey(prev => prev + 1);
  }, []);

  const limpiarFormulario = () => {
    setUsuarioActual({
      id: null,
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
      direccion: '',
      rol: 'cliente',
      activo: true
    });
    setEditando(false);
    setShowPassword(false);
  };

  const handleShowModal = (usuario = null) => {
    setShowPassword(false);
    if (usuario) {
      setUsuarioActual({ ...usuario, password: '' });
      setEditando(true);
    } else {
      limpiarFormulario();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowPassword(false);
    limpiarFormulario();
  };

  // Guardado real
  const ejecutarGuardado = async () => {
    try {
      if (usuarioActual.telefono && usuarioActual.telefono.length !== 10) {
        setMensaje({ tipo: 'danger', texto: 'El teléfono debe tener exactamente 10 dígitos numéricos' });
        return;
      }

      if (editando) {
        const dataActualizar = { ...usuarioActual };
        if (!dataActualizar.password) delete dataActualizar.password;
        await usuarioService.actualizarUsuario(usuarioActual.id, dataActualizar);
        setMensaje({ tipo: 'success', texto: `Usuario "${usuarioActual.nombre}" actualizado exitosamente` });
      } else {
        if (!usuarioActual.password) {
          setMensaje({ tipo: 'danger', texto: 'La contraseña es requerida para nuevos usuarios' });
          return;
        }
        await usuarioService.crearUsuario(usuarioActual);
        setMensaje({ tipo: 'success', texto: `Usuario "${usuarioActual.nombre}" creado exitosamente` });
      }
      handleCloseModal();
      recargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al guardar usuario' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editando) {
      setModalConfirmacion({
        show: true,
        titulo: '¿Actualizar usuario?',
        mensaje: `¿Deseas guardar los cambios realizados en el usuario "${usuarioActual.nombre} ${usuarioActual.apellido || ''}"?`,
        tipo: 'primary',
        icono: 'pencil-square',
        textoConfirmar: 'Actualizar',
        textoCancelar: 'Cancelar',
        onConfirm: async () => {
          await ejecutarGuardado();
        }
      });
    } else {
      ejecutarGuardado();
    }
  };

  // Los usuarios recibidos corresponden a la página actual consultada al backend
  const usuariosPaginados = usuarios;
  const usuariosFiltrados = usuarios;

  // Exportar usuarios bajo demanda consultando el total filtrado
  const obtenerUsuariosParaExportar = async () => {
    try {
      const params = { limite: 1000 };
      if (busquedaDebounced.trim()) params.buscar = busquedaDebounced.trim();
      if (filtros.rol && filtros.rol !== 'todos') params.rol = filtros.rol;
      if (filtros.estado && filtros.estado !== 'todos') {
        params.activo = filtros.estado === 'activo';
      }
      const res = await usuarioService.obtenerUsuariosPaginados(params);
      return res.data?.usuarios || res.usuarios || res.data || [];
    } catch (err) {
      console.error('Error al exportar usuarios:', err);
      return usuarios;
    }
  };

  const handleExportar = async (formato) => {
    setLoading(true);
    try {
      const users = await obtenerUsuariosParaExportar();
      if (formato === 'pdf') {
        exportarUsuariosAPDF(users);
      } else {
        await exportarUsuariosAExcel(users);
      }
    } catch (e) {
      console.error('Error en exportación de usuarios:', e);
      setMensaje({ tipo: 'danger', texto: 'Error al exportar usuarios' });
    } finally {
      setLoading(false);
    }
  };

  const todosPaginaSeleccionados = useMemo(() => {
    return usuariosPaginados.length > 0 && usuariosPaginados.every(u => seleccionados.has(u.id));
  }, [usuariosPaginados, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        usuariosPaginados.forEach(u => nuevo.delete(u.id));
      } else {
        usuariosPaginados.forEach(u => nuevo.add(u.id));
      }
      return nuevo;
    });
  };

  const toggleSeleccionarUsuario = (id) => {
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
  const solicitarEliminar = (usuario) => {
    setModalConfirmacion({
      show: true,
      titulo: '¿Eliminar usuario?',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente al usuario "${usuario.nombre} ${usuario.apellido || ''}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
          setSeleccionados(prev => {
            const next = new Set(prev);
            next.delete(usuario.id);
            return next;
          });

          await usuarioService.eliminarUsuario(usuario.id);
          setMensaje({ tipo: 'success', texto: `Usuario "${usuario.nombre}" eliminado exitosamente` });
          recargarUsuarios();
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al eliminar usuario' });
          recargarUsuarios();
        }
      }
    });
  };

  // Toggle estado individual con modal
  const solicitarCambioEstado = (usuario) => {
    const nuevoEstado = !usuario.activo;
    setModalConfirmacion({
      show: true,
      titulo: nuevoEstado ? '¿Activar usuario?' : '¿Desactivar usuario?',
      mensaje: `¿Deseas cambiar el estado de "${usuario.nombre}" a "${nuevoEstado ? 'Activo' : 'Inactivo'}"?`,
      tipo: nuevoEstado ? 'success' : 'warning',
      icono: nuevoEstado ? 'check-circle-fill' : 'x-circle-fill',
      textoConfirmar: nuevoEstado ? 'Activar' : 'Desactivar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          await usuarioService.cambiarEstado(usuario.id);
          
          setUsuarios(prev => 
            prev.map(u => 
              u.id === usuario.id ? { ...u, activo: nuevoEstado } : u
            )
          );
          
          setMensaje({ 
            tipo: 'success', 
            texto: `Usuario "${usuario.nombre}" ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente` 
          });
          recargarUsuarios();
        } catch (error) {
          console.error('Error al cambiar estado del usuario:', error);
          setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al cambiar estado del usuario' });
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
      titulo: `¿Eliminar ${count} usuario${count !== 1 ? 's' : ''}?`,
      mensaje: `Se eliminarán permanentemente los ${count} usuarios seleccionados. ¿Deseas continuar?`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          const idsSet = new Set(ids);
          
          setUsuarios(prev => prev.filter(u => !idsSet.has(u.id)));
          setSeleccionados(new Set());
          
          const resultados = await Promise.allSettled(ids.map(id => usuarioService.eliminarUsuario(id)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} de ${ids.length} usuarios eliminados exitosamente` 
          });
          
          recargarUsuarios();
        } catch (error) {
          console.error('Error en eliminación masiva:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar la eliminación masiva' });
          recargarUsuarios();
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
      titulo: `¿Cambiar estado a ${count} usuario${count !== 1 ? 's' : ''}?`,
      mensaje: `Se alternará el estado (activado/desactivado) de los ${count} usuarios seleccionados.`,
      tipo: 'warning',
      icono: 'arrow-repeat',
      textoConfirmar: 'Actualizar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          setSeleccionados(new Set());
          
          const resultados = await Promise.allSettled(ids.map(id => usuarioService.cambiarEstado(id)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `Estado actualizado en ${exitosos} de ${ids.length} usuarios` 
          });
          
          recargarUsuarios();
        } catch (error) {
          console.error('Error al cambiar estado masivo:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar el cambio de estado masivo' });
          recargarUsuarios();
        }
      }
    });
  };

  if (loading && usuarios.length === 0 && !filtros.busqueda && filtros.rol === 'todos' && filtros.estado === 'todos') {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar Responsivo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <span className="bi bi-people-fill me-2 text-gold" aria-hidden="true"></span> Gestión de Usuarios
          </h1>
          <p className="text-muted mb-0">
            Total: <strong>{totalUsuarios}</strong> usuario{totalUsuarios !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              disabled={loading}
              onClick={() => handleExportar(tipoExportacion)}
            >
              <span className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} aria-hidden="true"></span>
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="secondary" className="btn-dark dropdown-toggle-split" disabled={loading} />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                handleExportar('pdf');
              }}>
                <span className="bi bi-file-earmark-pdf me-2" aria-hidden="true"></span> Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('excel');
                handleExportar('excel');
              }}>
                <span className="bi bi-file-earmark-excel me-2" aria-hidden="true"></span> Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1"></i> Volver
          </Button>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle me-1"></i> Nuevo Usuario
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
            <Col md={5}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Buscar Usuario</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <span className="bi bi-search" aria-hidden="true"></span>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por nombre o email..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Filtrar por Rol</Form.Label>
                <Form.Select
                  value={filtros.rol}
                  onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
                >
                  <option value="todos">Todos los roles</option>
                  <option value="administrador">Administradores</option>
                  <option value="auxiliar">Auxiliares</option>
                  <option value="cliente">Clientes</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
                <Form.Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => setFiltros({ busqueda: '', rol: 'todos', estado: 'todos' })}
              >
                <span className="bi bi-arrow-clockwise me-1" aria-hidden="true"></span> Limpiar
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
            <span>{todosPaginaSeleccionados ? 'Deseleccionar página' : `Seleccionar todo (${usuariosPaginados.length})`}</span>
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
                  const usuSel = usuarios.find(u => u.id === idSel);
                  if (usuSel) handleShowModal(usuSel);
                }}
                title="Editar el usuario seleccionado"
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
              title="Activar o desactivar los usuarios seleccionados"
            >
              <i className="bi bi-arrow-repeat"></i>
              <span>Activar / Desactivar ({seleccionados.size})</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={solicitarEliminacionMasiva}
              title="Eliminar los usuarios seleccionados"
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

      {/* Tabla de Usuarios Responsiva */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th className="d-none d-lg-table-cell" style={{ width: '130px' }}>Teléfono</th>
                <th style={{ width: '110px' }}>Rol</th>
                <th className="d-none d-sm-table-cell" style={{ width: '100px' }}>Estado</th>
                <th className="text-center" style={{ width: '130px', minWidth: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuariosPaginados.map((usuario) => {
                  const estaSeleccionado = seleccionados.has(usuario.id);
                  return (
                    <tr 
                      key={usuario.id}
                      onClick={() => toggleSeleccionarUsuario(usuario.id)}
                      className={`fila-admin ${estaSeleccionado ? 'fila-admin-seleccionada' : ''}`}
                      title="Haz clic para seleccionar/deseleccionar este usuario"
                    >
                      <td className="align-middle fw-bold">
                        <div className="d-flex align-items-center gap-2">
                          <i 
                            className={`bi bi-${estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted'} fs-6 d-inline-block`}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{usuario.id}</span>
                        </div>
                      </td>
                      <td className="align-middle fw-bold">
                        <div>{usuario.nombre} {usuario.apellido || ''}</div>
                        <small className="d-lg-none text-muted d-block">{usuario.telefono || ''}</small>
                      </td>
                      <td className="align-middle">{usuario.email}</td>
                      <td className="align-middle d-none d-lg-table-cell">{usuario.telefono || '-'}</td>
                      <td className="align-middle">
                        <Badge bg={getRolBadgeVariant(usuario.rol)}>
                          {usuario.rol}
                        </Badge>
                      </td>
                      <td className="align-middle d-none d-sm-table-cell">
                        <Badge bg={usuario.activo ? 'success' : 'secondary'}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
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
                              handleShowModal(usuario);
                            }}
                            title="Editar usuario"
                          >
                            <i className="bi bi-pencil" />
                            <span className="btn-text">Editar</span>
                          </Button>
                          <Button
                            variant={usuario.activo ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarCambioEstado(usuario);
                            }}
                            title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            <i className={`bi bi-${usuario.activo ? 'x-circle' : 'check-circle'}`} />
                            <span className="btn-text">{usuario.activo ? 'Desactivar' : 'Activar'}</span>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarEliminar(usuario);
                            }}
                            title="Eliminar usuario"
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
      <div className="d-flex justify-content-between align-items-center mt-3">
        <small className="text-muted">
          Página <strong>{paginaActual}</strong> de <strong>{totalPaginas || 1}</strong> — Mostrando <strong>{totalUsuarios === 0 ? '0-0' : `${(paginaActual - 1) * registrosPorPagina + 1}-${Math.min(paginaActual * registrosPorPagina, totalUsuarios)}`}</strong> de <strong>{totalUsuarios}</strong> registros
        </small>
        <ButtonGroup size="sm">
          <Button variant="outline-primary" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1 || loading}>
            ««
          </Button>
          <Button variant="outline-primary" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1 || loading}>
            Anterior
          </Button>
          <Button variant="primary" disabled>
            {paginaActual} / {totalPaginas || 1}
          </Button>
          <Button variant="outline-primary" onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual >= totalPaginas || loading}>
            Siguiente
          </Button>
          <Button variant="outline-primary" onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual >= totalPaginas || loading}>
            »»
          </Button>
        </ButtonGroup>
      </div>

      {/* Modal Crear / Editar Usuario Minimalista */}
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
              {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h6>
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
              {editando ? `ID #${usuarioActual.id} — ${usuarioActual.email}` : 'Ingresa los datos para registrar un usuario'}
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
            <Row className="g-2 mb-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Nombre <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={usuarioActual.nombre}
                    onChange={(e) => setUsuarioActual({ ...usuarioActual, nombre: e.target.value })}
                    required
                    placeholder="Ej: Carlos"
                    className="product-minimal-input"
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Apellido
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={usuarioActual.apellido}
                    onChange={(e) => setUsuarioActual({ ...usuarioActual, apellido: e.target.value })}
                    placeholder="Ej: Gómez"
                    className="product-minimal-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Correo Electrónico <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                value={usuarioActual.email}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, email: e.target.value })}
                required
                placeholder="correo@ejemplo.com"
                className="product-minimal-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Contraseña {editando ? <span className="text-muted">(dejar en blanco para mantener)</span> : <span className="text-danger">*</span>}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder={editando ? '••••••••' : 'Mínimo 6 caracteres'}
                  value={usuarioActual.password}
                  onChange={(e) => setUsuarioActual({ ...usuarioActual, password: e.target.value })}
                  required={!editando}
                  className="product-minimal-input"
                />
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  style={{ border: '1px solid #e2e8f0', borderLeft: 'none' }}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </Button>
              </InputGroup>
            </Form.Group>

            <Row className="g-2 mb-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Teléfono
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    inputMode="numeric"
                    maxLength="10"
                    value={usuarioActual.telefono}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setUsuarioActual({ ...usuarioActual, telefono: val });
                    }}
                    placeholder="Ej: 3001234567"
                    className="product-minimal-input"
                  />
                  <Form.Text className="text-muted" style={{ fontSize: '0.72rem' }}>
                    10 dígitos numéricos
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Rol en el Sistema
                  </Form.Label>
                  <Form.Select
                    value={usuarioActual.rol}
                    onChange={(e) => setUsuarioActual({ ...usuarioActual, rol: e.target.value })}
                    className="product-minimal-input"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="auxiliar">Auxiliar</option>
                    <option value="administrador">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Dirección
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={usuarioActual.direccion}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, direccion: e.target.value })}
                placeholder="Dirección de envío o residencia..."
                className="product-minimal-input"
              />
            </Form.Group>

            <div className="pt-1">
              <Form.Check
                type="switch"
                id="usuario-switch-activo"
                label="Usuario activo (habilitado para iniciar sesión)"
                checked={usuarioActual.activo}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, activo: e.target.checked })}
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
              {editando ? 'Actualizar Usuario' : 'Guardar Usuario'}
            </button>
          </div>
        </Form>
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
}

export default AdminUsuariosPage;