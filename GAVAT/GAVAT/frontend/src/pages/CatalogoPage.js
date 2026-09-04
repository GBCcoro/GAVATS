/**
 * ============================================
 * CATALOGO PAGE - Estilo Prémium GAVAT
 * ============================================
 * Catálogo con los filtros originales de la plataforma:
 * - Búsqueda por nombre de producto / descripción
 * - Filtrado por Categoría
 * - Filtrado por Subcategoría
 * - Botón claro para Limpiar Filtros
 * Botones con diseño UI/UX de alta visibilidad y comprensión.
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import catalogoService from '../services/catalogoService';
import carritoService from '../services/carritoService';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FloatingToast from '../components/FloatingToast';

const CatalogoPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '', accion: null });
  const [paginacion, setPaginacion] = useState({ total: 0, pagina: 1, totalPaginas: 1 });
  const debounceRef = useRef(null);
  const isInitialMount = useRef(true);

  // Filtros originales de la plataforma
  const [filtros, setFiltros] = useState({
    categoriaId: '',
    subcategoriaId: '',
    buscar: '',
    pagina: 1,
  });

  const fetchProductos = useCallback(async (filtrosActuales) => {
    setLoading(true);
    try {
      const queryParams = {
        ...filtrosActuales,
        buscar: (filtrosActuales.buscar || '').trim()
      };
      const response = await catalogoService.getProductos(queryParams);
      const payload = response.data || response;
      const data = payload.data || payload;
      setProductos(data.productos || []);
      setPaginacion(data.paginacion || { total: 0, pagina: 1, totalPaginas: 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los productos del catálogo' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategorias = useCallback(async () => {
    try {
      const response = await catalogoService.getCategorias();
      setCategorias(response.data?.categorias || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  const loadSubcategorias = useCallback(async (categoriaId) => {
    try {
      const response = await catalogoService.getSubcategoriasPorCategoria(categoriaId);
      setSubcategorias(response.data?.subcategorias || []);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  // Búsqueda con debounce al tipear en el input
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const delay = filtros.buscar && !isInitialMount.current ? 350 : 0;

    debounceRef.current = setTimeout(() => {
      fetchProductos(filtros);
      isInitialMount.current = false;
    }, delay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filtros, fetchProductos]);

  // Cargar subcategorías al cambiar categoría
  useEffect(() => {
    if (filtros.categoriaId) {
      loadSubcategorias(filtros.categoriaId);
    } else {
      setSubcategorias([]);
      setFiltros(prevFiltros => ({ ...prevFiltros, subcategoriaId: '', pagina: 1 }));
    }
  }, [filtros.categoriaId, loadSubcategorias]);

  const handleFiltroChange = useCallback((e) => {
    const { name, value } = e.target;
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      [name]: value,
      pagina: 1,
    }));
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      categoriaId: '',
      subcategoriaId: '',
      buscar: '',
      pagina: 1,
    });
  }, []);

  const handlePageChange = useCallback((nuevaPagina) => {
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      pagina: nuevaPagina
    }));
  }, []);

  const handleSubmitBusqueda = (e) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    fetchProductos(filtros);
  };

  // Limpiar mensaje flotante automáticamente
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '', accion: null });
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleAddToCart = useCallback(async (producto) => {
    try {
      await carritoService.agregarAlCarrito(producto.id, 1, producto);
      setMensaje({
        tipo: 'success',
        texto: `Producto "${producto.nombre}" agregado al carrito exitosamente`,
        accion: { texto: 'Ver Carrito', url: '/carrito' }
      });
    } catch (error) {
      setMensaje({
        tipo: 'danger',
        texto: error.message || 'Error al agregar el producto al carrito',
        accion: null
      });
    }
  }, []);

  // Nombres de filtros para los chips activos
  const categoriaActiva = useMemo(() => {
    return categorias.find(c => String(c.id) === String(filtros.categoriaId));
  }, [categorias, filtros.categoriaId]);

  const subcategoriaActiva = useMemo(() => {
    return subcategorias.find(s => String(s.id) === String(filtros.subcategoriaId));
  }, [subcategorias, filtros.subcategoriaId]);

  const hayFiltrosActivos = Boolean(filtros.buscar || filtros.categoriaId || filtros.subcategoriaId);

  return (
    <div className="catalogo-page-wrapper py-4 py-lg-5">
      <Container>
        {/* Notificación flotante fija en esquina inferior izquierda */}
        <FloatingToast
          mensaje={mensaje}
          onClose={() => setMensaje({ tipo: '', texto: '', accion: null })}
        />

        {/* ========================================================================= */}
        {/* ENCABEZADO DEL CATÁLOGO                                                  */}
        {/* ========================================================================= */}
        <div className="catalogo-header-card p-4 rounded-4 shadow-sm mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge-icono-dorado">
                  <i className="bi bi-grid-fill" />
                </span>
                <h1 className="catalogo-main-title mb-0 fs-2 fw-bold text-navy">
                  Catálogo de Productos
                </h1>
              </div>
              <p className="text-muted small mb-0 ps-1">
                Explora nuestro catálogo de ventanería, canceles, perfiles de aluminio y accesorios.
              </p>
            </div>

            <div className="text-md-end">
              <span className="badge-total-productos">
                <i className="bi bi-box-seam me-1 text-gold" />
                <strong>{paginacion.total}</strong> productos disponibles
              </span>
            </div>
          </div>
        </div>

        {/* Chips de filtros activos para remover con un clic */}
        {hayFiltrosActivos && (
          <div className="filtros-activos-container d-flex flex-wrap align-items-center gap-2 mb-4 p-3 bg-white rounded-3 border shadow-sm">
            <div className="d-flex align-items-center gap-2 me-1">
              <i className="bi bi-funnel-fill text-gold fs-5" />
              <span className="fw-bold text-navy small">Filtros activos:</span>
            </div>
            {filtros.buscar && (
              <button
                type="button"
                className="btn-chip-filtro"
                onClick={() => setFiltros(f => ({ ...f, buscar: '', pagina: 1 }))}
                title="Haz clic para quitar este filtro de búsqueda"
              >
                <span className="chip-label">Texto:</span>
                <strong className="chip-valor">"{filtros.buscar}"</strong>
                <i className="bi bi-x-circle-fill chip-icon-x" />
              </button>
            )}
            {categoriaActiva && (
              <button
                type="button"
                className="btn-chip-filtro"
                onClick={() => setFiltros(f => ({ ...f, categoriaId: '', subcategoriaId: '', pagina: 1 }))}
                title="Haz clic para quitar este filtro de categoría"
              >
                <span className="chip-label">Categoría:</span>
                <strong className="chip-valor">{categoriaActiva.nombre}</strong>
                <i className="bi bi-x-circle-fill chip-icon-x" />
              </button>
            )}
            {subcategoriaActiva && (
              <button
                type="button"
                className="btn-chip-filtro"
                onClick={() => setFiltros(f => ({ ...f, subcategoriaId: '', pagina: 1 }))}
                title="Haz clic para quitar este filtro de subcategoría"
              >
                <span className="chip-label">Subcategoría:</span>
                <strong className="chip-valor">{subcategoriaActiva.nombre}</strong>
                <i className="bi bi-x-circle-fill chip-icon-x" />
              </button>
            )}
            <Button
              type="button"
              className="btn-borrar-todos ms-auto"
              onClick={handleLimpiarFiltros}
              title="Eliminar todos los filtros aplicados"
            >
              <i className="bi bi-trash3-fill me-1" />
              <span>Borrar todos los filtros</span>
            </Button>
          </div>
        )}

        <Row className="g-4">
          {/* ========================================================================= */}
          {/* SIDEBAR DE FILTROS (Filtros de antes)                                     */}
          {/* ========================================================================= */}
          <Col lg={3}>
            <div className="catalogo-sidebar-card shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="catalogo-sidebar-header d-flex align-items-center justify-content-between p-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-funnel-fill text-gold fs-5" />
                  <span className="fw-bold text-navy">Filtros</span>
                </div>
                {hayFiltrosActivos && (
                  <span className="badge bg-danger text-white rounded-pill px-2 py-1 small">
                    Filtros activos
                  </span>
                )}
              </div>

              <div className="p-3 p-md-4 bg-white">
                <Form onSubmit={handleSubmitBusqueda}>
                  {/* Filtro 1: Búsqueda por Nombre / Texto */}
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-navy mb-1">
                      Buscar producto
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-gold">
                        <i className="bi bi-search" />
                      </span>
                      <Form.Control
                        type="text"
                        name="buscar"
                        placeholder="Nombre o descripción..."
                        value={filtros.buscar}
                        onChange={handleFiltroChange}
                        className={`catalogo-input border-start-0 ${filtros.buscar ? 'border-end-0' : ''}`}
                      />
                      {filtros.buscar && (
                        <Button
                          variant="light"
                          className="input-group-text bg-white border-start-0 text-muted"
                          onClick={() => setFiltros(f => ({ ...f, buscar: '', pagina: 1 }))}
                          title="Borrar texto"
                        >
                          <i className="bi bi-x-lg small" />
                        </Button>
                      )}
                    </div>
                    <Form.Text className="text-muted small">
                      Presiona Enter o escribe para filtrar al instante.
                    </Form.Text>
                  </Form.Group>

                  {/* Filtro 2: Categoría */}
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-navy mb-1">
                      Categoría
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-gold">
                        <i className="bi bi-collection" />
                      </span>
                      <Form.Select
                        name="categoriaId"
                        value={filtros.categoriaId}
                        onChange={handleFiltroChange}
                        className="catalogo-input border-start-0"
                      >
                        <option value="">Todas las categorías</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </Form.Group>

                  {/* Filtro 3: Subcategoría (visible al seleccionar categoría) */}
                  {subcategorias.length > 0 && (
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold text-navy mb-1">
                        Subcategoría
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-gold">
                          <i className="bi bi-tags" />
                        </span>
                        <Form.Select
                          name="subcategoriaId"
                          value={filtros.subcategoriaId}
                          onChange={handleFiltroChange}
                          className="catalogo-input border-start-0"
                        >
                          <option value="">Todas las subcategorías</option>
                          {subcategorias.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    </Form.Group>
                  )}

                  {/* Botón 1: Aplicar Filtros con excelente contraste */}
                  <Button
                    type="submit"
                    className="btn-aplicar-filtros w-100 py-2 px-3 mb-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  >
                    <i className="bi bi-search fs-6 text-gold" />
                    <span>Filtrar Productos</span>
                  </Button>

                  {/* Botón 2: Borrar Filtros con alto contraste, padding generoso y texto visible */}
                  {hayFiltrosActivos && (
                    <Button
                      type="button"
                      className="btn-limpiar-filtros w-100 py-2 px-3 d-flex align-items-center justify-content-center gap-2 fw-bold"
                      onClick={handleLimpiarFiltros}
                    >
                      <i className="bi bi-arrow-counterclockwise fs-5" />
                      <span>Borrar Filtros</span>
                    </Button>
                  )}
                </Form>
              </div>
            </div>

            {/* Tarjeta de soporte / medidas */}
            <div className="catalogo-sidebar-banner p-3 p-md-4 rounded-4 shadow-sm text-center">
              <i className="bi bi-shield-check text-gold fs-2 d-block mb-2" />
              <h6 className="fw-bold text-navy mb-1">Garantía GAVAT</h6>
              <p className="text-muted small mb-0">
                Todos nuestros productos en aluminio y ventanería cuentan con certificación y soporte de fábrica.
              </p>
            </div>
          </Col>

          {/* ========================================================================= */}
          {/* GRID DE PRODUCTOS                                                        */}
          {/* ========================================================================= */}
          <Col lg={9}>
            {loading ? (
              <div className="py-5 text-center bg-white rounded-4 border shadow-sm">
                <LoadingSpinner message="Cargando productos..." />
              </div>
            ) : productos.length > 0 ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                  <span className="small text-muted">
                    Mostrando <strong>{productos.length}</strong> de <strong>{paginacion.total}</strong> productos
                  </span>
                  <span className="small text-muted">
                    Página <strong>{paginacion.pagina}</strong> de <strong>{paginacion.totalPaginas}</strong>
                  </span>
                </div>

                <Row className="g-4 mb-4">
                  {productos.map((producto) => (
                    <Col key={producto.id} sm={6} lg={4}>
                      <ProductCard
                        producto={producto}
                        onAddToCart={handleAddToCart}
                      />
                    </Col>
                  ))}
                </Row>

                {/* ========================================================================= */}
                {/* PAGINACIÓN CON BOTONES CLAROS Y VISIBLES                                 */}
                {/* ========================================================================= */}
                {paginacion.totalPaginas > 1 && (
                  <div className="catalogo-pagination-card p-3 rounded-4 bg-white border shadow-sm d-flex flex-wrap align-items-center justify-content-center gap-2 mt-4">
                    <Button
                      className="btn-pag-nav d-flex align-items-center gap-1"
                      disabled={paginacion.pagina === 1}
                      onClick={() => handlePageChange(paginacion.pagina - 1)}
                    >
                      <i className="bi bi-chevron-left" />
                      <span>Anterior</span>
                    </Button>

                    <div className="d-flex align-items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(5, paginacion.totalPaginas) }, (_, i) => {
                        let pageNum;
                        if (paginacion.totalPaginas <= 5) {
                          pageNum = i + 1;
                        } else if (paginacion.pagina <= 3) {
                          pageNum = i + 1;
                        } else if (paginacion.pagina >= paginacion.totalPaginas - 2) {
                          pageNum = paginacion.totalPaginas - 4 + i;
                        } else {
                          pageNum = paginacion.pagina - 2 + i;
                        }

                        const esActiva = paginacion.pagina === pageNum;
                        return (
                          <Button
                            key={pageNum}
                            className={`btn-pag-num ${esActiva ? 'btn-pag-num-active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      className="btn-pag-nav d-flex align-items-center gap-1"
                      disabled={paginacion.pagina === paginacion.totalPaginas}
                      onClick={() => handlePageChange(paginacion.pagina + 1)}
                    >
                      <span>Siguiente</span>
                      <i className="bi bi-chevron-right" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* ESTADO VACÍO (EMPTY STATE) CON BOTÓN CLARO */
              <div className="text-center py-5 px-4 bg-white rounded-4 border shadow-sm">
                <div className="empty-icon-circle mx-auto mb-3">
                  <i className="bi bi-search fs-2 text-gold" />
                </div>
                <h4 className="fw-bold text-navy mb-2">No se encontraron productos</h4>
                <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                  {filtros.buscar
                    ? `No existen productos que coincidan con la búsqueda "${filtros.buscar}".`
                    : 'No hay productos disponibles para los filtros seleccionados.'}
                </p>
                <Button
                  className="btn-hero-gold px-4 py-2 d-inline-flex align-items-center gap-2"
                  onClick={handleLimpiarFiltros}
                >
                  <i className="bi bi-arrow-counterclockwise" />
                  <span>Restablecer filtros</span>
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* ========================================================================= */}
      {/* ESTILOS DE LA PÁGINA (Alta visibilidad, contraste y UX entendible)        */}
      {/* ========================================================================= */}
      <style>{`
        .catalogo-page-wrapper {
          background-color: #f8fafc;
          min-height: calc(100vh - 180px);
        }
        .catalogo-header-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .badge-icono-dorado {
          width: 36px;
          height: 36px;
          border-radius: 0.6rem;
          background: linear-gradient(135deg, rgba(245, 194, 113, 0.25) 0%, rgba(199, 152, 78, 0.25) 100%);
          color: #c7984e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
        }
        .catalogo-main-title {
          letter-spacing: -0.3px;
        }
        .badge-total-productos {
          background: #f1f5f9;
          color: #192847;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.88rem;
          display: inline-flex;
          align-items: center;
        }
        .catalogo-input {
          border-radius: 0.65rem;
          border: 1.5px solid #d1d5db;
          font-size: 0.92rem;
          padding: 0.55rem 0.75rem;
          transition: all 0.2s ease;
          color: #192847;
        }
        .catalogo-input:focus {
          border-color: #c7984e !important;
          box-shadow: 0 0 0 3px rgba(199, 152, 78, 0.2) !important;
        }
        /* Chips interactivos de filtros con padding generoso */
        .btn-chip-filtro {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          color: #192847;
          border-radius: 9999px;
          padding: 0.5rem 1rem;
          font-size: 0.88rem;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
        }
        .btn-chip-filtro:hover {
          background: #fee2e2;
          border-color: #ef4444;
          color: #991b1b;
          transform: translateY(-1px);
        }
        .chip-label {
          color: #64748b;
          font-size: 0.82rem;
        }
        .chip-valor {
          color: #192847;
        }
        .chip-icon-x {
          color: #ef4444;
          font-size: 1.05rem;
          transition: transform 0.2s ease;
        }
        .btn-chip-filtro:hover .chip-icon-x {
          transform: scale(1.2);
        }

        /* Botón borrar todos los filtros con padding y contraste */
        .btn-borrar-todos {
          background: #fee2e2 !important;
          border: 1.5px solid #fca5a5 !important;
          color: #b91c1c !important;
          font-weight: 700 !important;
          font-size: 0.85rem !important;
          padding: 0.5rem 1.15rem !important;
          border-radius: 9999px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.35rem !important;
          transition: all 0.2s ease !important;
        }
        .btn-borrar-todos:hover {
          background: #ef4444 !important;
          border-color: #dc2626 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
          transform: translateY(-1px);
        }

        .catalogo-sidebar-card {
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #ffffff;
        }
        .catalogo-sidebar-header {
          background: var(--bg-positiva, #DBE1ED);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        /* Botón Aplicar Filtros: Fondo Azul Marino profundo con texto blanco y acento dorado */
        .btn-aplicar-filtros {
          background: #192847 !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 0.85rem !important;
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          padding: 0.75rem 1.25rem !important;
          transition: all 0.2s ease !important;
        }
        .btn-aplicar-filtros:hover {
          background: #0f1a30 !important;
          color: #f5c271 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(25, 40, 71, 0.25) !important;
        }

        /* Botón Borrar Filtros: Borde y texto rojo de alto contraste con padding visible */
        .btn-limpiar-filtros {
          background: #ffffff !important;
          border: 2px solid #ef4444 !important;
          color: #dc2626 !important;
          border-radius: 0.85rem !important;
          font-size: 0.92rem !important;
          font-weight: 700 !important;
          padding: 0.65rem 1.25rem !important;
          transition: all 0.2s ease !important;
        }
        .btn-limpiar-filtros:hover {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3) !important;
          transform: translateY(-1px);
        }

        .catalogo-sidebar-banner {
          background: linear-gradient(135deg, #ffffff 0%, #fbf8f2 100%);
          border: 1px solid rgba(197, 151, 74, 0.25);
        }

        /* Botones de paginación visibles y claros */
        .btn-pag-nav {
          border-radius: 0.65rem !important;
          font-size: 0.9rem !important;
          padding: 0.5rem 1rem !important;
          font-weight: 600 !important;
          border: 1.5px solid #cbd5e1 !important;
          background: #ffffff !important;
          color: #192847 !important;
          transition: all 0.2s ease !important;
        }
        .btn-pag-nav:hover:not(:disabled) {
          border-color: #c7984e !important;
          color: #8F6A34 !important;
          background: #fbf8f2 !important;
          transform: translateY(-1px);
        }
        .btn-pag-nav:disabled {
          opacity: 0.45 !important;
          cursor: not-allowed !important;
        }

        .btn-pag-num {
          background: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          color: #192847 !important;
          border-radius: 0.65rem !important;
          min-width: 40px !important;
          height: 40px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-weight: 700 !important;
          font-size: 0.92rem !important;
          transition: all 0.2s ease !important;
        }
        .btn-pag-num:hover {
          border-color: #c7984e !important;
          color: #8F6A34 !important;
          background: #fbf8f2 !important;
        }
        .btn-pag-num-active {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%) !important;
          border-color: #c7984e !important;
          color: #192847 !important;
          font-weight: 800 !important;
          box-shadow: 0 4px 12px rgba(199, 152, 78, 0.35) !important;
        }

        .empty-icon-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(199, 152, 78, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-hero-gold {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%) !important;
          color: #192847 !important;
          border: none !important;
          border-radius: 0.75rem !important;
          font-weight: 700 !important;
          transition: all 0.25s ease !important;
          box-shadow: 0 6px 18px rgba(199, 152, 78, 0.25) !important;
        }
        .btn-hero-gold:hover {
          background: linear-gradient(135deg, #c7984e 0%, #f5c271 100%) !important;
          color: #192847 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 22px rgba(199, 152, 78, 0.35) !important;
        }
      `}</style>
    </div>
  );
};

export default CatalogoPage;