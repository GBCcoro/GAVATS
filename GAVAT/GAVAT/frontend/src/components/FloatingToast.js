/**
 * ============================================
 * FLOATING TOAST COMPONENT (Estilo Gestores)
 * ============================================
 * Notificación flotante fija en la parte inferior izquierda de la ventana.
 * Utiliza createPortal para renderizarse directamente en document.body,
 * asegurando que nunca esté dentro de grids, filas o divs contenedores del layout.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FloatingToast = ({ mensaje, onClose }) => {
  if (!mensaje || !mensaje.texto) return null;

  return createPortal(
    <div 
      className="toast-floating-container-bottom-left"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 99999,
        margin: 0,
        pointerEvents: 'auto'
      }}
      role="region"
      aria-live="polite"
      aria-label="Notificación del sistema"
    >
      <Alert 
        variant={mensaje.tipo || 'info'} 
        dismissible 
        onClose={onClose}
        className={`toast-floating-alert alert-${mensaje.tipo || 'info'} mb-0`}
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
        {mensaje.tipo === 'success' && mensaje.accion && (
          <Button 
            as={Link} 
            to={mensaje.accion.url} 
            variant="outline-success" 
            size="sm" 
            className="ms-2 fw-bold text-nowrap py-1 px-2"
            style={{ fontSize: '0.82rem', borderRadius: '6px' }}
          >
            {mensaje.accion.texto} <i className="bi bi-arrow-right ms-1" />
          </Button>
        )}
      </Alert>
    </div>,
    document.body
  );
};

export default FloatingToast;
