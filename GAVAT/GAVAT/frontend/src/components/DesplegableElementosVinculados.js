/**
 * =========================================================
 * DESPLEGABLE DE ELEMENTOS VINCULADOS (GAVAT)
 * =========================================================
 * Componente interactivo desplegable (tipo acordeón) para
 * visualizar productos y subcategorías vinculadas a una
 * categoría o subcategoría (usado al editar y al eliminar).
 */

import React, { useState } from 'react';
import { Badge, Spinner } from 'react-bootstrap';

const DesplegableElementosVinculados = ({
  subcategorias = [],
  productos = [],
  mostrarSubcategorias = true,
  mostrarProductos = true,
  loading = false,
  titulo = null,
  defaultAbierto = false,
  className = ''
}) => {
  const [abierto, setAbierto] = useState(defaultAbierto);

  const totalSubs = subcategorias?.length || 0;
  const totalProds = productos?.length || 0;
  const totalElementos = (mostrarSubcategorias ? totalSubs : 0) + (mostrarProductos ? totalProds : 0);

  const textoTitulo = titulo || (
    totalElementos > 0
      ? `Elementos vinculados (${mostrarSubcategorias && totalSubs > 0 ? `${totalSubs} subcat. ` : ''}${mostrarProductos ? `${totalProds} prod.` : ''})`
      : 'Elementos vinculados (0)'
  );

  return (
    <div className={`desplegable-vinculados border rounded-3 overflow-hidden bg-white shadow-sm w-100 text-start ${className}`} style={{ fontSize: '0.85rem' }}>
      <button
        type="button"
        className="w-100 d-flex justify-content-between align-items-center px-3 py-2 border-0 bg-light text-secondary fw-semibold text-start shadow-none"
        onClick={() => setAbierto(!abierto)}
        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
        aria-expanded={abierto}
      >
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-diagram-3 text-primary fs-6" />
          <span className="text-dark">{textoTitulo}</span>
        </span>
        <span className="d-flex align-items-center gap-2">
          {mostrarSubcategorias && totalSubs > 0 && (
            <Badge bg="info" className="fw-normal" style={{ fontSize: '0.72rem' }}>
              {totalSubs} subcat.
            </Badge>
          )}
          {mostrarProductos && totalProds > 0 && (
            <Badge bg="primary" className="fw-normal" style={{ fontSize: '0.72rem' }}>
              {totalProds} prod.
            </Badge>
          )}
          <i className={`bi bi-chevron-${abierto ? 'up' : 'down'} text-muted ms-1`} />
        </span>
      </button>

      {abierto && (
        <div className="p-3 border-top bg-white" style={{ maxHeight: '220px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-2 text-muted">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Cargando elementos asociados...</span>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {/* Sección Subcategorías */}
              {mostrarSubcategorias && (
                <div>
                  <div className="fw-bold text-dark small mb-1 d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-folder2-open me-1 text-info" /> Subcategorías vinculadas ({totalSubs})
                    </span>
                  </div>
                  {totalSubs === 0 ? (
                    <div className="text-muted small fst-italic ps-2">Sin subcategorías asociadas</div>
                  ) : (
                    <ul className="list-group list-group-flush rounded border small mb-0">
                      {subcategorias.map(sub => (
                        <li key={sub.id} className="list-group-item d-flex justify-content-between align-items-center py-1 px-2 bg-light-subtle">
                          <span className="text-truncate me-2" style={{ maxWidth: '280px' }} title={sub.nombre}>
                            <span className="text-muted me-1">#{sub.id}</span>
                            <strong>{sub.nombre}</strong>
                          </span>
                          <Badge bg={sub.activo ? 'success-subtle text-success' : 'secondary-subtle text-secondary'} className="border">
                            {sub.activo ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Sección Productos */}
              {mostrarProductos && (
                <div>
                  <div className="fw-bold text-dark small mb-1 d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-box-seam me-1 text-primary" /> Productos vinculados ({totalProds})
                    </span>
                  </div>
                  {totalProds === 0 ? (
                    <div className="text-muted small fst-italic ps-2">Sin productos asociados</div>
                  ) : (
                    <ul className="list-group list-group-flush rounded border small mb-0">
                      {productos.map(prod => (
                        <li key={prod.id} className="list-group-item d-flex justify-content-between align-items-center py-1 px-2 bg-light-subtle">
                          <div className="d-flex align-items-center text-truncate me-2" style={{ maxWidth: '280px' }}>
                            <span className="text-muted me-1">#{prod.id}</span>
                            <span className="fw-medium text-truncate" title={prod.nombre}>{prod.nombre}</span>
                            {prod.precio !== undefined && (
                              <span className="text-muted ms-1 small">
                                (${Number(prod.precio).toFixed(2)})
                              </span>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            {prod.stock !== undefined && (
                              <span className="text-muted small me-1">
                                Stock: {prod.stock}
                              </span>
                            )}
                            <Badge bg={prod.activo ? 'success-subtle text-success' : 'secondary-subtle text-secondary'} className="border">
                              {prod.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesplegableElementosVinculados;
