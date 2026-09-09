/**
 * ============================================
 * PAGINACIÓN DE TABLA (GAVAT)
 * ============================================
 * Barra de paginación reutilizable para tablas administrativas.
 */

import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

const PaginacionTabla = ({
  paginaActual = 1,
  totalPaginas = 1,
  totalItems,
  itemsActuales = 0,
  etiquetaItems = 'elementos',
  onCambiarPagina,
  loading = false,
}) => {
  if (totalPaginas <= 1) return null;

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-4 p-3 bg-white rounded shadow-sm">
      <small className="text-muted">
        Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
        {totalItems !== undefined && (
          <> — Mostrando <strong>{itemsActuales}</strong> de <strong>{totalItems}</strong> {etiquetaItems}</>
        )}
      </small>
      <ButtonGroup size="sm">
        <Button
          variant="outline-primary"
          onClick={() => onCambiarPagina(1)}
          disabled={paginaActual === 1 || loading}
        >
          ««
        </Button>
        <Button
          variant="outline-primary"
          onClick={() => onCambiarPagina(p => p - 1)}
          disabled={paginaActual === 1 || loading}
        >
          Anterior
        </Button>
        <Button variant="primary" disabled>
          {paginaActual} / {totalPaginas}
        </Button>
        <Button
          variant="outline-primary"
          onClick={() => onCambiarPagina(p => p + 1)}
          disabled={paginaActual === totalPaginas || loading}
        >
          Siguiente
        </Button>
        <Button
          variant="outline-primary"
          onClick={() => onCambiarPagina(totalPaginas)}
          disabled={paginaActual === totalPaginas || loading}
        >
          »»
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default PaginacionTabla;
