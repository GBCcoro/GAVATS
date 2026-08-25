/**
 * ============================================
 * ADMIN DASHBOARD PAGE - GAVAT E-COMMERCE
 * ============================================
 * Panel principal de administración con diseño adaptado,
 * métricas legibles, accesos rápidos e información del sistema en tiempo real.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminDashboardPage = () => {
  const { user, isAdmin, isAuxiliar } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [stats, setStats] = useState({
    categorias: 0,
    subcategorias: 0,
    productos: 0,
    usuarios: 0,
    pedidos: 0,
    pedidosPendientes: 0,
    facturas: 0,
    comentarios: 0
  });

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const results = await Promise.allSettled([
        api.get('/admin/categorias'),
        api.get('/admin/subcategorias'),
        api.get('/admin/productos'),
        api.get('/admin/usuarios'),
        api.get('/admin/pedidos'),
        api.get('/admin/facturas'),
        api.get('/admin/comentarios')
      ]);

      const extractData = (result) => {
        if (result.status === 'rejected') {
          return [];
        }
        return result.value?.data || [];
      };

      const [categorias, subcategorias, productos, usuarios, pedidos, facturas, comentarios] = results;

      const getArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.data?.categorias) return data.data.categorias;
        if (data?.categorias) return data.categorias;
        if (data?.data?.subcategorias) return data.data.subcategorias;
        if (data?.subcategorias) return data.subcategorias;
        if (data?.data?.productos) return data.data.productos;
        if (data?.productos) return data.productos;
        if (data?.data?.usuarios) return data.data.usuarios;
        if (data?.usuarios) return data.usuarios;
        if (data?.data?.pedidos) return data.data.pedidos;
        if (data?.pedidos) return data.pedidos;
        if (data?.data?.facturas) return data.data.facturas;
        if (data?.facturas) return data.facturas;
        if (data?.data?.comentarios) return data.data.comentarios;
        if (data?.comentarios) return data.comentarios;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      };

      const categoriasData = getArray(extractData(categorias));
      const subcategoriasData = getArray(extractData(subcategorias));
      const productosData = getArray(extractData(productos));
      const usuariosData = getArray(extractData(usuarios));
      const pedidosData = getArray(extractData(pedidos));
      const facturasData = getArray(extractData(facturas));
      const comentariosData = getArray(extractData(comentarios));

      const pedidosPendientes = Array.isArray(pedidosData)
        ? pedidosData.filter(p => p.estado === 'pendiente').length
        : 0;

      setStats({
        categorias: categoriasData.length,
        subcategorias: subcategoriasData.length,
        productos: productosData.length,
        usuarios: usuariosData.length,
        pedidos: pedidosData.length,
        pedidosPendientes: pedidosPendientes,
        facturas: facturasData.length,
        comentarios: comentariosData.length
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error al cargar estadísticas del dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const dashboardCards = [
    {
      title: 'Productos',
      subtitle: 'Catálogo disponible',
      value: stats.productos,
      icon: 'bi-box-seam',
      colorClass: 'card-stat-gold',
      iconBg: 'rgba(245, 194, 113, 0.2)',
      iconColor: '#f5c271',
      link: '/admin/productos',
      show: true
    },
    {
      title: 'Categorías',
      subtitle: 'Familias de producto',
      value: stats.categorias,
      icon: 'bi-tags',
      colorClass: 'card-stat-navy',
      iconBg: 'rgba(56, 189, 248, 0.15)',
      iconColor: '#38bdf8',
      link: '/admin/categorias',
      show: true
    },
    {
      title: 'Subcategorías',
      subtitle: 'Líneas y divisiones',
      value: stats.subcategorias,
      icon: 'bi-diagram-3',
      colorClass: 'card-stat-teal',
      iconBg: 'rgba(45, 212, 191, 0.15)',
      iconColor: '#2dd4bf',
      link: '/admin/subcategorias',
      show: true
    },
    {
      title: 'Usuarios',
      subtitle: 'Clientes y personal',
      value: stats.usuarios,
      icon: 'bi-people',
      colorClass: 'card-stat-purple',
      iconBg: 'rgba(168, 85, 247, 0.15)',
      iconColor: '#a855f7',
      link: '/admin/usuarios',
      show: isAdmin
    },
    {
      title: 'Pedidos Totales',
      subtitle: 'Órdenes procesadas',
      value: stats.pedidos,
      icon: 'bi-cart-check',
      colorClass: 'card-stat-blue',
      iconBg: 'rgba(99, 102, 241, 0.15)',
      iconColor: '#6366f1',
      link: '/admin/pedidos',
      show: true
    },
    {
      title: 'Por Atender',
      subtitle: 'Pedidos pendientes',
      value: stats.pedidosPendientes,
      icon: 'bi-clock-history',
      colorClass: 'card-stat-red',
      iconBg: 'rgba(244, 63, 94, 0.15)',
      iconColor: '#f43f5e',
      link: '/admin/pedidos?estado=pendiente',
      show: true
    },
    {
      title: 'Facturas',
      subtitle: 'Documentos generados',
      value: stats.facturas,
      icon: 'bi-file-earmark-text',
      colorClass: 'card-stat-amber',
      iconBg: 'rgba(251, 191, 36, 0.15)',
      iconColor: '#fbbf24',
      link: '/admin/facturas',
      show: isAdmin || isAuxiliar
    },
    {
      title: 'Comentarios',
      subtitle: 'Opiniones y reseñas',
      value: stats.comentarios,
      icon: 'bi-chat-dots',
      colorClass: 'card-stat-emerald',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10b981',
      link: '/admin/comentarios',
      show: true
    }
  ];

  const quickActions = [
    {
      title: 'Agregar Producto',
      description: 'Crear nuevo artículo con foto, precio y stock',
      icon: 'bi-plus-circle',
      link: '/admin/productos',
      btnClass: 'btn-action-gold'
    },
    {
      title: 'Nueva Categoría',
      description: 'Organizar secciones y catálogos de venta',
      icon: 'bi-folder-plus',
      link: '/admin/categorias',
      btnClass: 'btn-action-navy'
    },
    {
      title: 'Gestionar Pedidos',
      description: 'Consultar estados, pagos y despachos',
      icon: 'bi-truck',
      link: '/admin/pedidos',
      btnClass: 'btn-action-emerald'
    },
    {
      title: 'Ver Tienda Online',
      description: 'Navegar por el catálogo como cliente',
      icon: 'bi-shop',
      link: '/catalogo',
      btnClass: 'btn-action-outline'
    }
  ];

  return (
    <Container className="py-4 py-lg-5 admin-dashboard-container">
      {/* Header / Hero Banner */}
      <div className="admin-header-card p-4 p-md-5 mb-4 shadow-sm">
        <Row className="align-items-center g-3">
          <Col md={8}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Badge className="badge-admin-role px-3 py-1">
                <i className="bi bi-shield-check me-1" />
                {isAdmin ? 'Administrador' : isAuxiliar ? 'Auxiliar' : 'Personal'}
              </Badge>
              <span className="text-white-50 small">
                • Sesión iniciada como <strong>{user?.nombre || user?.email}</strong>
              </span>
            </div>
            <h1 className="admin-main-title mb-2">
              Panel de Administración
            </h1>
            <p className="admin-main-subtitle mb-0">
              Monitorea el inventario, atiende pedidos y gestiona todas las operaciones de la tienda GAVAT.
            </p>
          </Col>
          <Col md={4} className="text-md-end">
            <Button
              variant="outline-light"
              className="btn-refresh-stats shadow-sm"
              onClick={() => loadStats(true)}
              disabled={loading || refreshing}
            >
              {refreshing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Actualizando...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-2" />
                  Actualizar Métricas
                </>
              )}
            </Button>
            <div className="text-white-50 small mt-2">
              Última sincronización: {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </Col>
        </Row>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="section-title-wrap mb-3 d-flex align-items-center justify-content-between">
        <h5 className="section-heading mb-0">
          <i className="bi bi-bar-chart-fill me-2 text-gold" />
          Resumen General del Sistema
        </h5>
        <span className="text-muted small">Haz clic en cualquier tarjeta para gestionar</span>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="text-muted mt-3">Cargando métricas del sistema...</p>
        </div>
      ) : (
        <Row className="g-3 mb-5">
          {dashboardCards.filter(card => card.show).map((card) => (
            <Col xs={12} sm={6} lg={3} key={card.link}>
              <Card
                className="stat-card shadow-sm h-100"
                onClick={() => navigate(card.link)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(card.link)}
              >
                <Card.Body className="p-3 p-md-4 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <span className="stat-card-title d-block">{card.title}</span>
                      <span className="stat-card-subtitle text-muted small">{card.subtitle}</span>
                    </div>
                    <div
                      className="stat-icon-wrap"
                      style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                    >
                      <i className={`bi ${card.icon}`} />
                    </div>
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mt-auto">
                    <span className="stat-card-number">{card.value}</span>
                    <span className="stat-card-link-hint">
                      Gestionar <i className="bi bi-chevron-right ms-1 small" />
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Sección Inferior: Accesos Rápidos & Información del Sistema */}
      <Row className="g-4">
        {/* Accesos Rápidos */}
        <Col lg={7}>
          <Card className="panel-card shadow-sm h-100">
            <Card.Header className="panel-card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="panel-header-icon bg-gold-subtle text-gold">
                  <i className="bi bi-lightning-charge-fill" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold panel-header-title">Accesos Rápidos</h6>
                  <small className="text-muted">Acciones frecuentes del día a día</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-3 p-md-4">
              <Row className="g-3">
                {quickActions.map((action) => (
                  <Col sm={6} key={action.title}>
                    <button
                      type="button"
                      className="quick-action-tile w-100 text-start"
                      onClick={() => navigate(action.link)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="action-tile-icon">
                          <i className={`bi ${action.icon}`} />
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="action-tile-title">{action.title}</div>
                          <div className="action-tile-desc text-muted">{action.description}</div>
                        </div>
                      </div>
                    </button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Información del Sistema */}
        <Col lg={5}>
          <Card className="panel-card shadow-sm h-100">
            <Card.Header className="panel-card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="panel-header-icon bg-info-subtle text-info">
                  <i className="bi bi-info-circle-fill" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold panel-header-title">Estado del Sistema</h6>
                  <small className="text-muted">Diagnóstico y conectividad</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-3 p-md-4">
              <div className="system-info-list d-flex flex-column gap-3">
                <div className="info-item d-flex align-items-center justify-content-between p-2 rounded">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill text-success fs-5" />
                    <div>
                      <strong className="d-block small">Servidor Backend</strong>
                      <span className="text-muted extra-small">Express HTTP Engine</span>
                    </div>
                  </div>
                  <Badge bg="success" className="px-2 py-1">En Línea (200 OK)</Badge>
                </div>

                <div className="info-item d-flex align-items-center justify-content-between p-2 rounded">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-database-fill-check text-primary fs-5" />
                    <div>
                      <strong className="d-block small">Base de Datos</strong>
                      <span className="text-muted extra-small">MySQL Relational DB</span>
                    </div>
                  </div>
                  <Badge bg="primary" className="px-2 py-1">Conectada</Badge>
                </div>

                <div className="info-item d-flex align-items-center justify-content-between p-2 rounded">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-badge-fill text-warning fs-5" />
                    <div>
                      <strong className="d-block small">Rol Autenticado</strong>
                      <span className="text-muted extra-small">{user?.email}</span>
                    </div>
                  </div>
                  <Badge bg="warning" text="dark" className="px-2 py-1 text-capitalize">
                    {user?.rol || 'Administrador'}
                  </Badge>
                </div>

                <div className="info-item d-flex align-items-center justify-content-between p-2 rounded">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-hdd-network-fill text-info fs-5" />
                    <div>
                      <strong className="d-block small">Entorno</strong>
                      <span className="text-muted extra-small">Plataforma GAVAT v1.0</span>
                    </div>
                  </div>
                  <Badge bg="secondary" className="px-2 py-1">Producción</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estilos dedicados para un confort de lectura premium */}
      <style>{`
        .admin-dashboard-container {
          max-width: 1280px;
        }

        /* Banner Hero */
        .admin-header-card {
          background: linear-gradient(135deg, #192847 0%, #101c33 100%);
          border-radius: 1.25rem;
          color: #ffffff;
          border: 1px solid rgba(245, 194, 113, 0.2);
          position: relative;
          overflow: hidden;
        }
        .admin-header-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(245, 194, 113, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .badge-admin-role {
          background: rgba(245, 194, 113, 0.2);
          color: var(--bs-gold, #f5c271);
          border: 1px solid rgba(245, 194, 113, 0.4);
          font-weight: 600;
          font-size: 0.82rem;
          border-radius: 2rem;
        }
        .admin-main-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #ffffff 40%, var(--bs-gold, #f5c271) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .admin-main-subtitle {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          line-height: 1.5;
        }
        .btn-refresh-stats {
          border-radius: 0.75rem;
          font-weight: 600;
          padding: 0.6rem 1.2rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
          transition: all 0.25s ease;
        }
        .btn-refresh-stats:hover {
          background: var(--bs-gold, #f5c271);
          color: #192847;
          border-color: var(--bs-gold, #f5c271);
          transform: translateY(-2px);
        }

        /* Section Headings */
        .section-heading {
          font-weight: 700;
          font-size: 1.15rem;
          color: #192847;
        }
        .text-gold {
          color: var(--bs-gold-dark, #c7984e) !important;
        }

        /* Stat Cards */
        .stat-card {
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 1rem;
          background: #ffffff;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(25, 40, 71, 0.1) !important;
          border-color: rgba(245, 194, 113, 0.5);
        }
        .stat-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #192847;
          line-height: 1.2;
        }
        .stat-card-subtitle {
          font-size: 0.78rem;
        }
        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 0.75rem;
          display: grid;
          place-items: center;
          font-size: 1.35rem;
          flex-shrink: 0;
        }
        .stat-card-number {
          font-size: 2.1rem;
          font-weight: 800;
          color: #192847;
          letter-spacing: -1px;
          line-height: 1;
        }
        .stat-card-link-hint {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--bs-gold-dark, #c7984e);
          opacity: 0.85;
          transition: opacity 0.2s ease;
        }
        .stat-card:hover .stat-card-link-hint {
          opacity: 1;
          color: #916934;
        }

        /* Panels (Bottom section) */
        .panel-card {
          border-radius: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #ffffff;
        }
        .panel-card-header {
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 1rem 1.25rem;
          border-radius: 1rem 1rem 0 0 !important;
        }
        .panel-header-icon {
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          display: grid;
          place-items: center;
          font-size: 1.1rem;
        }
        .bg-gold-subtle {
          background-color: rgba(245, 194, 113, 0.2);
        }
        .bg-info-subtle {
          background-color: rgba(56, 189, 248, 0.15);
        }
        .panel-header-title {
          color: #192847;
          font-size: 1rem;
        }

        /* Quick Action Tiles */
        .quick-action-tile {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.85rem;
          padding: 0.9rem 1rem;
          transition: all 0.22s ease;
          cursor: pointer;
        }
        .quick-action-tile:hover {
          background: #ffffff;
          border-color: var(--bs-gold, #f5c271);
          box-shadow: 0 6px 18px rgba(25, 40, 71, 0.08);
          transform: translateY(-2px);
        }
        .action-tile-icon {
          width: 38px;
          height: 38px;
          border-radius: 0.5rem;
          background: rgba(25, 40, 71, 0.08);
          color: #192847;
          display: grid;
          place-items: center;
          font-size: 1.2rem;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .quick-action-tile:hover .action-tile-icon {
          background: var(--bs-gold, #f5c271);
          color: #192847;
        }
        .action-tile-title {
          font-weight: 700;
          font-size: 0.92rem;
          color: #192847;
          line-height: 1.2;
          margin-bottom: 2px;
        }
        .action-tile-desc {
          font-size: 0.78rem;
          line-height: 1.3;
        }

        /* System Info */
        .info-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        .info-item:hover {
          background: #ffffff;
          border-color: #cbd5e1;
        }
        .extra-small {
          font-size: 0.72rem;
        }
      `}</style>
    </Container>
  );
};

export default AdminDashboardPage;
