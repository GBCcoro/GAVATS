/**
 * ============================================
 * PRODUCTO DETALLE PAGE
 * ============================================
 * Página de detalle de producto con presentación atractiva,
 * imagen adaptativa transparente y comentarios de clientes.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Button, Badge, Alert, Breadcrumb, Card } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import carritoService from '../services/carritoService';
import ProductoComentarios from '../components/ProductoComentarios';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import SvgIcon from '../components/SvgIcon';

const ProductoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const cargarProducto = async () => {
      setLoading(true);
      try {
        const response = await catalogoService.getProductoById(id);
        setProducto(response.data.producto);
      } catch (error) {
        console.error('Error al cargar producto:', error);
        setMensaje({ tipo: 'danger', texto: 'Error al cargar el producto' });
        setTimeout(() => navigate('/catalogo'), 2000);
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id, navigate]);

  const handleAddToCart = useCallback(async () => {
    if (!producto) return;
    setAgregando(true);
    try {
      const cantidadFinal = Number.parseInt(cantidad, 10) || 1;
      await carritoService.agregarAlCarrito(producto.id, cantidadFinal, producto);
      setMensaje({ tipo: 'success', texto: `¡"${producto.nombre}" (${cantidadFinal} ud.) agregado al carrito!` });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message || 'Error al agregar al carrito' });
    } finally {
      setAgregando(false);
    }
  }, [producto, cantidad]);

  const handleCantidadChange = useCallback((e) => {
    const valor = e.target.value;
    const maxStock = producto?.stock || 1;
    
    if (valor === '') {
      setCantidad('');
    } else {
      const num = Number.parseInt(valor, 10);
      if (!Number.isNaN(num)) {
        if (num < 1) {
          setCantidad(1);
        } else if (num > maxStock) {
          setCantidad(maxStock);
        } else {
          setCantidad(num);
        }
      }
    }
  }, [producto?.stock]);

  const handleIncreaseQuantity = useCallback(() => {
    const maxStock = producto?.stock || 1;
    const current = Number.parseInt(cantidad, 10) || 0;
    if (current < maxStock) {
      setCantidad(current + 1);
    }
  }, [cantidad, producto?.stock]);

  const handleDecreaseQuantity = useCallback(() => {
    const current = Number.parseInt(cantidad, 10) || 1;
    if (current > 1) {
      setCantidad(current - 1);
    }
  }, [cantidad]);

  const handleComentarioCreado = useCallback(() => {
    setMensaje({ tipo: 'success', texto: 'Comentario publicado exitosamente' });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Cargando detalles del producto..." />;
  }

  if (!producto) {
    return (
      <Container className="py-5 text-center">
        <Card className="p-5 shadow-sm border-0 rounded-4 mx-auto" style={{ maxWidth: '500px' }}>
          <span className="bi bi-exclamation-circle text-warning fs-1 mb-3" aria-hidden="true"></span>
          <h3 className="fw-bold text-navy">Producto no encontrado</h3>
          <p className="text-muted">El producto que estás buscando no existe o ya no está disponible.</p>
          <Button as={Link} to="/catalogo" variant="primary" className="mt-3">
            <span className="bi bi-arrow-left me-2" aria-hidden="true"></span> Volver al catálogo
          </Button>
        </Card>
      </Container>
    );
  }

  const stockDisponible = producto.stock || 0;

  const renderStockStatus = () => {
    if (stockDisponible > 10) {
      return (
        <div className="d-inline-flex align-items-center text-success fw-semibold stock-status-pill in-stock">
          <span className="bi bi-check-circle-fill me-2" aria-hidden="true"></span> En stock ({stockDisponible} disponibles)
        </div>
      );
    }
    if (stockDisponible > 0) {
      return (
        <div className="d-inline-flex align-items-center text-warning-dark fw-semibold stock-status-pill low-stock">
          <span className="bi bi-exclamation-circle-fill me-2" aria-hidden="true"></span> ¡Pocas unidades disponibles! ({stockDisponible} disponibles)
        </div>
      );
    }
    return (
      <div className="d-inline-flex align-items-center text-danger fw-semibold stock-status-pill out-of-stock">
        <span className="bi bi-x-circle-fill me-2" aria-hidden="true"></span> Agotado temporalmente
      </div>
    );
  };

  return (
    <Container className="py-4 py-lg-5">
      {/* Breadcrumb de navegación */}
      <Breadcrumb className="mb-4 product-breadcrumb">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          <span className="bi bi-house-door me-1" aria-hidden="true"></span> Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/catalogo' }}>
          Catálogo
        </Breadcrumb.Item>
        {producto.categoria && (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/catalogo?categoria=${producto.categoria.id || ''}` }}>
            {producto.categoria.nombre}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>{producto.nombre}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Alerta de notificación */}
      {mensaje.texto && (
        <Alert 
          variant={mensaje.tipo} 
          dismissible 
          onClose={() => setMensaje({ tipo: '', texto: '' })}
          className="shadow-sm rounded-3 mb-4 d-flex justify-content-between align-items-center"
        >
          <div>
            <span className={`bi bi-${mensaje.tipo === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2`} aria-hidden="true"></span> {mensaje.texto}
          </div>
          {mensaje.tipo === 'success' && (
            <Button as={Link} to="/carrito" variant="outline-success" size="sm" className="ms-3 fw-bold">
              Ver Carrito <span className="bi bi-arrow-right ms-1" aria-hidden="true"></span>
            </Button>
          )}
        </Alert>
      )}

      {/* Tarjeta principal del producto */}
      <Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-5 product-detail-card">
        <Card.Body className="p-4 p-lg-5">
          <Row className="g-4 g-lg-5 align-items-center">
            {/* Columna de Imagen: Contenedor transparente y adaptativo */}
            <Col lg={6}>
              <div className="product-image-stage">
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
                {/* Badges superpuestos */}
                <div className="product-badges-overlay">
                  {producto.categoria && (
                    <Badge className="badge-category-tag">
                      {producto.categoria.nombre}
                    </Badge>
                  )}
                  {stockDisponible <= 5 && stockDisponible > 0 && (
                    <Badge bg="warning" className="text-dark fw-bold shadow-sm">
                      <span className="bi bi-lightning-fill me-1" aria-hidden="true"></span> ¡Últimas unidades!
                    </Badge>
                  )}
                </div>
              </div>
            </Col>

            {/* Columna de Información */}
            <Col lg={6}>
              <div className="product-info-wrapper">
                {/* Categoría y Subcategoría */}
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  {producto.categoria && (
                    <span className="product-meta-pill">
                      <span className="bi bi-tag me-1 text-gold" aria-hidden="true"></span> {producto.categoria.nombre}
                    </span>
                  )}
                  {producto.subcategoria && (
                    <span className="product-meta-pill">
                      <span className="bi bi-bookmark me-1 text-gold" aria-hidden="true"></span> {producto.subcategoria.nombre}
                    </span>
                  )}
                  <span className="product-meta-sku ms-auto text-muted small">
                    SKU: #{producto.id}
                  </span>
                </div>

                {/* Título del producto */}
                <h1 className="product-title fw-bold text-navy mb-3">
                  {producto.nombre}
                </h1>

                {/* Precio */}
                <div className="product-price-box mb-4">
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="product-price-amount">
                      {formatCurrency(producto.precio)}
                    </span>
                    <span className="product-price-vat text-muted small">
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
                  <h6 className="fw-bold text-navy mb-2">Descripción</h6>
                  <p className="text-secondary mb-0 leading-relaxed">
                    {producto.descripcion || 'Producto de alta calidad garantizada, elaborado con los más finos acabados.'}
                  </p>
                </div>

                {/* Selector de cantidad y Botón de compra */}
                {stockDisponible > 0 ? (
                  <div className="purchase-controls-box mb-4">
                    <div className="d-flex flex-wrap align-items-center gap-3">
                      <div className="quantity-selector-card">
                        <Button
                          variant="link"
                          className="quantity-btn"
                          onClick={handleDecreaseQuantity}
                          disabled={cantidad <= 1}
                          title="Disminuir"
                        >
                          <span className="bi bi-dash" aria-hidden="true"></span>
                        </Button>
                        <input
                          type="number"
                          className="quantity-input-field"
                          value={cantidad}
                          onChange={handleCantidadChange}
                          min="1"
                          max={stockDisponible}
                        />
                        <Button
                          variant="link"
                          className="quantity-btn"
                          onClick={handleIncreaseQuantity}
                          disabled={cantidad >= stockDisponible}
                          title="Aumentar"
                        >
                          <span className="bi bi-plus" aria-hidden="true"></span>
                        </Button>
                      </div>

                      {isAuthenticated ? (
                        <Button
                          className="btn-add-cart-luxury flex-grow-1"
                          size="lg"
                          onClick={handleAddToCart}
                          disabled={agregando}
                        >
                          <SvgIcon name="cash" className="me-2" />
                          <span>{agregando ? 'Agregando...' : `Agregar ${cantidad} al Carrito`}</span>
                        </Button>
                      ) : (
                        <Button
                          as={Link}
                          to="/login"
                          className="btn-add-cart-luxury flex-grow-1"
                          size="lg"
                        >
                          <span className="bi bi-box-arrow-in-right me-2" aria-hidden="true"></span> Inicia Sesión para Comprar
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <Button variant="secondary" size="lg" disabled className="w-100 py-3 rounded-3">
                      <span className="bi bi-slash-circle me-2" aria-hidden="true"></span> Producto Agotado
                    </Button>
                  </div>
                )}

                {/* Beneficios de confianza */}
                <div className="trust-badges-grid pt-3 border-top">
                  <div className="trust-badge-item">
                    <span className="bi bi-shield-check text-gold fs-4" aria-hidden="true"></span>
                    <div>
                      <span className="fw-bold d-block text-navy small">Autenticidad</span>
                      <span className="text-muted extra-small">100% garantizada</span>
                    </div>
                  </div>
                  <div className="trust-badge-item">
                    <span className="bi bi-truck text-gold fs-4" aria-hidden="true"></span>
                    <div>
                      <span className="fw-bold d-block text-navy small">Envío Seguro</span>
                      <span className="text-muted extra-small">A todo el país</span>
                    </div>
                  </div>
                  <div className="trust-badge-item">
                    <span className="bi bi-gem text-gold fs-4" aria-hidden="true"></span>
                    <div>
                      <span className="fw-bold d-block text-navy small">Calidad Premium</span>
                      <span className="text-muted extra-small">Máxima distinción</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Sección de Comentarios y Reseñas */}
      <Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-5">
        <Card.Body className="p-4 p-lg-5">
          <h4 className="fw-bold text-navy mb-4 d-flex align-items-center gap-2"><span className="bi bi-chat-quote-fill text-gold" aria-hidden="true"></span> Opiniones y Reseñas del Producto</h4>
          <ProductoComentarios 
            productoId={producto.id}
            onComentarioCreado={handleComentarioCreado}
          />
        </Card.Body>
      </Card>

      {/* Botón Volver */}
      <div className="text-center">
        <Button
          as={Link}
          to="/catalogo"
          variant="outline-secondary"
          className="px-4 py-2 rounded-pill"
        >
          <span className="bi bi-arrow-left me-2" aria-hidden="true"></span> Volver al catálogo
        </Button>
      </div>

      {/* Estilos dedicados para la vista de producto */}
      <style>{`
        .product-breadcrumb .breadcrumb-item a {
          color: var(--bs-gold-dark, #c7984e);
          text-decoration: none;
          font-weight: 500;
        }
        .product-breadcrumb .breadcrumb-item.active {
          color: #192847;
          font-weight: 600;
        }

        .product-detail-card {
          background: #ffffff;
          box-shadow: 0 8px 30px rgba(25, 40, 71, 0.06) !important;
        }

        /* Escenario de Imagen transparente y adaptativo */
        .product-image-stage {
          position: relative;
          width: 100%;
          min-height: 380px;
          height: 100%;
          max-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1.5rem;
          background: radial-gradient(circle at center, rgba(245, 194, 113, 0.12) 0%, rgba(219, 225, 237, 0.18) 60%, rgba(255, 255, 255, 0) 100%);
          padding: 2rem;
          border: 1px solid rgba(245, 194, 113, 0.2);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .product-image-stage:hover {
          border-color: rgba(245, 194, 113, 0.4);
          box-shadow: 0 12px 36px rgba(245, 194, 113, 0.15);
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
          background: rgba(25, 40, 71, 0.85);
          backdrop-filter: blur(8px);
          color: #f5c271;
          font-weight: 600;
          font-size: 0.8rem;
          padding: 0.45rem 0.85rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(245, 194, 113, 0.3);
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

        .product-price-amount {
          font-size: 2.2rem;
          font-weight: 800;
          color: #b8832a;
          letter-spacing: -0.01em;
        }

        .stock-status-pill {
          padding: 0.45rem 0.95rem;
          border-radius: 2rem;
          font-size: 0.9rem;
        }

        .stock-status-pill.in-stock {
          background: rgba(16, 185, 129, 0.1);
        }

        .stock-status-pill.low-stock {
          background: rgba(245, 158, 11, 0.12);
          color: #b45309 !important;
        }

        .stock-status-pill.out-of-stock {
          background: rgba(239, 68, 68, 0.1);
        }

        .quantity-selector-card {
          display: inline-flex;
          align-items: center;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.85rem;
          padding: 0.25rem 0.4rem;
        }

        .quantity-btn {
          color: #192847 !important;
          font-size: 1.2rem;
          padding: 0.3rem 0.7rem;
          text-decoration: none !important;
          line-height: 1;
        }

        .quantity-btn:hover:not(:disabled) {
          color: #c7984e !important;
        }

        .quantity-input-field {
          width: 50px;
          border: none;
          background: transparent;
          text-align: center;
          font-weight: 700;
          font-size: 1.1rem;
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

        .btn-add-cart-luxury {
          background: linear-gradient(135deg, #192847 0%, #0f1a30 100%) !important;
          border: 1px solid #f5c271 !important;
          color: #f5c271 !important;
          font-weight: 700 !important;
          border-radius: 0.85rem !important;
          padding: 0.75rem 1.5rem !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 4px 15px rgba(25, 40, 71, 0.2) !important;
        }

        .btn-add-cart-luxury:hover:not(:disabled) {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%) !important;
          color: #000000 !important;
          border-color: #c7984e !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(199, 152, 78, 0.35) !important;
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
      `}</style>
    </Container>
  );
};

export default ProductoDetallePage;
