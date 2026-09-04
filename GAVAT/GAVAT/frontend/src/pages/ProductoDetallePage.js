/**
 * ============================================
 * PRODUCTO DETALLE PAGE - GAVAT
 * ============================================
 * Página de detalle de producto con presentación prémium:
 * Azul Marino (#192847), Acentos Dorados (#f5c271 / #c7984e),
 * visor interactivo de imagen con zoom, selector de cantidad
 * sincronizado con stock, beneficios de confianza y reseñas.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Container, Row, Col, Button, Breadcrumb, Card, Modal } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import carritoService from '../services/carritoService';
import ProductoComentarios from '../components/ProductoComentarios';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import FloatingToast from '../components/FloatingToast';

const ProductoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '', accion: null });
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const { isAuthenticated } = useAuth();

  // Estados y controles para el Modal de Visualización con Mover y Zoom
  const [modalPreviewFoto, setModalPreviewFoto] = useState(false);
  const [zoomNivel, setZoomNivel] = useState(1);
  const [posicionFoto, setPosicionFoto] = useState({ x: 0, y: 0 });
  const [arrastrandoFoto, setArrastrandoFoto] = useState(false);
  const inicioArrastreFoto = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => setZoomNivel(prev => Math.min(Number((prev + 0.25).toFixed(2)), 3.5));
  const handleZoomOut = () => setZoomNivel(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleResetZoom = () => {
    setZoomNivel(1);
    setPosicionFoto({ x: 0, y: 0 });
  };

  const handleMouseDownFoto = (e) => {
    e.preventDefault();
    setArrastrandoFoto(true);
    inicioArrastreFoto.current = {
      x: e.clientX - posicionFoto.x,
      y: e.clientY - posicionFoto.y
    };
  };

  const handleMouseMoveFoto = (e) => {
    if (!arrastrandoFoto) return;
    setPosicionFoto({
      x: e.clientX - inicioArrastreFoto.current.x,
      y: e.clientY - inicioArrastreFoto.current.y
    });
  };

  const handleMouseUpFoto = () => {
    setArrastrandoFoto(false);
  };

  const handleTouchStartFoto = (e) => {
    if (e.touches.length === 1) {
      setArrastrandoFoto(true);
      inicioArrastreFoto.current = {
        x: e.touches[0].clientX - posicionFoto.x,
        y: e.touches[0].clientY - posicionFoto.y
      };
    }
  };

  const handleTouchMoveFoto = (e) => {
    if (!arrastrandoFoto || e.touches.length !== 1) return;
    setPosicionFoto({
      x: e.touches[0].clientX - inicioArrastreFoto.current.x,
      y: e.touches[0].clientY - inicioArrastreFoto.current.y
    });
  };

  const handleOpenPreview = () => {
    setZoomNivel(1);
    setPosicionFoto({ x: 0, y: 0 });
    setArrastrandoFoto(false);
    setModalPreviewFoto(true);
  };

  const handleClosePreview = () => {
    setModalPreviewFoto(false);
    setArrastrandoFoto(false);
    setZoomNivel(1);
    setPosicionFoto({ x: 0, y: 0 });
  };

  useEffect(() => {
    const cargarProducto = async () => {
      setLoading(true);
      try {
        const response = await catalogoService.getProductoById(id);
        setProducto(response.data?.producto || response.data || response);
      } catch (error) {
        console.error('Error al cargar producto:', error);
        setMensaje({ tipo: 'danger', texto: 'Error al cargar el producto solicitado' });
        setTimeout(() => navigate('/catalogo'), 2000);
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id, navigate]);

  const handleIncreaseQuantity = useCallback(() => {
    const maxStock = Number(producto?.stock) || 1;
    const current = Number.parseInt(cantidad, 10) || 0;
    if (current >= maxStock) {
      setMensaje({
        tipo: 'warning',
        texto: `El stock máximo disponible para "${producto?.nombre}" es de ${maxStock} ${maxStock === 1 ? 'unidad' : 'unidades'}, por lo que no es posible agregar más unidades.`,
        accion: null
      });
      return;
    }
    setCantidad(current + 1);
  }, [producto, cantidad]);

  const handleDecreaseQuantity = useCallback(() => {
    setCantidad((prev) => {
      const current = Number.parseInt(prev, 10) || 1;
      return current > 1 ? current - 1 : 1;
    });
  }, []);

  const handleCantidadChange = useCallback((e) => {
    const valor = e.target.value;
    if (valor === '') {
      setCantidad('');
      return;
    }
    const num = Number.parseInt(valor, 10);
    const maxStock = Number(producto?.stock) || 1;
    if (!Number.isNaN(num)) {
      if (num < 1) {
        setCantidad(1);
      } else if (num > maxStock) {
        setCantidad(maxStock);
        setMensaje({
          tipo: 'warning',
          texto: `El stock máximo disponible para "${producto?.nombre}" es de ${maxStock} ${maxStock === 1 ? 'unidad' : 'unidades'}, por lo que no es posible agregar la cantidad solicitada (${num}).`,
          accion: null
        });
      } else {
        setCantidad(num);
      }
    }
  }, [producto?.stock, producto?.nombre]);

  const handleCantidadBlur = useCallback(() => {
    if (!cantidad || Number(cantidad) < 1) {
      setCantidad(1);
    }
  }, [cantidad]);

  // Limpiar mensaje flotante automáticamente
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '', accion: null });
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleAddToCart = useCallback(async () => {
    if (!producto) return;
    setAgregando(true);
    try {
      const cantidadFinal = Math.max(1, Number.parseInt(cantidad, 10) || 1);
      await carritoService.agregarAlCarrito(producto.id, cantidadFinal, producto);
      setMensaje({
        tipo: 'success',
        texto: cantidadFinal > 1
          ? `Producto "${producto.nombre}" (${cantidadFinal} unidades) agregado al carrito exitosamente`
          : `Producto "${producto.nombre}" agregado al carrito exitosamente`,
        accion: { texto: 'Ver Carrito', url: '/carrito' }
      });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      setMensaje({
        tipo: 'danger',
        texto: error.message || 'Error al agregar el producto al carrito',
        accion: null
      });
    } finally {
      setAgregando(false);
    }
  }, [producto, cantidad]);

  const handleComentarioCreado = useCallback(() => {
    setMensaje({ tipo: 'success', texto: 'Comentario publicado exitosamente', accion: null });
  }, []);

  if (loading) {
    return (
      <div className="py-5">
        <LoadingSpinner message="Cargando detalles del producto..." />
      </div>
    );
  }

  if (!producto) {
    return (
      <Container className="py-5 text-center">
        <Card className="p-5 shadow-sm border-0 rounded-4 mx-auto bg-white" style={{ maxWidth: '500px' }}>
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3" />
          <h3 className="fw-bold text-navy mb-2">Producto no encontrado</h3>
          <p className="text-muted small mb-4">El producto que estás buscando no existe o ya no está disponible en catálogo.</p>
          <Button as={Link} to="/catalogo" className="btn-hero-gold px-4 py-2">
            <i className="bi bi-arrow-left me-2" />
            Volver al catálogo
          </Button>
        </Card>
      </Container>
    );
  }

  const stockDisponible = producto.stock || 0;

  const renderStockStatus = () => {
    if (stockDisponible > 10) {
      return (
        <span className="stock-status-pill in-stock d-inline-flex align-items-center gap-1">
          <i className="bi bi-check-circle-fill text-success" />
          <span>En stock ({stockDisponible} unidades disponibles)</span>
        </span>
      );
    }
    if (stockDisponible > 0) {
      return (
        <span className="stock-status-pill low-stock d-inline-flex align-items-center gap-1">
          <i className="bi bi-lightning-fill text-warning" />
          <span>¡Últimas unidades! ({stockDisponible} disponibles)</span>
        </span>
      );
    }
    return (
      <span className="stock-status-pill out-of-stock d-inline-flex align-items-center gap-1">
        <i className="bi bi-slash-circle text-danger" />
        <span>Agotado temporalmente</span>
      </span>
    );
  };

  return (
    <div className="producto-detalle-wrapper py-4 py-lg-5">
      <Container>
        {/* Notificación flotante fija en esquina inferior izquierda */}
        <FloatingToast
          mensaje={mensaje}
          onClose={() => setMensaje({ tipo: '', texto: '', accion: null })}
        />

        {/* Breadcrumb de navegación armonizado */}
        <div className="product-breadcrumb-card p-2 px-3 rounded-3 shadow-sm bg-white mb-4 border">
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
              <i className="bi bi-house-door me-1 text-gold" /> Inicio
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/catalogo' }}>
              Catálogo
            </Breadcrumb.Item>
            {producto.categoria && (
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/catalogo` }}>
                {producto.categoria.nombre}
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item active className="text-navy fw-semibold">
              {producto.nombre}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* ========================================================================= */}
        {/* TARJETA PRINCIPAL DEL PRODUCTO                                           */}
        {/* ========================================================================= */}
        <Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-4 product-detail-card">
          <Card.Body className="p-4 p-lg-5">
            <Row className="g-4 g-lg-5 align-items-center">
              {/* Columna de Imagen: Visor interactivo con Lupa y Zoom */}
              <Col lg={6}>
                <div
                  className="product-image-stage"
                  onClick={handleOpenPreview}
                  title="Haz clic para ver la imagen ampliada"
                >
                  <div className="product-image-backdrop">
                    <img
                      src={getImageUrl(producto.imagen)}
                      alt={producto.nombre}
                      className="product-hero-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/producto-default.jpg';
                      }}
                    />
                  </div>

                  {/* Badges sobre la fotografía */}
                  <div className="product-badges-overlay">
                    {producto.categoria && (
                      <span className="badge-category-tag">
                        {producto.categoria.nombre}
                      </span>
                    )}
                    {stockDisponible <= 5 && stockDisponible > 0 && (
                      <span className="badge-ultimas-unidades">
                        <i className="bi bi-lightning-fill me-1" /> ¡Últimas {stockDisponible}!
                      </span>
                    )}
                  </div>

                  {/* Botón flotante para ver detalle con lupa */}
                  <button
                    type="button"
                    className="btn-zoom-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPreview();
                    }}
                    title="Ampliar imagen con lupa"
                  >
                    <i className="bi bi-zoom-in" />
                    <span>Ampliar</span>
                  </button>
                </div>
              </Col>

              {/* Columna de Información */}
              <Col lg={6}>
                <div className="product-info-wrapper">
                  {/* Categoría, Subcategoría y SKU */}
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    {producto.categoria && (
                      <span className="product-meta-pill">
                        <i className="bi bi-collection text-gold me-1" /> {producto.categoria.nombre}
                      </span>
                    )}
                    {producto.subcategoria && (
                      <span className="product-meta-pill">
                        <i className="bi bi-tags text-gold me-1" /> {producto.subcategoria.nombre}
                      </span>
                    )}
                    <span className="ms-auto text-muted small fw-semibold">
                      SKU: #{producto.id}
                    </span>
                  </div>

                  {/* Título del producto */}
                  <h1 className="product-title fw-bold text-navy mb-3">
                    {producto.nombre}
                  </h1>

                  {/* Precio destacado */}
                  <div className="product-price-box p-3 rounded-3 mb-3">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="product-price-amount">
                        {formatCurrency(producto.precio)}
                      </span>
                      <span className="text-muted small fw-semibold">
                        (IVA incluido)
                      </span>
                    </div>
                  </div>

                  {/* Estado del stock */}
                  <div className="mb-4">
                    {renderStockStatus()}
                  </div>

                  {/* Descripción */}
                  <div className="product-description-box mb-4">
                    <h6 className="fw-bold text-navy mb-2 small text-uppercase">
                      <i className="bi bi-text-paragraph text-gold me-1" /> Descripción
                    </h6>
                    <p className="text-secondary mb-0 leading-relaxed small">
                      {producto.descripcion || 'Producto arquitectónico de alta calidad, elaborado bajo estrictos estándares y con garantía de durabilidad.'}
                    </p>
                  </div>

                  {/* Selector de cantidad y Botón de compra */}
                  {stockDisponible > 0 ? (
                    <div className="purchase-controls-box mb-4">
                      <div className="d-flex flex-wrap align-items-center gap-3">
                        <div className="quantity-selector-card">
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={handleDecreaseQuantity}
                            disabled={Number(cantidad || 1) <= 1}
                            title="Disminuir cantidad"
                            aria-label="Disminuir cantidad"
                          >
                            <i className="bi bi-dash-lg" />
                          </button>
                          <input
                            type="number"
                            className="quantity-input-field"
                            value={cantidad}
                            onChange={handleCantidadChange}
                            onBlur={handleCantidadBlur}
                            min="1"
                            max={stockDisponible}
                            aria-label="Cantidad"
                          />
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={handleIncreaseQuantity}
                            title="Aumentar cantidad"
                            aria-label="Aumentar cantidad"
                          >
                            <i className="bi bi-plus-lg" />
                          </button>
                        </div>

                        {isAuthenticated ? (
                          <Button
                            className="btn-add-cart-gold flex-grow-1 py-3"
                            size="lg"
                            onClick={handleAddToCart}
                            disabled={agregando}
                          >
                            <i className="bi bi-cart-plus-fill me-2 fs-5" />
                            <span>
                              {agregando ? 'Agregando...' : `Agregar (${cantidad}) al Carrito`}
                            </span>
                          </Button>
                        ) : (
                          <Button
                            as={Link}
                            to="/login"
                            className="btn-add-cart-gold flex-grow-1 py-3"
                            size="lg"
                          >
                            <i className="bi bi-box-arrow-in-right me-2 fs-5" />
                            <span>Inicia Sesión para Comprar</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <Button variant="secondary" size="lg" disabled className="w-100 py-3 rounded-3 fw-bold">
                        <i className="bi bi-slash-circle me-2" /> Producto Agotado
                      </Button>
                    </div>
                  )}

                  {/* Beneficios de confianza */}
                  <div className="trust-badges-grid pt-3 border-top">
                    <div className="trust-badge-item">
                      <i className="bi bi-shield-check text-gold fs-4" />
                      <div>
                        <span className="fw-bold d-block text-navy small">Garantía Directa</span>
                        <span className="text-muted extra-small">Calidad certificada</span>
                      </div>
                    </div>
                    <div className="trust-badge-item">
                      <i className="bi bi-truck text-gold fs-4" />
                      <div>
                        <span className="fw-bold d-block text-navy small">Despacho Seguro</span>
                        <span className="text-muted extra-small">Envíos nacionales</span>
                      </div>
                    </div>
                    <div className="trust-badge-item">
                      <i className="bi bi-award-fill text-gold fs-4" />
                      <div>
                        <span className="fw-bold d-block text-navy small">Aluminio & Vidrio</span>
                        <span className="text-muted extra-small">Acabados prémium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ========================================================================= */}
        {/* SECCIÓN DE RESEÑAS Y COMENTARIOS                                         */}
        {/* ========================================================================= */}
        <Card className="shadow-sm rounded-4 overflow-hidden mb-4 border-0">
          <Card.Header className="pedido-card-header d-flex align-items-center gap-2 p-3 px-4">
            <i className="bi bi-chat-quote-fill text-gold fs-5" />
            <span className="fw-bold text-navy">Opiniones y Reseñas del Producto</span>
          </Card.Header>
          <Card.Body className="p-4 p-lg-5 bg-white">
            <ProductoComentarios
              productoId={producto.id}
              onComentarioCreado={handleComentarioCreado}
            />
          </Card.Body>
        </Card>

        {/* Botón Volver al Catálogo */}
        <div className="text-center pt-2">
          <Button
            as={Link}
            to="/catalogo"
            className="btn-volver-catalogo px-4 py-2"
          >
            <i className="bi bi-arrow-left me-2" />
            Volver al Catálogo
          </Button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL PARA VISUALIZAR FOTO CON MOVIMIENTO Y ZOOM                          */}
        {/* ========================================================================= */}
        <Modal
          show={modalPreviewFoto}
          onHide={handleClosePreview}
          centered
          dialogClassName="modal-preview-foto-dialog"
        >
          <div className="modal-preview-foto-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
            <div className="fw-semibold text-navy small d-flex align-items-center gap-2">
              <i className="bi bi-arrows-move text-gold" /> {producto.nombre}
            </div>

            {/* Controles de Zoom */}
            <div className="zoom-toolbar d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn-zoom-ctrl"
                onClick={handleZoomOut}
                disabled={zoomNivel <= 0.5}
                title="Reducir zoom (-)"
              >
                <i className="bi bi-dash-lg" />
              </button>
              <span className="zoom-badge px-2 small fw-bold">
                {Math.round(zoomNivel * 100)}%
              </span>
              <button
                type="button"
                className="btn-zoom-ctrl"
                onClick={handleZoomIn}
                disabled={zoomNivel >= 3.5}
                title="Aumentar zoom (+)"
              >
                <i className="bi bi-plus-lg" />
              </button>
              <button
                type="button"
                className="btn-zoom-ctrl ms-1"
                onClick={handleResetZoom}
                title="Restablecer tamaño original y centrar"
              >
                <i className="bi bi-aspect-ratio" />
              </button>
            </div>

            <button
              type="button"
              className="btn-close"
              onClick={handleClosePreview}
              aria-label="Cerrar"
            />
          </div>

          <Modal.Body className="p-3 p-md-4 text-center bg-light">
            <div 
              className="modal-preview-foto-wrapper mb-3"
              onMouseMove={handleMouseMoveFoto}
              onMouseUp={handleMouseUpFoto}
              onMouseLeave={handleMouseUpFoto}
              onTouchMove={handleTouchMoveFoto}
              onTouchEnd={handleMouseUpFoto}
              style={{ cursor: arrastrandoFoto ? 'grabbing' : 'move', overflow: 'hidden' }}
            >
              <img
                src={getImageUrl(producto.imagen)}
                alt={producto.nombre}
                className="modal-preview-foto-img"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={handleMouseDownFoto}
                onTouchStart={handleTouchStartFoto}
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
                <i className="bi bi-arrows-move me-1" />
                Arrastra con el ratón para mover la imagen o usa los botones para ajustar el tamaño
              </small>

              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1 px-3 py-1 rounded-3"
                onClick={handleClosePreview}
              >
                <i className="bi bi-x-lg" /> Cerrar
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </Container>

      {/* ========================================================================= */}
      {/* ESTILOS DE LA PÁGINA (Sincronizados con el diseño global)                 */}
      {/* ========================================================================= */}
      <style>{`
        .producto-detalle-wrapper {
          background-color: #f8fafc;
          min-height: calc(100vh - 180px);
        }

        .product-breadcrumb-card .breadcrumb-item a {
          color: #c7984e;
          text-decoration: none;
          font-weight: 500;
        }
        .product-breadcrumb-card .breadcrumb-item a:hover {
          color: #8F6A34;
          text-decoration: underline;
        }

        .product-detail-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .pedido-card-header {
          background: var(--bg-positiva, #DBE1ED);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        /* Escenario de Imagen adaptativo */
        .product-image-stage {
          position: relative;
          width: 100%;
          min-height: 380px;
          height: 100%;
          max-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1.25rem;
          background: radial-gradient(circle at center, rgba(245, 194, 113, 0.12) 0%, rgba(219, 225, 237, 0.18) 60%, rgba(255, 255, 255, 0) 100%);
          padding: 2rem;
          border: 1.5px solid rgba(245, 194, 113, 0.25);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .product-image-stage:hover {
          border-color: rgba(199, 152, 78, 0.45);
          box-shadow: 0 12px 30px rgba(199, 152, 78, 0.15);
        }

        .product-image-backdrop {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-hero-image {
          max-width: 90%;
          max-height: 380px;
          object-fit: contain;
          filter: drop-shadow(0 15px 25px rgba(25, 40, 71, 0.12));
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .product-image-stage:hover .product-hero-image {
          transform: scale(1.06) translateY(-4px);
        }

        .product-badges-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 2;
        }

        .badge-category-tag {
          background: rgba(25, 40, 71, 0.88);
          backdrop-filter: blur(8px);
          color: #f5c271;
          font-weight: 600;
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
          border-radius: 0.65rem;
          border: 1px solid rgba(245, 194, 113, 0.3);
        }

        .badge-ultimas-unidades {
          background: #fef3c7;
          color: #92400e;
          font-weight: 700;
          font-size: 0.78rem;
          padding: 0.35rem 0.75rem;
          border-radius: 0.65rem;
          border: 1px solid #fde68a;
        }

        .btn-zoom-trigger {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          background: rgba(25, 40, 71, 0.88);
          backdrop-filter: blur(8px);
          color: #f5c271;
          border: 1px solid rgba(245, 194, 113, 0.4);
          border-radius: 2rem;
          padding: 0.4rem 0.85rem;
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          z-index: 3;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-zoom-trigger:hover {
          background: linear-gradient(135deg, #f5c271, #c7984e);
          color: #192847;
          border-color: #f5c271;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(245, 194, 113, 0.35);
        }

        .product-meta-pill {
          background: rgba(219, 225, 237, 0.45);
          color: #192847;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 2rem;
        }

        .product-title {
          font-size: clamp(1.6rem, 2.5vw, 2.2rem);
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        .product-price-box {
          background: #fbf8f2;
          border: 1px solid rgba(197, 151, 74, 0.25);
        }

        .product-price-amount {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.01em;
        }

        .stock-status-pill {
          padding: 0.45rem 0.95rem;
          border-radius: 2rem;
          font-size: 0.88rem;
          font-weight: 600;
        }
        .stock-status-pill.in-stock {
          background: rgba(16, 185, 129, 0.12);
          color: #065f46;
        }
        .stock-status-pill.low-stock {
          background: rgba(245, 158, 11, 0.12);
          color: #92400e;
        }
        .stock-status-pill.out-of-stock {
          background: rgba(239, 68, 68, 0.12);
          color: #991b1b;
        }

        .quantity-selector-card {
          display: inline-flex;
          align-items: center;
          background: #ffffff;
          border: 1.5px solid #d1d5db;
          border-radius: 0.85rem;
          padding: 0.25rem 0.4rem;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .quantity-selector-card:focus-within {
          border-color: #c7984e;
          box-shadow: 0 0 0 3px rgba(199, 152, 78, 0.2);
        }

        .quantity-btn {
          background: transparent;
          border: none;
          color: #192847;
          font-size: 1.15rem;
          width: 38px;
          height: 38px;
          border-radius: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .quantity-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #c7984e;
        }

        .quantity-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .quantity-input-field {
          width: 55px;
          border: none;
          background: transparent;
          text-align: center;
          font-weight: 700;
          font-size: 1.15rem;
          color: #192847;
          outline: none;
        }

        .quantity-input-field::-webkit-outer-spin-button,
        .quantity-input-field::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .quantity-input-field[type=number] {
          -moz-appearance: textfield;
        }

        /* Botón de compra dorado prominente */
        .btn-add-cart-gold {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%) !important;
          color: #192847 !important;
          font-weight: 700 !important;
          border: none !important;
          border-radius: 0.85rem !important;
          padding: 0.8rem 1.5rem !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.25s ease !important;
          box-shadow: 0 6px 18px rgba(199, 152, 78, 0.28) !important;
        }

        .btn-add-cart-gold:hover:not(:disabled) {
          background: linear-gradient(135deg, #c7984e 0%, #f5c271 100%) !important;
          color: #192847 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(199, 152, 78, 0.38) !important;
        }

        .btn-volver-catalogo {
          background: #ffffff !important;
          border: 1.5px solid #192847 !important;
          color: #192847 !important;
          border-radius: 9999px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        .btn-volver-catalogo:hover {
          background: #192847 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(25, 40, 71, 0.15) !important;
        }

        .trust-badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 1rem;
        }

        .trust-badge-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .extra-small {
          font-size: 0.75rem;
        }

        /* Modal Preview Zoom Controls */
        .btn-zoom-ctrl {
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #192847;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .btn-zoom-ctrl:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #c7984e;
          color: #c7984e;
        }
        .btn-zoom-ctrl:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .modal-preview-foto-wrapper {
          overflow: hidden;
          max-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-preview-foto-img {
          max-height: 60vh;
          max-width: 100%;
          object-fit: contain;
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ProductoDetallePage;
