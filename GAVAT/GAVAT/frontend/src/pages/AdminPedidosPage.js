/**
 * ============================================
 * ADMIN PEDIDOS PAGE
 * ============================================
 * Gestión y seguimiento de pedidos de clientes
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import pedidoService from '../services/pedidoService';
import { exportarPedidosAPDF, exportarPedidosAExcel } from '../utils/exportUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import SvgIcon from '../components/SvgIcon';

function AdminPedidosPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    fechaInicio: '',
    fechaFin: ''
  });
  
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;

  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pedidoService.obtenerTodosPedidos('?limite=1000');
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los pedidos' });
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const response = await pedidoService.actualizarEstadoPedido(pedidoId, nuevoEstado);
      setMensaje({ tipo: 'success', texto: `Estado del pedido actualizado a "${nuevoEstado}"` });
      await cargarPedidos();
      if (showDetalleModal && pedidoSeleccionado?.id === pedidoId) {
        const pedidoActualizado = response?.data?.pedido || response?.pedido || response?.data || null;
        if (pedidoActualizado) {
          setPedidoSeleccionado(pedidoActualizado);
        }
      }
    } catch (error) {
      console.error('Error al cambiar estado del pedido:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar estado del pedido' });
    }
  };

  const handleVerDetalle = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowDetalleModal(true);
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
    const map = {
      pendiente: 'warning',
      pagado: 'info',
      enviado: 'primary',
      entregado: 'success',
      cancelado: 'danger'
    };
    return map[estado] || 'secondary';
  };

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const nombreCliente = pedido.usuario?.nombre?.toLowerCase() || '';
        const emailCliente = pedido.usuario?.email?.toLowerCase() || '';
        if (!nombreCliente.includes(busqueda) && !emailCliente.includes(busqueda)) return false;
      }
      if (filtros.estado !== 'todos' && pedido.estado !== filtros.estado) return false;
      if (filtros.fechaInicio) {
        const fechaPedido = new Date(pedido.createdAt);
        const fechaInicio = new Date(filtros.fechaInicio);
        fechaInicio.setHours(0,0,0,0);
        if (fechaPedido < fechaInicio) return false;
      }
      if (filtros.fechaFin) {
        const fechaPedido = new Date(pedido.createdAt);
        const fechaFin = new Date(filtros.fechaFin);
        fechaFin.setHours(23,59,59,999);
        if (fechaPedido > fechaFin) return false;
      }
      return true;
    });
  }, [pedidos, filtros]);

  const totalPaginas = Math.ceil(pedidosFiltrados.length / registrosPorPagina);
  const pedidosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return pedidosFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [pedidosFiltrados, paginaActual]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtros.busqueda, filtros.estado, filtros.fechaInicio, filtros.fechaFin]);

  if (loading) {
    return <LoadingSpinner message="Cargando pedidos..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <i className="bi bi-cart-check-fill me-2 text-gold" />
            Gestión de Pedidos
          </h1>
          <p className="text-muted mb-0">
            Total: {pedidosFiltrados.length} de {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              onClick={() => {
                setTipoExportacion('pdf');
                exportarPedidosAPDF(pedidosFiltrados);
              }}
            >
              <i className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} />
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="primary" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                exportarPedidosAPDF(pedidosFiltrados);
              }}>
                <i className="bi bi-file-earmark-pdf me-2" /> Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={async () => {
                setTipoExportacion('excel');
                await exportarPedidosAExcel(pedidosFiltrados);
              }}>
                <i className="bi bi-file-earmark-excel me-2" /> Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1" /> Volver
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
            <i className="bi bi-funnel text-gold" /> Filtros de Búsqueda
          </h6>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Buscar por Cliente</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <i className="bi bi-search" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por nombre o email..."
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
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Fecha Fin</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => setFiltros({ busqueda: '', estado: 'todos', fechaInicio: '', fechaFin: '' })}
                title="Limpiar filtros"
              >
                <i className="bi bi-arrow-clockwise" />
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Pedidos */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th className="d-none d-md-table-cell" style={{ width: '60px' }}>ID</th>
                <th>Cliente</th>
                <th className="d-none d-sm-table-cell" style={{ width: '130px' }}>Fecha</th>
                <th style={{ width: '120px' }}>Total</th>
                <th style={{ width: '110px' }}>Estado</th>
                <th className="text-center" style={{ minWidth: '110px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No hay pedidos registrados
                  </td>
                </tr>
              ) : (
                pedidosPaginados.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="align-middle d-none d-md-table-cell">#{pedido.id}</td>
                    <td className="align-middle">
                      <div className="fw-bold">{pedido.usuario?.nombre || 'Usuario desconocido'}</div>
                      <small className="text-muted">{pedido.usuario?.email}</small>
                    </td>
                    <td className="align-middle d-none d-sm-table-cell">{formatearFecha(pedido.createdAt)}</td>
                    <td className="align-middle fw-bold">{formatearPrecio(pedido.total)}</td>
                    <td className="align-middle">
                      <Badge bg={getBadgeEstado(pedido.estado)}>
                        {pedido.estado}
                      </Badge>
                    </td>
                    <td className="align-middle text-center">
                      <div className="action-btn-group">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="btn-action-table" 
                          onClick={() => handleVerDetalle(pedido)} 
                          title="Ver detalle del pedido"
                        >
                          <SvgIcon name="search" />
                          <span className="btn-text">Detalle</span>
                        </Button>
                        {pedido.estado === 'pendiente' && (
                          <>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="btn-action-table" 
                              onClick={() => handleCambiarEstado(pedido.id, 'pagado')} 
                              title="Marcar como pagado"
                            >
                              <SvgIcon name="cash" />
                              <span className="btn-text">Pagar</span>
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="btn-action-table" 
                              onClick={() => handleCambiarEstado(pedido.id, 'cancelado')} 
                              title="Cancelar pedido"
                            >
                              <SvgIcon name="x-circle" />
                              <span className="btn-text">Cancelar</span>
                            </Button>
                          </>
                        )}
                        {pedido.estado === 'pagado' && (
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={() => handleCambiarEstado(pedido.id, 'enviado')} 
                            title="Marcar como enviado"
                          >
                            <SvgIcon name="truck" />
                            <span className="btn-text">Enviar</span>
                          </Button>
                        )}
                        {pedido.estado === 'enviado' && (
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={() => handleCambiarEstado(pedido.id, 'entregado')} 
                            title="Marcar como entregado"
                          >
                            <SvgIcon name="check-circle" />
                            <span className="btn-text">Entregar</span>
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
            Página {paginaActual} de {totalPaginas} - Mostrando {pedidosPaginados.length} de {pedidosFiltrados.length} registros
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

      {/* Modal Detalle Pedido */}
      <Modal show={showDetalleModal} onHide={() => { setShowDetalleModal(false); setPedidoSeleccionado(null); }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-navy">
            Detalle del Pedido #{pedidoSeleccionado?.id}
          </Modal.Title>
        </Modal.Header>
        {pedidoSeleccionado && (
          <Modal.Body>
            <Row className="mb-4">
              <Col md={6}>
                <h6 className="fw-bold text-navy mb-2">Información del Cliente</h6>
                <p className="mb-0">
                  <strong>Nombre:</strong> {pedidoSeleccionado.usuario?.nombre}<br/>
                  <strong>Email:</strong> {pedidoSeleccionado.usuario?.email}<br/>
                  <strong>Teléfono:</strong> {pedidoSeleccionado.telefono || '-'}
                </p>
              </Col>
              <Col md={6}>
                <h6 className="fw-bold text-navy mb-2">Información del Pedido</h6>
                <p className="mb-0">
                  <strong>Fecha:</strong> {formatearFecha(pedidoSeleccionado.createdAt)}<br/>
                  <strong>Estado:</strong> <Badge bg={getBadgeEstado(pedidoSeleccionado.estado)}>{pedidoSeleccionado.estado}</Badge><br/>
                  <strong>Total:</strong> {formatearPrecio(pedidoSeleccionado.total)}
                </p>
              </Col>
            </Row>

            <div className="mb-3">
              <h6 className="fw-bold text-navy mb-1">Dirección de Envío</h6>
              <div className="alert alert-light mb-0">
                {pedidoSeleccionado.direccionEnvio || 'No especificada'}
              </div>
            </div>

            {pedidoSeleccionado.notas && (
              <div className="mb-3">
                <h6 className="fw-bold text-navy mb-1">Notas</h6>
                <div className="alert alert-info mb-0">
                  {pedidoSeleccionado.notas}
                </div>
              </div>
            )}

            <h6 className="fw-bold text-navy mb-2">Productos</h6>
            <div className="table-responsive mb-4">
              <Table size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(pedidoSeleccionado.detalles || pedidoSeleccionado.DetallePedidos || []).map((detalle) => {
                    const detalleKey = detalle.id || detalle.producto?.id || detalle.Producto?.id || detalle.productoId || detalle.ProductoId || `${detalle.producto?.nombre || detalle.Producto?.nombre || 'producto'}-${detalle.cantidad}-${detalle.subtotal}`;

                    return (
                      <tr key={detalleKey}>
                        <td>{detalle.producto?.nombre || detalle.Producto?.nombre || 'Producto no disponible'}</td>
                        <td>{detalle.cantidad}</td>
                        <td>{formatearPrecio(detalle.precioUnitario)}</td>
                        <td className="text-end"><strong>{formatearPrecio(detalle.subtotal)}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" className="text-end">TOTAL:</th>
                    <th className="text-end text-gold-dark">{formatearPrecio(pedidoSeleccionado.total)}</th>
                  </tr>
                </tfoot>
              </Table>
            </div>

            <div>
              <h6 className="fw-bold text-navy mb-2">Cambiar Estado del Pedido</h6>
              <div className="d-flex flex-wrap gap-2">
                {['pendiente','pagado','enviado','entregado','cancelado'].map(est => (
                  <Button
                    key={est}
                    variant={pedidoSeleccionado.estado === est ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => handleCambiarEstado(pedidoSeleccionado.id, est)}
                    disabled={pedidoSeleccionado.estado === est}
                  >
                    {est.charAt(0).toUpperCase() + est.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => { setShowDetalleModal(false); setPedidoSeleccionado(null); }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminPedidosPage;