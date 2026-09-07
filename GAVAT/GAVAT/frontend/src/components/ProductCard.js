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
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;