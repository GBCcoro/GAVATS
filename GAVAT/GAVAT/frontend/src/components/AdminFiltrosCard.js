/**
 * ============================================
 * ADMIN FILTROS CARD (GAVAT)
 * ============================================
 * Contenedor estándar para filtros de búsqueda en tablas administrativas.
 */

import React from 'react';
import { Card, Row } from 'react-bootstrap';

const AdminFiltrosCard = ({ titulo = 'Filtros de Búsqueda', children }) => {
  return (
    <Card className="shadow-sm border-0 mb-4 admin-card-table">
      <Card.Body className="p-3 p-md-4">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-navy">
          <span className="bi bi-funnel text-gold" aria-hidden="true" />
          <span>{titulo}</span>
        </h6>
        <Row className="g-3 align-items-end">
          {children}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AdminFiltrosCard;
