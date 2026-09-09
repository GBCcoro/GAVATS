/**
 * ============================================
 * TOOLBAR SELECCIÓN LOTE (GAVAT)
 * ============================================
 * Barra de acciones para selección múltiple en tablas administrativas.
 */

import React from 'react';
import { Button, Badge } from 'react-bootstrap';

const ToolbarSeleccionLote = ({
  totalItems = 0,
  todosSeleccionados = false,
  cantidadSeleccionados = 0,
  etiquetaItem = 'elemento',
  onToggleTodos,
  onLimpiar,
  children,
}) => {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 px-1">
      <div className="d-flex align-items-center gap-2">
        <Button
          variant={todosSeleccionados ? "secondary" : "outline-secondary"}
          size="sm"
          className="d-inline-flex align-items-center gap-1"
          onClick={onToggleTodos}
          title={todosSeleccionados ? "Deseleccionar todos en esta página" : "Seleccionar todos en esta página"}
        >
          <i className={`bi bi-${todosSeleccionados ? 'check-square-fill text-primary' : 'square'}`} />
          <span>{todosSeleccionados ? 'Deseleccionar página' : `Seleccionar todo (${totalItems})`}</span>
        </Button>
        {cantidadSeleccionados > 0 && (
          <Badge bg="danger" className="p-2 d-flex align-items-center gap-1 fs-7">
            <i className="bi bi-check-circle-fill"></i> {cantidadSeleccionados} {etiquetaItem}{cantidadSeleccionados !== 1 ? 's' : ''} seleccionada{cantidadSeleccionados !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {cantidadSeleccionados > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2">
          {children}
          {onLimpiar && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onLimpiar}
              title="Limpiar selección"
            >
              <i className="bi bi-x-lg me-1"></i> Deseleccionar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolbarSeleccionLote;
