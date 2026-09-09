/**
 * ============================================
 * BOTÓN EXPORTAR DROPDOWN (GAVAT)
 * ============================================
 * Componente reutilizable para exportación a PDF y Excel en páginas admin.
 */

import React from 'react';
import { Dropdown, Button, ButtonGroup } from 'react-bootstrap';

const BotonExportar = ({
  tipoExportacion = 'pdf',
  onTipoChange,
  onExportar,
  exportando = false,
}) => {
  const formato = tipoExportacion === 'pdf' ? 'PDF' : 'Excel';
  const textoBoton = exportando ? 'Exportando...' : `Exportar a ${formato}`;
  const iconTipo = tipoExportacion === 'pdf' ? 'pdf' : 'excel';

  return (
    <Dropdown as={ButtonGroup}>
      <Button
        variant="primary"
        disabled={exportando}
        onClick={() => onExportar(tipoExportacion)}
      >
        <span className={`bi bi-file-earmark-${iconTipo} me-1`} aria-hidden="true" />
        {textoBoton}
      </Button>
      <Dropdown.Toggle
        split
        variant="secondary"
        className="btn-dark dropdown-toggle-split"
        disabled={exportando}
      />
      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => {
            if (onTipoChange) onTipoChange('pdf');
            onExportar('pdf');
          }}
        >
          <span className="bi bi-file-earmark-pdf me-2" aria-hidden="true" /> Exportar a PDF
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            if (onTipoChange) onTipoChange('excel');
            onExportar('excel');
          }}
        >
          <span className="bi bi-file-earmark-excel me-2" aria-hidden="true" /> Exportar a Excel
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default BotonExportar;
