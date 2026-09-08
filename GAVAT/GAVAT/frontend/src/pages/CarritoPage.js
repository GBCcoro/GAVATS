/**
 * ============================================
 * CARRITO PAGE - Adaptado a la paleta del proyecto
 * ============================================
 * Página del carrito de compras con estilos personalizados (dorados, fondos)
 */

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Badge, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import carritoService from '../services/carritoService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import SvgIcon from '../components/SvgIcon';
import FloatingToast from '../components/FloatingToast';
import { getImageUrl, formatCurrency } from '../utils/helpers';

const BG_MODAL_CONFIRMACION = Object.freeze({
  danger: 'danger-subtle',
  warning: 'warning-subtle',
  primary: 'primary-subtle',
  info: 'primary-subtle',
  success: 'success-subtle'
});

/**
 * Componente modal de confirmación compacto reutilizable
 */
const ModalConfirmacionCarrito = memo(({ modalConfirmacion, onHide }) => {
  const bgClase = BG_MODAL_CONFIRMACION[modalConfirmacion.tipo] || 'danger-subtle';
  const tipoClase = modalConfirmacion.tipo || 'danger';
  const icono = modalConfirmacion.icono || 'trash3-fill';

  return (
    <Modal
      show={modalConfirmacion.show}
      onHide={onHide}
      centered
      backdrop="static"
      dialogClassName="modal-confirmacion-compacto"
    >
      <Modal.Body className="text-center p-3 p-sm-4">
        <div className={`confirm-icon-wrapper mb-3 mx-auto bg-${bgClase} text-${tipoClase}`}>
          <span className={`bi bi-${icono} confirm-icon`} aria-hidden="true" />
        </div>

        <h5 className="fw-bold text-navy mb-2 fs-5">
          {modalConfirmacion.titulo}
        </h5>

        <p className="text-muted small mb-3 mb-sm-4 px-1 modal-confirm-msg">
          {modalConfirmacion.mensaje}
        </p>

        <div className="d-flex gap-2 justify-content-center w-100 mt-2">
          <Button
            type="button"
            variant="outline-secondary"
            className="px-3 py-2 fw-semibold flex-fill"
            onClick={() => {
              onHide();
              if (modalConfirmacion.onCancel) modalConfirmacion.onCancel();
            }}
          >
            {modalConfirmacion.textoCancelar || 'Cancelar'}
          </Button>
          <Button
            type="button"
            variant={tipoClase}
            className="px-3 py-2 fw-semibold flex-fill shadow-sm"
            onClick={() => {
              const action = modalConfirmacion.onConfirm;
              onHide();
              if (action) action();
            }}
          >
            {modalConfirmacion.textoConfirmar || 'Borrar'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
});

ModalConfirmacionCarrito.displayName = 'ModalConfirmacionCarrito';

/**
 * Componente de visualización de carrito vacío
 */
const CarritoVacio = memo(() => (
  <Card className="carrito-empty-card text-center py-5">
    <Card.Body>
      <span className="bi bi-cart-x display-1 text-muted d-block mb-3" aria-hidden="true"></span>
      <h3 className="mt-3">Tu carrito está vacío</h3>
      <p className="text-muted">Agrega productos para comenzar tu compra</p>
      <Link to="/catalogo" className="btn btn-ir-catalogo">
        <span className="bi bi-shop me-2" aria-hidden="true"></span>
        <span>Ir al Catálogo</span>
      </Link>
    </Card.Body>
  </Card>
));

CarritoVacio.displayName = 'CarritoVacio';

/**
 * Fila individual de producto en la tabla del carrito
 */
const ItemFilaCarrito = memo(({ item, onAumentar, onDisminuir, onInputChange, onInputBlur, onEliminar }) => {
  const nombre = item.producto?.nombre || item.nombre;
  const imagen = getImageUrl(item.producto?.imagen || item.imagen);
  const categoriaNombre = item.producto?.categoria?.nombre;
  const precio = item.precioUnitario || item.precio;
  const cantidadNum = Number.parseInt(item.cantidad, 10) || 0;
  const subtotal = precio * cantidadNum;
  const maxStock = item.producto?.stock ?? item.stock ?? 99;

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <img
            src={imagen}
            alt={nombre}
            className="rounded me-3 carrito-item-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/producto-default.jpg';
            }}
          />
          <div>
            <div className="fw-bold">{nombre}</div>
            {categoriaNombre && (
              <small className="text-muted">{categoriaNombre}</small>
            )}
          </div>
        </div>
      </td>
      <td className="text-center align-middle">
        {formatCurrency(precio)}
      </td>
      <td className="text-center align-middle">
        <div className="d-flex justify-content-center align-items-center">
          <Button
            type="button"
            className="btn-cantidad"
            size="sm"
            onClick={() => onDisminuir(item)}
            disabled={Number(item.cantidad) <= 1}
            title="Disminuir cantidad"
            aria-label="Disminuir cantidad"
          >
            <span className="bi bi-dash" aria-hidden="true" />
          </Button>
          <input
            type="number"
            className="cantidad-input mx-2"
            value={item.cantidad}
            min="1"
            max={maxStock}
            onChange={(e) => onInputChange(item, e.target.value)}
            onBlur={() => onInputBlur(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            aria-label={`Cantidad para ${nombre}`}
          />
          <Button
            type="button"
            className="btn-cantidad"
            size="sm"
            onClick={() => onAumentar(item)}
            title="Aumentar cantidad"
            aria-label="Aumentar cantidad"
          >
            <span className="bi bi-plus" aria-hidden="true" />
          </Button>
        </div>
      </td>
      <td className="text-center align-middle fw-bold">
        {formatCurrency(subtotal)}
      </td>
      <td className="text-center align-middle">
        <Button
          type="button"
          className="btn-eliminar d-inline-flex align-items-center justify-content-center"
          size="sm"
          onClick={() => onEliminar(item)}
          title="Eliminar item"
          aria-label={`Eliminar ${nombre} del carrito`}
        >
          <SvgIcon name="trash" />
        </Button>
      </td>
    </tr>
  );
});

ItemFilaCarrito.displayName = 'ItemFilaCarrito';

/**
 * Tarjeta de resumen de pedido y acción de pago
 */
const ResumenPedido = memo(({ total, isAuthenticated, onProcederPago }) => (
  <Card className="resumen-card">
    <Card.Header className="resumen-card-header">
      <h5 className="mb-0">Resumen del Pedido</h5>
    </Card.Header>
    <Card.Body>
      <div className="d-flex justify-content-between mb-2">
        <span>Subtotal:</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span>Envío:</span>
        <span className="text-muted">A calcular</span>
      </div>
      <hr className="resumen-hr" />
      <div className="d-flex justify-content-between mb-3">
        <strong>Total:</strong>
        <strong className="resumen-total fs-4">{formatCurrency(total)}</strong>
      </div>

      <Button
        type="button"
        className="btn-proceder-pago w-100 mb-2 d-inline-flex align-items-center justify-content-center gap-2"
        size="lg"
        onClick={onProcederPago}
      >
        <SvgIcon name="cash" />
        <span>{isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión para Pagar'}</span>
      </Button>

      <Link
        to="/catalogo"
        className="btn btn-seguir-comprando w-100 d-inline-flex align-items-center justify-content-center gap-2"
      >
        <span className="bi bi-arrow-left" aria-hidden="true" />
        <span>Seguir Comprando</span>
      </Link>
    </Card.Body>
  </Card>
));

ResumenPedido.displayName = 'ResumenPedido';

const CarritoPage = () => {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estado para modal de confirmación en pantalla (igual al gestor de productos)
  const [modalConfirmacion, setModalConfirmacion] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    tipo: 'danger',
    icono: 'trash3-fill',
    textoConfirmar: 'Borrar',
    textoCancelar: 'Cancelar',
    onConfirm: null,
    onCancel: null
  });

  const loadCarrito = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await carritoService.getCarrito();
      setCarrito(response.data || response.carrito);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar el carrito' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCarrito();
  }, [loadCarrito]);

  // Limpiar mensaje automáticamente (estilo gestores admin)
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '' });
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleCantidadChange = useCallback(async (itemId, nuevaCantidad, mensajePersonalizado = null) => {
    const cantNum = Number.parseInt(nuevaCantidad, 10);
    if (Number.isNaN(cantNum) || cantNum < 1) return;

    // Actualización optimista inmediata para respuesta instantánea al hacer clic en los botones
    setCarrito(prev => {
      if (!prev) return prev;
      const items = (prev.items || []).map(i => {
        if (i.id === itemId) {
          return { ...i, cantidad: cantNum };
        }
        return i;
      });
      const nuevoTotal = items.reduce((acc, i) => acc + ((Number(i.precioUnitario) || Number(i.precio) || 0) * (Number(i.cantidad) || 0)), 0);
      return {
        ...prev,
        items,
        total: nuevoTotal,
        resumen: {
          ...prev.resumen,
          total: nuevoTotal.toFixed(2),
          cantidadTotal: items.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0)
        }
      };
    });

    try {
      await carritoService.actualizarItem(itemId, cantNum);
      await loadCarrito(true);
      if (mensajePersonalizado) {
        setMensaje(mensajePersonalizado);
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      setMensaje({ tipo: 'danger', texto: error.message || 'Error al actualizar cantidad' });
      await loadCarrito(true);
    }
  }, [loadCarrito]);

  const handleInputChange = useCallback((item, nuevoValor) => {
    if (nuevoValor === '') {
      setCarrito(prev => {
        if (!prev) return prev;
        const items = (prev.items || []).map(i => {
          if (i.id === item.id) {
            return { ...i, cantidad: '' };
          }
          return i;
        });
        return { ...prev, items };
      });
      return;
    }

    const num = Number.parseInt(nuevoValor, 10);
    if (Number.isNaN(num)) return;

    const maxStock = Number(item.producto?.stock ?? item.stock) || 99;
    const nombreItem = item.producto?.nombre || item.nombre || 'este producto';

    if (num > maxStock) {
      setCarrito(prev => {
        if (!prev) return prev;
        const items = (prev.items || []).map(i => {
          if (i.id === item.id) {
            return { ...i, cantidad: maxStock };
          }
          return i;
        });
        return { ...prev, items };
      });
      setMensaje({
        tipo: 'warning',
        texto: `El stock máximo disponible para "${nombreItem}" es de ${maxStock} ${maxStock === 1 ? 'unidad' : 'unidades'}, por lo que no es posible agregar la cantidad solicitada (${num}).`
      });
      return;
    }

    setCarrito(prev => {
      if (!prev) return prev;
      const items = (prev.items || []).map(i => {
        if (i.id === item.id) {
          return { ...i, cantidad: num };
        }
        return i;
      });
      return { ...prev, items };
    });
  }, []);

  const handleInputBlur = useCallback(async (item) => {
    const cantOriginal = Number.parseInt(item.cantidad, 10);
    const maxStock = Number(item.producto?.stock ?? item.stock) || 99;
    const nombreItem = item.producto?.nombre || item.nombre || 'este producto';

    if (Number.isNaN(cantOriginal) || cantOriginal < 1) {
      await handleCantidadChange(item.id, 1);
      return;
    }

    if (cantOriginal > maxStock) {
      await handleCantidadChange(
        item.id,
        maxStock,
        {
          tipo: 'warning',
          texto: `El stock máximo disponible para "${nombreItem}" es de ${maxStock} ${maxStock === 1 ? 'unidad' : 'unidades'}, por lo que no es posible agregar la cantidad solicitada (${cantOriginal}).`
        }
      );
      return;
    }

    await handleCantidadChange(item.id, cantOriginal);
  }, [handleCantidadChange]);

  const handleAumentarCantidad = useCallback((item) => {
    const cantActual = Number.parseInt(item.cantidad, 10) || 1;
    const maxStock = Number(item.producto?.stock ?? item.stock) || 99;
    const nombreItem = item.producto?.nombre || item.nombre || 'este producto';

    if (cantActual >= maxStock) {
      setMensaje({
        tipo: 'warning',
        texto: `El stock máximo disponible para "${nombreItem}" es de ${maxStock} ${maxStock === 1 ? 'unidad' : 'unidades'}, por lo que no es posible agregar más unidades.`
      });
      return;
    }

    handleCantidadChange(item.id, cantActual + 1);
  }, [handleCantidadChange]);

  const handleDisminuirCantidad = useCallback((item) => {
    const cantActual = Number.parseInt(item.cantidad, 10) || 1;
    if (cantActual <= 1) return;
    handleCantidadChange(item.id, cantActual - 1);
  }, [handleCantidadChange]);

  const handleEliminar = useCallback((item) => {
    const nombreItem = item.producto?.nombre || item.nombre || 'este item';
    setModalConfirmacion({
      show: true,
      titulo: '¿Eliminar item?',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente el item "${nombreItem}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          await carritoService.eliminarItem(item.id);
          await loadCarrito();
          setMensaje({
            tipo: 'success',
            texto: `Item "${nombreItem}" eliminado del carrito exitosamente`
          });
        } catch (error) {
          console.error('Error al eliminar item:', error);
          setMensaje({
            tipo: 'danger',
            texto: error.message || 'Error al eliminar el item del carrito'
          });
        }
      }
    });
  }, [loadCarrito]);

  const handleVaciarCarrito = useCallback(() => {
    setModalConfirmacion({
      show: true,
      titulo: '¿Vaciar carrito?',
      mensaje: '¿Estás seguro de que deseas eliminar permanentemente todos los items del carrito? Esta acción no se puede deshacer.',
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          await carritoService.vaciarCarrito();
          await loadCarrito();
          setMensaje({ tipo: 'success', texto: 'Carrito vaciado exitosamente' });
        } catch (error) {
          console.error('Error al vaciar carrito:', error);
          setMensaje({ tipo: 'danger', texto: error.message || 'Error al vaciar carrito' });
        }
      }
    });
  }, [loadCarrito]);

  const handleProcederPago = useCallback(() => {
    if (!isAuthenticated) {
      setMensaje({
        tipo: 'warning',
        texto: 'Debes iniciar sesión para proceder al pago'
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    navigate('/checkout');
  }, [isAuthenticated, navigate]);

  const items = useMemo(() => carrito?.items || [], [carrito?.items]);
  const total = useMemo(() => Number.parseFloat(carrito?.resumen?.total || carrito?.total || 0), [carrito?.resumen?.total, carrito?.total]);

  const cerrarModal = useCallback(() => {
    setModalConfirmacion(prev => ({ ...prev, show: false }));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Cargando carrito..." />;
  }

  return (
    <Container className="py-4">
      <h1 className="carrito-title mb-4">
        <span className="bi bi-cart me-2" aria-hidden="true"></span>
        <span>Mi Carrito</span>
      </h1>

      {!isAuthenticated && (
        <Alert variant="info" className="carrito-alert-info mb-4">
          <span className="bi bi-info-circle me-2" aria-hidden="true"></span>
          <span>Puedes agregar productos sin iniciar sesión. Al momento de pagar deberás crear una cuenta o iniciar sesión.</span>
        </Alert>
      )}

      {/* Notificación flotante inferior izquierda siempre fija en la ventana */}
      <FloatingToast
        mensaje={mensaje}
        onClose={() => setMensaje({ tipo: '', texto: '' })}
      />

      {items.length === 0 ? (
        <CarritoVacio />
      ) : (
        <Row>
          <Col lg={8}>
            <Card className="carrito-card mb-4">
              <Card.Header className="carrito-card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Productos en tu carrito
                    <Badge className="carrito-badge ms-2">{items.length}</Badge>
                  </h5>
                  <Button
                    type="button"
                    variant="outline-danger"
                    className="btn-vaciar-carrito d-inline-flex align-items-center gap-1"
                    size="sm"
                    onClick={handleVaciarCarrito}
                  >
                    <SvgIcon name="trash" />
                    <span>Vaciar carrito</span>
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="carrito-table mb-0">
                  <thead className="carrito-table-header">
                    <tr>
                      <th scope="col">Producto</th>
                      <th scope="col" className="text-center">Precio</th>
                      <th scope="col" className="text-center">Cantidad</th>
                      <th scope="col" className="text-center">Subtotal</th>
                      <th scope="col" className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <ItemFilaCarrito
                        key={item.id}
                        item={item}
                        onAumentar={handleAumentarCantidad}
                        onDisminuir={handleDisminuirCantidad}
                        onInputChange={handleInputChange}
                        onInputBlur={handleInputBlur}
                        onEliminar={handleEliminar}
                      />
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <ResumenPedido
              total={total}
              isAuthenticated={isAuthenticated}
              onProcederPago={handleProcederPago}
            />
          </Col>
        </Row>
      )}

      {/* Estilos personalizados usando variables globales */}
      <style>{`
        .carrito-title {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 700;
        }
        .carrito-alert-info {
          border-radius: 0.75rem;
          background-color: #cfe2ff;
          border: none;
          color: #084298;
        }
        .carrito-empty-card, .carrito-card, .resumen-card {
          border-radius: 1.5rem;
          border: none;
          overflow: hidden;
          background: var(--bg, #ffffff);
          box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        }
        .carrito-card-header, .resumen-card-header {
          background: var(--bg-positiva, #DBE1ED);
          border-bottom: none;
          padding: 1rem 1.5rem;
          font-weight: 600;
          color: var(--bg-negativo, #192847);
        }
        .carrito-badge {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          color: var(--fnt-black, #000000);
          padding: 0.35rem 0.65rem;
          border-radius: 0.5rem;
        }
        .btn-vaciar-carrito {
          background: transparent;
          border: 1px solid var(--bs-gold, #f5c271);
          color: var(--bs-gold-dark, #c7984e);
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }
        .btn-vaciar-carrito:hover {
          background: var(--bs-gold, #f5c271);
          color: var(--fnt-black, #000000);
          transform: translateY(-1px);
        }
        .carrito-table {
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .carrito-table-header {
          background: var(--bg-positiva, #DBE1ED);
          color: var(--bg-negativo, #192847);
          font-weight: 700;
        }
        .carrito-table-header th {
          border-bottom: 2px solid #cbd5e1;
          padding: 0.95rem 1.15rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .carrito-table td {
          padding: 0.95rem 1.15rem;
          vertical-align: middle;
          font-size: 0.92rem;
        }
        .btn-cantidad {
          background: transparent;
          border: 1px solid var(--bs-gold, #f5c271);
          color: var(--bs-gold-dark, #c7984e);
          border-radius: 0.5rem;
          padding: 0.25rem 0.5rem;
          transition: all 0.2s ease;
        }
        .btn-cantidad:hover:not(:disabled) {
          background: var(--bs-gold, #f5c271);
          color: var(--fnt-black, #000000);
        }
        .btn-cantidad:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .cantidad-input {
          width: 54px;
          height: 34px;
          border: 1.5px solid #d1d5db;
          border-radius: 0.5rem;
          background: #ffffff;
          color: #192847;
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .cantidad-input:focus {
          border-color: #c7984e;
          box-shadow: 0 0 0 3px rgba(199, 152, 78, 0.2);
        }
        .cantidad-input::-webkit-outer-spin-button,
        .cantidad-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .cantidad-input[type=number] {
          -moz-appearance: textfield;
        }
        .btn-eliminar {
          background: transparent;
          border: 1px solid #dc3545;
          color: #dc3545;
          border-radius: 0.5rem;
          padding: 0.25rem 0.5rem;
          transition: all 0.2s ease;
        }
        .btn-eliminar:hover {
          background: #dc3545;
          color: white;
          transform: translateY(-1px);
        }
        .resumen-hr {
          background-color: var(--gray-300, #d1d5db);
          opacity: 0.5;
        }
        .resumen-total {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .btn-proceder-pago {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          border: none;
          border-radius: 0.75rem;
          padding: 0.75rem;
          font-weight: 600;
          color: var(--fnt-black, #000000);
          transition: all 0.3s ease;
        }
        .btn-proceder-pago:hover {
          background: linear-gradient(135deg, var(--bs-gold-dark, #c7984e), var(--bs-oldGold-bg, #916934));
          transform: translateY(-2px);
          box-shadow: 0 4px 15px 0 rgba(145, 105, 52, 0.3);
        }
        .btn-seguir-comprando {
          background: transparent;
          border: 2px solid var(--bs-gold, #f5c271);
          color: var(--bs-gold-dark, #c7984e);
          border-radius: 0.75rem;
          padding: 0.625rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-seguir-comprando:hover {
          background: var(--bs-gold, #f5c271);
          color: var(--fnt-black, #000000);
          transform: translateY(-2px);
        }
        .btn-ir-catalogo {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          border: none;
          border-radius: 0.75rem;
          padding: 0.625rem 1.5rem;
          font-weight: 600;
          color: var(--fnt-black, #000000);
          transition: all 0.3s ease;
        }
        .btn-ir-catalogo:hover {
          background: linear-gradient(135deg, var(--bs-gold-dark, #c7984e), var(--bs-oldGold-bg, #916934));
          transform: translateY(-2px);
        }
        .carrito-item-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
        }
        .modal-confirm-msg {
          max-width: 300px;
          margin: 0 auto;
        }
      `}</style>
      {/* Modal de Confirmación Compacto Estilo Gestor de Productos */}
      <ModalConfirmacionCarrito
        modalConfirmacion={modalConfirmacion}
        onHide={cerrarModal}
      />
    </Container>
  );
};

export default CarritoPage;