/**
 * ============================================
 * ADMIN FACTURAS PAGE
 * ============================================
 * Gestión de facturas (consultar, descargar, anular)
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { exportarFacturasAPDF, exportarFacturasAExcel } from '../../utils/exportUtils';
import SvgIcon from '../../components/SvgIcon';

const AdminFacturasPage = () => {
  useAuth();
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos'
  });
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;
  
  // Facturas filtradas y paginadas
  const facturasFiltradas = useMemo(() => {
    return facturas.filter(factura => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const coincide = 
          factura.numero_factura?.toLowerCase().includes(busqueda) ||
          factura.numeroFactura?.toLowerCase().includes(busqueda) ||
          factura.cliente_nombre?.toLowerCase().includes(busqueda) ||
          factura.clienteNombre?.toLowerCase().includes(busqueda) ||
          factura.cliente_email?.toLowerCase().includes(busqueda) ||
          factura.clienteEmail?.toLowerCase().includes(busqueda);
        if (!coincide) return false;
      }
      
      if (filtros.estado !== 'todos') {
        if (filtros.estado !== factura.estado) return false;
      }
      
      return true;
    });
  }, [facturas, filtros.busqueda, filtros.estado]);
  
  const totalPaginas = Math.ceil(facturasFiltradas.length / registrosPorPagina);
  const facturasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return facturasFiltradas.slice(inicio, inicio + registrosPorPagina);
  }, [facturasFiltradas, paginaActual, registrosPorPagina]);
  
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros.busqueda, filtros.estado]);

  const loadFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getFacturas({ limite: 1000 });
      const facturasData = response.data?.facturas || response.data || [];
      setFacturas(Array.isArray(facturasData) ? facturasData : []);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar las facturas' });
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacturas();
  }, [loadFacturas]);

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
      setMensaje({ tipo: 'success', texto: 'PDF descargado correctamente' });
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al descargar el PDF' });
    }
  };

  const handleAnularFactura = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas anular esta factura?')) return;
    try {
      await adminService.anularFactura(id);
      setMensaje({ tipo: 'success', texto: 'Factura anulada exitosamente' });
      setShowDetalleModal(false);
      loadFacturas();
    } catch (error) {
      console.error('Error al anular factura:', error);
      setMensaje({ tipo: 'danger', texto: error.message || 'Error al anular la factura' });
    }
  };

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

  const getBadgeEstado = (estado) => {
    const estados = {
      'emitida': 'warning',
      'enviada': 'info',
      'vista': 'warning',
      'anulada': 'danger',
      'pagada': 'success'
    };
    return estados[estado] || 'secondary';
  };

  if (loading) {
    return <LoadingSpinner message="Cargando facturas..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy"><span className="bi bi-file-earmark-pdf me-2 text-gold" aria-hidden="true"></span> Gestión de Facturas</h1>
          <p className="text-muted mb-0">
            Total: {facturasFiltradas.length} de {facturas.length} factura{facturas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              onClick={() => {
                setTipoExportacion('pdf');
                exportarFacturasAPDF(facturasFiltradas);
              }}
            >
              <span className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} aria-hidden="true"></span> Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="primary" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                exportarFacturasAPDF(facturasFiltradas);
              }}>
                <span className="bi bi-file-earmark-pdf me-2" aria-hidden="true"></span> Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={async () => {
                setTipoExportacion('excel');
                await exportarFacturasAExcel(facturasFiltradas);
              }}>
                <span className="bi bi-file-earmark-excel me-2" aria-hidden="true"></span> Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <span className="bi bi-arrow-left me-1" aria-hidden="true"></span> Volver
          </Button>
        </div>
      </div>

      {/* Notificación flotante inferior izquierda */}
      {mensaje.texto && (
        <div className="toast-floating-container-bottom-left">
          <Alert 
            variant={mensaje.tipo} 
            dismissible 
            onClose={() => setMensaje({ tipo: '', texto: '' })}
            className={`toast-floating-alert alert-${mensaje.tipo} mb-0`}
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
          </Alert>
        </div>
      )}

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4 admin-card-table">
        <Card.Body className="p-3 p-md-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-navy">
            <span className="bi bi-funnel text-gold" aria-hidden="true"></span> Filtros de Búsqueda
          </h6>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Buscar Factura</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <span className="bi bi-search" aria-hidden="true"></span>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por número, cliente o email..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
                <Form.Select
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
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Facturas */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Número Factura</th>
                <th>Cliente</th>
                <th style={{ width: '120px' }}>Monto</th>
                <th className="d-none d-sm-table-cell" style={{ width: '100px' }}>Estado</th>
                <th className="d-none d-md-table-cell" style={{ width: '130px' }}>Fecha</th>
                <th className="text-center" style={{ minWidth: '110px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No hay facturas registradas
                  </td>
                </tr>
              ) : (
                facturasPaginadas.map((factura) => (
                  <tr key={factura.id}>
                    <td className="align-middle fw-bold">{factura.numeroFactura || factura.numero_factura}</td>
                    <td className="align-middle">
                      <div className="fw-bold">{factura.clienteNombre || factura.cliente_nombre || '-'}</div>
                      <small className="text-muted">{factura.clienteEmail || factura.cliente_email || ''}</small>
                    </td>
                    <td className="align-middle fw-bold">{formatearPrecio(factura.total)}</td>
                    <td className="align-middle d-none d-sm-table-cell">
                      <Badge bg={getBadgeEstado(factura.estado)}>
                        {factura.estado}
                      </Badge>
                    </td>
                    <td className="align-middle d-none d-md-table-cell">{formatearFecha(factura.fechaEmision || factura.created_at)}</td>
                    <td className="align-middle text-center">
                      <div className="action-btn-group">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="btn-action-table" 
                          onClick={() => handleVerDetalle(factura)}
                          title="Ver detalle de factura"
                        >
                          <SvgIcon name="search" />
                          <span className="btn-text">Detalle</span>
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          className="btn-action-table" 
                          onClick={() => handleDescargarPDF(factura.numeroFactura || factura.numero_factura)}
                          title="Descargar PDF"
                        >
                          <SvgIcon name="download" />
                          <span className="btn-text">PDF</span>
                        </Button>
                        {factura.estado !== 'anulada' && (
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={() => handleAnularFactura(factura.id)}
                            title="Anular factura"
                          >
                            <SvgIcon name="x-circle" />
                            <span className="btn-text">Anular</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Página {paginaActual} de {totalPaginas} - Mostrando {facturasPaginadas.length} de {facturasFiltradas.length} registros
          </small>
          <ButtonGroup size="sm">
            <Button variant="outline-primary" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1}>
              ««
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(p => p - 1)} disabled={paginaActual === 1}>
              Anterior
            </Button>
            <Button variant="primary" disabled>
              {paginaActual} / {totalPaginas}
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual === totalPaginas}>
              Siguiente
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas}>
              »»
            </Button>
          </ButtonGroup>
        </div>
      )}

      {/* Modal Detalle Factura */}
      <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-navy">
            Detalle de Factura
          </Modal.Title>
        </Modal.Header>
        {facturaSeleccionada && (
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Número Factura:</strong> {facturaSeleccionada.numeroFactura || facturaSeleccionada.numero_factura}
              </Col>
              <Col md={6}>
                <strong>Estado:</strong>{' '}
                <Badge bg={getBadgeEstado(facturaSeleccionada.estado)}>
                  {facturaSeleccionada.estado}
                </Badge>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <strong>Fecha Emisión:</strong> {formatearFecha(facturaSeleccionada.fechaEmision || facturaSeleccionada.created_at)}
              </Col>
              <Col md={6}>
                <strong>Cliente:</strong> {facturaSeleccionada.clienteNombre || facturaSeleccionada.cliente_nombre || '-'}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <strong>Email:</strong> {facturaSeleccionada.clienteEmail || facturaSeleccionada.cliente_email || '-'}
              </Col>
              <Col md={6}>
                <strong>Documento:</strong> {facturaSeleccionada.clienteDocumento || facturaSeleccionada.cliente_documento || 'N/A'}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <strong>Teléfono:</strong> {facturaSeleccionada.telefonoEnvio || facturaSeleccionada.telefono || '-'}
              </Col>
              <Col md={6}>
                <strong>Método Pago:</strong> {facturaSeleccionada.metodoPago || facturaSeleccionada.metodo_pago || '-'}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <strong>Dirección Envío:</strong> 
                <div className="alert alert-light mt-2 mb-0">
                  {facturaSeleccionada.direccionEnvio || facturaSeleccionada.direccion || 'No especificada'}
                </div>
              </Col>
            </Row>

            <hr />

            <Row className="mb-3">
              <Col md={6}>
                <strong>Subtotal:</strong> {formatearPrecio(facturaSeleccionada.subtotal)}
              </Col>
              <Col md={6}>
                <strong>Impuesto (IVA):</strong> {formatearPrecio(facturaSeleccionada.impuesto)}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <strong style={{ fontSize: '1.1rem' }}>Total a Pagar:</strong> 
                <div style={{ fontSize: '1.3rem', color: 'var(--bs-gold-dark, #c7984e)', fontWeight: 'bold' }}>
                  {formatearPrecio(facturaSeleccionada.total)}
                </div>
              </Col>
            </Row>

            {facturaSeleccionada.notas && (
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Notas:</strong>
                  <div className="alert alert-info mt-2 mb-0">
                    {facturaSeleccionada.notas}
                  </div>
                </Col>
              </Row>
            )}
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDetalleModal(false)}>
            Cerrar
          </Button>
          {facturaSeleccionada && (
            <>
              <Button 
                variant="success" 
                onClick={() => handleDescargarPDF(facturaSeleccionada.numeroFactura || facturaSeleccionada.numero_factura)}
              >
                <span className="bi bi-download me-1" aria-hidden="true"></span> Descargar PDF
              </Button>
              {facturaSeleccionada.estado !== 'anulada' && (
                <Button 
                  variant="danger" 
                  onClick={() => handleAnularFactura(facturaSeleccionada.id)}
                >
                  <span className="bi bi-x-circle me-1" aria-hidden="true"></span> Anular
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminFacturasPage;
