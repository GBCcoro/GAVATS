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
import ModalConfirmacion from '../components/ModalConfirmacion';

const getRolLabel = (isAdmin, isAuxiliar) => {
  if (isAdmin) return 'Administrador';
  if (isAuxiliar) return 'Auxiliar';
  return 'Cliente';
};

const getRolBadgeClass = (isAdmin, isAuxiliar) => {
  if (isAdmin) return 'badge-admin';
  if (isAuxiliar) return 'badge-aux';
  return 'badge-cliente';
};

const getRolIcon = (isAdmin, isAuxiliar) => {
  if (isAdmin) return 'bi-shield-lock-fill';
  if (isAuxiliar) return 'bi-person-gear';
  return 'bi-person-check-fill';
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

const verificarHayCambios = ({ user, formData, isAuxiliar, isCliente, isAdmin }) => {
  const nombreOriginal = (user?.nombre || '').trim();
  const nombreNuevo = (formData.nombre || '').trim();

  const emailOriginal = (user?.email || '').trim().toLowerCase();
  const emailNuevo = (formData.email || '').trim().toLowerCase();

  const telefonoOriginal = (user?.telefono || '').trim();
  const telefonoNuevo = (formData.telefono || '').trim();

  const direccionOriginal = (user?.direccion || '').trim();
  const direccionNuevo = (formData.direccion || '').trim();

  if (nombreOriginal !== nombreNuevo) return true;
  if (!isAuxiliar && emailOriginal !== emailNuevo) return true;
  if (telefonoOriginal !== telefonoNuevo) return true;
  if ((isCliente || isAdmin) && direccionOriginal !== direccionNuevo) return true;

  return false;
};

const validarFormularioPerfil = (formData, isAuxiliar) => {
  if (!isAuxiliar && formData.email) {
    const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return 'Por favor ingresa un correo electrónico válido';
    }
  }
  if (formData.telefono && formData.telefono.length !== 10) {
    return 'El teléfono debe tener exactamente 10 dígitos numéricos';
  }
  return null;
};

const prepararDatosActualizacion = (formData, isAuxiliar, isAdmin, passwordAuth, passwordAdmin) => {
  const datos = { ...formData };
  if (isAuxiliar) {
    delete datos.email;
  }
  if (isAdmin) {
    datos.passwordActual = passwordAuth || passwordAdmin;
  }
  return datos;
};

// ============================================
// SUBCOMPONENTES MODULARES
// ============================================

