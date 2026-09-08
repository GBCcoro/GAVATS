/**
 * ============================================
 * FLOATING TOAST COMPONENT (Estilo Gestores)
 * ============================================
 * Notificación flotante fija en la parte inferior izquierda de la ventana.
 * Utiliza createPortal para renderizarse directamente en document.body,
 * asegurando que nunca esté dentro de grids, filas o divs contenedores del layout.
 */

import { memo } from 'react';
import { createPortal } from 'react-dom';
import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ICONOS_POR_TIPO = Object.freeze({
  success: 'check-circle-fill text-success',
  danger: 'exclamation-octagon-fill text-danger',
  warning: 'exclamation-triangle-fill text-warning',
  info: 'info-circle-fill text-info'
});

const FloatingToast = memo(({ mensaje, onClose = () => {} }) => {
  if (!mensaje?.texto || typeof document === 'undefined' || !document.body) {
    return null;
  }

  const tipo = mensaje.tipo || 'info';
  const iconoClase = ICONOS_POR_TIPO[tipo] || ICONOS_POR_TIPO.info;

  return createPortal(
    <div className="toast-floating-container-bottom-left">
      <Alert 
        variant={tipo} 
        dismissible 
        onClose={onClose}
        className={`toast-floating-alert alert-${tipo} mb-0`}
      >
        <span className={`bi bi-${iconoClase} fs-5 flex-shrink-0`} aria-hidden="true" />
        <div className="flex-grow-1 fw-medium text-start">
          {mensaje.texto}
        </div>
        {tipo === 'success' && mensaje.accion?.url && (
          <Link 
            to={mensaje.accion.url} 
            className="btn btn-outline-success btn-sm ms-2 fw-bold text-nowrap py-1 px-2 rounded-2"
          >
            {mensaje.accion.texto} <span className="bi bi-arrow-right ms-1" aria-hidden="true" />
          </Link>
        )}
      </Alert>
    </div>,
    document.body
  );
});

FloatingToast.displayName = 'FloatingToast';

export default FloatingToast;
