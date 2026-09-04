/**
 * ============================================
 * PRODUCT CARD COMPONENT - Adaptado a la paleta del proyecto
 * ============================================
 * Tarjeta de producto con estilos personalizados (dorados, fondos)
 */

import React, { memo, useCallback } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatCurrency, getImageUrl } from '../utils/helpers';

const ProductCard = memo(({ producto, onAddToCart, showActions = true }) => {
  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(producto);
    }
  }, [producto, onAddToCart]);

  return (
    <Card className="h-100 product-card shadow-sm">
      <Link to={`/producto/${producto.id}`} className="text-decoration-none position-relative">
        <div style={{ overflow: 'hidden', height: '200px', borderRadius: '0.75rem 0.75rem 0 0' }}>
          <Card.Img
            variant="top"
            src={getImageUrl(producto.imagen)}
            alt={producto.nombre}
            style={{ height: '200px', objectFit: 'cover', width: '100%' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/producto-default.jpg';
            }}
          />
        </div>
        {producto.stock > 0 && producto.stock < 10 && (
          <Badge 
            className="badge-warning-custom position-absolute" 
            style={{ top: '10px', right: '10px', fontSize: '0.75rem' }}
          >
            ¡Últimas unidades!
          </Badge>
        )}
      </Link>
      
      <Card.Body className="d-flex flex-column p-3">
        <Link to={`/producto/${producto.id}`} className="text-decoration-none">
          <Card.Title className="h6 mb-2 product-title">
            {producto.nombre}
          </Card.Title>
        </Link>
        
        <Card.Text className="text-muted small flex-grow-1" style={{ lineHeight: '1.5' }}>
          {producto.descripcion?.substring(0, 80)}
          {producto.descripcion?.length > 80 && '...'}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 product-price">
            {formatCurrency(producto.precio)}
          </h5>
          {producto.stock > 0 ? (
            <Badge className="badge-stock-success">
              Stock: {producto.stock}
            </Badge>
          ) : (
            <Badge className="badge-stock-danger">Sin stock</Badge>
          )}
        </div>
        
        {showActions && producto.stock > 0 && (
          <Button
            className="btn-add-to-cart w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleAddToCart}
          >
            <i className="bi bi-cart-plus-fill fs-6" />
            <span>Agregar al carrito</span>
          </Button>
        )}
        
        {showActions && producto.stock === 0 && (
          <Button variant="secondary" className="btn-sin-stock w-100 d-flex align-items-center justify-content-center gap-2" disabled>
            <i className="bi bi-slash-circle" />
            <span>No disponible</span>
          </Button>
        )}
      </Card.Body>

      {/* Estilos personalizados usando las variables globales */}
      <style>{`
        .product-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          background: var(--bg, #ffffff);
          border-radius: 1rem !important;
        }
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 24px -5px rgba(25, 40, 71, 0.1) !important;
          border-color: rgba(197, 151, 74, 0.3) !important;
        }
        .product-card:hover .product-title {
          color: #c7984e;
        }
        .product-title {
          color: var(--bg-negativo, #192847);
          font-weight: 600;
          transition: color 0.3s ease;
        }
        .product-price {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 700;
        }
        .badge-warning-custom {
          background-color: var(--bg-aviso, #F7B517);
          color: var(--fnt-black, #000000);
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          font-weight: 600;
        }
        .badge-stock-success {
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 0.4rem 0.7rem;
          border-radius: 0.5rem;
          font-weight: 600;
          color: white;
        }
        .badge-stock-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          padding: 0.4rem 0.7rem;
          border-radius: 0.5rem;
          font-weight: 600;
          color: white;
        }
        .btn-add-to-cart {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e)) !important;
          border: none !important;
          border-radius: 0.75rem !important;
          padding: 0.65rem 1rem !important;
          font-weight: 700 !important;
          color: #192847 !important;
          transition: all 0.25s ease !important;
          box-shadow: 0 4px 12px rgba(199, 152, 78, 0.25) !important;
        }
        .btn-add-to-cart:hover {
          background: linear-gradient(135deg, var(--bs-gold-dark, #c7984e), var(--bs-gold, #f5c271)) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(199, 152, 78, 0.35) !important;
          color: #192847 !important;
        }
        .btn-add-to-cart:active {
          transform: translateY(0) !important;
        }
        .btn-sin-stock {
          border-radius: 0.75rem !important;
          padding: 0.65rem 1rem !important;
          font-weight: 600 !important;
          background: #e2e8f0 !important;
          color: #64748b !important;
          border: none !important;
        }
      `}</style>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;