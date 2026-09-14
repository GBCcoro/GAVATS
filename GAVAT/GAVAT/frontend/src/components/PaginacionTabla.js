/**
 * ============================================
 * PAGINACIÓN DE TABLA (GAVAT)
 * ============================================
 * Barra de paginación reutilizable para tablas administrativas.
 * Sigue el mismo esquema y diseño de AdminProductosPage:
 * - Botones anterior y siguiente secundarios con bi-arrow-left y bi-arrow-right
 * - Indicador central 'Página X de Y'
 * - Contador de registros mostrados a la izquierda con icono bi-file-text
 */

import React from 'react';
import { Button } from 'react-bootstrap';

const PaginacionTabla = ({
  paginaActual = 1,
  totalPaginas = 1,
  totalItems,
  itemsActuales = 0,
  etiquetaItems = 'registros',
  onCambiarPagina,
  loading = false,
  className = ''
}) => {
  if (totalPaginas <= 1 && (!totalItems || totalItems <= 0)) return null;

  const totalNum = totalItems !== undefined ? totalItems : itemsActuales;
  const itemsPorPagina = itemsActuales > 0 ? itemsActuales : 10;
  const inicio = totalNum === 0 ? 0 : (paginaActual - 1) * itemsPorPagina + 1;
  const fin = totalNum > 0 ? Math.min(paginaActual * itemsPorPagina, totalNum) : itemsActuales;

  const handleAnterior = () => {
    if (typeof onCambiarPagina === 'function') {
      onCambiarPagina(paginaActual > 1 ? paginaActual - 1 : 1);
    }
  };

  const handleSiguiente = () => {
    if (typeof onCambiarPagina === 'function') {
      onCambiarPagina(paginaActual < totalPaginas ? paginaActual + 1 : totalPaginas);
    }
  };

  return (
    <div className={`d-flex justify-content-between align-items-center text-muted bg-white p-3 rounded shadow-sm ${className}`}>
      <small>
        <span className="bi bi-file-text me-1" aria-hidden="true" />
        <span>
          Mostrando <strong>{totalNum === 0 ? '0-0' : `${inicio}-${fin}`}</strong> de <strong>{totalNum}</strong> {etiquetaItems}
        </span>
      </small>
      
      <div className="d-flex gap-2 align-items-center">
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          disabled={paginaActual === 1 || loading}
          onClick={handleAnterior}
          title="Página anterior"
        >
          <span className="bi bi-arrow-left" aria-hidden="true" />
        </Button>
        
        <span className="text-nowrap small">
          Página <strong>{paginaActual}</strong> de <strong>{totalPaginas || 1}</strong>
        </span>
        
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          disabled={paginaActual >= totalPaginas || loading}
          onClick={handleSiguiente}
          title="Página siguiente"
        >
          <span className="bi bi-arrow-right" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default PaginacionTabla;
