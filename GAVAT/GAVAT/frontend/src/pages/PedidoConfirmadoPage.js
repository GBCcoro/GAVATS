/**
 * ============================================
 * PEDIDO DETALLE / CONFIRMADO PAGE - GAVAT
 * ============================================
 * Vista detallada del pedido con estética global:
 * Azul Marino (#192847), Acentos Dorados (#f5c271 / #c7984e)
 * y componentes visuales consistentes con toda la plataforma.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pedidoService from '../services/pedidoService';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FloatingToast from '../components/FloatingToast';
import { getImageUrl, formatCurrency, formatDateTime } from '../utils/helpers';

const PedidoConfirmadoPage = () => {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descargandoFactura, setDescargandoFactura] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '', accion: null });
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loadPedido = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pedidoService.getPedidoById(id);
      if (response.success === false) {
        setMensaje({ tipo: 'danger', texto: response.message || 'Error al cargar el pedido' });
      } else {
        const pedidoData = response.data?.pedido || response.data || response;
        setPedido(pedidoData);
      }
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      setMensaje({ tipo: 'danger', texto: error.message || 'Error al cargar el pedido' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPedido();
  }, [isAuthenticated, navigate, loadPedido]);

  const getEstadoBadgeClass = (estado) => {
    const badges = {
      'pendiente': 'badge-estado-pendiente',
      'pagado': 'badge-estado-pagado',
      'confirmado': 'badge-estado-confirmado',
      'en_proceso': 'badge-estado-proceso',
      'enviado': 'badge-estado-enviado',
      'entregado': 'badge-estado-entregado',
      'cancelado': 'badge-estado-cancelado'
    };
    return badges[estado] || 'badge-estado-default';
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      'pendiente': 'clock-history',
      'pagado': 'cash-stack',
      'confirmado': 'check2-all',
      'en_proceso': 'gear-wide-connected',
      'enviado': 'truck',
      'entregado': 'box2-heart-fill',
      'cancelado': 'x-circle-fill'
    };
    return icons[estado] || 'info-circle';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente de Pago',
      'pagado': 'Pagado',
      'confirmado': 'Confirmado',
      'en_proceso': 'En Proceso',
      'enviado': 'Enviado',
      'entregado': 'Entregado con Éxito',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  };

  const getEstadoMensaje = (estado) => {
    switch (estado) {
      case 'pagado':
        return 'Tu pago ha sido confirmado. Estamos preparando tus productos para el despacho.';
      case 'en_proceso':
        return 'Tu orden se encuentra en fase de ensamblaje y preparación en bodega.';
      case 'enviado':
        return 'Tu pedido ha sido despachado y se encuentra en ruta hacia tu dirección.';
      case 'entregado':
        return 'Tu pedido ha sido entregado exitosamente. ¡Gracias por confiar en GAVAT!';
      case 'cancelado':
        return 'Este pedido ha sido cancelado.';
      case 'pendiente':
      default:
        return 'Tu pedido ha sido registrado exitosamente y está listo para ser procesado.';
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleDescargarFactura = async () => {
    if (!pedido) return;
    setDescargandoFactura(true);
    try {
      const responseFactura = await api.get(`/cliente/pedidos/${pedido.id}/factura`);
      if (!responseFactura.data?.success || !responseFactura.data?.data?.numeroFactura) {
        setMensaje({ tipo: 'warning', texto: 'Aún no se ha generado la factura para este pedido' });
        return;
      }
      const { numeroFactura } = responseFactura.data.data;
      const responsePdf = await api.get(`/facturas/${numeroFactura}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([responsePdf.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura-${numeroFactura}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMensaje({ tipo: 'success', texto: `Factura ${numeroFactura} descargada correctamente` });
    } catch (error) {
      console.error('Error al descargar factura:', error);
      setMensaje({ tipo: 'danger', texto: 'No se pudo descargar la factura en este momento' });
    } finally {
      setDescargandoFactura(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5">
        <LoadingSpinner message="Cargando información del pedido..." />
      </div>
    );
  }

  if (!pedido) {
    return (
      <Container className="py-5 text-center">
        <div className="p-5 bg-white rounded-4 border shadow-sm" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1 d-block mb-3" />
          <h4 className="fw-bold text-navy mb-2">No se encontró el pedido</h4>
          <p className="text-muted small mb-4">
            No se pudo localizar la información del pedido solicitado o no tienes permisos para visualizarlo.
          </p>
          <Button className="btn-hero-gold px-4 py-2" onClick={() => navigate('/mis-pedidos')}>
            <i className="bi bi-arrow-left me-2" />
            Volver a Mis Pedidos
          </Button>
        </div>
      </Container>
    );
  }

  const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : (pedido.DetallePedidos || []);

  return (
    <div className="pedido-detalle-wrapper py-4 py-lg-5">
      <Container>
        {/* Notificación flotante fija en esquina inferior izquierda */}
        <FloatingToast
          mensaje={mensaje}
          onClose={() => setMensaje({ tipo: '', texto: '', accion: null })}
        />

        {/* ========================================================================= */}
        {/* BANNER PRINCIPAL DEL ESTADO DEL PEDIDO                                    */}
        {/* ========================================================================= */}
        <div className="pedido-header-banner p-4 p-md-4 rounded-4 shadow-sm mb-4 position-relative overflow-hidden">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 position-relative z-1">
            <div className="d-flex align-items-center gap-3">
              <div className="pedido-icon-circle flex-shrink-0">
                <i className={`bi bi-${getEstadoIcon(pedido.estado)}`} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h1 className="fw-bold text-navy fs-3 mb-0">
                    Pedido #{pedido.id}
                  </h1>
                  <span className={`badge-estado-custom ${getEstadoBadgeClass(pedido.estado)}`}>
                    <i className={`bi bi-${getEstadoIcon(pedido.estado)} me-1`} />
                    {getEstadoTexto(pedido.estado)}
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  {getEstadoMensaje(pedido.estado)}
                </p>
              </div>
            </div>

            <div className="text-md-end pt-2 pt-md-0 border-top border-md-0">
              <small className="text-muted d-block">Fecha de Registro</small>
              <strong className="text-navy">{formatDateTime(pedido.createdAt)}</strong>
            </div>
          </div>
        </div>

        <Row className="g-4">
          {/* ========================================================================= */}
          {/* COLUMNA IZQUIERDA: PRODUCTOS Y DETALLES DE ENVÍO                          */}
          {/* ========================================================================= */}
          <Col lg={8}>
            {/* Tarjeta de Productos */}
            <Card className="pedido-card shadow-sm rounded-4 overflow-hidden mb-4">
              <Card.Header className="pedido-card-header d-flex align-items-center justify-content-between p-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-boxes text-gold fs-5" />
                  <span className="fw-bold text-navy">Productos del Pedido ({detalles.length})</span>
                </div>
              </Card.Header>
              <Card.Body className="p-0 bg-white">
                <div className="table-responsive">
                  <Table className="align-middle mb-0 pedido-table">
                    <thead>
                      <tr>
                        <th className="ps-4">Producto</th>
                        <th className="text-center">Precio Unit.</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end pe-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((detalle, index) => {
                        const producto = detalle.producto || detalle.Producto;
                        return (
                          <tr key={detalle.id || `${producto?.id || 'prod'}-${index}`}>
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={getImageUrl(producto?.imagen)}
                                  alt={producto?.nombre || 'Producto'}
                                  className="pedido-prod-img rounded-3"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/producto-default.jpg';
                                  }}
                                />
                                <div>
                                  <div className="fw-bold text-navy">
                                    {producto?.nombre || 'Producto no especificado'}
                                  </div>
                                  {producto?.categoria && (
                                    <small className="text-muted d-block">
                                      {producto.categoria.nombre}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-3">
                              <span className="text-muted fw-semibold">
                                {formatCurrency(detalle.precioUnitario)}
                              </span>
                            </td>
                            <td className="text-center py-3">
                              <span className="badge-cantidad-pill">
                                {detalle.cantidad}
                              </span>
                            </td>
                            <td className="text-end pe-4 py-3">
                              <span className="fw-bold text-navy">
                                {formatCurrency(detalle.subtotal)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Tarjeta de Información de Envío y Contacto */}
            <Card className="pedido-card shadow-sm rounded-4 overflow-hidden mb-4">
              <Card.Header className="pedido-card-header d-flex align-items-center gap-2 p-3 px-4">
                <i className="bi bi-truck text-gold fs-5" />
                <span className="fw-bold text-navy">Información de Envío y Entrega</span>
              </Card.Header>
              <Card.Body className="p-4 bg-white">
                <Row className="g-4">
                  <Col md={6}>
                    <div className="d-flex gap-3">
                      <div className="info-icon-badge">
                        <i className="bi bi-geo-alt-fill text-gold" />
                      </div>
                      <div>
                        <small className="text-muted fw-semibold d-block mb-1 text-uppercase">
                          Dirección de Entrega
                        </small>
                        <p className="fw-medium text-navy mb-0">
                          {pedido.direccionEnvio || 'No especificada'}
                        </p>
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex gap-3">
                      <div className="info-icon-badge">
                        <i className="bi bi-telephone-fill text-gold" />
                      </div>
                      <div>
                        <small className="text-muted fw-semibold d-block mb-1 text-uppercase">
                          Teléfono de Contacto
                        </small>
                        <p className="fw-medium text-navy mb-0">
                          {pedido.telefono || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </Col>

                  {pedido.notas && (
                    <Col xs={12}>
                      <div className="p-3 rounded-3 bg-light border">
                        <small className="text-muted fw-bold d-block mb-1">
                          <i className="bi bi-chat-left-text me-1 text-gold" /> Notas o Instrucciones:
                        </small>
                        <p className="small text-secondary mb-0">
                          {pedido.notas}
                        </p>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* ========================================================================= */}
          {/* COLUMNA DERECHA: RESUMEN DE COMPRA Y ACCIONES                            */}
          {/* ========================================================================= */}
          <Col lg={4}>
            <Card className="pedido-card shadow-sm rounded-4 overflow-hidden mb-4">
              <Card.Header className="pedido-card-header d-flex align-items-center gap-2 p-3 px-4">
                <i className="bi bi-receipt text-gold fs-5" />
                <span className="fw-bold text-navy">Resumen de Compra</span>
              </Card.Header>
              <Card.Body className="p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Subtotal Productos:</span>
                  <span className="fw-semibold text-navy">{formatCurrency(pedido.total)}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Costo de Envío:</span>
                  <span className="fw-bold text-success">Gratis</span>
                </div>

                <hr className="my-3 opacity-15" />

                <div className="d-flex justify-content-between align-items-baseline mb-4">
                  <span className="fw-bold text-navy fs-5">Total Pagado:</span>
                  <span className="total-precio-gold fs-4 fw-bold">
                    {formatCurrency(pedido.total)}
                  </span>
                </div>

                {/* Acciones principales */}
                <div className="d-grid gap-2">
                  {(pedido.estado === 'pagado' || pedido.estado === 'entregado') && (
                    <Button
                      variant="outline-success"
                      className="btn-accion-pedido btn-factura d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                      onClick={handleDescargarFactura}
                      disabled={descargandoFactura}
                    >
                      <i className="bi bi-file-earmark-pdf-fill" />
                      <span>{descargandoFactura ? 'Descargando...' : 'Descargar Factura PDF'}</span>
                    </Button>
                  )}

                  <Button
                    variant="outline-secondary"
                    className="btn-accion-pedido d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                    onClick={handleImprimir}
                  >
                    <i className="bi bi-printer" />
                    <span>Imprimir Comprobante</span>
                  </Button>

                  <Button
                    className="btn-accion-pedido btn-mis-pedidos d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                    onClick={() => navigate('/mis-pedidos')}
                  >
                    <i className="bi bi-list-ul" />
                    <span>Ver Mis Pedidos</span>
                  </Button>

                  <Button
                    className="btn-hero-gold d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                    onClick={() => navigate('/catalogo')}
                  >
                    <i className="bi bi-grid-fill" />
                    <span>Seguir Comprando</span>
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Tarjeta de Soporte */}
            <div className="p-4 rounded-4 bg-white border shadow-sm text-center">
              <i className="bi bi-headset text-gold fs-2 d-block mb-2" />
              <h6 className="fw-bold text-navy mb-1">¿Tienes preguntas sobre tu pedido?</h6>
              <p className="text-muted small mb-0">
                Comunícate con nuestro equipo de atención citando el <strong>Pedido #{pedido.id}</strong> para asistencia inmediata.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* ========================================================================= */}
      {/* ESTILOS DE LA PÁGINA (Sincronizados con el diseño global)                 */}
      {/* ========================================================================= */}
      <style>{`
        .pedido-detalle-wrapper {
          background-color: #f8fafc;
          min-height: calc(100vh - 180px);
        }
        .pedido-header-banner {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .pedido-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(245, 194, 113, 0.25) 0%, rgba(199, 152, 78, 0.25) 100%);
          color: #c7984e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
        }

        /* Badges de Estado estilizados */
        .badge-estado-custom {
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
        }
        .badge-estado-pendiente {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .badge-estado-pagado {
          background-color: #dbeafe;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }
        .badge-estado-confirmado {
          background-color: #e0e7ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
        }
        .badge-estado-proceso {
          background-color: #fef9c3;
          color: #854d0e;
          border: 1px solid #fef08a;
        }
        .badge-estado-enviado {
          background-color: #f3e8ff;
          color: #6b21a8;
          border: 1px solid #e9d5ff;
        }
        .badge-estado-entregado {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .badge-estado-cancelado {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .badge-estado-default {
          background-color: #f1f5f9;
          color: #475569;
        }

        .pedido-card {
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #ffffff;
        }
        .pedido-card-header {
          background: var(--bg-positiva, #DBE1ED);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .pedido-table thead th {
          background: var(--bg-positiva, #DBE1ED) !important;
          color: var(--bg-negativo, #192847) !important;
          font-size: 0.85rem !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-bottom: 2px solid #cbd5e1 !important;
          padding: 0.95rem 1.15rem !important;
        }
        .pedido-table tbody td {
          padding: 0.95rem 1.15rem !important;
          vertical-align: middle !important;
          font-size: 0.92rem !important;
        }
        .pedido-prod-img {
          width: 54px;
          height: 54px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
        }
        .badge-cantidad-pill {
          background: #f1f5f9;
          color: #192847;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.85rem;
        }

        .info-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 0.65rem;
          background: rgba(199, 152, 78, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          flex-shrink: 0;
        }

        .total-precio-gold {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .btn-accion-pedido {
          border-radius: 0.75rem !important;
          font-size: 0.9rem !important;
          transition: all 0.2s ease !important;
        }
        .btn-mis-pedidos {
          background: #ffffff !important;
          border: 1.5px solid #192847 !important;
          color: #192847 !important;
        }
        .btn-mis-pedidos:hover {
          background: #192847 !important;
          color: #ffffff !important;
        }

        .btn-factura {
          border-radius: 0.75rem !important;
          border-width: 1.5px !important;
        }

        .btn-hero-gold {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%) !important;
          color: #192847 !important;
          border: none !important;
          border-radius: 0.75rem !important;
          font-weight: 700 !important;
          transition: all 0.25s ease !important;
          box-shadow: 0 4px 12px rgba(199, 152, 78, 0.25) !important;
        }
        .btn-hero-gold:hover {
          background: linear-gradient(135deg, #c7984e 0%, #f5c271 100%) !important;
          color: #192847 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 16px rgba(199, 152, 78, 0.35) !important;
        }
      `}</style>
    </div>
  );
};

export default PedidoConfirmadoPage;
