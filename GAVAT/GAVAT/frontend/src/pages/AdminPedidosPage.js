/**
 * ============================================
 * ADMIN PEDIDOS PAGE
 * ============================================
 * Gestión y seguimiento de pedidos de clientes
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Container, Card, Table, Button, Modal, Form, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import pedidoService from '../services/pedidoService';
import { exportarPedidosAPDF, exportarPedidosAExcel } from '../utils/exportUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import FloatingToast from '../components/FloatingToast';
import ModalConfirmacion from '../components/ModalConfirmacion';
import ToolbarSeleccionLote from '../components/ToolbarSeleccionLote';

const TITULOS_ESTADO = {
  pagado: '¿Marcar pedido como pagado?',
  enviado: '¿Marcar pedido como enviado?',
  entregado: '¿Marcar pedido como entregado?',
  cancelado: '¿Cancelar pedido?'
};

const ICONOS_ESTADO = {
  pagado: 'cash-stack',
  enviado: 'truck',
  entregado: 'check-circle-fill',
  cancelado: 'x-circle-fill'
};

const TIPOS_ESTADO = {
  pagado: 'info',
  enviado: 'primary',
  entregado: 'success',
  cancelado: 'danger'
};

const BADGES_ESTADO = {
  pendiente: 'warning',
  pagado: 'info',
  enviado: 'primary',
  entregado: 'success',
  cancelado: 'danger'
};

const ESTADOS_DISPONIBLES = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

const getBadgeEstado = (estado) => BADGES_ESTADO[estado] || 'secondary';

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

const getDetalleKey = (detalle) => {
  if (detalle.id) return detalle.id;
  if (detalle.producto?.id) return detalle.producto.id;
  if (detalle.Producto?.id) return detalle.Producto.id;
  if (detalle.productoId) return detalle.productoId;
  const nombre = detalle.producto?.nombre || detalle.Producto?.nombre || 'producto';
  return `${nombre}-${detalle.cantidad}-${detalle.subtotal}`;
};

const getDetalleNombre = (detalle) => detalle.producto?.nombre || detalle.Producto?.nombre || 'Producto no disponible';

const construirParametrosBusqueda = ({ pagina, limite, busqueda, estado, fechaInicio, fechaFin }) => {
  const params = { pagina, limite };
  const termino = busqueda?.trim();
  if (termino) params.buscar = termino;
  if (estado && estado !== 'todos') params.estado = estado;
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;
  return params;
};

const hanCambiadoFiltros = (prev, busquedaDebounced, filtros) => {
  return (
    prev.busquedaDebounced !== busquedaDebounced ||
    prev.estado !== filtros.estado ||
    prev.fechaInicio !== filtros.fechaInicio ||
    prev.fechaFin !== filtros.fechaFin
  );
};

const esCargaInicial = (loading, pedidosLength, busqueda, filtros) => {
  return (
    loading &&
    pedidosLength === 0 &&
    !busqueda &&
    filtros.estado === 'todos' &&
    !filtros.fechaInicio &&
    !filtros.fechaFin
  );
};

// ============================================
// SUBCOMPONENTES MODULARES
// ============================================

function AccionesPedido({ pedido, onVerDetalle, onCambiarEstado }) {
  const handleAccion = (e, accion) => {
    e.stopPropagation();
    accion();
  };

  return (
    <div className="action-btn-group">
      <Button 
        type="button"
        variant="outline-primary" 
        size="sm" 
        className="btn-action-table" 
        onClick={(e) => handleAccion(e, () => onVerDetalle(pedido))} 
        title="Ver detalle del pedido"
      >
        <span className="bi bi-eye" aria-hidden="true" />
        <span className="btn-text">Detalle</span>
      </Button>

      {pedido.estado === 'pendiente' && (
        <>
          <Button 
            type="button"
            variant="outline-info" 
            size="sm" 
            className="btn-action-table" 
            onClick={(e) => handleAccion(e, () => onCambiarEstado(pedido.id, 'pagado'))} 
            title="Marcar como pagado"
          >
            <span className="bi bi-cash-stack" aria-hidden="true" />
            <span className="btn-text">Pagar</span>
          </Button>
          <Button 
            type="button"
            variant="outline-danger" 
            size="sm" 
            className="btn-action-table" 
            onClick={(e) => handleAccion(e, () => onCambiarEstado(pedido.id, 'cancelado'))} 
            title="Cancelar pedido"
          >
            <span className="bi bi-x-circle" aria-hidden="true" />
            <span className="btn-text">Cancelar</span>
          </Button>
        </>
      )}

      {pedido.estado === 'pagado' && (
        <Button 
          type="button"
          variant="outline-primary" 
          size="sm" 
          className="btn-action-table" 
          onClick={(e) => handleAccion(e, () => onCambiarEstado(pedido.id, 'enviado'))} 
          title="Marcar como enviado"
        >
          <span className="bi bi-truck" aria-hidden="true" />
          <span className="btn-text">Enviar</span>
        </Button>
      )}

      {pedido.estado === 'enviado' && (
        <Button 
          type="button"
          variant="outline-success" 
          size="sm" 
          className="btn-action-table" 
          onClick={(e) => handleAccion(e, () => onCambiarEstado(pedido.id, 'entregado'))} 
          title="Marcar como entregado"
        >
          <span className="bi bi-check-circle" aria-hidden="true" />
          <span className="btn-text">Entregar</span>
        </Button>
      )}
    </div>
  );
}

function FilaPedido({ pedido, estaSeleccionado, onToggleSeleccionar, onVerDetalle, onCambiarEstado }) {
  const iconCls = estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted';
  const rowCls = `fila-admin ${estaSeleccionado ? 'fila-admin-seleccionada' : ''}`;

  return (
    <tr 
      onClick={() => onToggleSeleccionar(pedido.id)}
      className={rowCls}
      title="Haz clic para seleccionar/deseleccionar este pedido"
    >
      <td className="align-middle fw-bold">
        <div className="d-flex align-items-center gap-2">
          <span 
            className={`bi bi-${iconCls} fs-6 d-inline-block`}
            style={{ cursor: 'pointer' }}
            aria-hidden="true"
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
        <AccionesPedido 
          pedido={pedido} 
          onVerDetalle={onVerDetalle} 
          onCambiarEstado={onCambiarEstado} 
        />
      </td>
    </tr>
  );
}

function FiltrosPedidos({ filtros, onChangeFiltro, onLimpiar }) {
  return (
    <Card className="shadow-sm border-0 mb-4 admin-card-table">
      <Card.Body className="p-3 p-md-4">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-navy">
          <span className="bi bi-funnel text-gold" aria-hidden="true" />
          <span>Filtros de Búsqueda</span>
        </h6>
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">Buscar por Cliente o ID</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <span className="bi bi-search" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Nombre, email o #ID..."
                  value={filtros.busqueda}
                  onChange={(e) => onChangeFiltro('busqueda', e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">Estado</Form.Label>
              <Form.Select
                value={filtros.estado}
                onChange={(e) => onChangeFiltro('estado', e.target.value)}
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
                onChange={(e) => onChangeFiltro('fechaInicio', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">Fecha Fin</Form.Label>
              <Form.Control
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => onChangeFiltro('fechaFin', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button
              type="button"
              variant="outline-secondary"
              className="w-100"
              onClick={onLimpiar}
              title="Limpiar filtros"
            >
              <span className="bi bi-arrow-clockwise" aria-hidden="true" />
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

function PaginacionPedidos({ paginaActual, totalPaginas, totalPedidos, totalMostrados, loading, onCambiarPagina }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-4 p-3 bg-white rounded shadow-sm">
      <small className="text-muted">
        Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> — Mostrando <strong>{totalMostrados}</strong> de <strong>{totalPedidos}</strong> pedidos
      </small>
      <ButtonGroup size="sm">
        <Button 
          type="button" 
          variant="outline-primary" 
          onClick={() => onCambiarPagina(1)} 
          disabled={paginaActual === 1 || loading}
        >
          ««
        </Button>
        <Button 
          type="button" 
          variant="outline-primary" 
          onClick={() => onCambiarPagina(paginaActual - 1)} 
          disabled={paginaActual === 1 || loading}
        >
          Anterior
        </Button>
        <Button type="button" variant="primary" disabled>
          {paginaActual} / {totalPaginas}
        </Button>
        <Button 
          type="button" 
          variant="outline-primary" 
          onClick={() => onCambiarPagina(paginaActual + 1)} 
          disabled={paginaActual === totalPaginas || loading}
        >
          Siguiente
        </Button>
        <Button 
          type="button" 
          variant="outline-primary" 
          onClick={() => onCambiarPagina(totalPaginas)} 
          disabled={paginaActual === totalPaginas || loading}
        >
          »»
        </Button>
      </ButtonGroup>
    </div>
  );
}

function ModalDetallePedido({ show, pedido, onCerrar, onCambiarEstado }) {
  if (!pedido) return null;

  const detalles = pedido.detalles || pedido.DetallePedidos || [];

  return (
    <Modal 
      show={show} 
      onHide={onCerrar} 
      size="lg" 
      centered
      dialogClassName="modal-producto-form"
      style={{ maxWidth: '780px' }}
    >
      <div className="product-minimal-header">
        <div>
          <h6 className="fw-bold mb-0 text-navy fs-6">
            Detalle del Pedido #{pedido.id}
          </h6>
          <small className="text-muted" style={{ fontSize: '0.8rem' }}>
            {formatearFecha(pedido.createdAt)}
          </small>
        </div>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onCerrar}
          aria-label="Cerrar"
        />
      </div>

      <Modal.Body className="p-3 p-sm-4">
        <Row className="g-3 mb-3">
          <Col sm={6}>
            <div className="p-3 rounded-3 bg-light border">
              <h6 className="fw-bold text-navy mb-2 small text-uppercase">Información del Cliente</h6>
              <p className="mb-0 small text-secondary">
                <strong>Nombre:</strong> {pedido.usuario?.nombre || 'N/A'}<br/>
                <strong>Email:</strong> {pedido.usuario?.email || 'N/A'}<br/>
                <strong>Teléfono:</strong> {pedido.telefono || '-'}
              </p>
            </div>
          </Col>
          <Col sm={6}>
            <div className="p-3 rounded-3 bg-light border">
              <h6 className="fw-bold text-navy mb-2 small text-uppercase">Resumen del Pedido</h6>
              <p className="mb-0 small text-secondary">
                <strong>Fecha:</strong> {formatearFecha(pedido.createdAt)}<br/>
                <strong>Estado:</strong> <Badge bg={getBadgeEstado(pedido.estado)} className="ms-1">{pedido.estado}</Badge><br/>
                <strong>Total:</strong> <span className="fw-bold text-navy">{formatearPrecio(pedido.total)}</span>
              </p>
            </div>
          </Col>
        </Row>

        <div className="mb-3">
          <span className="small fw-semibold text-secondary d-block mb-1">Dirección de Envío:</span>
          <div className="p-2 px-3 rounded-3 bg-light border small text-muted">
            {pedido.direccionEnvio || 'No especificada'}
          </div>
        </div>

        {pedido.notas && (
          <div className="mb-3">
            <span className="small fw-semibold text-secondary d-block mb-1">Notas del Cliente:</span>
            <div className="p-2 px-3 rounded-3 bg-info-subtle border border-info-subtle small text-navy">
              {pedido.notas}
            </div>
          </div>
        )}

        <h6 className="fw-bold text-navy mb-2 fs-6">Productos Comprados</h6>
        <div className="table-responsive table-no-round border mb-3" style={{ borderRadius: 0 }}>
          <Table size="sm" className="mb-0 align-middle table-no-round" style={{ borderRadius: 0 }}>
            <thead className="bg-light table-no-round" style={{ borderRadius: 0 }}>
              <tr>
                <th className="py-2" style={{ borderRadius: 0 }}>Producto</th>
                <th className="py-2 text-center" style={{ borderRadius: 0 }}>Precio Unit.</th>
                <th className="py-2 text-center" style={{ borderRadius: 0 }}>Cantidad</th>
                <th className="py-2 text-end" style={{ borderRadius: 0 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((detalle) => {
                const detalleKey = getDetalleKey(detalle);
                return (
                  <tr key={detalleKey}>
                    <td className="py-2 fw-medium">{getDetalleNombre(detalle)}</td>
                    <td className="py-2 text-center">{formatearPrecio(detalle.precioUnitario)}</td>
                    <td className="py-2 text-center">{detalle.cantidad}</td>
                    <td className="py-2 text-end fw-bold">{formatearPrecio(detalle.subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-light">
              <tr>
                <th colSpan="3" className="text-end py-2">TOTAL PEDIDO:</th>
                <th className="text-end py-2 fs-6 text-primary">{formatearPrecio(pedido.total)}</th>
              </tr>
            </tfoot>
          </Table>
        </div>

        <div>
          <span className="small fw-semibold text-secondary d-block mb-2">Cambiar Estado Directo:</span>
          <div className="d-flex flex-wrap gap-2">
            {ESTADOS_DISPONIBLES.map((est) => (
              <Button
                key={est}
                type="button"
                variant={pedido.estado === est ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => onCambiarEstado(pedido.id, est)}
                disabled={pedido.estado === est}
                className="text-capitalize"
              >
                {est}
              </Button>
            ))}
          </div>
        </div>
      </Modal.Body>

      <div className="product-minimal-footer">
        <button 
          type="button" 
          className="btn-minimal-cancel"
          onClick={onCerrar}
        >
          Cerrar Detalle
        </button>
      </div>
    </Modal>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

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
    if (hanCambiadoFiltros(prev, busquedaDebounced, filtros)) {
      filtrosAnteriores.current = {
        busquedaDebounced,
        estado: filtros.estado,
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      };
      setPaginaActual(1);
    }
  }, [busquedaDebounced, filtros]);

  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params = construirParametrosBusqueda({
        pagina: paginaActual,
        limite: registrosPorPagina,
        busqueda: busquedaDebounced,
        estado: filtros.estado,
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      });

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

  const actualizarPedidoEnEstado = (pedidoId, nuevoEstado, pedidoActualizado = null) => {
    setPedidos(prev => 
      prev.map(p => (p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
    );
    setPedidoSeleccionado(prev => {
      if (!prev || prev.id !== pedidoId) return prev;
      return pedidoActualizado || { ...prev, estado: nuevoEstado };
    });
  };

  // Cambio de estado con confirmación modal
  const solicitarCambioEstado = (pedidoId, nuevoEstado) => {
    setModalConfirmacion({
      show: true,
      titulo: TITULOS_ESTADO[nuevoEstado] || `¿Cambiar estado a "${nuevoEstado}"?`,
      mensaje: `¿Deseas cambiar el estado del Pedido #${pedidoId} a "${nuevoEstado.toUpperCase()}"?`,
      tipo: TIPOS_ESTADO[nuevoEstado] || 'primary',
      icono: ICONOS_ESTADO[nuevoEstado] || 'arrow-repeat',
      textoConfirmar: nuevoEstado === 'cancelado' ? 'Cancelar Pedido' : 'Actualizar Estado',
      textoCancelar: 'Cerrar',
      onConfirm: async () => {
        try {
          actualizarPedidoEnEstado(pedidoId, nuevoEstado);
          const response = await pedidoService.actualizarEstadoPedido(pedidoId, nuevoEstado);
          setMensaje({ tipo: 'success', texto: `Pedido #${pedidoId} actualizado a "${nuevoEstado}" exitosamente` });
          
          const pedidoActualizado = response?.data?.pedido || response?.pedido || response?.data || null;
          if (pedidoActualizado) {
            actualizarPedidoEnEstado(pedidoId, nuevoEstado, pedidoActualizado);
          }
          recargarPedidos();
        } catch (error) {
          console.error('Error al cambiar estado del pedido:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al cambiar estado del pedido' });
          recargarPedidos();
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
          
          recargarPedidos();
        } catch (error) {
          console.error('Error al cambiar estado masivo:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al procesar el cambio de estado masivo' });
          recargarPedidos();
        }
      }
    });
  };

  const handleVerDetalle = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowDetalleModal(true);
  };

  const [exportando, setExportando] = useState(false);

  const obtenerPedidosParaExportar = async () => {
    const params = construirParametrosBusqueda({
      pagina: 1,
      limite: 1000,
      busqueda: busquedaDebounced,
      estado: filtros.estado,
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin
    });

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
    return pedidos.length > 0 && pedidos.every(p => seleccionados.has(p.id));
  }, [pedidos, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        pedidos.forEach(p => nuevo.delete(p.id));
      } else {
        pedidos.forEach(p => nuevo.add(p.id));
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

  const handleVerDetalleUnico = () => {
    const idSel = Array.from(seleccionados)[0];
    const pedSel = pedidos.find(p => p.id === idSel);
    if (pedSel) handleVerDetalle(pedSel);
  };

  const formatoExportarTexto = tipoExportacion === 'pdf' ? 'PDF' : 'Excel';
  const labelBotonExportar = exportando ? 'Exportando...' : `Exportar a ${formatoExportarTexto}`;

  if (esCargaInicial(loading, pedidos.length, busquedaDebounced, filtros)) {
    return <LoadingSpinner message="Cargando pedidos..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar Responsivo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <span className="bi bi-cart-check-fill me-2 text-gold" aria-hidden="true" />
            <span>Gestión de Pedidos</span>
          </h1>
          <p className="text-muted mb-0">
            Total: <strong>{totalPedidos}</strong> pedido{totalPedidos !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              type="button"
              variant="primary"
              disabled={exportando}
              onClick={() => handleExportar(tipoExportacion)}
            >
              <span className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`} aria-hidden="true" />
              <span>{labelBotonExportar}</span>
            </Button>
            <Dropdown.Toggle split variant="secondary" className="btn-dark dropdown-toggle-split" disabled={exportando} />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('pdf');
                handleExportar('pdf');
              }}>
                <span className="bi bi-file-earmark-pdf me-2" aria-hidden="true" />
                <span>Exportar a PDF</span>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setTipoExportacion('excel');
                handleExportar('excel');
              }}>
                <span className="bi bi-file-earmark-excel me-2" aria-hidden="true" />
                <span>Exportar a Excel</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button type="button" variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <span className="bi bi-arrow-left me-1" aria-hidden="true" />
            <span>Volver</span>
          </Button>
        </div>
      </div>

      {/* Notificación flotante inferior izquierda mediante FloatingToast */}
      <FloatingToast mensaje={mensaje} onClose={() => setMensaje({ tipo: '', texto: '' })} />

      {/* Filtros */}
      <FiltrosPedidos 
        filtros={filtros}
        onChangeFiltro={(campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }))}
        onLimpiar={() => setFiltros({ busqueda: '', estado: 'todos', fechaInicio: '', fechaFin: '' })}
      />

      {/* Barra de Acciones de Selección Múltiple */}
      <ToolbarSeleccionLote
        totalItems={pedidos.length}
        todosSeleccionados={todosPaginaSeleccionados}
        cantidadSeleccionados={seleccionados.size}
        etiquetaItem="pedido"
        onToggleTodos={handleToggleSeleccionarTodos}
        onLimpiar={() => setSeleccionados(new Set())}
      >
        {seleccionados.size === 1 && (
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            className="d-inline-flex align-items-center gap-1 fw-semibold"
            onClick={handleVerDetalleUnico}
            title="Ver detalle del pedido seleccionado"
          >
            <span className="bi bi-eye-fill" aria-hidden="true" />
            <span>Ver Detalle</span>
          </Button>
        )}
        <Button
          type="button"
          variant="outline-info"
          size="sm"
          className="d-inline-flex align-items-center gap-1 fw-semibold"
          onClick={() => solicitarCambioEstadoMasivo('pagado')}
          title="Marcar como pagados"
        >
          <span className="bi bi-cash-stack" aria-hidden="true" />
          <span>Pagar ({seleccionados.size})</span>
        </Button>
        <Button
          type="button"
          variant="outline-primary"
          size="sm"
          className="d-inline-flex align-items-center gap-1 fw-semibold"
          onClick={() => solicitarCambioEstadoMasivo('enviado')}
          title="Marcar como enviados"
        >
          <span className="bi bi-truck" aria-hidden="true" />
          <span>Enviar ({seleccionados.size})</span>
        </Button>
        <Button
          type="button"
          variant="outline-success"
          size="sm"
          className="d-inline-flex align-items-center gap-1 fw-semibold"
          onClick={() => solicitarCambioEstadoMasivo('entregado')}
          title="Marcar como entregados"
        >
          <span className="bi bi-check-circle-fill" aria-hidden="true" />
          <span>Entregar ({seleccionados.size})</span>
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          className="d-inline-flex align-items-center gap-1 fw-semibold"
          onClick={() => solicitarCambioEstadoMasivo('cancelado')}
          title="Cancelar pedidos seleccionados"
        >
          <span className="bi bi-x-circle-fill" aria-hidden="true" />
          <span>Cancelar ({seleccionados.size})</span>
        </Button>
      </ToolbarSeleccionLote>

      {/* Tabla de Pedidos Responsiva */}
      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>ID</th>
                <th>Cliente</th>
                <th className="d-none d-sm-table-cell">Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th className="text-center" style={{ width: '220px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <span className="bi bi-inbox fs-1 d-block mb-2 text-gold opacity-50" aria-hidden="true" />
                    <span>No se encontraron pedidos registrados con los filtros actuales</span>
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <FilaPedido
                    key={pedido.id}
                    pedido={pedido}
                    estaSeleccionado={seleccionados.has(pedido.id)}
                    onToggleSeleccionar={toggleSeleccionarPedido}
                    onVerDetalle={handleVerDetalle}
                    onCambiarEstado={solicitarCambioEstado}
                  />
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Paginación */}
      <PaginacionPedidos
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalPedidos={totalPedidos}
        totalMostrados={pedidos.length}
        loading={loading}
        onCambiarPagina={setPaginaActual}
      />

      {/* Modal Detalle Pedido Minimalista */}
      <ModalDetallePedido
        show={showDetalleModal}
        pedido={pedidoSeleccionado}
        onCerrar={() => {
          setShowDetalleModal(false);
          setPedidoSeleccionado(null);
        }}
        onCambiarEstado={solicitarCambioEstado}
      />

      {/* Modal de Confirmación Compacto Estilo Dashboard */}
      <ModalConfirmacion
        modal={modalConfirmacion}
        onClose={() => setModalConfirmacion(prev => ({ ...prev, show: false }))}
      />
    </Container>
  );
}

export default AdminPedidosPage;