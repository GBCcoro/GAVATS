/* eslint-disable no-undef */
/**
 * ============================================
 * ADMIN PRODUCTOS PAGE
 * ============================================
 * Gestión CRUD de productos con tabla responsiva,
 * selección múltiple y ventana de confirmación compacta.
 */

import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getImageUrl } from '../../utils/helpers';
import { exportarProductosAPDF, exportarProductosAExcel } from '../../utils/exportUtils';

// ============================================
// CONSTANTES Y HELPERS PUROS
// ============================================

const ICONOS_MENSAJE = {
  success: 'check-circle-fill text-success',
  danger: 'exclamation-octagon-fill text-danger',
  warning: 'exclamation-triangle-fill text-warning',
  info: 'info-circle-fill text-info'
};

const getIconoMensaje = (tipo) => ICONOS_MENSAJE[tipo] || 'info-circle-fill text-info';

const BG_MODAL_CONFIRMACION = {
  danger: 'danger-subtle',
  warning: 'warning-subtle',
  primary: 'primary-subtle',
  info: 'primary-subtle',
  success: 'success-subtle'
};

const getBgModalConfirmacion = (tipo) => BG_MODAL_CONFIRMACION[tipo] || 'primary-subtle';

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio || 0);
};

const getTextoPlaceholderSubcategoria = (categoriaId, count) => {
  if (!categoriaId) return 'Elige categoría primero';
  if (count === 0) return 'Sin subcategorías';
  return 'Selecciona subcategoría...';
};

const getBadgeStockBg = (stock) => {
  if (stock > 10) return 'success';
  if (stock > 0) return 'warning';
  return 'danger';
};

// Componente memoizado para imágenes de productos
const ProductImage = memo(({ imagen, nombre }) => {
  const [imgSrc, setImgSrc] = useState(() => getImageUrl(imagen));
  const hasError = useRef(false);

  useEffect(() => {
    hasError.current = false;
    setImgSrc(getImageUrl(imagen));
  }, [imagen]);

  const handleImageError = useCallback(() => {
    if (!hasError.current) {
      hasError.current = true;
      setImgSrc('/producto-default.jpg');
    }
  }, []);

  return (
    <img
      src={imgSrc}
      alt={nombre}
      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
      className="rounded"
      onError={handleImageError}
    />
  );
});

ProductImage.displayName = 'ProductImage';

// ============================================
// SUBCOMPONENTES MODULARES
// ============================================

