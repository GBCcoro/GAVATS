/**
 * ============================================
 * PÁGINA DE PERFIL DEL USUARIO
 * ============================================
 * Información personal del usuario autenticado con diseño premium.
 * Incluye gestión de datos personales y auto-eliminación de cuenta exclusiva para clientes.
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingToast from '../components/FloatingToast';

const PerfilPage = () => {
  const { user, isAdmin, isAuxiliar, isCliente, updateProfile, deleteAccount, desactivarCuenta, eliminarCuenta } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [desactivando, setDesactivando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Modal de seguridad para eliminar cuenta con verificación de credenciales
  const [modalEliminar, setModalEliminar] = useState({
    show: false,
    email: '',
    password: '',
    error: '',
  });

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });

  // Modal de confirmación estilo Gestor de Usuarios
  const [modalConfirmacion, setModalConfirmacion] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    tipo: 'danger',
    icono: 'trash3-fill',
    textoConfirmar: 'Borrar',
    textoCancelar: 'Cancelar',
    onConfirm: null
  });

  // Sincronizar datos si el usuario en contexto cambia
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
      });
    }
  }, [user]);

  // Limpiar mensaje automáticamente estilo gestores admin
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '' });
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const solicitarGuardar = () => {
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setMensaje({
          tipo: 'danger',
          texto: 'Por favor ingresa un correo electrónico válido'
        });
        return;
      }
    }

    if (formData.telefono && formData.telefono.length !== 10) {
      setMensaje({
        tipo: 'danger',
        texto: 'El teléfono debe tener exactamente 10 dígitos numéricos'
      });
      return;
    }

    const emailCambio = formData.email && user?.email && formData.email.trim().toLowerCase() !== user.email.toLowerCase();

    setModalConfirmacion({
      show: true,
      titulo: '¿Confirmar cambios?',
      mensaje: emailCambio
        ? `¿Deseas confirmar la actualización de tus datos? Tu nuevo correo electrónico será "${formData.email.trim().toLowerCase()}".`
        : '¿Deseas guardar los cambios realizados en tu perfil?',
      tipo: 'primary',
      icono: 'pencil-square',
      textoConfirmar: 'Guardar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        await ejecutarGuardado();
      }
    });
  };

  const ejecutarGuardado = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setMensaje({
        tipo: 'success',
        texto: `Usuario "${formData.nombre || user?.nombre}" actualizado exitosamente`
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      const textoError =
        err.message ||
        err.mensaje ||
        err.error ||
        err.response?.data?.message ||
        err.response?.data?.mensaje ||
        'Error al actualizar el perfil';
      setMensaje({
        tipo: 'danger',
        texto: textoError
      });
    } finally {
      setLoading(false);
    }
  };

  // Solicitar auto-desactivación de cuenta (solo clientes - confirmación sencilla)
  const solicitarDesactivarCuenta = () => {
    const nombreUsuario = user?.nombre || 'tu cuenta';
    setModalConfirmacion({
      show: true,
      titulo: '¿Desactivar cuenta?',
      mensaje: `¿Deseas cambiar el estado de tu cuenta "${nombreUsuario}" a "Inactivo"? Tu sesión se cerrará de inmediato.`,
      tipo: 'warning',
      icono: 'x-circle-fill',
      textoConfirmar: 'Desactivar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        setDesactivando(true);
        try {
          const accion = desactivarCuenta || deleteAccount;
          await accion();
          setMensaje({
            tipo: 'success',
            texto: 'Tu cuenta ha sido desactivada exitosamente'
          });
          setTimeout(() => {
            navigate('/login');
          }, 1200);
        } catch (error) {
          console.error('Error al desactivar cuenta:', error);
          setMensaje({
            tipo: 'danger',
            texto: error.message || error.response?.data?.message || 'Error al desactivar la cuenta'
          });
          setDesactivando(false);
        }
      }
    });
  };

  // Solicitar eliminación permanente de cuenta (solo clientes - pide correo y contraseña)
  const solicitarEliminarCuenta = () => {
    setModalEliminar({
      show: true,
      email: '',
      password: '',
      error: '',
    });
  };

  const ejecutarEliminacionCuenta = async (e) => {
    if (e) e.preventDefault();
    if (!modalEliminar.email.trim() || !modalEliminar.password) {
      setModalEliminar(prev => ({ ...prev, error: 'Debes ingresar tu correo y contraseña para continuar' }));
      return;
    }

    if (modalEliminar.email.trim().toLowerCase() !== user?.email?.toLowerCase()) {
      setModalEliminar(prev => ({ ...prev, error: 'El correo electrónico no coincide con tu cuenta actual' }));
      return;
    }

    setEliminando(true);
    try {
      const accion = eliminarCuenta || deleteAccount;
      await accion(modalEliminar.email.trim(), modalEliminar.password);
      setModalEliminar(prev => ({ ...prev, show: false }));
      setMensaje({
        tipo: 'success',
        texto: 'Tu cuenta ha sido eliminada permanentemente'
      });
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      const errorMsg = error.message || error.response?.data?.message || 'Error al verificar credenciales para eliminar la cuenta';
      setModalEliminar(prev => ({ ...prev, error: errorMsg }));
      setEliminando(false);
    }
  };

  const getRolLabel = () => {
    if (isAdmin) return 'Administrador';
    if (isAuxiliar) return 'Auxiliar';
    return 'Cliente';
  };

  const getInitials = (nombre) => {
    if (!nombre) return 'U';
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container className="perfil-page-container py-4 py-lg-5">
      {/* Notificación flotante inferior izquierda siempre en la ventana */}
      <FloatingToast
        mensaje={mensaje}
        onClose={() => setMensaje({ tipo: '', texto: '' })}
      />

      {/* Encabezado Principal */}
      <div className="perfil-banner mb-4 p-4 p-md-5 rounded-4 shadow-sm">
        <Row className="align-items-center g-4">
          <Col xs={12} md="auto" className="text-center text-md-start">
            <div className="perfil-avatar-outer mx-auto mx-md-0">
              <div className="perfil-avatar-inner">
                {getInitials(user?.nombre || user?.email)}
              </div>
            </div>
          </Col>
          <Col xs={12} md className="text-center text-md-start">
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
              <h1 className="perfil-hero-nombre mb-0">
                {user?.nombre || 'Usuario'}
              </h1>
              <Badge className={`perfil-badge-rol ${isAdmin ? 'badge-admin' : isAuxiliar ? 'badge-aux' : 'badge-cliente'}`}>
                <i className={`bi ${isAdmin ? 'bi-shield-lock-fill' : isAuxiliar ? 'bi-person-gear' : 'bi-person-check-fill'} me-1`} />
                {getRolLabel()}
              </Badge>
            </div>
            <p className="perfil-hero-email mb-2 text-muted">
              <i className="bi bi-envelope-at me-2" />
              {user?.email}
            </p>
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-3 small text-muted">
              <span>
                <i className="bi bi-calendar3 me-1 text-gold" />
                Miembro desde: <strong>{formatDate(user?.createdAt)}</strong>
              </span>
              <span>
                <i className="bi bi-check-circle-fill me-1 text-success" />
                Estado: <strong>Activo</strong>
              </span>
            </div>
          </Col>
          <Col xs={12} md="auto" className="text-center text-md-end">
            {!isEditing ? (
              <Button
                variant="primary"
                className="btn-editar-perfil d-inline-flex align-items-center gap-2 px-4 py-2"
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil-square" />
                <span>Editar Información</span>
              </Button>
            ) : (
              <div className="d-flex gap-2 justify-content-center justify-content-md-end">
                <Button
                  variant="outline-secondary"
                  className="px-3 py-2 fw-semibold"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      nombre: user?.nombre || '',
                      email: user?.email || '',
                      telefono: user?.telefono || '',
                      direccion: user?.direccion || '',
                    });
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-x-lg me-1" />
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="btn-guardar-perfil px-4 py-2 fw-semibold"
                  onClick={solicitarGuardar}
                  disabled={loading}
                >
                  <i className="bi bi-check2-circle me-1" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </div>

      <Row className="g-4">
        {/* Columna Izquierda: Información Rápida y Enlaces */}
        <Col xs={12} lg={4}>
          <Card className="perfil-sidebar-card shadow-sm mb-4">
            <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
              <i className="bi bi-person-lines-fill text-gold fs-5" />
              <span className="fw-bold">Resumen de Cuenta</span>
            </Card.Header>
            <Card.Body className="p-3 p-md-4">
              <div className="resumen-item mb-3 pb-3 border-bottom">
                <span className="resumen-label text-muted small d-block">Tipo de Acceso</span>
                <span className="resumen-value fw-bold text-navy">{getRolLabel()}</span>
              </div>
              <div className="resumen-item mb-3 pb-3 border-bottom">
                <span className="resumen-label text-muted small d-block">Identificador de Usuario</span>
                <span className="resumen-value font-monospace small text-muted">ID #{user?.id || '—'}</span>
              </div>
              <div className="resumen-item mb-3 pb-3 border-bottom">
                <span className="resumen-label text-muted small d-block">Teléfono registrado</span>
                <span className="resumen-value fw-semibold text-navy">
                  {user?.telefono ? (
                    <><i className="bi bi-telephone-fill me-1 text-gold small" />{user.telefono}</>
                  ) : (
                    <span className="text-muted fst-italic">No especificado</span>
                  )}
                </span>
              </div>
              {isCliente && (
                <div className="resumen-item mb-2">
                  <span className="resumen-label text-muted small d-block">Dirección registrada</span>
                  <span className="resumen-value fw-semibold text-navy">
                    {user?.direccion ? (
                      <><i className="bi bi-geo-alt-fill me-1 text-gold small" />{user.direccion}</>
                    ) : (
                      <span className="text-muted fst-italic">No especificada</span>
                    )}
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Accesos rápidos según rol */}
          <Card className="perfil-sidebar-card shadow-sm">
            <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
              <i className="bi bi-compass-fill text-gold fs-5" />
              <span className="fw-bold">Accesos Rápidos</span>
            </Card.Header>
            <Card.Body className="p-3 d-flex flex-column gap-2">
              {isCliente && (
                <>
                  <Button
                    as={Link}
                    to="/mis-pedidos"
                    variant="outline-primary"
                    className="btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
                  >
                    <span><i className="bi bi-box-seam me-2 text-gold" /> Mis Pedidos</span>
                    <i className="bi bi-chevron-right small" />
                  </Button>
                  <Button
                    as={Link}
                    to="/carrito"
                    variant="outline-primary"
                    className="btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
                  >
                    <span><i className="bi bi-cart3 me-2 text-gold" /> Mi Carrito</span>
                    <i className="bi bi-chevron-right small" />
                  </Button>
                  <Button
                    as={Link}
                    to="/catalogo"
                    variant="outline-primary"
                    className="btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
                  >
                    <span><i className="bi bi-grid me-2 text-gold" /> Explorar Catálogo</span>
                    <i className="bi bi-chevron-right small" />
                  </Button>
                </>
              )}
              {(isAdmin || isAuxiliar) && (
                <>
                  <Button
                    as={Link}
                    to="/admin/dashboard"
                    variant="outline-primary"
                    className="btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
                  >
                    <span><i className="bi bi-speedometer2 me-2 text-gold" /> Panel de Control</span>
                    <i className="bi bi-chevron-right small" />
                  </Button>
                  <Button
                    as={Link}
                    to="/admin/productos"
                    variant="outline-primary"
                    className="btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
                  >
                    <span><i className="bi bi-boxes me-2 text-gold" /> Gestor de Productos</span>
                    <i className="bi bi-chevron-right small" />
                  </Button>
                  <Button
                    as={Link}
                    to="/admin/facturas"
                    variant="outline-primary"
                    className="btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
                  >
                    <span><i className="bi bi-receipt me-2 text-gold" /> Facturas</span>
                    <i className="bi bi-chevron-right small" />
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Derecha: Formulario de Datos y Zona de Peligro */}
        <Col xs={12} lg={8}>
          {/* Tarjeta de Datos Personales */}
          <Card className="perfil-main-card shadow-sm mb-4">
            <Card.Header className="perfil-card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-gold fs-5" />
                <span className="fw-bold">Detalles de la Cuenta</span>
              </div>
              {isEditing && (
                <Badge bg="warning" text="dark" className="px-2 py-1">
                  Modo Edición
                </Badge>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={(e) => { e.preventDefault(); if (isEditing) solicitarGuardar(); }}>
                <Row className="g-3">
                  {/* Correo Electrónico */}
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-navy small">
                        Correo Electrónico
                        {isEditing && (
                          <Badge bg="info" text="dark" className="ms-2 small" style={{ fontSize: '0.65rem' }}>
                            Modificable
                          </Badge>
                        )}
                      </Form.Label>
                      <div className="input-group">
                        <span className={`input-group-text ${isEditing ? 'bg-white' : 'bg-light'} border-end-0`}>
                          <i className={`bi bi-envelope ${isEditing ? 'text-gold' : 'text-muted'}`} />
                        </span>
                        <Form.Control
                          type="email"
                          name="email"
                          id="perfil-email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="tu@correo.com"
                          className={isEditing ? 'border-start-0 perfil-input-edit' : 'border-start-0 bg-light text-muted'}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Nombre Completo */}
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-navy small">
                        Nombre Completo
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-person text-gold" />
                        </span>
                        <Form.Control
                          type="text"
                          name="nombre"
                          id="perfil-nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Tu nombre completo"
                          className={isEditing ? 'border-start-0 perfil-input-edit' : 'border-start-0 bg-white'}
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Teléfono */}
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-navy small">
                        Teléfono Móvil
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-telephone text-gold" />
                        </span>
                        <Form.Control
                          type="tel"
                          name="telefono"
                          id="perfil-telefono"
                          inputMode="numeric"
                          maxLength="10"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Ej: 3001234567"
                          className={isEditing ? 'border-start-0 perfil-input-edit' : 'border-start-0 bg-white'}
                        />
                      </div>
                      {isEditing && (
                        <Form.Text className="text-muted small">
                          Debe contener exactamente 10 dígitos numéricos.
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  {/* Rol en la plataforma */}
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-navy small">
                        Rol asignado
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-award text-muted" />
                        </span>
                        <Form.Control
                          type="text"
                          value={getRolLabel()}
                          disabled
                          className="bg-light border-start-0 text-muted"
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Dirección de Envío (Solo Clientes) */}
                  {isCliente && (
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-navy small">
                          Dirección de Envío Principal
                        </Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0 align-items-start pt-2">
                            <i className="bi bi-geo-alt text-gold" />
                          </span>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="direccion"
                            id="perfil-direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Ej: Calle 123 #45-67, Apto 802, Bogotá"
                            className={isEditing ? 'border-start-0 perfil-input-edit' : 'border-start-0 bg-white'}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  )}
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Tarjeta de Permisos o Beneficios */}
          <Card className="perfil-main-card shadow-sm mb-4">
            <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
              <i className="bi bi-stars text-gold fs-5" />
              <span className="fw-bold">
                {isAdmin ? 'Privilegios de Administrador' : isAuxiliar ? 'Privilegios de Auxiliar' : 'Beneficios de tu Cuenta'}
              </span>
            </Card.Header>
            <Card.Body className="p-4">
              <ul className="perfil-permissions-list mb-0">
                {isAdmin && (
                  <>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Acceso total al panel de administración y métricas ejecutivas</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Gestión completa de catálogo, categorías, productos y stock</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Administración de usuarios, generación de facturas y reportes contables</li>
                  </>
                )}
                {isAuxiliar && (
                  <>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Gestión de productos, catálogo y existencias de almacén</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Monitoreo y actualización del estado de pedidos de clientes</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Visualización de comprobantes y facturas electrónicas</li>
                  </>
                )}
                {isCliente && (
                  <>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Acceso a compras directas de ventanería y productos en aluminio</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Seguimiento en tiempo real de órdenes de pedido y facturación</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2" /> Comentarios y valoraciones verificadas de productos</li>
                  </>
                )}
              </ul>
            </Card.Body>
          </Card>

          {/* ========================================================================= */}
          {/* GESTIÓN DE CUENTA: Desactivar (sencillo) o Eliminar (correo y contraseña) */}
          {/* ========================================================================= */}
          {isCliente && (
            <Card className="perfil-status-card shadow-sm">
              <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
                <i className="bi bi-shield-slash text-gold fs-5" />
                <span className="fw-bold">Gestión de la Cuenta</span>
              </Card.Header>
              <Card.Body className="p-4 d-flex flex-column gap-4">
                {/* Opción 1: Desactivar Cuenta (Confirmación sencilla) */}
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 pb-3 border-bottom">
                  <div>
                    <h6 className="text-navy fw-bold d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-pause-circle-fill text-warning" />
                      Desactivar Cuenta
                    </h6>
                    <p className="text-muted small mb-0" style={{ maxWidth: '520px' }}>
                      Tu cuenta pasará a estado Inactivo temporalmente y se cerrará tu sesión. Podrás reactivarla contactando al soporte.
                    </p>
                  </div>
                  <Button
                    variant="outline-warning"
                    className="btn-desactivar-cuenta text-dark flex-shrink-0 d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold"
                    onClick={solicitarDesactivarCuenta}
                    disabled={desactivando || eliminando}
                  >
                    <i className="bi bi-pause-circle text-warning" />
                    <span>{desactivando ? 'Desactivando...' : 'Desactivar cuenta'}</span>
                  </Button>
                </div>

                {/* Opción 2: Eliminar Cuenta (Requiere correo y contraseña) */}
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                  <div>
                    <h6 className="text-danger fw-bold d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-trash3-fill" />
                      Eliminar Cuenta Permanentemente
                    </h6>
                    <p className="text-muted small mb-0" style={{ maxWidth: '520px' }}>
                      Se darán de baja definitivamente tus datos en la plataforma. Por seguridad, te solicitaremos tu correo y contraseña para confirmar.
                    </p>
                  </div>
                  <Button
                    variant="outline-danger"
                    className="btn-eliminar-cuenta flex-shrink-0 d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold"
                    onClick={solicitarEliminarCuenta}
                    disabled={desactivando || eliminando}
                  >
                    <i className="bi bi-trash3-fill" />
                    <span>{eliminando ? 'Eliminando...' : 'Eliminar cuenta'}</span>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* ========================================================================= */}
      {/* MODAL DE SEGURIDAD PARA ELIMINAR CUENTA (PIDE CORREO Y CONTRASEÑA)        */}
      {/* ========================================================================= */}
      <Modal
        show={modalEliminar.show}
        onHide={() => !eliminando && setModalEliminar(prev => ({ ...prev, show: false }))}
        centered
        backdrop="static"
        dialogClassName="modal-confirmacion-compacto"
      >
        <Modal.Body className="p-3 p-sm-4">
          <div className="text-center mb-3">
            <div className="confirm-icon-wrapper mb-2 mx-auto bg-danger-subtle text-danger">
              <i className="bi bi-shield-lock-fill confirm-icon" />
            </div>
            <h5 className="fw-bold text-navy mb-1 fs-5">
              ¿Eliminar cuenta permanentemente?
            </h5>
            <p className="text-muted small mb-0 px-2" style={{ maxWidth: '340px', margin: '0 auto' }}>
              Esta acción es irreversible. Para verificar tu identidad, por favor ingresa tu correo electrónico y tu contraseña actual.
            </p>
          </div>

          {modalEliminar.error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
              <span>{modalEliminar.error}</span>
            </div>
          )}

          <Form onSubmit={ejecutarEliminacionCuenta}>
            <Form.Group className="mb-3 text-start">
              <Form.Label className="small fw-semibold text-navy">
                Correo Electrónico Actual
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted" />
                </span>
                <Form.Control
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={modalEliminar.email}
                  onChange={(e) => setModalEliminar(prev => ({ ...prev, email: e.target.value, error: '' }))}
                  disabled={eliminando}
                  className="border-start-0"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4 text-start">
              <Form.Label className="small fw-semibold text-navy">
                Contraseña Actual
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted" />
                </span>
                <Form.Control
                  type="password"
                  placeholder="Tu contraseña actual"
                  value={modalEliminar.password}
                  onChange={(e) => setModalEliminar(prev => ({ ...prev, password: e.target.value, error: '' }))}
                  disabled={eliminando}
                  className="border-start-0"
                  required
                />
              </div>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-center w-100">
              <Button
                variant="outline-secondary"
                className="px-3 py-2 fw-semibold flex-fill"
                onClick={() => setModalEliminar(prev => ({ ...prev, show: false }))}
                disabled={eliminando}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                type="submit"
                className="px-3 py-2 fw-semibold flex-fill shadow-sm"
                disabled={eliminando || !modalEliminar.email.trim() || !modalEliminar.password}
              >
                {eliminando ? 'Eliminando...' : 'Eliminar cuenta'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMACIÓN COMPACTO ESTILO GESTOR DE PRODUCTOS/USUARIOS        */}
      {/* ========================================================================= */}
      <Modal
        show={modalConfirmacion.show}
        onHide={() => setModalConfirmacion(prev => ({ ...prev, show: false }))}
        centered
        backdrop="static"
        dialogClassName="modal-confirmacion-compacto"
      >
        <Modal.Body className="text-center p-3 p-sm-4">
          <div
            className={`confirm-icon-wrapper mb-3 mx-auto bg-${modalConfirmacion.tipo === 'danger' ? 'danger-subtle' :
              modalConfirmacion.tipo === 'warning' ? 'warning-subtle' :
                'primary-subtle'
              } text-${modalConfirmacion.tipo || 'primary'}`}
          >
            <i className={`bi bi-${modalConfirmacion.icono || 'trash3-fill'} confirm-icon`} />
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
              variant={modalConfirmacion.tipo || 'danger'}
              className="px-3 py-2 fw-semibold flex-fill shadow-sm"
              onClick={async () => {
                const action = modalConfirmacion.onConfirm;
                setModalConfirmacion(prev => ({ ...prev, show: false }));
                if (action) await action();
              }}
            >
              {modalConfirmacion.textoConfirmar || 'Borrar'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ========================================================================= */}
      {/* ESTILOS DE LA PÁGINA (Consistentes con la paleta de toda la plataforma)   */}
      {/* ========================================================================= */}
      <style>{`
        .perfil-page-container {
          min-height: calc(100vh - 180px);
        }
        .perfil-banner {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 4px 15px rgba(25, 40, 71, 0.05);
        }
        .perfil-avatar-outer {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(199, 152, 78, 0.25);
        }
        .perfil-avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--bg-negativo, #192847);
          color: #ffffff;
          font-weight: 700;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 1px;
        }
        .perfil-hero-nombre {
          font-weight: 700;
          color: var(--bg-negativo, #192847);
          font-size: 1.75rem;
        }
        .perfil-hero-email {
          font-size: 0.95rem;
        }
        .perfil-badge-rol {
          font-size: 0.8rem;
          padding: 0.4rem 0.75rem;
          border-radius: 9999px;
          font-weight: 600;
        }
        .badge-admin {
          background: #dc3545;
          color: #ffffff;
        }
        .badge-aux {
          background: #f59e0b;
          color: #ffffff;
        }
        .badge-cliente {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          color: #000000;
        }
        .btn-editar-perfil, .btn-guardar-perfil {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          border: none;
          color: #000000;
          font-weight: 600;
          border-radius: 0.6rem;
          transition: all 0.2s ease;
        }
        .btn-editar-perfil:hover, .btn-guardar-perfil:hover {
          background: linear-gradient(135deg, var(--bs-gold-dark, #c7984e), var(--bs-gold, #f5c271));
          color: #000000;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(199, 152, 78, 0.3);
        }
        .perfil-sidebar-card, .perfil-main-card {
          border-radius: 1.25rem;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #ffffff;
          overflow: hidden;
        }
        .perfil-card-header {
          background: var(--bg-positiva, #DBE1ED);
          border-bottom: none;
          padding: 1rem 1.25rem;
          color: var(--bg-negativo, #192847);
        }
        .btn-acceso-rapido {
          border-color: #e2e8f0;
          color: var(--bg-negativo, #192847);
          border-radius: 0.6rem;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .btn-acceso-rapido:hover {
          background: #f8fafc;
          border-color: var(--bs-gold, #f5c271);
          color: var(--bg-negativo, #192847);
          transform: translateX(3px);
        }
        .perfil-input-edit:focus {
          border-color: #c7984e !important;
          box-shadow: 0 0 0 3px rgba(199, 152, 78, 0.2) !important;
        }
        .perfil-permissions-list {
          list-style: none;
          padding-left: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          font-size: 0.92rem;
          color: #475569;
        }
        .perfil-status-card {
          border-radius: 1.25rem;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #ffffff;
          overflow: hidden;
        }
        .btn-desactivar-cuenta {
          border-radius: 0.6rem;
          transition: all 0.2s ease;
        }
        .btn-desactivar-cuenta:hover {
          background: #f59e0b;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }
        .btn-eliminar-cuenta {
          border-radius: 0.6rem;
          transition: all 0.2s ease;
        }
        .btn-eliminar-cuenta:hover {
          background: #dc3545;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.25);
        }
      `}</style>
    </Container>
  );
};

export default PerfilPage;