function BannerPerfil({
  user,
  rolLabel,
  rolBadgeClass,
  rolIcon,
  isEditing,
  loading,
  onIniciarEdicion,
  onCancelarEdicion,
  onGuardar
}) {
  return (
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
            <Badge className={`perfil-badge-rol ${rolBadgeClass}`}>
              <span className={`bi ${rolIcon} me-1`} aria-hidden="true" />
              <span>{rolLabel}</span>
            </Badge>
          </div>
          <p className="perfil-hero-email mb-2 text-muted">
            <span className="bi bi-envelope-at me-2" aria-hidden="true" />
            <span>{user?.email}</span>
          </p>
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-3 small text-muted">
            <span>
              <span className="bi bi-calendar3 me-1 text-gold" aria-hidden="true" />
              <span>Miembro desde: </span><strong>{formatDate(user?.createdAt)}</strong>
            </span>
            <span>
              <span className="bi bi-check-circle-fill me-1 text-success" aria-hidden="true" />
              <span>Estado: </span><strong>Activo</strong>
            </span>
          </div>
        </Col>
        <Col xs={12} md="auto" className="text-center text-md-end">
          {!isEditing ? (
            <Button
              type="button"
              variant="primary"
              className="btn-editar-perfil d-inline-flex align-items-center gap-2 px-4 py-2"
              onClick={onIniciarEdicion}
            >
              <span className="bi bi-pencil-square" aria-hidden="true" />
              <span>Editar Información</span>
            </Button>
          ) : (
            <div className="d-flex gap-2 justify-content-center justify-content-md-end">
              <Button
                type="button"
                variant="outline-secondary"
                className="px-3 py-2 fw-semibold"
                onClick={onCancelarEdicion}
                disabled={loading}
              >
                <span className="bi bi-x-lg me-1" aria-hidden="true" />
                <span>Cancelar</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                className="btn-guardar-perfil px-4 py-2 fw-semibold"
                onClick={onGuardar}
                disabled={loading}
              >
                <span className="bi bi-check2-circle me-1" aria-hidden="true" />
                <span>{loading ? 'Guardando...' : 'Guardar'}</span>
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}

function ResumenCuenta({ user, rolLabel, isAdmin, isCliente }) {
  return (
    <Card className="perfil-sidebar-card shadow-sm mb-4">
      <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
        <span className="bi bi-person-lines-fill text-gold fs-5" aria-hidden="true" />
        <span className="fw-bold">Resumen de Cuenta</span>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        <div className="resumen-item mb-3 pb-3 border-bottom">
          <span className="resumen-label text-muted small d-block">Tipo de Acceso</span>
          <span className="resumen-value fw-bold text-navy">{rolLabel}</span>
        </div>
        <div className="resumen-item mb-3 pb-3 border-bottom">
          <span className="resumen-label text-muted small d-block">Identificador de Usuario</span>
          <span className="resumen-value font-monospace small text-muted">ID #{user?.id || '—'}</span>
        </div>
        <div className="resumen-item mb-3 pb-3 border-bottom">
          <span className="resumen-label text-muted small d-block">Teléfono registrado</span>
          <span className="resumen-value fw-semibold text-navy">
            {user?.telefono ? (
              <>
                <span className="bi bi-telephone-fill me-1 text-gold small" aria-hidden="true" />
                <span>{user.telefono}</span>
              </>
            ) : (
              <span className="text-muted fst-italic">No especificado</span>
            )}
          </span>
        </div>
        {(isCliente || isAdmin) && (
          <div className="resumen-item mb-2">
            <span className="resumen-label text-muted small d-block">
              {isAdmin ? 'Dirección registrada / contacto' : 'Dirección de entrega'}
            </span>
            <span className="resumen-value fw-semibold text-navy">
              {user?.direccion ? (
                <>
                  <span className="bi bi-geo-alt-fill me-1 text-gold small" aria-hidden="true" />
                  <span>{user.direccion}</span>
                </>
              ) : (
                <span className="text-muted fst-italic">No especificada</span>
              )}
            </span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function FormularioDatosPerfil({
  formData,
  isEditing,
  isAuxiliar,
  isAdmin,
  isCliente,
  rolLabel,
  onInputChange,
  onSubmit
}) {
  return (
    <Card className="perfil-main-card shadow-sm mb-4">
      <Card.Header className="perfil-card-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="bi bi-shield-check text-gold fs-5" aria-hidden="true" />
          <span className="fw-bold">Detalles de la Cuenta</span>
        </div>
        {isEditing && (
          <Badge bg="warning" text="dark" className="px-2 py-1">
            Modo Edición
          </Badge>
        )}
      </Card.Header>
      <Card.Body className="p-4">
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            {/* Correo Electrónico */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-navy small">
                  Correo Electrónico
                  {!isAuxiliar ? (
                    isEditing && (
                      <Badge bg="info" text="dark" className="ms-2 small" style={{ fontSize: '0.65rem' }}>
                        Modificable
                      </Badge>
                    )
                  ) : (
                    <Badge bg="secondary" className="ms-2 small" style={{ fontSize: '0.65rem' }}>
                      No modificable
                    </Badge>
                  )}
                </Form.Label>
                <div className="input-group">
                  <span className={`input-group-text ${isEditing && !isAuxiliar ? 'bg-white' : 'bg-light'} border-end-0`}>
                    <span className={`bi bi-envelope ${isEditing && !isAuxiliar ? 'text-gold' : 'text-muted'}`} aria-hidden="true" />
                  </span>
                  <Form.Control
                    type="email"
                    name="email"
                    id="perfil-email"
                    value={formData.email}
                    onChange={onInputChange}
                    disabled={!isEditing || isAuxiliar}
                    placeholder="tu@correo.com"
                    className={isEditing && !isAuxiliar ? 'border-start-0 perfil-input-edit' : 'border-start-0 bg-light text-muted'}
                    required
                  />
                </div>
                {isAuxiliar && isEditing && (
                  <Form.Text className="text-muted small">
                    Las cuentas con rol Auxiliar no tienen permitido cambiar su correo electrónico.
                  </Form.Text>
                )}
                {isAdmin && isEditing && (
                  <Form.Text className="text-muted small">
                    Como Administrador puedes cambiar tu correo electrónico. Se solicitará tu contraseña para autorizar los cambios.
                  </Form.Text>
                )}
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
                    <span className="bi bi-person text-gold" aria-hidden="true" />
                  </span>
                  <Form.Control
                    type="text"
                    name="nombre"
                    id="perfil-nombre"
                    value={formData.nombre}
                    onChange={onInputChange}
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
                    <span className="bi bi-telephone text-gold" aria-hidden="true" />
                  </span>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    id="perfil-telefono"
                    inputMode="numeric"
                    maxLength="10"
                    value={formData.telefono}
                    onChange={onInputChange}
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
                    <span className="bi bi-award text-muted" aria-hidden="true" />
                  </span>
                  <Form.Control
                    type="text"
                    value={rolLabel}
                    disabled
                    className="bg-light border-start-0 text-muted"
                  />
                </div>
              </Form.Group>
            </Col>

            {/* Dirección de Envío / Ubicación (Clientes y Administradores) */}
            {(isCliente || isAdmin) && (
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-navy small">
                    {isAdmin ? 'Dirección de Contacto / Ubicación' : 'Dirección de Envío Principal'}
                  </Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 align-items-start pt-2">
                      <span className="bi bi-geo-alt text-gold" aria-hidden="true" />
                    </span>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="direccion"
                      id="perfil-direccion"
                      value={formData.direccion}
                      onChange={onInputChange}
                      disabled={!isEditing}
                      placeholder={isAdmin ? "Ej: Calle 123 #45-67, Oficina 802, Bogotá" : "Ej: Calle 123 #45-67, Apto 802, Bogotá"}
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
  );
}

function ModalEliminarCuenta({ show, eliminando, modalData, onCerrar, onChangeField, onSubmit }) {
  return (
    <Modal
      show={show}
      onHide={onCerrar}
      centered
      backdrop="static"
      dialogClassName="modal-confirmacion-compacto"
    >
      <Modal.Body className="p-3 p-sm-4">
        <div className="text-center mb-3">
          <div className="confirm-icon-wrapper mb-2 mx-auto bg-danger-subtle text-danger">
            <span className="bi bi-shield-lock-fill confirm-icon" aria-hidden="true" />
          </div>
          <h5 className="fw-bold text-navy mb-1 fs-5">
            ¿Eliminar cuenta permanentemente?
          </h5>
          <p className="text-muted small mb-0 px-2" style={{ maxWidth: '340px', margin: '0 auto' }}>
            Esta acción es irreversible. Para verificar tu identidad, por favor ingresa tu correo electrónico y tu contraseña actual.
          </p>
        </div>

        {modalData.error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
            <span className="bi bi-exclamation-triangle-fill flex-shrink-0" aria-hidden="true" />
            <span>{modalData.error}</span>
          </div>
        )}

        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3 text-start">
            <Form.Label htmlFor="modal-eliminar-email" className="small fw-semibold text-navy">
              Correo Electrónico Actual
            </Form.Label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <span className="bi bi-envelope text-muted" aria-hidden="true" />
              </span>
              <Form.Control
                id="modal-eliminar-email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={modalData.email}
                onChange={(e) => onChangeField('email', e.target.value)}
                disabled={eliminando}
                className="border-start-0"
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4 text-start">
            <Form.Label htmlFor="modal-eliminar-password" className="small fw-semibold text-navy">
              Contraseña Actual
            </Form.Label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <span className="bi bi-lock text-muted" aria-hidden="true" />
              </span>
              <Form.Control
                id="modal-eliminar-password"
                type="password"
                placeholder="Tu contraseña actual"
                value={modalData.password}
                onChange={(e) => onChangeField('password', e.target.value)}
                disabled={eliminando}
                className="border-start-0"
                required
              />
            </div>
          </Form.Group>

          <div className="d-flex gap-2 justify-content-center w-100">
            <Button
              type="button"
              variant="outline-secondary"
              className="px-3 py-2 fw-semibold flex-fill"
              onClick={onCerrar}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              type="submit"
              className="px-3 py-2 fw-semibold flex-fill shadow-sm"
              disabled={eliminando || !modalData.email.trim() || !modalData.password}
            >
              {eliminando ? 'Eliminando...' : 'Eliminar cuenta'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

function AccesosRapidos({ isCliente, isAdmin, isAuxiliar }) {
  if (isCliente) {
    return (
      <Card className="perfil-sidebar-card shadow-sm">
        <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
          <span className="bi bi-compass-fill text-gold fs-5" aria-hidden="true" />
          <span className="fw-bold">Accesos Rápidos</span>
        </Card.Header>
        <Card.Body className="p-3 d-flex flex-column gap-2">
          <Link
            to="/mis-pedidos"
            className="btn btn-outline-primary btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
          >
            <span><span className="bi bi-box-seam me-2 text-gold" aria-hidden="true" /> Mis Pedidos</span>
            <span className="bi bi-chevron-right small" aria-hidden="true" />
          </Link>
          <Link
            to="/carrito"
            className="btn btn-outline-primary btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
          >
            <span><span className="bi bi-cart3 me-2 text-gold" aria-hidden="true" /> Mi Carrito</span>
            <span className="bi bi-chevron-right small" aria-hidden="true" />
          </Link>
          <Link
            to="/catalogo"
            className="btn btn-outline-primary btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
          >
            <span><span className="bi bi-grid me-2 text-gold" aria-hidden="true" /> Explorar Catálogo</span>
            <span className="bi bi-chevron-right small" aria-hidden="true" />
          </Link>
        </Card.Body>
      </Card>
    );
  }

  if (isAdmin || isAuxiliar) {
    return (
      <Card className="perfil-sidebar-card shadow-sm">
        <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
          <span className="bi bi-compass-fill text-gold fs-5" aria-hidden="true" />
          <span className="fw-bold">Accesos Rápidos</span>
        </Card.Header>
        <Card.Body className="p-3 d-flex flex-column gap-2">
          <Link
            to="/admin/dashboard"
            className="btn btn-outline-primary btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
          >
            <span><span className="bi bi-speedometer2 me-2 text-gold" aria-hidden="true" /> Panel de Control</span>
            <span className="bi bi-chevron-right small" aria-hidden="true" />
          </Link>
          <Link
            to="/admin/productos"
            className="btn btn-outline-primary btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
          >
            <span><span className="bi bi-boxes me-2 text-gold" aria-hidden="true" /> Gestor de Productos</span>
            <span className="bi bi-chevron-right small" aria-hidden="true" />
          </Link>
          <Link
            to="/admin/facturas"
            className="btn btn-outline-primary btn-acceso-rapido text-start d-flex align-items-center justify-content-between p-2 px-3"
          >
            <span><span className="bi bi-receipt me-2 text-gold" aria-hidden="true" /> Facturas</span>
            <span className="bi bi-chevron-right small" aria-hidden="true" />
          </Link>
        </Card.Body>
      </Card>
    );
  }

  return null;
}

function PermisosRol({ isAdmin, isAuxiliar, isCliente }) {
  let titulo = 'Beneficios de tu Cuenta';
  if (isAdmin) titulo = 'Privilegios de Administrador';
  else if (isAuxiliar) titulo = 'Privilegios de Auxiliar';

  return (
    <Card className="perfil-main-card shadow-sm mb-4">
      <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
        <span className="bi bi-stars text-gold fs-5" aria-hidden="true" />
        <span className="fw-bold">{titulo}</span>
      </Card.Header>
      <Card.Body className="p-4">
        <ul className="perfil-permissions-list mb-0">
          {isAdmin && (
            <>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Acceso total al panel de administración y métricas ejecutivas</li>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Gestión completa de catálogo, categorías, productos y stock</li>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Administración de usuarios, generación de facturas y reportes contables</li>
            </>
          )}
          {isAuxiliar && (
            <>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Gestión de productos, catálogo y existencias de almacén</li>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Monitoreo y actualización del estado de pedidos de clientes</li>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Visualización de comprobantes y facturas electrónicas</li>
            </>
          )}
          {isCliente && (
            <>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Acceso a compras directas de ventanería y productos en aluminio</li>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Seguimiento en tiempo real de órdenes de pedido y facturación</li>
              <li><span className="bi bi-check-circle-fill text-success me-2" aria-hidden="true" /> Comentarios y valoraciones verificadas de productos</li>
            </>
          )}
        </ul>
      </Card.Body>
    </Card>
  );
}

function GestionCuentaCliente({ desactivando, eliminando, onSolicitarDesactivar, onSolicitarEliminar }) {
  return (
    <Card className="perfil-status-card shadow-sm">
      <Card.Header className="perfil-card-header d-flex align-items-center gap-2">
        <span className="bi bi-shield-slash text-gold fs-5" aria-hidden="true" />
        <span className="fw-bold">Gestión de la Cuenta</span>
      </Card.Header>
      <Card.Body className="p-4 d-flex flex-column gap-4">
        {/* Opción 1: Desactivar Cuenta */}
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 pb-3 border-bottom">
          <div>
            <h6 className="text-navy fw-bold d-flex align-items-center gap-2 mb-1">
              <span className="bi bi-pause-circle-fill text-warning" aria-hidden="true" />
              <span>Desactivar Cuenta</span>
            </h6>
            <p className="text-muted small mb-0" style={{ maxWidth: '520px' }}>
              Tu cuenta pasará a estado Inactivo temporalmente y se cerrará tu sesión. Podrás reactivarla contactando al soporte.
            </p>
          </div>
          <Button
            type="button"
            variant="outline-warning"
            className="btn-desactivar-cuenta text-dark flex-shrink-0 d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            onClick={onSolicitarDesactivar}
            disabled={desactivando || eliminando}
          >
            <span className="bi bi-pause-circle text-warning" aria-hidden="true" />
            <span>{desactivando ? 'Desactivando...' : 'Desactivar cuenta'}</span>
          </Button>
        </div>

        {/* Opción 2: Eliminar Cuenta */}
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div>
            <h6 className="text-danger fw-bold d-flex align-items-center gap-2 mb-1">
              <span className="bi bi-trash3-fill" aria-hidden="true" />
              <span>Eliminar Cuenta Permanentemente</span>
            </h6>
            <p className="text-muted small mb-0" style={{ maxWidth: '520px' }}>
              Se darán de baja definitivamente tus datos en la plataforma. Por seguridad, te solicitaremos tu correo y contraseña para confirmar.
            </p>
          </div>
          <Button
            type="button"
            variant="outline-danger"
            className="btn-eliminar-cuenta flex-shrink-0 d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            onClick={onSolicitarEliminar}
            disabled={desactivando || eliminando}
          >
            <span className="bi bi-trash3-fill" aria-hidden="true" />
            <span>{eliminando ? 'Eliminando...' : 'Eliminar cuenta'}</span>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const PerfilPage = () => {
  const { user, isAdmin, isAuxiliar, isCliente, updateProfile, deleteAccount, desactivarCuenta, eliminarCuenta } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [desactivando, setDesactivando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

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

  const handleCancelarEdicion = () => {
    setIsEditing(false);
    setFormData({
      nombre: user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      direccion: user?.direccion || '',
    });
  };

  const ejecutarGuardado = async (passwordAuth) => {
    setLoading(true);
    try {
      const datosAEnviar = prepararDatosActualizacion(formData, isAuxiliar, isAdmin, passwordAuth, passwordAdmin);
      await updateProfile(datosAEnviar);
      setMensaje({
        tipo: 'success',
        texto: `Usuario "${formData.nombre || user?.nombre}" actualizado exitosamente`
      });
      setIsEditing(false);
      setPasswordAdmin('');
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

  const solicitarGuardar = () => {
    if (!verificarHayCambios({ user, formData, isAuxiliar, isCliente, isAdmin })) {
      setIsEditing(false);
      setMensaje({
        tipo: 'info',
        texto: 'No se detectaron cambios en los datos del perfil'
      });
      return;
    }

    const errorValidacion = validarFormularioPerfil(formData, isAuxiliar);
    if (errorValidacion) {
      setMensaje({
        tipo: 'danger',
        texto: errorValidacion
      });
      return;
    }

    const emailCambio = !isAuxiliar && formData.email && user?.email && formData.email.trim().toLowerCase() !== user.email.toLowerCase();

    if (isAdmin) {
      setPasswordAdmin('');
      setModalConfirmacion({
        show: true,
        titulo: '¿Confirmar cambios de Administrador?',
        mensaje: emailCambio
          ? `Se actualizará tu correo a "${formData.email.trim().toLowerCase()}". Por seguridad, ingresa tu contraseña actual para autorizar los cambios:`
          : 'Por seguridad, ingresa tu contraseña actual para autorizar los cambios en tu cuenta de Administrador:',
        tipo: 'primary',
        icono: 'shield-lock-fill',
        textoConfirmar: 'Guardar cambios',
        textoCancelar: 'Cancelar',
        requierePassword: true,
        onConfirm: async (passwordIngresada) => {
          await ejecutarGuardado(passwordIngresada);
        }
      });
      return;
    }

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
      requierePassword: false,
      onConfirm: async () => {
        await ejecutarGuardado();
      }
    });
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

  const rolLabel = getRolLabel(isAdmin, isAuxiliar);
  const rolBadgeClass = getRolBadgeClass(isAdmin, isAuxiliar);
  const rolIcon = getRolIcon(isAdmin, isAuxiliar);

  return (
    <Container className="perfil-page-container py-4 py-lg-5">
      {/* Notificación flotante inferior izquierda siempre en la ventana */}
      <FloatingToast
        mensaje={mensaje}
        onClose={() => setMensaje({ tipo: '', texto: '' })}
      />

      {/* Encabezado Principal */}
      <BannerPerfil
        user={user}
        rolLabel={rolLabel}
        rolBadgeClass={rolBadgeClass}
        rolIcon={rolIcon}
        isEditing={isEditing}
        loading={loading}
        onIniciarEdicion={() => setIsEditing(true)}
        onCancelarEdicion={handleCancelarEdicion}
        onGuardar={solicitarGuardar}
      />

      <Row className="g-4">
        {/* Columna Izquierda: Información Rápida y Enlaces */}
        <Col xs={12} lg={4}>
          <ResumenCuenta
            user={user}
            rolLabel={rolLabel}
            isAdmin={isAdmin}
            isCliente={isCliente}
          />
          <AccesosRapidos
            isCliente={isCliente}
            isAdmin={isAdmin}
            isAuxiliar={isAuxiliar}
          />
        </Col>

        {/* Columna Derecha: Formulario de Datos y Zona de Peligro */}
        <Col xs={12} lg={8}>
          <FormularioDatosPerfil
            formData={formData}
            isEditing={isEditing}
            isAuxiliar={isAuxiliar}
            isAdmin={isAdmin}
            isCliente={isCliente}
            rolLabel={rolLabel}
            onInputChange={handleInputChange}
            onSubmit={(e) => { e.preventDefault(); if (isEditing) solicitarGuardar(); }}
          />

          <PermisosRol
            isAdmin={isAdmin}
            isAuxiliar={isAuxiliar}
            isCliente={isCliente}
          />

          {isCliente && (
            <GestionCuentaCliente
              desactivando={desactivando}
              eliminando={eliminando}
              onSolicitarDesactivar={solicitarDesactivarCuenta}
              onSolicitarEliminar={() => setModalEliminar({ show: true, email: '', password: '', error: '' })}
            />
          )}
        </Col>
      </Row>

      {/* Modales */}
      <ModalEliminarCuenta
        show={modalEliminar.show}
        eliminando={eliminando}
        modalData={modalEliminar}
        onCerrar={() => !eliminando && setModalEliminar(prev => ({ ...prev, show: false }))}
        onChangeField={(campo, valor) => setModalEliminar(prev => ({ ...prev, [campo]: valor, error: '' }))}
        onSubmit={ejecutarEliminacionCuenta}
      />

      <ModalConfirmacion
        modal={modalConfirmacion}
        passwordAdmin={passwordAdmin}
        setPasswordAdmin={setPasswordAdmin}
        onClose={() => setModalConfirmacion(prev => ({ ...prev, show: false }))}
      />

      {/* ESTILOS DE LA PÁGINA */}
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
