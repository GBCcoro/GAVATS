/**
 * ============================================
 * ADMIN PEDIDOS PAGE
 * ============================================
 * Gestión y seguimiento de pedidos de clientes
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import pedidoService from '../services/pedidoService';
import { exportarPedidosAPDF, exportarPedidosAExcel } from '../utils/exportUtils';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminPedidosPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [seleccionados, setSeleccionados] = useState(new Set());
  
  // Modal de confirmación en pantalla
  const [modalConfirmacion, setModalConfirmacion] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    tipo: 'warning',
    icono: 'exclamation-circle-fill',
    textoConfirmar: 'Confirmar',
    textoCancelar: 'Cancelar',
    onConfirm: null,
    onCancel: null
  });
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    fechaInicio: '',
    fechaFin: ''
  });
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPedidos, setTotalPedidos] = useState(0);
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
    estado: filtros.estado,
    fechaInicio: filtros.fechaInicio,
    fechaFin: filtros.fechaFin
  });

  useEffect(() => {
    const prev = filtrosAnteriores.current;
    if (
      prev.busquedaDebounced !== busquedaDebounced ||
      prev.estado !== filtros.estado ||
      prev.fechaInicio !== filtros.fechaInicio ||
      prev.fechaFin !== filtros.fechaFin
    ) {
      filtrosAnteriores.current = {
        busquedaDebounced,
        estado: filtros.estado,
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      };
      setPaginaActual(1);
    }
  }, [busquedaDebounced, filtros.estado, filtros.fechaInicio, filtros.fechaFin]);

  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pagina: paginaActual,
        limite: registrosPorPagina
      };
      if (busquedaDebounced.trim()) params.buscar = busquedaDebounced.trim();
      if (filtros.estado && filtros.estado !== 'todos') params.estado = filtros.estado;
      if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

      const res = await pedidoService.obtenerTodosPedidosPaginados(params);
      const peds = res.data?.pedidos || res.pedidos || res.data || [];
      const paginacion = res.data?.paginacion || res.paginacion || {};

      setPedidos(Array.isArray(peds) ? peds : []);
      const total = paginacion.total !== undefined ? paginacion.total : peds.length;
      const numPags = paginacion.totalPaginas || Math.max(1, Math.ceil(total / registrosPorPagina));
      setTotalPedidos(total);
      setTotalPaginas(numPags);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los pedidos' });
      setPedidos([]);
      setTotalPedidos(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  }, [paginaActual, busquedaDebounced, filtros.estado, filtros.fechaInicio, filtros.fechaFin]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos, reloadKey]);

  const recargarPedidos = useCallback(() => {
    setReloadKey(prev => prev + 1);
  }, []);

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

  // Cambio de estado con confirmación modal
  const solicitarCambioEstado = (pedidoId, nuevoEstado) => {
    const titulos = {
      pagado: '¿Marcar pedido como pagado?',
      enviado: '¿Marcar pedido como enviado?',
      entregado: '¿Marcar pedido como entregado?',
      cancelado: '¿Cancelar pedido?'
    };
    const iconos = {
      pagado: 'cash-stack',
      enviado: 'truck',
      entregado: 'check-circle-fill',
      cancelado: 'x-circle-fill'
    };
    const tipos = {
      pagado: 'info',
      enviado: 'primary',
      entregado: 'success',
      cancelado: 'danger'
    };

    setModalConfirmacion({
      show: true,
      titulo: titulos[nuevoEstado] || `¿Cambiar estado a "${nuevoEstado}"?`,
      mensaje: `¿Deseas cambiar el estado del Pedido #${pedidoId} a "${nuevoEstado.toUpperCase()}"?`,
      tipo: tipos[nuevoEstado] || 'primary',
      icono: iconos[nuevoEstado] || 'arrow-repeat',
      textoConfirmar: nuevoEstado === 'cancelado' ? 'Cancelar Pedido' : 'Actualizar Estado',
      textoCancelar: 'Cerrar',
      onConfirm: async () => {
        try {
          // Actualización inmediata local
          setPedidos(prev => 
            prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p)
          );
          if (pedidoSeleccionado?.id === pedidoId) {
            setPedidoSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : prev);
          }

          const response = await pedidoService.actualizarEstadoPedido(pedidoId, nuevoEstado);
          setMensaje({ tipo: 'success', texto: `Pedido #${pedidoId} actualizado a "${nuevoEstado}" exitosamente` });
          
          if (showDetalleModal && pedidoSeleccionado?.id === pedidoId) {
            const pedidoActualizado = response?.data?.pedido || response?.pedido || response?.data || null;
            if (pedidoActualizado) {
              setPedidoSeleccionado(pedidoActualizado);
            }
          }
          await cargarPedidos();
        } catch (error) {
          console.error('Error al cambiar estado del pedido:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al cambiar estado del pedido' });
          await cargarPedidos();
        }
      }
    });
  };

  // Cambio de estado masivo con modal
  const solicitarCambioEstadoMasivo = (nuevoEstado) => {
    const count = seleccionados.size;
    if (count === 0) return;

    setModalConfirmacion({
      show: true,
      titulo: `¿Marcar ${count} pedido${count !== 1 ? 's' : ''} como "${nuevoEstado}"?`,
      mensaje: `Se actualizará el estado de los ${count} pedidos seleccionados a "${nuevoEstado.toUpperCase()}".`,
      tipo: nuevoEstado === 'cancelado' ? 'danger' : 'primary',
      icono: nuevoEstado === 'cancelado' ? 'x-circle-fill' : 'arrow-repeat',
      textoConfirmar: 'Confirmar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          setSeleccionados(new Set());
          
          setPedidos(prev => 
            prev.map(p => ids.includes(p.id) ? { ...p, estado: nuevoEstado } : p)
          );

          const resultados = await Promise.allSettled(ids.map(id => pedidoService.actualizarEstadoPedido(id, nuevoEstado)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} de ${ids.length} pedidos actualizados a "${nuevoEstado}" exitosamente` 
          });
          
          await cargarPedidos();
        } catch (error) {
          console.error('Error al cambiar estado masivo:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar el cambio de estado masivo' });
          await cargarPedidos();
        }
      }
    });
  };

  const handleVerDetalle = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowDetalleModal(true);
  };

  const pedidosFiltrados = pedidos;
  const pedidosPaginados = pedidos;

  const [exportando, setExportando] = useState(false);

  const obtenerPedidosParaExportar = async () => {
    const params = {
      pagina: 1,
      limite: 1000
    };
    if (busquedaDebounced.trim()) params.buscar = busquedaDebounced.trim();
    if (filtros.estado && filtros.estado !== 'todos') params.estado = filtros.estado;
    if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
    if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

    try {
      const res = await pedidoService.obtenerTodosPedidosPaginados(params);
      const items = res.data?.pedidos || res.pedidos || res.data || [];
      return Array.isArray(items) ? items : pedidos;
    } catch (err) {
      console.error('Error al obtener pedidos para exportar:', err);
      return pedidos;
    }
  };

  const handleExportar = async (formato) => {
    setExportando(true);
    try {
      const itemsParaExportar = await obtenerPedidosParaExportar();
      if (formato === 'pdf') {
        exportarPedidosAPDF(itemsParaExportar);
      } else {
        await exportarPedidosAExcel(itemsParaExportar);
      }
    } catch (error) {
      console.error('Error al exportar pedidos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al exportar pedidos' });
    } finally {
      setExportando(false);
    }
  };

  // Selección de filas
  const todosPaginaSeleccionados = useMemo(() => {
    return pedidosPaginados.length > 0 && pedidosPaginados.every(p => seleccionados.has(p.id));
  }, [pedidosPaginados, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        pedidosPaginados.forEach(p => nuevo.delete(p.id));
      } else {
        pedidosPaginados.forEach(p => nuevo.add(p.id));
      }
      return nuevo;
    });
  };

  const toggleSeleccionarPedido = (id) => {
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

  if (loading && pedidos.length === 0 && !busquedaDebounced && filtros.estado === 'todos' && !filtros.fechaInicio && !filtros.fechaFin) {
    return <LoadingSpinner message="Cargando pedidos..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar Responsivo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <span className="bi bi-cart-check-fill me-2 text-gold" aria-hidden="true"></span> Gestión de Pedidos
          </h1>
          <p className="text-muted mb-0">
            Total: <strong>{totalPedidos}</strong> pedido{totalPedidos !== 1 ? 's' : ''}
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
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Buscar por Cliente o ID</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <span className="bi bi-search" aria-hidden="true"></span>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Nombre, email o #ID..."
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
                <span className="bi bi-arrow-clockwise" aria-hidden="true"></span>
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
            <span>{todosPaginaSeleccionados ? 'Deseleccionar página' : `Seleccionar todo (${pedidosPaginados.length})`}</span>
          </Button>
          {seleccionados.size > 0 && (
            <Badge bg="danger" className="p-2 d-flex align-items-center gap-1 fs-7">
              <i className="bi bi-check-circle-fill"></i> {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
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
                  const pedSel = pedidos.find(p => p.id === idSel);
                  if (pedSel) handleVerDetalle(pedSel);
                }}
                title="Ver detalle del pedido seleccionado"
              >
                <i className="bi bi-eye-fill"></i>
                <span>Ver Detalle</span>
              </Button>
            )}
            <Button
              variant="outline-info"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={() => solicitarCambioEstadoMasivo('pagado')}
              title="Marcar como pagados"
            >
              <i className="bi bi-cash-stack"></i>
              <span>Pagar ({seleccionados.size})</span>
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={() => solicitarCambioEstadoMasivo('enviado')}
              title="Marcar como enviados"
            >
              <i className="bi bi-truck"></i>
              <span>Enviar ({seleccionados.size})</span>
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={() => solicitarCambioEstadoMasivo('entregado')}
              title="Marcar como entregados"
            >
              <i className="bi bi-check-circle-fill"></i>
              <span>Entregar ({seleccionados.size})</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={() => solicitarCambioEstadoMasivo('cancelado')}
              title="Cancelar pedidos seleccionados"
            >
              <i className="bi bi-x-circle-fill"></i>
              <span>Cancelar ({seleccionados.size})</span>
            </Button>
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

      {/* Tabla de Pedidos Responsiva */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Cliente</th>
                <th className="d-none d-sm-table-cell" style={{ width: '130px' }}>Fecha</th>
                <th style={{ width: '120px' }}>Total</th>
                <th style={{ width: '110px' }}>Estado</th>
                <th className="text-center" style={{ width: '150px', minWidth: '110px' }}>Acciones</th>
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
                pedidosPaginados.map((pedido) => {
                  const estaSeleccionado = seleccionados.has(pedido.id);
                  return (
                    <tr 
                      key={pedido.id}
                      onClick={() => toggleSeleccionarPedido(pedido.id)}
                      className={`fila-admin ${estaSeleccionado ? 'fila-admin-seleccionada' : ''}`}
                      title="Haz clic para seleccionar/deseleccionar este pedido"
                    >
                      <td className="align-middle fw-bold">
                        <div className="d-flex align-items-center gap-2">
                          <i 
                            className={`bi bi-${estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted'} fs-6 d-inline-block`}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>#{pedido.id}</span>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="fw-bold">{pedido.usuario?.nombre || 'Usuario desconocido'}</div>
                        <small className="text-muted d-block">{pedido.usuario?.email}</small>
                      </td>
                      <td className="align-middle d-none d-sm-table-cell">{formatearFecha(pedido.createdAt)}</td>
                      <td className="align-middle fw-bold">{formatearPrecio(pedido.total)}</td>
                      <td className="align-middle">
                        <Badge bg={getBadgeEstado(pedido.estado)}>
                          {pedido.estado}
                        </Badge>
                      </td>
                      <td className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="action-btn-group">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="btn-action-table" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerDetalle(pedido);
                            }} 
                            title="Ver detalle del pedido"
                          >
                            <i className="bi bi-eye" />
                            <span className="btn-text">Detalle</span>
                          </Button>
                          {pedido.estado === 'pendiente' && (
                            <>
                              <Button 
                                variant="outline-info" 
                                size="sm" 
                                className="btn-action-table" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  solicitarCambioEstado(pedido.id, 'pagado');
                                }} 
                                title="Marcar como pagado"
                              >
                                <i className="bi bi-cash-stack" />
                                <span className="btn-text">Pagar</span>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="btn-action-table" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  solicitarCambioEstado(pedido.id, 'cancelado');
                                }} 
                                title="Cancelar pedido"
                              >
                                <i className="bi bi-x-circle" />
                                <span className="btn-text">Cancelar</span>
                              </Button>
                            </>
                          )}
                          {pedido.estado === 'pagado' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="btn-action-table" 
                              onClick={(e) => {
                                e.stopPropagation();
                                solicitarCambioEstado(pedido.id, 'enviado');
                              }} 
                              title="Marcar como enviado"
                            >
                              <i className="bi bi-truck" />
                              <span className="btn-text">Enviar</span>
                            </Button>
                          )}
                          {pedido.estado === 'enviado' && (
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              className="btn-action-table" 
                              onClick={(e) => {
                                e.stopPropagation();
                                solicitarCambioEstado(pedido.id, 'entregado');
                              }} 
                              title="Marcar como entregado"
                            >
                              <i className="bi bi-check-circle" />
                              <span className="btn-text">Entregar</span>
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
            Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> — Mostrando <strong>{pedidos.length}</strong> de <strong>{totalPedidos}</strong> pedidos
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

      {/* Modal Detalle Pedido Minimalista */}
      <Modal 
        show={showDetalleModal} 
        onHide={() => { setShowDetalleModal(false); setPedidoSeleccionado(null); }} 
        size="lg" 
        centered
        dialogClassName="modal-producto-form"
        style={{ maxWidth: '780px' }}
      >
        <div className="product-minimal-header">
          <div>
            <h6 className="fw-bold mb-0 text-navy fs-6">
              Detalle del Pedido #{pedidoSeleccionado?.id}
            </h6>
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
              {pedidoSeleccionado ? formatearFecha(pedidoSeleccionado.createdAt) : ''}
            </small>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => { setShowDetalleModal(false); setPedidoSeleccionado(null); }}
            aria-label="Cerrar"
          />
        </div>

        {pedidoSeleccionado && (
          <Modal.Body className="p-3 p-sm-4">
            <Row className="g-3 mb-3">
              <Col sm={6}>
                <div className="p-3 rounded-3 bg-light border">
                  <h6 className="fw-bold text-navy mb-2 small text-uppercase">Información del Cliente</h6>
                  <p className="mb-0 small text-secondary">
                    <strong>Nombre:</strong> {pedidoSeleccionado.usuario?.nombre || 'N/A'}<br/>
                    <strong>Email:</strong> {pedidoSeleccionado.usuario?.email || 'N/A'}<br/>
                    <strong>Teléfono:</strong> {pedidoSeleccionado.telefono || '-'}
                  </p>
                </div>
              </Col>
              <Col sm={6}>
                <div className="p-3 rounded-3 bg-light border">
                  <h6 className="fw-bold text-navy mb-2 small text-uppercase">Resumen del Pedido</h6>
                  <p className="mb-0 small text-secondary">
                    <strong>Fecha:</strong> {formatearFecha(pedidoSeleccionado.createdAt)}<br/>
                    <strong>Estado:</strong> <Badge bg={getBadgeEstado(pedidoSeleccionado.estado)} className="ms-1">{pedidoSeleccionado.estado}</Badge><br/>
                    <strong>Total:</strong> <span className="fw-bold text-navy">{formatearPrecio(pedidoSeleccionado.total)}</span>
                  </p>
                </div>
              </Col>
            </Row>

            <div className="mb-3">
              <span className="small fw-semibold text-secondary d-block mb-1">Dirección de Envío:</span>
              <div className="p-2 px-3 rounded-3 bg-light border small text-muted">
                {pedidoSeleccionado.direccionEnvio || 'No especificada'}
              </div>
            </div>

            {pedidoSeleccionado.notas && (
              <div className="mb-3">
                <span className="small fw-semibold text-secondary d-block mb-1">Notas del Cliente:</span>
                <div className="p-2 px-3 rounded-3 bg-info-subtle border border-info-subtle small text-navy">
                  {pedidoSeleccionado.notas}
                </div>
              </div>
            )}

            <h6 className="fw-bold text-navy mb-2 fs-6">Productos Comprados</h6>
            <div className="table-responsive rounded-3 border mb-3">
              <Table size="sm" className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="py-2">Producto</th>
                    <th className="py-2 text-center">Cantidad</th>
                    <th className="py-2">Precio Unit.</th>
                    <th className="py-2 text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(pedidoSeleccionado.detalles || pedidoSeleccionado.DetallePedidos || []).map((detalle) => {
                    const detalleKey = detalle.id || detalle.producto?.id || detalle.Producto?.id || detalle.productoId || detalle.ProductoId || `${detalle.producto?.nombre || detalle.Producto?.nombre || 'producto'}-${detalle.cantidad}-${detalle.subtotal}`;

                    return (
                      <tr key={detalleKey}>
                        <td className="py-2 fw-medium">{detalle.producto?.nombre || detalle.Producto?.nombre || 'Producto no disponible'}</td>
                        <td className="py-2 text-center">{detalle.cantidad}</td>
                        <td className="py-2">{formatearPrecio(detalle.precioUnitario)}</td>
                        <td className="py-2 text-end fw-bold">{formatearPrecio(detalle.subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <th colSpan="3" className="text-end py-2">TOTAL PEDIDO:</th>
                    <th className="text-end py-2 fs-6 text-primary">{formatearPrecio(pedidoSeleccionado.total)}</th>
                  </tr>
                </tfoot>
              </Table>
            </div>

            <div>
              <span className="small fw-semibold text-secondary d-block mb-2">Cambiar Estado Directo:</span>
              <div className="d-flex flex-wrap gap-2">
                {['pendiente','pagado','enviado','entregado','cancelado'].map(est => (
                  <Button
                    key={est}
                    variant={pedidoSeleccionado.estado === est ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => solicitarCambioEstado(pedidoSeleccionado.id, est)}
                    disabled={pedidoSeleccionado.estado === est}
                    className="text-capitalize"
                  >
                    {est}
                  </Button>
                ))}
              </div>
            </div>
          </Modal.Body>
        )}

        <div className="product-minimal-footer">
          <button 
            type="button" 
            className="btn-minimal-cancel"
            onClick={() => { setShowDetalleModal(false); setPedidoSeleccionado(null); }}
          >
            Cerrar Detalle
          </button>
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
}

export default AdminPedidosPage;