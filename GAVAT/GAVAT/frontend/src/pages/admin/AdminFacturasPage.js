/**
 * ============================================
 * ADMIN FACTURAS PAGE
 * ============================================
 * Gestión de facturas (consultar, descargar, anular)
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import BotonExportar from '../../components/BotonExportar';
import ToolbarSeleccionLote from '../../components/ToolbarSeleccionLote';
import PaginacionTabla from '../../components/PaginacionTabla';
import AdminPageHeader from '../../components/AdminPageHeader';
import AdminFiltrosCard from '../../components/AdminFiltrosCard';
import { exportarFacturasAPDF, exportarFacturasAExcel } from '../../utils/exportUtils';

const BADGE_ESTADOS = Object.freeze({
  emitida: 'warning',
  enviada: 'info',
  vista: 'warning',
  anulada: 'danger',
  pagada: 'success'
});

const getBadgeEstado = (estado) => BADGE_ESTADOS[estado] || 'secondary';

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0 
  }).format(precio || 0);
};

const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleString('es-CO', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const AdminFacturasPage = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [exportando, setExportando] = useState(false);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [modalConfirmacion, setModalConfirmacion] = useState({ show: false });
  const [filtros, setFiltros] = useState({ busqueda: '', estado: 'todos' });
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const registrosPorPagina = 25;

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(filtros.busqueda);
    }, 350);
    return () => clearTimeout(timer);
  }, [filtros.busqueda]);

  // Resetear página al filtrar o buscar
  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaDebounced, filtros.estado]);

  const loadFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pagina: paginaActual,
        limite: registrosPorPagina
      };
      if (busquedaDebounced.trim()) params.buscar = busquedaDebounced.trim();
      if (filtros.estado && filtros.estado !== 'todos') params.estado = filtros.estado;

      const response = await adminService.getFacturas(params);
      const facturasData = response.data?.facturas || response.data || [];
      const total = response.data?.total ?? response.total ?? facturasData.length;
      const numPags = response.data?.totalPaginas || Math.max(1, Math.ceil(total / registrosPorPagina));

      setFacturas(Array.isArray(facturasData) ? facturasData : []);
      setTotalFacturas(total);
      setTotalPaginas(numPags);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar las facturas' });
      setFacturas([]);
      setTotalFacturas(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  }, [paginaActual, busquedaDebounced, filtros.estado]);

  useEffect(() => {
    loadFacturas();
  }, [loadFacturas, reloadKey]);

  const recargarFacturas = useCallback(() => {
    setReloadKey(prev => prev + 1);
  }, []);

  const handleExportar = useCallback(async (formato) => {
    setExportando(true);
    try {
      const params = {
        pagina: 1,
        limite: 1000,
        ...(busquedaDebounced.trim() && { buscar: busquedaDebounced.trim() }),
        ...(filtros.estado && filtros.estado !== 'todos' && { estado: filtros.estado })
      };
      const res = await adminService.getFacturas(params);
      const items = res.data?.facturas || res.data || [];
      const datos = Array.isArray(items) ? items : facturas;
      if (formato === 'pdf') {
        exportarFacturasAPDF(datos);
      } else {
        await exportarFacturasAExcel(datos);
      }
    } catch (error) {
      console.error('Error al exportar facturas:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al exportar facturas' });
    } finally {
      setExportando(false);
    }
  }, [busquedaDebounced, filtros.estado, facturas]);

  const handleVerDetalle = async (factura) => {
    try {
      const response = await adminService.getFacturaById(factura.id);
      setFacturaSeleccionada(response.data || factura);
      setShowDetalleModal(true);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar detalle de la factura' });
    }
  };

  const handleDescargarPDF = async (numeroFactura) => {
    try {
      const response = await adminService.descargarFacturaPDF(numeroFactura);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${numeroFactura}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
      setMensaje({ tipo: 'success', texto: `PDF de la factura "${numeroFactura}" descargado correctamente` });
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al descargar el PDF de la factura' });
    }
  };

  // Anular factura individual
  const ejecutarAnulacionFactura = async (factura, numFactura) => {
    try {
      setFacturas(prev => 
        prev.map(f => f.id === factura.id ? { ...f, estado: 'anulada' } : f)
      );
      if (facturaSeleccionada?.id === factura.id) {
        setFacturaSeleccionada(prev => prev ? { ...prev, estado: 'anulada' } : prev);
      }

      await adminService.anularFactura(factura.id);
      setMensaje({ tipo: 'success', texto: `Factura "${numFactura}" anulada exitosamente` });
      setShowDetalleModal(false);
      recargarFacturas();
    } catch (error) {
      console.error('Error al anular factura:', error);
      setMensaje({ tipo: 'danger', texto: error.message || 'Error al anular la factura' });
      recargarFacturas();
    }
  };

  const solicitarAnularFactura = (factura) => {
    const numFactura = factura.numeroFactura || factura.numero_factura || `#${factura.id}`;
    setModalConfirmacion({
      show: true,
      titulo: '¿Anular factura?',
      mensaje: `¿Estás seguro de que deseas anular la factura "${numFactura}"? Esta acción cambiará el estado a Anulada.`,
      tipo: 'danger',
      icono: 'x-circle-fill',
      textoConfirmar: 'Anular Factura',
      textoCancelar: 'Cancelar',
      onConfirm: () => ejecutarAnulacionFactura(factura, numFactura)
    });
  };

  // Selección de filas
  const todosPaginaSeleccionados = useMemo(() => {
    return facturas.length > 0 && facturas.every(f => seleccionados.has(f.id));
  }, [facturas, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        facturas.forEach(f => nuevo.delete(f.id));
      } else {
        facturas.forEach(f => nuevo.add(f.id));
      }
      return nuevo;
    });
  };

  const toggleSeleccionarFactura = (id) => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  };

  const esCargaInicial = loading && facturas.length === 0 && !busquedaDebounced && filtros.estado === 'todos';
  if (esCargaInicial) {
    return <LoadingSpinner message="Cargando facturas..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar Responsivo */}
      <AdminPageHeader
        titulo="Gestión de Facturas"
        icono="file-earmark-pdf"
        total={totalFacturas}
        etiqueta="factura"
        mensaje={mensaje}
        onLimpiarMensaje={() => setMensaje({ tipo: '', texto: '' })}
      >
        <BotonExportar
          tipoExportacion={tipoExportacion}
          onTipoChange={setTipoExportacion}
          onExportar={handleExportar}
          exportando={exportando}
        />
      </AdminPageHeader>

      {/* Filtros */}
      <AdminFiltrosCard>
        <Col md={6}>
          <Form.Group controlId="filtroBuscarFactura">
            <Form.Label className="small fw-semibold mb-1">Buscar Factura</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-light">
                <span className="bi bi-search" aria-hidden="true"></span>
              </InputGroup.Text>
              <Form.Control
                id="filtroBuscarFactura"
                placeholder="Buscar por número, cliente o email..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="filtroEstadoFactura">
            <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
            <Form.Select
              id="filtroEstadoFactura"
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <option value="todos">Todos</option>
              <option value="emitida">Emitida</option>
              <option value="enviada">Enviada</option>
              <option value="vista">Vista</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={() => setFiltros({ busqueda: '', estado: 'todos' })}
          >
            <span className="bi bi-arrow-clockwise me-1" aria-hidden="true"></span> Limpiar filtros
          </Button>
        </Col>
      </AdminFiltrosCard>

      {/* Barra de Acciones de Selección Múltiple */}
      <ToolbarSeleccionLote
        totalItems={facturas.length}
        todosSeleccionados={todosPaginaSeleccionados}
        cantidadSeleccionados={seleccionados.size}
        etiquetaItem="factura"
        onToggleTodos={handleToggleSeleccionarTodos}
        onLimpiar={() => setSeleccionados(new Set())}
      >
        {seleccionados.size === 1 && (
          <Button
            variant="outline-primary"
            size="sm"
            className="d-inline-flex align-items-center gap-1 fw-semibold"
            onClick={() => {
              const idSel = Array.from(seleccionados)[0];
              const factSel = facturas.find(f => f.id === idSel);
              if (factSel) handleVerDetalle(factSel);
            }}
            title="Ver detalle de la factura seleccionada"
          >
            <i className="bi bi-eye-fill"></i>
            <span>Ver Detalle</span>
          </Button>
        )}
      </ToolbarSeleccionLote>

      {/* Tabla de Facturas Responsiva */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '160px' }}>Número Factura</th>
                <th>Cliente</th>
                <th style={{ width: '120px' }}>Monto</th>
                <th className="d-none d-sm-table-cell" style={{ width: '100px' }}>Estado</th>
                <th className="d-none d-md-table-cell" style={{ width: '130px' }}>Fecha</th>
                <th className="text-center" style={{ width: '150px', minWidth: '110px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No hay facturas registradas
                  </td>
                </tr>
              ) : (
                facturas.map((factura) => {
                  const estaSeleccionado = seleccionados.has(factura.id);
                  const numFactura = factura.numeroFactura || factura.numero_factura;
                  return (
                    <tr 
                      key={factura.id}
                      onClick={() => toggleSeleccionarFactura(factura.id)}
                      className={`fila-admin ${estaSeleccionado ? 'fila-admin-seleccionada' : ''}`}
                      title="Haz clic para seleccionar/deseleccionar esta factura"
                    >
                      <td className="align-middle fw-bold">
                        <div className="d-flex align-items-center gap-2">
                          <i 
                            className={`bi bi-${estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted'} fs-6 d-inline-block`}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{numFactura}</span>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="fw-bold">{factura.clienteNombre || factura.cliente_nombre || '-'}</div>
                        <small className="text-muted d-block">{factura.clienteEmail || factura.cliente_email || ''}</small>
                      </td>
                      <td className="align-middle fw-bold">{formatearPrecio(factura.total)}</td>
                      <td className="align-middle d-none d-sm-table-cell">
                        <Badge bg={getBadgeEstado(factura.estado)}>
                          {factura.estado}
                        </Badge>
                      </td>
                      <td className="align-middle d-none d-md-table-cell">{formatearFecha(factura.fechaEmision || factura.created_at)}</td>
                      <td className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="action-btn-group">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerDetalle(factura);
                            }}
                            title="Ver detalle de factura"
                          >
                            <i className="bi bi-eye" />
                            <span className="btn-text">Detalle</span>
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDescargarPDF(numFactura);
                            }}
                            title="Descargar PDF"
                          >
                            <i className="bi bi-download" />
                            <span className="btn-text">PDF</span>
                          </Button>
                          {factura.estado !== 'anulada' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="btn-action-table" 
                              onClick={(e) => {
                                e.stopPropagation();
                                solicitarAnularFactura(factura);
                              }}
                              title="Anular factura"
                            >
                              <i className="bi bi-x-circle" />
                              <span className="btn-text">Anular</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Paginación */}
      <PaginacionTabla
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={totalFacturas}
        itemsActuales={facturas.length}
        etiquetaItems="facturas"
        onCambiarPagina={setPaginaActual}
        loading={loading}
      />

      <FacturaDetalleModal
        show={showDetalleModal}
        factura={facturaSeleccionada}
        onClose={() => setShowDetalleModal(false)}
        onDescargarPDF={handleDescargarPDF}
        onAnularFactura={solicitarAnularFactura}
      />

      <ModalConfirmacion
        modal={modalConfirmacion}
        onClose={() => setModalConfirmacion(prev => ({ ...prev, show: false }))}
      />
    </Container>
  );
};

// Subcomponente Detalle Factura
const FacturaDetalleModal = ({
  show,
  factura,
  onClose,
  onDescargarPDF,
  onAnularFactura,
}) => {
  const numFactura = factura ? (factura.numeroFactura || factura.numero_factura) : '';

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="lg" 
      centered
      dialogClassName="modal-producto-form"
      style={{ maxWidth: '780px' }}
    >
      <div className="product-minimal-header">
        <div>
          <h6 className="fw-bold mb-0 text-navy fs-6">
            Detalle de Factura
          </h6>
          <small className="text-muted" style={{ fontSize: '0.8rem' }}>
            {numFactura}
          </small>
        </div>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Cerrar"
        />
      </div>

      {factura && (
        <Modal.Body className="p-3 p-sm-4">
          <Row className="g-3 mb-3">
            <Col sm={6}>
              <div className="p-3 rounded-3 bg-light border">
                <h6 className="fw-bold text-navy mb-2 small text-uppercase">Datos del Comprobante</h6>
                <p className="mb-0 small text-secondary">
                  <strong>Factura:</strong> {numFactura}<br/>
                  <strong>Emisión:</strong> {formatearFecha(factura.fechaEmision || factura.created_at)}<br/>
                  <strong>Estado:</strong> <Badge bg={getBadgeEstado(factura.estado)} className="ms-1">{factura.estado}</Badge>
                </p>
              </div>
            </Col>
            <Col sm={6}>
              <div className="p-3 rounded-3 bg-light border">
                <h6 className="fw-bold text-navy mb-2 small text-uppercase">Datos del Cliente</h6>
                <p className="mb-0 small text-secondary">
                  <strong>Cliente:</strong> {factura.clienteNombre || factura.cliente_nombre || '-'}<br/>
                  <strong>Email:</strong> {factura.clienteEmail || factura.cliente_email || '-'}<br/>
                  <strong>Documento:</strong> {factura.clienteDocumento || factura.cliente_documento || 'N/A'}
                </p>
              </div>
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col sm={6}>
              <div className="p-2 px-3 rounded-3 bg-light border small text-muted">
                <strong className="text-secondary d-block">Teléfono:</strong>
                {factura.telefonoEnvio || factura.telefono || '-'}
              </div>
            </Col>
            <Col sm={6}>
              <div className="p-2 px-3 rounded-3 bg-light border small text-muted">
                <strong className="text-secondary d-block">Método de Pago:</strong>
                {factura.metodoPago || factura.metodo_pago || '-'}
              </div>
            </Col>
          </Row>

          <div className="mb-3">
            <span className="small fw-semibold text-secondary d-block mb-1">Dirección de Envío / Entrega:</span>
            <div className="p-2 px-3 rounded-3 bg-light border small text-muted">
              {factura.direccionEnvio || factura.direccion || 'No especificada'}
            </div>
          </div>

          <div className="p-3 rounded-3 border bg-light mb-3">
            <Row className="mb-1">
              <Col xs={6} className="small text-secondary">Subtotal:</Col>
              <Col xs={6} className="text-end small fw-semibold">{formatearPrecio(factura.subtotal)}</Col>
            </Row>
            <Row className="mb-2">
              <Col xs={6} className="small text-secondary">Impuesto (IVA):</Col>
              <Col xs={6} className="text-end small fw-semibold">{formatearPrecio(factura.impuesto)}</Col>
            </Row>
            <hr className="my-2" />
            <Row className="align-items-center">
              <Col xs={6} className="fw-bold text-navy fs-6">Total Facturado:</Col>
              <Col xs={6} className="text-end fw-bold fs-5 text-primary">{formatearPrecio(factura.total)}</Col>
            </Row>
          </div>

          {factura.notas && (
            <div className="mb-2">
              <span className="small fw-semibold text-secondary d-block mb-1">Notas:</span>
              <div className="p-2 px-3 rounded-3 bg-info-subtle border border-info-subtle small text-navy">
                {factura.notas}
              </div>
            </div>
          )}
        </Modal.Body>
      )}

      <div className="product-minimal-footer">
        <button 
          type="button" 
          className="btn-minimal-cancel"
          onClick={onClose}
        >
          Cerrar
        </button>
        {factura && (
          <>
            <Button 
              variant="success" 
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
              onClick={() => onDescargarPDF(numFactura)}
            >
              <i className="bi bi-download"></i> Descargar PDF
            </Button>
            {factura.estado !== 'anulada' && (
              <Button 
                variant="danger" 
                size="sm"
                className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
                onClick={() => onAnularFactura(factura)}
              >
                <i className="bi bi-x-circle"></i> Anular Factura
              </Button>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default AdminFacturasPage;
