/**
 * ============================================
 * ADMIN USUARIOS PAGE
 * ============================================
 * Gestión CRUD de usuarios y roles
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import usuarioService from '../services/usuarioService';
import { exportarUsuariosAPDF, exportarUsuariosAExcel } from '../utils/exportUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import SvgIcon from '../components/SvgIcon';

function AdminUsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editando, setEditando] = useState(false);
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
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
  
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usuarioService.obtenerUsuarios('?limite=1000');
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los usuarios' });
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        const dataActualizar = { ...usuarioActual };
        if (!dataActualizar.password) delete dataActualizar.password;
        await usuarioService.actualizarUsuario(usuarioActual.id, dataActualizar);
        setMensaje({ tipo: 'success', texto: 'Usuario actualizado exitosamente' });
      } else {
        if (!usuarioActual.password) {
          setMensaje({ tipo: 'danger', texto: 'La contraseña es requerida para nuevos usuarios' });
          return;
        }
        await usuarioService.crearUsuario(usuarioActual);
        setMensaje({ tipo: 'success', texto: 'Usuario creado exitosamente' });
      }
      handleCloseModal();
      await cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al guardar usuario' });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await usuarioService.eliminarUsuario(id);
      setMensaje({ tipo: 'success', texto: 'Usuario eliminado exitosamente' });
      await cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar usuario' });
    }
  };

  const handleToggleActivo = async (usuario) => {
    try {
      await usuarioService.cambiarEstado(usuario.id);
      setMensaje({ 
        tipo: 'success', 
        texto: `Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente` 
      });
      await cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar estado del usuario' });
    }
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usuario => {
      const busquedaLower = filtros.busqueda.toLowerCase().trim();
      const pasaBusqueda = !busquedaLower || 
        usuario.nombre.toLowerCase().includes(busquedaLower) ||
        usuario.email.toLowerCase().includes(busquedaLower);
      const pasaRol = filtros.rol === 'todos' || usuario.rol === filtros.rol;
      const pasaEstado = filtros.estado === 'todos' ||
        (filtros.estado === 'activo' && usuario.activo) ||
        (filtros.estado === 'inactivo' && !usuario.activo);
      return pasaBusqueda && pasaRol && pasaEstado;
    });
  }, [usuarios, filtros]);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina);
  const usuariosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return usuariosFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [usuariosFiltrados, paginaActual]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtros.busqueda, filtros.rol, filtros.estado]);

  if (loading) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <i className="bi bi-people-fill me-2 text-gold" />
            Gestión de Usuarios
          </h1>
          <p className="text-muted mb-0">
            Total: {usuariosFiltrados.length} de {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              onClick={() => {
                setTipoExportacion('pdf');
                exportarUsuariosAPDF(usuariosFiltrados);
              }}
            >
              <i className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} />
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="primary" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                exportarUsuariosAPDF(usuariosFiltrados);
              }}>
                <i className="bi bi-file-earmark-pdf me-2" /> Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={async () => {
                setTipoExportacion('excel');
                await exportarUsuariosAExcel(usuariosFiltrados);
              }}>
                <i className="bi bi-file-earmark-excel me-2" /> Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1" /> Volver
          </Button>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle me-1" /> Nuevo Usuario
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
            <Col md={5}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Buscar Usuario</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <i className="bi bi-search" />
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
                <i className="bi bi-arrow-clockwise me-1" /> Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Usuarios */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th className="d-none d-md-table-cell" style={{ width: '50px' }}>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th className="d-none d-lg-table-cell" style={{ width: '130px' }}>Teléfono</th>
                <th style={{ width: '110px' }}>Rol</th>
                <th className="d-none d-sm-table-cell" style={{ width: '100px' }}>Estado</th>
                <th className="text-center" style={{ minWidth: '110px' }}>Acciones</th>
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
                usuariosPaginados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="align-middle d-none d-md-table-cell">{usuario.id}</td>
                    <td className="align-middle fw-bold">
                      <div>{usuario.nombre} {usuario.apellido || ''}</div>
                      <small className="d-lg-none text-muted d-block">{usuario.telefono || ''}</small>
                    </td>
                    <td className="align-middle">{usuario.email}</td>
                    <td className="align-middle d-none d-lg-table-cell">{usuario.telefono || '-'}</td>
                    <td className="align-middle">
                      <Badge bg={usuario.rol === 'administrador' ? 'danger' : usuario.rol === 'auxiliar' ? 'warning' : 'info'}>
                        {usuario.rol}
                      </Badge>
                    </td>
                    <td className="align-middle d-none d-sm-table-cell">
                      <Badge bg={usuario.activo ? 'success' : 'secondary'}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="align-middle text-center">
                      <div className="action-btn-group">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="btn-action-table"
                          onClick={() => handleShowModal(usuario)}
                          title="Editar usuario"
                        >
                          <SvgIcon name="pencil" />
                          <span className="btn-text">Editar</span>
                        </Button>
                        <Button
                          variant={usuario.activo ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          className="btn-action-table"
                          onClick={() => handleToggleActivo(usuario)}
                          title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          <SvgIcon name={usuario.activo ? 'x-circle' : 'check-circle'} />
                          <span className="btn-text">{usuario.activo ? 'Desactivar' : 'Activar'}</span>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="btn-action-table"
                          onClick={() => handleEliminar(usuario.id)}
                          title="Eliminar usuario"
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
            Página {paginaActual} de {totalPaginas} - Mostrando {usuariosPaginados.length} de {usuariosFiltrados.length} registros
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

      {/* Modal Usuario */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-navy">
            {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-2 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Nombre <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={usuarioActual.nombre}
                    onChange={(e) => setUsuarioActual({ ...usuarioActual, nombre: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    value={usuarioActual.apellido}
                    onChange={(e) => setUsuarioActual({ ...usuarioActual, apellido: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                value={usuarioActual.email}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Contraseña {editando ? '(opcional)' : <span className="text-danger">*</span>}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder={editando ? 'Dejar en blanco para mantener actual' : 'Ingrese contraseña'}
                  value={usuarioActual.password}
                  onChange={(e) => setUsuarioActual({ ...usuarioActual, password: e.target.value })}
                  required={!editando}
                />
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </Button>
              </InputGroup>
            </Form.Group>

            <Row className="g-2 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    value={usuarioActual.telefono}
                    onChange={(e) => setUsuarioActual({ ...usuarioActual, telefono: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Rol</Form.Label>
                  <Form.Select
                    value={usuarioActual.rol}
                    onChange={(e) => setUsuarioActual({ ...usuarioActual, rol: e.target.value })}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="auxiliar">Auxiliar</option>
                    <option value="administrador">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Dirección</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={usuarioActual.direccion}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, direccion: e.target.value })}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="usuario-activo"
              label="Usuario activo"
              checked={usuarioActual.activo}
              onChange={(e) => setUsuarioActual({ ...usuarioActual, activo: e.target.checked })}
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
}

export default AdminUsuariosPage;