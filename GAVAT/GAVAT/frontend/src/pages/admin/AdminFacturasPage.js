/**
 * ============================================
 * ADMIN FACTURAS PAGE
 * ============================================
 * Gestión de facturas (consultar, descargar, anular)
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { exportarFacturasAPDF, exportarFacturasAExcel } from '../../utils/exportUtils';

const AdminFacturasPage = () => {
  useAuth();
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [exportando, setExportando] = useState(false);
  const [seleccionados, setSeleccionados] = useState(new Set());
  
  // Modal de confirmación en pantalla
  const [modalConfirmacion, setModalConfirmacion] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    tipo: 'danger',
    icono: 'x-circle-fill',
    textoConfirmar: 'Anular',
    textoCancelar: 'Cancelar',
    onConfirm: null,
    onCancel: null
  });
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos'
  });
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

  const filtrosAnteriores = useRef({
    busquedaDebounced,
    estado: filtros.estado
  });

  useEffect(() => {
    const prev = filtrosAnteriores.current;
    if (
      prev.busquedaDebounced !== busquedaDebounced ||
      prev.estado !== filtros.estado
    ) {
      filtrosAnteriores.current = {
        busquedaDebounced,
        estado: filtros.estado
      };
      setPaginaActual(1);
    }
  }, [busquedaDebounced, filtros.estado]);

  const facturasFiltradas = facturas;
  const facturasPaginadas = facturas;

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
      const total = response.data?.total !== undefined ? response.data.total : (response.total !== undefined ? response.total : facturasData.length);
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

  const obtenerFacturasParaExportar = async () => {
    const params = {
      pagina: 1,
      limite: 1000
    };
    if (busquedaDebounced.trim()) params.buscar = busquedaDebounced.trim();
    if (filtros.estado && filtros.estado !== 'todos') params.estado = filtros.estado;

    try {
      const res = await adminService.getFacturas(params);
      const items = res.data?.facturas || res.data || [];
      return Array.isArray(items) ? items : facturas;
    } catch (err) {
      console.error('Error al obtener facturas para exportar:', err);
      return facturas;
    }
  };

  const handleExportar = async (formato) => {
    setExportando(true);
    try {
      const itemsParaExportar = await obtenerFacturasParaExportar();
      if (formato === 'pdf') {
        exportarFacturasAPDF(itemsParaExportar);
      } else {
        await exportarFacturasAExcel(itemsParaExportar);
      }
    } catch (error) {
      console.error('Error al exportar facturas:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al exportar facturas' });
    } finally {
      setExportando(false);
    }
  };

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

  // Anular factura con modal de confirmación
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
      onConfirm: async () => {
        try {
          // Actualización inmediata local
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
      }
    });
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

  // Selección de filas
  const todosPaginaSeleccionados = useMemo(() => {
    return facturasPaginadas.length > 0 && facturasPaginadas.every(f => seleccionados.has(f.id));
  }, [facturasPaginadas, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        facturasPaginadas.forEach(f => nuevo.delete(f.id));
      } else {
        facturasPaginadas.forEach(f => nuevo.add(f.id));
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

  if (loading && facturas.length === 0 && !busquedaDebounced && filtros.estado === 'todos') {
    return <LoadingSpinner message="Cargando facturas..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar Responsivo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <span className="bi bi-file-earmark-pdf me-2 text-gold" aria-hidden="true"></span> Gestión de Facturas
          </h1>
          <p className="text-muted mb-0">
            Total: <strong>{totalFacturas}</strong> factura{totalFacturas !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              disabled={exportando}
              onClick={() => handleExportar(tipoExportacion)}
            >
              <span className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} aria-hidden="true"></span>
              {exportando ? 'Exportando...' : `Exportar a ${tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}`}
            </Button>
            <Dropdown.Toggle split variant="secondary" className="btn-dark dropdown-toggle-split" disabled={exportando} />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                handleExportar('pdf');
              }}>
                <span className="bi bi-file-earmark-pdf me-2" aria-hidden="true"></span> Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('excel');
                handleExportar('excel');
              }}>
                <span className="bi bi-file-earmark-excel me-2" aria-hidden="true"></span> Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1"></i> Volver
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

      {/* Barra de Acciones de Selección Múltiple */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 px-1">
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={todosPaginaSeleccionados ? "secondary" : "outline-secondary"}
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={handleToggleSeleccionarTodos}
            title={todosPaginaSeleccionados ? "Deseleccionar todos en esta página" : "Seleccionar todos en esta página"}
          >
            <i className={`bi bi-${todosPaginaSeleccionados ? 'check-square-fill text-primary' : 'square'}`} />
            <span>{todosPaginaSeleccionados ? 'Deseleccionar página' : `Seleccionar todo (${facturasPaginadas.length})`}</span>
          </Button>
          {seleccionados.size > 0 && (
            <Badge bg="danger" className="p-2 d-flex align-items-center gap-1 fs-7">
              <i className="bi bi-check-circle-fill"></i> {seleccionados.size} seleccionada{seleccionados.size !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {seleccionados.size > 0 && (
          <div className="d-flex flex-wrap align-items-center gap-2">
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
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setSeleccionados(new Set())}
              title="Limpiar selección"
            >
              <i className="bi bi-x-lg me-1"></i> Deseleccionar
            </Button>
          </div>
        )}
      </div>

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
              {facturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No hay facturas registradas
                  </td>
                </tr>
              ) : (
                facturasPaginadas.map((factura) => {
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
      {totalPaginas > 1 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-4 p-3 bg-white rounded shadow-sm">
          <small className="text-muted">
            Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> — Mostrando <strong>{facturas.length}</strong> de <strong>{totalFacturas}</strong> facturas
          </small>
          <ButtonGroup size="sm">
            <Button variant="outline-primary" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1 || loading}>
              ««
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(p => p - 1)} disabled={paginaActual === 1 || loading}>
              Anterior
            </Button>
            <Button variant="primary" disabled>
              {paginaActual} / {totalPaginas}
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual === totalPaginas || loading}>
              Siguiente
            </Button>
            <Button variant="outline-primary" onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas || loading}>
              »»
            </Button>
          </ButtonGroup>
        </div>
      )}

      {/* Modal Detalle Factura Minimalista */}
      <Modal 
        show={showDetalleModal} 
        onHide={() => setShowDetalleModal(false)} 
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
              {facturaSeleccionada ? (facturaSeleccionada.numeroFactura || facturaSeleccionada.numero_factura) : ''}
            </small>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowDetalleModal(false)}
            aria-label="Cerrar"
          />
        </div>

        {facturaSeleccionada && (
          <Modal.Body className="p-3 p-sm-4">
            <Row className="g-3 mb-3">
              <Col sm={6}>
                <div className="p-3 rounded-3 bg-light border">
                  <h6 className="fw-bold text-navy mb-2 small text-uppercase">Datos del Comprobante</h6>
                  <p className="mb-0 small text-secondary">
                    <strong>Factura:</strong> {facturaSeleccionada.numeroFactura || facturaSeleccionada.numero_factura}<br/>
                    <strong>Emisión:</strong> {formatearFecha(facturaSeleccionada.fechaEmision || facturaSeleccionada.created_at)}<br/>
                    <strong>Estado:</strong> <Badge bg={getBadgeEstado(facturaSeleccionada.estado)} className="ms-1">{facturaSeleccionada.estado}</Badge>
                  </p>
                </div>
              </Col>
              <Col sm={6}>
                <div className="p-3 rounded-3 bg-light border">
                  <h6 className="fw-bold text-navy mb-2 small text-uppercase">Datos del Cliente</h6>
                  <p className="mb-0 small text-secondary">
                    <strong>Cliente:</strong> {facturaSeleccionada.clienteNombre || facturaSeleccionada.cliente_nombre || '-'}<br/>
                    <strong>Email:</strong> {facturaSeleccionada.clienteEmail || facturaSeleccionada.cliente_email || '-'}<br/>
                    <strong>Documento:</strong> {facturaSeleccionada.clienteDocumento || facturaSeleccionada.cliente_documento || 'N/A'}
                  </p>
                </div>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col sm={6}>
                <div className="p-2 px-3 rounded-3 bg-light border small text-muted">
                  <strong className="text-secondary d-block">Teléfono:</strong>
                  {facturaSeleccionada.telefonoEnvio || facturaSeleccionada.telefono || '-'}
                </div>
              </Col>
              <Col sm={6}>
                <div className="p-2 px-3 rounded-3 bg-light border small text-muted">
                  <strong className="text-secondary d-block">Método de Pago:</strong>
                  {facturaSeleccionada.metodoPago || facturaSeleccionada.metodo_pago || '-'}
                </div>
              </Col>
            </Row>

            <div className="mb-3">
              <span className="small fw-semibold text-secondary d-block mb-1">Dirección de Envío / Entrega:</span>
              <div className="p-2 px-3 rounded-3 bg-light border small text-muted">
                {facturaSeleccionada.direccionEnvio || facturaSeleccionada.direccion || 'No especificada'}
              </div>
            </div>

            <div className="p-3 rounded-3 border bg-light mb-3">
              <Row className="mb-1">
                <Col xs={6} className="small text-secondary">Subtotal:</Col>
                <Col xs={6} className="text-end small fw-semibold">{formatearPrecio(facturaSeleccionada.subtotal)}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={6} className="small text-secondary">Impuesto (IVA):</Col>
                <Col xs={6} className="text-end small fw-semibold">{formatearPrecio(facturaSeleccionada.impuesto)}</Col>
              </Row>
              <hr className="my-2" />
              <Row className="align-items-center">
                <Col xs={6} className="fw-bold text-navy fs-6">Total Facturado:</Col>
                <Col xs={6} className="text-end fw-bold fs-5 text-primary">{formatearPrecio(facturaSeleccionada.total)}</Col>
              </Row>
            </div>

            {facturaSeleccionada.notas && (
              <div className="mb-2">
                <span className="small fw-semibold text-secondary d-block mb-1">Notas:</span>
                <div className="p-2 px-3 rounded-3 bg-info-subtle border border-info-subtle small text-navy">
                  {facturaSeleccionada.notas}
                </div>
              </div>
            )}
          </Modal.Body>
        )}

        <div className="product-minimal-footer">
          <button 
            type="button" 
            className="btn-minimal-cancel"
            onClick={() => setShowDetalleModal(false)}
          >
            Cerrar
          </button>
          {facturaSeleccionada && (
            <>
              <Button 
                variant="success" 
                size="sm"
                className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
                onClick={() => handleDescargarPDF(facturaSeleccionada.numeroFactura || facturaSeleccionada.numero_factura)}
              >
                <i className="bi bi-download"></i> Descargar PDF
              </Button>
              {facturaSeleccionada.estado !== 'anulada' && (
                <Button 
                  variant="danger" 
                  size="sm"
                  className="d-inline-flex align-items-center gap-1 fw-semibold px-3 py-2 rounded-3"
                  onClick={() => solicitarAnularFactura(facturaSeleccionada)}
                >
                  <i className="bi bi-x-circle"></i> Anular Factura
                </Button>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Modal de Confirmación Compacto Estilo Dashboard */}
      <Modal 
        show={modalConfirmacion.show} 
        onHide={() => setModalConfirmacion(prev => ({ ...prev, show: false }))} 
        centered
        backdrop="static"
        dialogClassName="modal-confirmacion-compacto"
      >
        <Modal.Body className="text-center p-3 p-sm-4">
          <div 
            className={`confirm-icon-wrapper mb-3 mx-auto bg-${
              modalConfirmacion.tipo === 'danger' ? 'danger-subtle' :
              modalConfirmacion.tipo === 'warning' ? 'warning-subtle' :
              modalConfirmacion.tipo === 'primary' || modalConfirmacion.tipo === 'info' ? 'primary-subtle' :
              'success-subtle'
            } text-${modalConfirmacion.tipo || 'primary'}`}
          >
            <i className={`bi bi-${modalConfirmacion.icono || 'exclamation-circle-fill'} confirm-icon`} />
          </div>
          
          <h5 className="fw-bold text-navy mb-2 fs-5">
            {modalConfirmacion.titulo}
          </h5>
          
          <p className="text-muted small mb-3 mb-sm-4 px-1" style={{ maxWidth: '300px', margin: '0 auto' }}>
            {modalConfirmacion.mensaje}
          </p>

          <div className="d-flex gap-2 justify-content-center w-100 mt-2">
            <Button 
              variant="outline-secondary" 
              className="px-3 py-2 fw-semibold flex-fill"
              onClick={() => {
                setModalConfirmacion(prev => ({ ...prev, show: false }));
                if (modalConfirmacion.onCancel) modalConfirmacion.onCancel();
              }}
            >
              {modalConfirmacion.textoCancelar || 'Cancelar'}
            </Button>
            <Button 
              variant={modalConfirmacion.tipo || 'primary'} 
              className="px-3 py-2 fw-semibold flex-fill shadow-sm"
              onClick={async () => {
                const action = modalConfirmacion.onConfirm;
                setModalConfirmacion(prev => ({ ...prev, show: false }));
                if (action) await action();
              }}
            >
              {modalConfirmacion.textoConfirmar || 'Confirmar'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminFacturasPage;