function FiltrosProductos({
  busqueda,
  filtroCategoria,
  filtroSubcategoria,
  precioMin,
  precioMax,
  categorias,
  subcategorias,
  onBusquedaChange,
  onCategoriaChange,
  onSubcategoriaChange,
  onPrecioMinChange,
  onPrecioMaxChange,
  onLimpiarFiltros
}) {
  const subcategoriasDisponibles = useMemo(() => {
    if (!filtroCategoria) return [];
    return subcategorias.filter(s => s.categoriaId === Number.parseInt(filtroCategoria, 10) && s.activo);
  }, [subcategorias, filtroCategoria]);

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3 text-navy fw-bold">
          <span className="bi bi-funnel me-2 text-gold" aria-hidden="true" />
          <span>Filtros de Búsqueda</span>
        </h5>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">Buscar</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <span className="bi bi-search" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Nombre o descripción..."
                  value={busqueda}
                  onChange={(e) => onBusquedaChange(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">Categoría</Form.Label>
              <Form.Select
                value={filtroCategoria}
                onChange={(e) => onCategoriaChange(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.filter(c => c.activo).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">Subcategoría</Form.Label>
              <Form.Select
                value={filtroSubcategoria}
                onChange={(e) => onSubcategoriaChange(e.target.value)}
                disabled={!filtroCategoria}
              >
                <option value="">Todas las subcategorías</option>
                {subcategoriasDisponibles.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">Rango de Precio</Form.Label>
              <Row className="g-2">
                <Col xs={6}>
                  <Form.Control
                    type="number"
                    placeholder="Mínimo"
                    value={precioMin}
                    onChange={(e) => onPrecioMinChange(e.target.value)}
                    min="0"
                  />
                </Col>
                <Col xs={6}>
                  <Form.Control
                    type="number"
                    placeholder="Máximo"
                    value={precioMax}
                    onChange={(e) => onPrecioMaxChange(e.target.value)}
                    min="0"
                  />
                </Col>
              </Row>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              onClick={onLimpiarFiltros}
            >
              <span className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
              <span>Limpiar filtros</span>
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

function AccionesProducto({ prod, onEditar, onCambiarEstado, onEliminar }) {
  const handleAccion = (e, accion) => {
    e.stopPropagation();
    accion();
  };

  const estadoIcono = prod.activo ? 'x-circle' : 'check-circle';
  const estadoTexto = prod.activo ? 'Desactivar' : 'Activar';
  const estadoVariant = prod.activo ? 'outline-warning' : 'outline-success';

  return (
    <div className="action-btn-group">
      <Button
        type="button"
        variant="outline-primary"
        size="sm"
        className="btn-action-table"
        onClick={(e) => handleAccion(e, () => onEditar(prod))}
        title="Editar producto"
      >
        <span className="bi bi-pencil" aria-hidden="true" />
        <span className="btn-text">Editar</span>
      </Button>
      <Button
        type="button"
        variant={estadoVariant}
        size="sm"
        className="btn-action-table"
        onClick={(e) => handleAccion(e, () => onCambiarEstado(prod))}
        title={prod.activo ? 'Desactivar producto' : 'Activar producto'}
      >
        <span className={`bi bi-${estadoIcono}`} aria-hidden="true" />
        <span className="btn-text">{estadoTexto}</span>
      </Button>
      <Button
        type="button"
        variant="outline-danger"
        size="sm"
        className="btn-action-table"
        onClick={(e) => handleAccion(e, () => onEliminar(prod))}
        title="Eliminar producto"
      >
        <span className="bi bi-trash" aria-hidden="true" />
        <span className="btn-text">Eliminar</span>
      </Button>
    </div>
  );
}

function FilaProducto({ prod, estaSeleccionado, onToggleSeleccionar, onEditar, onCambiarEstado, onEliminar }) {
  const iconCls = estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted';
  const rowCls = `fila-producto ${estaSeleccionado ? 'fila-producto-seleccionada' : ''}`;

  return (
    <tr 
      onClick={() => onToggleSeleccionar(prod.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleSeleccionar(prod.id);
        }
      }}
      tabIndex={0}
      className={rowCls}
      title="Haz clic o presiona Enter para seleccionar/deseleccionar este producto"
    >
      <td className="align-middle fw-bold">
        <div className="d-flex align-items-center gap-2">
          <span 
            className={`bi bi-${iconCls} fs-6 d-inline-block`}
            style={{ cursor: 'pointer' }}
            aria-hidden="true"
          />
          <span>#{prod.id}</span>
        </div>
      </td>
      <td className="align-middle d-none d-sm-table-cell">
        <ProductImage imagen={prod.imagen} nombre={prod.nombre} />
      </td>
      <td className="align-middle fw-bold">
        <div>{prod.nombre}</div>
        <small className="d-lg-none text-muted d-block">
          {prod.categoria?.nombre || 'Sin categoría'}
        </small>
      </td>
      <td className="align-middle d-none d-lg-table-cell">
        <Badge bg="info">{prod.categoria?.nombre || 'N/A'}</Badge>
        {prod.subcategoria && (
          <><br /><small className="text-muted">{prod.subcategoria.nombre}</small></>
        )}
      </td>
      <td className="align-middle d-none d-sm-table-cell">{formatearPrecio(prod.precio)}</td>
      <td className="align-middle d-none d-md-table-cell">
        <Badge bg={getBadgeStockBg(prod.stock)}>
          {prod.stock}
        </Badge>
      </td>
      <td className="align-middle d-none d-md-table-cell">
        <Badge bg={prod.activo ? 'success' : 'secondary'}>
          {prod.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </td>
      <td className="align-middle text-center">
        <AccionesProducto
          prod={prod}
          onEditar={onEditar}
          onCambiarEstado={onCambiarEstado}
          onEliminar={onEliminar}
        />
      </td>
    </tr>
  );
}

function ModalPreviewFoto({ show, previewImagen, onCerrar, onCambiarFoto, onEliminarFoto }) {
  const [zoomNivel, setZoomNivel] = useState(1);
  const [posicionFoto, setPosicionFoto] = useState({ x: 0, y: 0 });
  const [arrastrandoFoto, setArrastrandoFoto] = useState(false);
  const containerRef = useRef(null);
  const posicionRef = useRef({ x: 0, y: 0 });
  const inicioArrastreFoto = useRef({ x: 0, y: 0 });
  const arrastrandoRef = useRef(false);

  useEffect(() => {
    posicionRef.current = posicionFoto;
  }, [posicionFoto]);

  useEffect(() => {
    arrastrandoRef.current = arrastrandoFoto;
  }, [arrastrandoFoto]);

  useEffect(() => {
    if (show) {
      setZoomNivel(1);
      setPosicionFoto({ x: 0, y: 0 });
      setArrastrandoFoto(false);
    }
  }, [show]);

  const handleZoomIn = () => setZoomNivel(prev => Math.min(Number((prev + 0.25).toFixed(2)), 3.5));
  const handleZoomOut = () => setZoomNivel(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleResetZoom = () => {
    setZoomNivel(1);
    setPosicionFoto({ x: 0, y: 0 });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !show) return;

    const onMouseDown = (e) => {
      e.preventDefault();
      arrastrandoRef.current = true;
      setArrastrandoFoto(true);
      inicioArrastreFoto.current = {
        x: e.clientX - posicionRef.current.x,
        y: e.clientY - posicionRef.current.y
      };
    };

    const onMouseMove = (e) => {
      if (!arrastrandoRef.current) return;
      const nuevoX = e.clientX - inicioArrastreFoto.current.x;
      const nuevoY = e.clientY - inicioArrastreFoto.current.y;
      setPosicionFoto({ x: nuevoX, y: nuevoY });
    };

    const onMouseUp = () => {
      arrastrandoRef.current = false;
      setArrastrandoFoto(false);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        arrastrandoRef.current = true;
        setArrastrandoFoto(true);
        inicioArrastreFoto.current = {
          x: e.touches[0].clientX - posicionRef.current.x,
          y: e.touches[0].clientY - posicionRef.current.y
        };
      }
    };

    const onTouchMove = (e) => {
      if (!arrastrandoRef.current || e.touches.length !== 1) return;
      const nuevoX = e.touches[0].clientX - inicioArrastreFoto.current.x;
      const nuevoY = e.touches[0].clientY - inicioArrastreFoto.current.y;
      setPosicionFoto({ x: nuevoX, y: nuevoY });
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={onCerrar}
      centered
      dialogClassName="modal-preview-foto-dialog"
    >
      <div className="modal-preview-foto-header">
        <div className="fw-semibold text-navy small d-flex align-items-center gap-2">
          <span className="bi bi-arrows-move text-primary" aria-hidden="true" />
          <span>Fotografía del Producto</span>
        </div>

        <div className="zoom-toolbar">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomNivel <= 0.5}
            title="Reducir zoom (-)"
          >
            <span className="bi bi-dash-lg" aria-hidden="true" />
          </button>
          <span className="zoom-badge">
            {Math.round(zoomNivel * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomNivel >= 3.5}
            title="Aumentar zoom (+)"
          >
            <span className="bi bi-plus-lg" aria-hidden="true" />
          </button>
          <div className="vr mx-1 my-auto" style={{ height: '16px' }} />
          <button
            type="button"
            onClick={handleResetZoom}
            title="Restablecer tamaño original y centrar"
          >
            <span className="bi bi-aspect-ratio" aria-hidden="true" />
          </button>
        </div>

        <button 
          type="button" 
          className="btn-close" 
          onClick={onCerrar}
          aria-label="Cerrar"
        />
      </div>

      <Modal.Body className="p-3 p-md-4 text-center bg-light">
        <div 
          ref={containerRef}
          className="modal-preview-foto-wrapper mb-3"
          style={{ cursor: arrastrandoFoto ? 'grabbing' : 'move', overflow: 'hidden' }}
        >
          <img
            src={previewImagen}
            alt="Vista detallada del producto"
            className="modal-preview-foto-img"
            draggable={false}
            style={{ 
              transform: `translate(${posicionFoto.x}px, ${posicionFoto.y}px) scale(${zoomNivel})`, 
              transformOrigin: 'center center',
              cursor: arrastrandoFoto ? 'grabbing' : 'move',
              transition: arrastrandoFoto ? 'none' : 'transform 0.15s ease-out'
            }}
            title="Arrastra para mover la imagen"
            onError={(e) => { 
              e.target.onerror = null;
              e.target.src = '/producto-default.jpg'; 
            }}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-1">
          <small className="text-muted text-start" style={{ fontSize: '0.78rem' }}>
            <span className="bi bi-arrows-move me-1" aria-hidden="true" />
            <span>Arrastra con el ratón para mover la imagen o usa los botones para ajustar el tamaño</span>
          </small>

          <div className="d-flex gap-2 ms-auto">
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1 px-3 py-1"
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
              onClick={onCambiarFoto}
            >
              <span className="bi bi-arrow-repeat" aria-hidden="true" />
              <span>Cambiar foto</span>
            </Button>
            <Button
              type="button"
              variant="outline-danger"
              size="sm"
              className="d-flex align-items-center gap-1 px-3 py-1"
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
              onClick={onEliminarFoto}
            >
              <span className="bi bi-trash3" aria-hidden="true" />
              <span>Eliminar foto</span>
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

function ModalProductoForm({
  show,
  editando,
  formData,
  categorias,
  subcategoriasFiltradas,
  previewImagen,
  fileInputRef,
  onChange,
  onImagenChange,
  onQuitarImagen,
  onAbrirPreviewFoto,
  onClose,
  onSubmit
}) {
  const placeholderSubcat = getTextoPlaceholderSubcategoria(formData.categoriaId, subcategoriasFiltradas.length);

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      dialogClassName="modal-producto-form"
      backdrop="static"
    >
      <div className="product-minimal-header">
        <div>
          <h6 className="fw-bold mb-0 text-navy fs-6">
            {editando ? 'Editar Producto' : 'Nuevo Producto'}
          </h6>
          <small className="text-muted" style={{ fontSize: '0.8rem' }}>
            {editando ? `ID #${editando.id} — ${editando.nombre}` : 'Ingresa los datos para registrar el producto'}
          </small>
        </div>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Cerrar"
        />
      </div>

      <Form onSubmit={onSubmit}>
        <Modal.Body className="p-3 p-sm-4">
          <div className="d-flex gap-3 align-items-center mb-3">
            <div className="position-relative d-inline-block flex-shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={onImagenChange}
              />
              
              <button
                type="button"
                className={`product-minimal-avatar-box ${previewImagen ? 'has-img' : ''}`}
                onClick={onAbrirPreviewFoto}
                title={previewImagen ? "Haz clic para ver, cambiar o eliminar la foto" : "Haz clic para seleccionar una foto"}
              >
                {previewImagen ? (
                  <>
                    <img
                      src={previewImagen}
                      alt="Vista previa"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/producto-default.jpg';
                      }}
                    />
                    <div className="product-minimal-avatar-overlay">
                      <span className="bi bi-eye-fill fs-5 mb-0" aria-hidden="true" />
                      <span style={{ fontSize: '0.62rem' }}>VER</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted">
                    <span className="bi bi-camera text-secondary fs-4 d-block mb-0" aria-hidden="true" />
                    <span style={{ fontSize: '0.65rem' }} className="fw-semibold text-secondary">FOTO</span>
                  </div>
                )}
              </button>

              {previewImagen && (
                <button
                  type="button"
                  className="btn-trash-avatar"
                  onClick={onQuitarImagen}
                  title="Eliminar foto"
                >
                  <span className="bi bi-trash3-fill" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex-grow-1">
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">
                  Nombre del Producto <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={onChange}
                  required
                  placeholder="Ej: Camiseta Oversize, Zapatillas..."
                  className="product-minimal-input"
                />
              </Form.Group>
            </div>
          </div>

          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">
                  Categoría <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={onChange}
                  required
                  className="product-minimal-input"
                >
                  <option value="">Selecciona categoría...</option>
                  {categorias.filter(c => c.activo).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">
                  Subcategoría {!editando && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Select
                  name="subcategoriaId"
                  value={formData.subcategoriaId}
                  onChange={onChange}
                  disabled={!formData.categoriaId || subcategoriasFiltradas.length === 0}
                  required={!editando}
                  className="product-minimal-input"
                >
                  <option value="">{placeholderSubcat}</option>
                  {subcategoriasFiltradas
                    .filter(s => s.activo)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                    ))
                  }
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">
                  Precio ($) <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0 text-muted" style={{ borderRadius: '8px 0 0 8px', fontSize: '0.9rem' }}>
                    $
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={onChange}
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className="product-minimal-input border-start-0"
                    style={{ borderRadius: '0 8px 8px 0' }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary mb-1">
                  Stock Disponible <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={onChange}
                  required
                  min="0"
                  placeholder="0"
                  className="product-minimal-input"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold text-secondary mb-1">
              Descripción
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="descripcion"
              value={formData.descripcion}
              onChange={onChange}
              placeholder="Detalles sobre características o materiales (opcional)..."
              className="product-minimal-input"
            />
          </Form.Group>

          <div className="pt-1">
            <Form.Check
              type="switch"
              id="minimal-switch-activo"
              label="Producto activo (visible en catálogo para clientes)"
              checked={formData.activo}
              onChange={onChange}
              name="activo"
              className="small text-secondary fw-medium"
            />
          </div>
        </Modal.Body>

        <div className="product-minimal-footer">
          <button 
            type="button"
            onClick={onClose}
            className="btn-minimal-cancel"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="btn-minimal-submit"
          >
            <span className={`bi bi-${editando ? 'check2' : 'plus-lg'}`} aria-hidden="true" />
            <span>{editando ? 'Actualizar Producto' : 'Guardar Producto'}</span>
          </button>
        </div>
      </Form>
    </Modal>
  );
}

function ModalConfirmacionCompacto({ modal, onCerrar }) {
  const bgClass = getBgModalConfirmacion(modal.tipo);

  const handleCancelar = () => {
    onCerrar();
    if (modal.onCancel) modal.onCancel();
  };

  const handleConfirmar = async () => {
    const action = modal.onConfirm;
    onCerrar();
    if (action) await action();
  };

  return (
    <Modal 
      show={modal.show} 
      onHide={handleCancelar} 
      centered
      backdrop="static"
      dialogClassName="modal-confirmacion-compacto"
    >
      <Modal.Body className="text-center p-3 p-sm-4">
        <div 
          className={`confirm-icon-wrapper mb-3 mx-auto bg-${bgClass} text-${modal.tipo || 'primary'}`}
        >
          <span className={`bi bi-${modal.icono || 'exclamation-circle-fill'} confirm-icon`} aria-hidden="true" />
        </div>
        
        <h5 className="fw-bold text-navy mb-2 fs-5">
          {modal.titulo}
        </h5>
        
        <p className="text-muted small mb-3 mb-sm-4 px-1" style={{ maxWidth: '300px', margin: '0 auto' }}>
          {modal.mensaje}
        </p>

        <div className="d-flex gap-2 justify-content-center w-100 mt-2">
          <Button 
            type="button"
            variant="outline-secondary" 
            className="px-3 py-2 fw-semibold flex-fill"
            onClick={handleCancelar}
          >
            {modal.textoCancelar || 'Cancelar'}
          </Button>
          <Button 
            type="button"
            variant={modal.tipo || 'primary'} 
            className="px-3 py-2 fw-semibold flex-fill shadow-sm"
            onClick={handleConfirmar}
          >
            {modal.textoConfirmar || 'Confirmar'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const AdminProductosPage = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [previewImagen, setPreviewImagen] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  
  // Estados para filtros y paginación del servidor
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSubcategoria, setFiltroSubcategoria] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const ITEMS_POR_PAGINA = 25;
  
  const [seleccionados, setSeleccionados] = useState(new Set());

  const [modalConfirmacion, setModalConfirmacion] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    tipo: 'danger',
    icono: 'trash3-fill',
    textoConfirmar: 'Confirmar',
    textoCancelar: 'Cancelar',
    onConfirm: null,
    onCancel: null
  });
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoriaId: '',
    subcategoriaId: '',
    activo: true
  });
  
  const fileInputRef = useRef(null);
  const [modalPreviewFoto, setModalPreviewFoto] = useState(false);

  // Debounce para búsqueda en servidor (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 350);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // Resetear a página 1 cuando cambien los filtros
  const filtrosAnteriores = useRef({ busquedaDebounced, filtroCategoria, filtroSubcategoria, precioMin, precioMax });
  useEffect(() => {
    const prev = filtrosAnteriores.current;
    if (
      prev.busquedaDebounced !== busquedaDebounced ||
      prev.filtroCategoria !== filtroCategoria ||
      prev.filtroSubcategoria !== filtroSubcategoria ||
      prev.precioMin !== precioMin ||
      prev.precioMax !== precioMax
    ) {
      filtrosAnteriores.current = { busquedaDebounced, filtroCategoria, filtroSubcategoria, precioMin, precioMax };
      setPaginaActual(1);
    }
  }, [busquedaDebounced, filtroCategoria, filtroSubcategoria, precioMin, precioMax]);

  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = Math.min(paginaActual * ITEMS_POR_PAGINA, totalProductos);

  // Limpiar mensaje automáticamente
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Cargar categorías y subcategorías
  const loadCategoriasYSubcategorias = useCallback(async () => {
    try {
      const [catResponse, subcatResponse] = await Promise.all([
        api.get('/admin/categorias'),
        api.get('/admin/subcategorias')
      ]);
      const cats = catResponse.data?.data?.categorias || catResponse.data?.categorias || catResponse.data?.data || [];
      const subcats = subcatResponse.data?.data?.subcategorias || subcatResponse.data?.subcategorias || subcatResponse.data?.data || [];
      setCategorias(Array.isArray(cats) ? cats : []);
      setSubcategorias(Array.isArray(subcats) ? subcats : []);
    } catch (error) {
      console.error('Error al cargar categorías y subcategorías:', error);
    }
  }, []);

  useEffect(() => {
    loadCategoriasYSubcategorias();
  }, [loadCategoriasYSubcategorias]);

  // Cargar productos con paginación y filtros
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pagina: String(paginaActual),
        limite: String(ITEMS_POR_PAGINA)
      });
      if (busquedaDebounced.trim()) params.append('buscar', busquedaDebounced.trim());
      if (filtroCategoria) params.append('categoriaId', filtroCategoria);
      if (filtroSubcategoria) params.append('subcategoriaId', filtroSubcategoria);
      if (precioMin !== '' && precioMin !== undefined) params.append('precioMin', precioMin);
      if (precioMax !== '' && precioMax !== undefined) params.append('precioMax', precioMax);

      const prodResponse = await api.get(`/admin/productos?${params.toString()}`);
      const prods = prodResponse.data?.data?.productos || prodResponse.data?.productos || prodResponse.data?.data || [];
      const paginacion = prodResponse.data?.data?.paginacion || prodResponse.data?.paginacion || {};

      setProductos(Array.isArray(prods) ? prods : []);
      const total = paginacion.total !== undefined ? paginacion.total : prods.length;
      const numPaginas = paginacion.totalPaginas || Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));
      setTotalProductos(total);
      setTotalPaginas(numPaginas);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los productos' });
      setProductos([]);
      setTotalProductos(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  }, [paginaActual, busquedaDebounced, filtroCategoria, filtroSubcategoria, precioMin, precioMax]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadKey]);

  const recargarProductos = useCallback(() => {
    setReloadKey(prev => prev + 1);
  }, []);

  const obtenerProductosParaExportar = async () => {
    try {
      const params = new URLSearchParams({ limite: '1000' });
      if (busquedaDebounced.trim()) params.append('buscar', busquedaDebounced.trim());
      if (filtroCategoria) params.append('categoriaId', filtroCategoria);
      if (filtroSubcategoria) params.append('subcategoriaId', filtroSubcategoria);
      if (precioMin !== '' && precioMin !== undefined) params.append('precioMin', precioMin);
      if (precioMax !== '' && precioMax !== undefined) params.append('precioMax', precioMax);

      const res = await api.get(`/admin/productos?${params.toString()}`);
      return res.data?.data?.productos || res.data?.productos || res.data?.data || [];
    } catch (err) {
      console.error('Error al obtener productos para exportar:', err);
      return productos;
    }
  };

  const handleExportar = async (formato) => {
    setLoading(true);
    try {
      const prods = await obtenerProductosParaExportar();
      if (formato === 'pdf') {
        exportarProductosAPDF(prods);
      } else {
        await exportarProductosAExcel(prods);
      }
    } catch (e) {
      console.error('Error en exportación:', e);
      setMensaje({ tipo: 'danger', texto: 'Error al exportar productos' });
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (producto = null) => {
    if (producto) {
      setEditando(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        stock: producto.stock,
        categoriaId: producto.categoriaId || '',
        subcategoriaId: producto.subcategoriaId || '',
        activo: producto.activo
      });
      setImagenArchivo(null);
      setPreviewImagen(producto.imagen ? getImageUrl(producto.imagen) : '');
    } else {
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoriaId: '',
        subcategoriaId: '',
        activo: true
      });
      setImagenArchivo(null);
      setPreviewImagen('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoriaId: '',
      subcategoriaId: '',
      activo: true
    });
    setImagenArchivo(null);
    setPreviewImagen('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    
    if ((name === 'categoriaId' || name === 'subcategoriaId') && value !== '') {
      finalValue = Number.parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : finalValue,
      ...(name === 'categoriaId' ? { subcategoriaId: '' } : {})
    }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImagenArchivo(file);

    if (file) {
      setPreviewImagen(URL.createObjectURL(file));
    } else if (editando?.imagen) {
      setPreviewImagen(getImageUrl(editando.imagen));
    } else {
      setPreviewImagen('');
    }
  };

  const handleQuitarImagen = (e) => {
    if (e) e.stopPropagation();
    setImagenArchivo(null);
    setPreviewImagen('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ejecutarGuardado = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion || '');
      formDataToSend.append('precio', String(Number.parseFloat(formData.precio)));
      formDataToSend.append('stock', String(Number.parseInt(formData.stock, 10)));
      formDataToSend.append('categoriaId', String(formData.categoriaId));
      if (formData.subcategoriaId) {
        formDataToSend.append('subcategoriaId', String(formData.subcategoriaId));
      }
      formDataToSend.append('activo', String(formData.activo));

      if (imagenArchivo) {
        formDataToSend.append('imagen', imagenArchivo);
      }

      if (editando) {
        const res = await api.put(`/admin/productos/${editando.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMensaje({ 
          tipo: 'success', 
          texto: res.data?.message || `Producto "${formData.nombre}" actualizado exitosamente` 
        });
      } else {
        const res = await api.post('/admin/productos', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMensaje({ 
          tipo: 'success', 
          texto: res.data?.message || `Producto "${formData.nombre}" creado exitosamente` 
        });
      }

      handleCloseModal();
      recargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setMensaje({ 
        tipo: 'danger', 
        texto: error.response?.data?.message || 'Error al guardar el producto' 
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editando) {
      setModalConfirmacion({
        show: true,
        titulo: '¿Actualizar producto?',
        mensaje: `¿Deseas guardar los cambios realizados en el producto "${formData.nombre || editando.nombre}"?`,
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

  const todosPaginaSeleccionados = useMemo(() => {
    return productos.length > 0 && productos.every(p => seleccionados.has(p.id));
  }, [productos, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        productos.forEach(p => nuevo.delete(p.id));
      } else {
        productos.forEach(p => nuevo.add(p.id));
      }
      return nuevo;
    });
  };

  const toggleSeleccionarProducto = (id) => {
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

  const solicitarEliminar = (producto) => {
    setModalConfirmacion({
      show: true,
      titulo: '¿Eliminar producto?',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/productos/${producto.id}`);
          setProductos(prev => prev.filter(p => p.id !== producto.id));
          setSeleccionados(prev => {
            const nuevo = new Set(prev);
            nuevo.delete(producto.id);
            return nuevo;
          });
          setMensaje({ 
            tipo: 'success', 
            texto: res.data?.message || `Producto "${producto.nombre}" eliminado exitosamente` 
          });
          recargarProductos();
        } catch (error) {
          console.error('Error al eliminar producto:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: error.response?.data?.message || error.response?.data?.error || 'Error al eliminar el producto' 
          });
        }
      }
    });
  };

  const solicitarCambioEstado = (producto) => {
    const nuevoEstado = !producto.activo;
    setModalConfirmacion({
      show: true,
      titulo: nuevoEstado ? '¿Activar producto?' : '¿Desactivar producto?',
      mensaje: `¿Deseas cambiar el estado de "${producto.nombre}" a "${nuevoEstado ? 'Activo' : 'Inactivo'}"?`,
      tipo: nuevoEstado ? 'success' : 'warning',
      icono: nuevoEstado ? 'check-circle-fill' : 'x-circle-fill',
      textoConfirmar: nuevoEstado ? 'Activar' : 'Desactivar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/productos/${producto.id}/toggle`);
          const nuevoEstadoRes = res.data?.data?.producto?.activo ?? nuevoEstado;
          
          setProductos(prevProductos => 
            prevProductos.map(p => 
              p.id === producto.id ? { ...p, activo: nuevoEstadoRes } : p
            )
          );
          
          setMensaje({ 
            tipo: 'success', 
            texto: res.data?.message || `Producto "${producto.nombre}" ${nuevoEstadoRes ? 'activado' : 'desactivado'} exitosamente` 
          });
        } catch (error) {
          console.error('Error al cambiar estado:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: error.response?.data?.message || 'Error al cambiar el estado del producto' 
          });
        }
      }
    });
  };

  const solicitarEliminacionMasiva = () => {
    const count = seleccionados.size;
    if (count === 0) return;
    const pluralS = count !== 1 ? 's' : '';
    
    setModalConfirmacion({
      show: true,
      titulo: `¿Eliminar ${count} producto${pluralS}?`,
      mensaje: `Se eliminarán permanentemente los ${count} productos seleccionados de la base de datos. ¿Deseas continuar?`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          const idsSet = new Set(ids);
          
          setProductos(prev => prev.filter(p => !idsSet.has(p.id)));
          setSeleccionados(new Set());
          
          const resultados = await Promise.allSettled(ids.map(id => api.delete(`/admin/productos/${id}`)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          const sufijoEliminados = exitosos !== 1 ? 's eliminados' : ' eliminado';
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} producto${sufijoEliminados} exitosamente` 
          });
          
          recargarProductos();
        } catch (error) {
          console.error('Error en eliminación masiva:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al eliminar los productos seleccionados' });
        }
      }
    });
  };

  const solicitarCambioEstadoMasivo = () => {
    const count = seleccionados.size;
    if (count === 0) return;
    
    const productosSeleccionados = productos.filter(p => seleccionados.has(p.id));
    const todosActivos = productosSeleccionados.length > 0 ? productosSeleccionados.every(p => p.activo) : false;
    const nuevoEstado = !todosActivos;
    const pluralS = count !== 1 ? 's' : '';
    const accionTexto = nuevoEstado ? 'Activar' : 'Desactivar';
    const estadoNombre = nuevoEstado ? 'Activo' : 'Inactivo';
    
    setModalConfirmacion({
      show: true,
      titulo: `¿${accionTexto} ${count} producto${pluralS}?`,
      mensaje: `Se cambiará el estado de los ${count} productos seleccionados a "${estadoNombre}".`,
      tipo: nuevoEstado ? 'success' : 'warning',
      icono: nuevoEstado ? 'check-circle-fill' : 'x-circle-fill',
      textoConfirmar: accionTexto,
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          const resultados = await Promise.allSettled(
            ids.map(id => api.patch(`/admin/productos/${id}/toggle`))
          );
          
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          const sufijoActualizados = count !== 1 ? 's actualizados' : ' actualizado';
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} de ${count} producto${sufijoActualizados} a ${estadoNombre}` 
          });
          setSeleccionados(new Set());
          recargarProductos();
        } catch (error) {
          console.error('Error al actualizar estado masivo:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al cambiar estado de los productos' });
        }
      }
    });
  };


  const subcategoriasFiltradas = useMemo(() => {
    return subcategorias.filter(sub => sub.categoriaId === Number.parseInt(formData.categoriaId));
  }, [subcategorias, formData.categoriaId]);

  const handleEditarSeleccionadoUnico = async () => {
    const idSel = Array.from(seleccionados)[0];
    let prodSel = productos.find(p => p.id === idSel);
    if (!prodSel) {
      try {
        const res = await api.get(`/admin/productos/${idSel}`);
        prodSel = res.data?.data?.producto || res.data?.producto;
      } catch (err) {
        console.error('Error al obtener producto para editar:', err);
      }
    }
    if (prodSel) handleShowModal(prodSel);
  };

  const formatoExportarTexto = tipoExportacion === 'pdf' ? 'PDF' : 'Excel';

  if (loading && productos.length === 0 && !busqueda && !filtroCategoria && !filtroSubcategoria && !precioMin && !precioMax) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <span className="bi bi-box-seam me-2 text-gold" aria-hidden="true" />
            <span>Gestión de Productos</span>
          </h1>
          <p className="text-muted mb-0">
            Total: <strong>{totalProductos}</strong> producto{totalProductos !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              type="button"
              variant="primary"
              disabled={loading}
              onClick={() => handleExportar(tipoExportacion)}
            >
              <span className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} aria-hidden="true" />
              <span>Exportar a {formatoExportarTexto}</span>
            </Button>
            <Dropdown.Toggle split variant="secondary" className="btn-dark dropdown-toggle-split" disabled={loading} />
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => {
                  setTipoExportacion('pdf');
                  handleExportar('pdf');
                }}
              >
                <span className="bi bi-file-earmark-pdf me-2" aria-hidden="true" />
                <span>Exportar a PDF</span>
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => {
                  setTipoExportacion('excel');
                  handleExportar('excel');
                }}
              >
                <span className="bi bi-file-earmark-excel me-2" aria-hidden="true" />
                <span>Exportar a Excel</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button type="button" variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <span className="bi bi-arrow-left me-1" aria-hidden="true" />
            <span>Volver</span>
          </Button>
          <Button type="button" variant="primary" onClick={() => handleShowModal()}>
            <span className="bi bi-plus-circle me-1" aria-hidden="true" />
            <span>Nuevo Producto</span>
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
            <span className={`bi bi-${getIconoMensaje(mensaje.tipo)} fs-5 flex-shrink-0`} aria-hidden="true" />
            <div className="flex-grow-1 fw-medium text-start">
              {mensaje.texto}
            </div>
          </Alert>
        </div>
      )}

      {/* Filtros */}
      <FiltrosProductos
        busqueda={busqueda}
        filtroCategoria={filtroCategoria}
        filtroSubcategoria={filtroSubcategoria}
        precioMin={precioMin}
        precioMax={precioMax}
        categorias={categorias}
        subcategorias={subcategorias}
        onBusquedaChange={setBusqueda}
        onCategoriaChange={(val) => {
          setFiltroCategoria(val);
          setFiltroSubcategoria('');
        }}
        onSubcategoriaChange={setFiltroSubcategoria}
        onPrecioMinChange={setPrecioMin}
        onPrecioMaxChange={setPrecioMax}
        onLimpiarFiltros={() => {
          setBusqueda('');
          setFiltroCategoria('');
          setFiltroSubcategoria('');
          setPrecioMin('');
          setPrecioMax('');
          setPaginaActual(1);
        }}
      />

      {/* Barra de Selección y Acciones Masivas */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 p-2 px-3 bg-white rounded-3 shadow-sm border admin-selection-bar">
        <div className="d-flex align-items-center gap-2">
          <Button
            type="button"
            variant={todosPaginaSeleccionados ? 'primary' : 'outline-primary'}
            size="sm"
            className="d-inline-flex align-items-center gap-1 fw-semibold"
            onClick={handleToggleSeleccionarTodos}
            title={todosPaginaSeleccionados ? 'Deseleccionar todos los de esta página' : 'Seleccionar todos los de esta página'}
          >
            <span className={`bi bi-${todosPaginaSeleccionados ? 'check-square-fill' : 'square'}`} aria-hidden="true" />
            <span>{todosPaginaSeleccionados ? 'Deseleccionar página' : `Seleccionar todo (${productos.length})`}</span>
          </Button>
          {seleccionados.size > 0 && (
            <Badge bg="danger" className="p-2 d-flex align-items-center gap-1 fs-7">
              <span className="bi bi-check-circle-fill" aria-hidden="true" />
              <span>{seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}</span>
            </Badge>
          )}
        </div>

        {seleccionados.size > 0 && (
          <div className="d-flex flex-wrap align-items-center gap-2">
            {seleccionados.size === 1 && (
              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                className="d-inline-flex align-items-center gap-1 fw-semibold"
                onClick={handleEditarSeleccionadoUnico}
                title="Editar el producto seleccionado"
              >
                <span className="bi bi-pencil-fill" aria-hidden="true" />
                <span>Editar</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline-warning"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={solicitarCambioEstadoMasivo}
              title="Activar o desactivar los productos seleccionados"
            >
              <span className="bi bi-arrow-repeat" aria-hidden="true" />
              <span>Activar / Desactivar ({seleccionados.size})</span>
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={solicitarEliminacionMasiva}
              title="Eliminar los productos seleccionados"
            >
              <span className="bi bi-trash-fill" aria-hidden="true" />
              <span>Eliminar ({seleccionados.size})</span>
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              onClick={() => setSeleccionados(new Set())}
              title="Limpiar selección"
            >
              <span className="bi bi-x-lg me-1" aria-hidden="true" />
              <span>Deseleccionar</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabla Responsiva */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th className="d-none d-sm-table-cell" style={{ width: '65px' }}>Imagen</th>
                <th>Nombre</th>
                <th className="d-none d-lg-table-cell" style={{ width: '160px' }}>Categoría</th>
                <th className="d-none d-sm-table-cell" style={{ width: '115px' }}>Precio</th>
                <th className="d-none d-md-table-cell" style={{ width: '80px' }}>Stock</th>
                <th className="d-none d-md-table-cell" style={{ width: '95px' }}>Estado</th>
                <th className="text-center" style={{ width: '130px', minWidth: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((prod) => (
                  <FilaProducto
                    key={prod.id}
                    prod={prod}
                    estaSeleccionado={seleccionados.has(prod.id)}
                    onToggleSeleccionar={toggleSeleccionarProducto}
                    onEditar={handleShowModal}
                    onCambiarEstado={solicitarCambioEstado}
                    onEliminar={solicitarEliminar}
                  />
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="text-muted bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <small>
              <span className="bi bi-file-text me-1" aria-hidden="true" />
              <span>Mostrando <strong>{totalProductos === 0 ? '0-0' : `${indiceInicio + 1}-${indiceFin}`}</strong> de <strong>{totalProductos}</strong> producto{totalProductos !== 1 ? 's' : ''}</span>
            </small>
            
            <div className="d-flex gap-2 align-items-center">
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                disabled={paginaActual === 1 || loading}
                onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
              >
                <span className="bi bi-arrow-left" aria-hidden="true" />
              </Button>
              
              <span className="text-nowrap">
                Página <strong>{paginaActual}</strong> de <strong>{totalPaginas || 1}</strong>
              </span>
              
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                disabled={paginaActual >= totalPaginas || loading}
                onClick={() => setPaginaActual(prev => prev + 1)}
              >
                <span className="bi bi-arrow-right" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Modal para crear/editar producto */}
      <ModalProductoForm
        show={showModal}
        editando={editando}
        formData={formData}
        categorias={categorias}
        subcategoriasFiltradas={subcategoriasFiltradas}
        previewImagen={previewImagen}
        fileInputRef={fileInputRef}
        onChange={handleChange}
        onImagenChange={handleImagenChange}
        onQuitarImagen={handleQuitarImagen}
        onAbrirPreviewFoto={() => {
          if (previewImagen) {
            setModalPreviewFoto(true);
          } else {
            fileInputRef.current?.click();
          }
        }}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* Modal para Visualizar / Cambiar / Eliminar Foto */}
      <ModalPreviewFoto
        show={modalPreviewFoto}
        previewImagen={previewImagen}
        onCerrar={() => setModalPreviewFoto(false)}
        onCambiarFoto={() => {
          setModalPreviewFoto(false);
          setTimeout(() => fileInputRef.current?.click(), 150);
        }}
        onEliminarFoto={(e) => {
          handleQuitarImagen(e);
          setModalPreviewFoto(false);
        }}
      />

      {/* Modal de Confirmación Compacto */}
      <ModalConfirmacionCompacto
        modal={modalConfirmacion}
        onCerrar={() => setModalConfirmacion(prev => ({ ...prev, show: false }))}
      />

      {/* Estilos locales */}
      <style>{`
        .admin-selection-bar {
          border-color: #e2e8f0;
        }
        .fila-producto {
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .fila-producto:hover {
          background-color: rgba(245, 194, 113, 0.08) !important;
        }
        .fila-producto-seleccionada {
          background-color: rgba(220, 53, 69, 0.06) !important;
        }
        .action-btn-group {
          display: inline-flex;
          gap: 0.35rem;
          justify-content: center;
        }
        .btn-action-table {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          border-radius: 6px;
        }
        .product-minimal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem 0.75rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .product-minimal-avatar-box {
          width: 76px;
          height: 76px;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: #f8fafc;
          transition: all 0.2s ease;
          padding: 0;
        }
        .product-minimal-avatar-box:hover {
          border-color: var(--bs-gold, #f5c271);
          background: #f1f5f9;
        }
        .product-minimal-avatar-box.has-img {
          border-style: solid;
          border-color: #e2e8f0;
        }
        .product-minimal-avatar-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-minimal-avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(25, 40, 71, 0.65);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .product-minimal-avatar-box:hover .product-minimal-avatar-overlay {
          opacity: 1;
        }
        .btn-trash-avatar {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #dc3545;
          color: white;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .product-minimal-input {
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.92rem;
        }
        .product-minimal-input:focus {
          border-color: #c7984e;
          box-shadow: 0 0 0 3px rgba(199, 152, 78, 0.2);
        }
        .product-minimal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 0 0 12px 12px;
        }
        .btn-minimal-cancel {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-weight: 600;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        .btn-minimal-submit {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%);
          border: none;
          color: #192847;
          font-weight: 700;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .modal-preview-foto-dialog {
          max-width: 650px;
        }
        .modal-preview-foto-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: #ffffff;
        }
        .zoom-toolbar {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .zoom-toolbar button {
          background: transparent;
          border: none;
          color: #475569;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 0.85rem;
        }
        .zoom-toolbar button:hover:not(:disabled) {
          background: #e2e8f0;
          color: #192847;
        }
        .zoom-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #192847;
          min-width: 42px;
          text-align: center;
        }
        .modal-preview-foto-wrapper {
          width: 100%;
          height: 380px;
          border-radius: 12px;
          background: #192847;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }
        .modal-preview-foto-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          pointer-events: auto;
        }
        .confirm-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }
      `}</style>
    </Container>
  );
};

export default AdminProductosPage;
