/**
 * ============================================
 * HOME PAGE - Estilo Prémium GAVAT
 * ============================================
 * Página principal armonizada con la paleta de la plataforma:
 * Azul Marino (#192847), Acentos Dorados (#f5c271 / #c7984e)
 * y componentes visuales refinados.
 */

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadProductosDestacados();
  }, []);

  const loadProductosDestacados = async () => {
    try {
      const response = await catalogoService.getProductosDestacados();
      const payload = response.data || response;
      const data = payload.data || payload;
      setProductos((data.productos || []).slice(0, 4));
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page-wrapper">
      {/* ========================================================================= */}
      {/* HERO SECTION: Azul Marino profundo con halos dorados                      */}
      {/* ========================================================================= */}
      <section className="hero-section text-white py-5 position-relative overflow-hidden">
        <div className="hero-radial-glow hero-glow-1" />
        <div className="hero-radial-glow hero-glow-2" />

        <Container className="position-relative z-1 py-4 py-lg-5">
          <Row className="align-items-center gx-5 gy-4">
            <Col lg={7} className="text-center text-lg-start">
              <div className="hero-badge d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill">
                <i className="bi bi-stars text-gold" />
                <span className="small fw-semibold text-light">Innovación & Calidad Arquitectónica</span>
              </div>

              <h1 className="hero-title display-4 fw-bold mb-3">
                Bienvenidos a <span className="hero-title-gold">GAVAT</span>
              </h1>

              <p className="hero-lead lead text-light opacity-90 mb-4" style={{ maxWidth: '580px' }}>
                Especialistas en soluciones arquitectónicas de alta precisión: ventanería, perfiles en aluminio, cancelería y vidrio templado con acabados prémium y despacho seguro.
              </p>

              <div className="hero-actions d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start mb-4 pb-2">
                <Link to="/catalogo" className="btn btn-hero-gold d-inline-flex align-items-center gap-2 px-4 py-3">
                  <i className="bi bi-grid-fill" />
                  <span>Explorar Catálogo</span>
                </Link>

                {!isAuthenticated ? (
                  <Link to="/register" className="btn btn-hero-outline d-inline-flex align-items-center gap-2 px-4 py-3">
                    <i className="bi bi-person-plus" />
                    <span>Crear Cuenta</span>
                  </Link>
                ) : (
                  <Link to="/mis-pedidos" className="btn btn-hero-outline d-inline-flex align-items-center gap-2 px-4 py-3">
                    <i className="bi bi-box-seam" />
                    <span>Mis Pedidos</span>
                  </Link>
                )}
              </div>

              {/* Estadísticas en Glassmorphism */}
              <Row className="g-3 pt-2">
                <Col xs={4}>
                  <div className="hero-metric-card p-3 rounded-3 text-center text-lg-start">
                    <h3 className="fw-bold mb-0 text-gold">+1,200</h3>
                    <p className="text-light opacity-75 small mb-0">Productos en Stock</p>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="hero-metric-card p-3 rounded-3 text-center text-lg-start">
                    <h3 className="fw-bold mb-0 text-gold">100%</h3>
                    <p className="text-light opacity-75 small mb-0">Garantía Directa</p>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="hero-metric-card p-3 rounded-3 text-center text-lg-start">
                    <h3 className="fw-bold mb-0 text-gold">Nacional</h3>
                    <p className="text-light opacity-75 small mb-0">Despacho Seguro</p>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col lg={5} className="text-center">
              <div className="hero-visual-wrapper mx-auto">
                <div className="hero-logo-halo">
                  <img
                    src="/assests/icons/logo-gavat-navbar.png"
                    alt="GAVAT Logo"
                    className="hero-logo-img"
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN DE PRODUCTOS DESTACADOS                                          */}
      {/* ========================================================================= */}
      <Container className="py-5">
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4 pb-2 border-bottom">
          <div>
            <span className="eyebrow-badge d-inline-flex align-items-center gap-1 text-gold fw-bold text-uppercase small mb-1">
              <i className="bi bi-award-fill" /> Colección Destacada
            </span>
            <h2 className="fw-bold text-navy mb-1 fs-2">
              Soluciones Arquitectónicas Populares
            </h2>
            <p className="text-muted small mb-0">
              Perfiles, ventanas y accesorios con mayor preferencia por nuestros clientes.
            </p>
          </div>
          <Link to="/catalogo" className="btn-link-catalogo d-inline-flex align-items-center gap-2 mt-3 mt-md-0 fw-semibold">
            <span>Ver catálogo completo</span>
            <i className="bi bi-arrow-right" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando productos destacados..." />
        ) : (
          <Row className="g-4 mb-5">
            {productos.length > 0 ? (
              productos.map((producto, index) => (
                <Col key={producto.id} sm={6} lg={3}>
                  <div className="card-preview-anim" style={{ animationDelay: `${index * 0.1}s` }}>
                    <ProductCard producto={producto} showActions={true} />
                  </div>
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <div className="text-center py-5 bg-white rounded-4 border">
                  <i className="bi bi-inbox fs-1 text-muted d-block mb-2" />
                  <p className="text-muted mb-0">No hay productos destacados disponibles en este momento</p>
                </div>
              </Col>
            )}
          </Row>
        )}

        {/* ========================================================================= */}
        {/* VALORES DE MARCA / CARACTERÍSTICAS                                       */}
        {/* ========================================================================= */}
        <section className="features-section py-4 my-3">
          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card h-100 shadow-sm border-0 rounded-4">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon-wrapper mx-auto mb-3">
                    <i className="bi bi-patch-check-fill" />
                  </div>
                  <h5 className="fw-bold text-navy mb-2">Calidad Certificada</h5>
                  <p className="text-muted small mb-0">
                    Aluminio de primera fundición, perfiles de alta precisión y acabados que resisten el paso del tiempo.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 shadow-sm border-0 rounded-4">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon-wrapper mx-auto mb-3">
                    <i className="bi bi-truck" />
                  </div>
                  <h5 className="fw-bold text-navy mb-2">Despacho & Embalaje Seguro</h5>
                  <p className="text-muted small mb-0">
                    Empaque especializado para ventanería y perfiles delicados con envíos a nivel nacional.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 shadow-sm border-0 rounded-4">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon-wrapper mx-auto mb-3">
                    <i className="bi bi-headset" />
                  </div>
                  <h5 className="fw-bold text-navy mb-2">Asesoría Especializada</h5>
                  <p className="text-muted small mb-0">
                    Nuestro equipo técnico te ayuda a seleccionar las medidas y materiales exactos para tu proyecto.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ========================================================================= */}
        {/* BANNER CTA INFERIOR                                                      */}
        {/* ========================================================================= */}
        {!isAuthenticated && (
          <div className="cta-banner-card mt-5 p-4 p-md-5 rounded-4 shadow-sm text-center text-white position-relative overflow-hidden">
            <div className="cta-glow-bg" />
            <div className="position-relative z-1 py-2">
              <div className="cta-badge d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3">
                <i className="bi bi-building-check text-gold" />
                <span className="small fw-semibold text-light">Tu Aliado en Construcción & Remodelación</span>
              </div>
              <h2 className="display-6 fw-bold mb-3">
                Comienza a Comprar con el Respaldo de <span className="hero-title-gold">GAVAT</span>
              </h2>
              <p className="lead opacity-90 mx-auto mb-4" style={{ maxWidth: '620px', fontSize: '1.05rem' }}>
                Regístrate gratis hoy para consultar precios, generar órdenes de compra inmediatas y recibir facturación electrónica transparente.
              </p>
              <Link to="/register" className="btn btn-hero-gold px-5 py-3 d-inline-flex align-items-center gap-2">
                <i className="bi bi-person-plus-fill" />
                <span>Crear Cuenta Gratis</span>
              </Link>
            </div>
          </div>
        )}
      </Container>

      {/* ========================================================================= */}
      {/* ESTILOS DE LA PÁGINA (Sincronizados con el diseño global)                 */}
      {/* ========================================================================= */}
      <style>{`
        .home-page-wrapper {
          background-color: #f8fafc;
          min-height: 100vh;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #131f37 0%, #192847 60%, #0d172a 100%);
          border-bottom: 1px solid rgba(197, 151, 74, 0.2);
        }
        .hero-radial-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.35;
        }
        .hero-glow-1 {
          width: 450px;
          height: 450px;
          top: -100px;
          right: 5%;
          background: radial-gradient(circle, rgba(245, 194, 113, 0.4) 0%, transparent 70%);
        }
        .hero-glow-2 {
          width: 380px;
          height: 380px;
          bottom: -80px;
          left: 5%;
          background: radial-gradient(circle, rgba(199, 152, 78, 0.3) 0%, transparent 70%);
        }
        .hero-badge {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(197, 151, 74, 0.35);
          backdrop-filter: blur(8px);
        }
        .hero-title {
          line-height: 1.15;
          letter-spacing: -0.5px;
        }
        .hero-title-gold {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .btn-hero-gold {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%);
          color: #000000 !important;
          border: none;
          border-radius: 0.75rem;
          font-weight: 700;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(199, 152, 78, 0.28);
        }
        .btn-hero-gold:hover {
          background: linear-gradient(135deg, #c7984e 0%, #f5c271 100%);
          color: #000000 !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(199, 152, 78, 0.38);
        }
        .btn-hero-outline {
          background: transparent;
          color: #ffffff !important;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.25s ease;
        }
        .btn-hero-outline:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: #f5c271;
          color: #f5c271 !important;
          transform: translateY(-2px);
        }
        .hero-metric-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(6px);
        }

        /* Hero Logo Halo */
        .hero-visual-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-logo-halo {
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(25, 40, 71, 0.4) 70%);
          border: 2px solid rgba(197, 151, 74, 0.3);
          box-shadow: 0 0 60px rgba(197, 151, 74, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
          animation: floatHalo 5s ease-in-out infinite;
        }
        .hero-logo-img {
          width: 100%;
          max-width: 220px;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4));
          user-select: none;
        }
        @keyframes floatHalo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Enlace catálogo */
        .btn-link-catalogo {
          color: #c7984e;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .btn-link-catalogo:hover {
          color: #8F6A34;
          transform: translateX(4px);
        }

        /* Tarjetas de Features */
        .feature-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(25, 40, 71, 0.08) !important;
          border-color: rgba(197, 151, 74, 0.3) !important;
        }
        .feature-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(245, 194, 113, 0.2) 0%, rgba(199, 152, 78, 0.2) 100%);
          color: #c7984e;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .feature-card:hover .feature-icon-wrapper {
          background: linear-gradient(135deg, #f5c271 0%, #c7984e 100%);
          color: #000000;
          transform: scale(1.08);
        }

        /* Banner CTA */
        .cta-banner-card {
          background: linear-gradient(135deg, #131f37 0%, #192847 60%, #0d172a 100%);
          border: 1px solid rgba(197, 151, 74, 0.3);
        }
        .cta-glow-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 250px;
          background: radial-gradient(ellipse, rgba(197, 151, 74, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-badge {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(197, 151, 74, 0.35);
        }

        @keyframes fadeInCard {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-preview-anim {
          animation: fadeInCard 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;