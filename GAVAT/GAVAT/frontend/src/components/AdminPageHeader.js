/**
 * ============================================
 * ADMIN PAGE HEADER (GAVAT)
 * ============================================
 * Cabecera estándar para páginas del panel administrativo.
 */

import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FloatingToast from './FloatingToast';

const AdminPageHeader = ({
  titulo,
  icono,
  total,
  totalFiltrados,
  etiqueta = 'registro',
  subtitulo,
  mensaje,
  onLimpiarMensaje,
  rutaVolver = '/admin/dashboard',
  children,
}) => {
  const navigate = useNavigate();

  const renderContador = () => {
    if (subtitulo) return subtitulo;
    if (total === undefined && totalFiltrados === undefined) return null;
    if (totalFiltrados !== undefined && total !== undefined && totalFiltrados !== total) {
      return (
        <>
          Total: <strong>{totalFiltrados}</strong> de <strong>{total}</strong> {etiqueta}
          {total !== 1 ? 's' : ''}
        </>
      );
    }
    const count = total !== undefined ? total : totalFiltrados;
    return (
      <>
        Total: <strong>{count}</strong> {etiqueta}
        {count !== 1 ? 's' : ''}
      </>
    );
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            {icono && <span className={`bi bi-${icono} me-2 text-gold`} aria-hidden="true" />}
            <span>{titulo}</span>
          </h1>
          <p className="text-muted mb-0">{renderContador()}</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          {children}
          {rutaVolver && (
            <Button variant="outline-secondary" onClick={() => navigate(rutaVolver)}>
              <i className="bi bi-arrow-left me-1" /> Volver
            </Button>
          )}
        </div>
      </div>

      {mensaje && onLimpiarMensaje && (
        <FloatingToast
          mensaje={mensaje}
          onClose={onLimpiarMensaje}
        />
      )}
    </>
  );
};

export default AdminPageHeader;
