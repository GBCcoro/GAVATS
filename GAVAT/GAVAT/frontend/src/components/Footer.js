/**
 * ============================================
 * FOOTER COMPONENT - Estilo Prémium & Compacto GAVAT
 * ============================================
 * Pie de página armonizado con la identidad visual:
 * Azul Marino Profundo (#192847), Acentos Dorados (#f5c271 / #c7984e).
 * Proporcionado y compacto para mantenerse al fondo de la pantalla
 * sin consumir todo el espacio visual inicial del usuario.
 */

import React, { memo, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = memo(() => {
  const { isAuthenticated, isAdmin, isAuxiliar } = useAuth();
  const currentYear = new Date().getFullYear();

  // Función para volver arriba suavemente al hacer clic
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <footer className="gavat-footer position-relative text-light mt-auto">
      {/* Halo radial sutil de fondo */}
      <div className="footer-glow-ambient" aria-hidden="true" />

      {/* ========================================================================= */}
      {/* 1. FRANJA DE CONFIANZA & VALOR (Trust Strip Compacta)                     */}
      {/* ========================================================================= */}
      <div className="footer-trust-strip py-2 py-md-2.5">
        <Container>
          <Row className="g-2 justify-content-center align-items-center">
            <Col xs={6} md={3}>
              <div className="trust-card d-flex align-items-center gap-2 px-2.5 py-1.5 rounded-2 h-100">
                <div className="trust-icon-box">
                  <i className="bi bi-truck text-gold" aria-hidden="true" />
                </div>
                <div className="overflow-hidden">
                  <span className="trust-title text-white fw-bold d-block text-truncate">Despacho Nacional</span>
                  <span className="trust-desc text-light opacity-75 small d-none d-sm-block text-truncate">Envíos a todo el país</span>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="trust-card d-flex align-items-center gap-2 px-2.5 py-1.5 rounded-2 h-100">
                <div className="trust-icon-box">
                  <i className="bi bi-patch-check-fill text-gold" aria-hidden="true" />
                </div>
                <div className="overflow-hidden">
                  <span className="trust-title text-white fw-bold d-block text-truncate">Calidad Certificada</span>
                  <span className="trust-desc text-light opacity-75 small d-none d-sm-block text-truncate">Aluminio y vidrio templado</span>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="trust-card d-flex align-items-center gap-2 px-2.5 py-1.5 rounded-2 h-100">
                <div className="trust-icon-box">
                  <i className="bi bi-headset text-gold" aria-hidden="true" />
                </div>
                <div className="overflow-hidden">
                  <span className="trust-title text-white fw-bold d-block text-truncate">Asesoría Técnica</span>
                  <span className="trust-desc text-light opacity-75 small d-none d-sm-block text-truncate">Acompañamiento experto</span>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="trust-card d-flex align-items-center gap-2 px-2.5 py-1.5 rounded-2 h-100">
                <div className="trust-icon-box">
                  <i className="bi bi-shield-lock-fill text-gold" aria-hidden="true" />
                </div>
                <div className="overflow-hidden">
                  <span className="trust-title text-white fw-bold d-block text-truncate">Compra Segura</span>
                  <span className="trust-desc text-light opacity-75 small d-none d-sm-block text-truncate">Facturación electrónica</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTENIDO PRINCIPAL COMPACTO (4 Columnas)                              */}
      {/* ========================================================================= */}
      <Container className="py-3 py-md-4">
        <Row className="gy-3 gx-lg-4">
          {/* Columna 1: Identidad Corporativa */}
          <Col lg={4} md={12} className="footer-brand-col">
            <Link to="/" onClick={scrollToTop} className="footer-brand-logo d-inline-flex align-items-center text-decoration-none mb-2">
              <img
                src="/assests/icons/logo-gavat-navbar.png"
                alt="GAVAT Logo"
                className="footer-brand-img me-2"
              />
              <div className="d-flex flex-column">
                <span className="footer-brand-title">GAVAT</span>
                <span className="footer-brand-tagline">SOLUCIONES ARQUITECTÓNICAS</span>
              </div>
            </Link>

            <p className="footer-description text-light opacity-75 mb-2 small">
              Especialistas en carpintería de aluminio de alta precisión, ventanería modular, 
              vidrio templado y herrajes prémium para proyectos residenciales y corporativos.
            </p>

            <div className="footer-badge-pills d-flex flex-wrap gap-1.5 pt-1">
              <span className="badge-pill-item">
                <i className="bi bi-stars text-gold me-1" aria-hidden="true" /> Alta Precisión
              </span>
              <span className="badge-pill-item">
                <i className="bi bi-geo-alt-fill text-gold me-1" aria-hidden="true" /> Colombia
              </span>
            </div>
          </Col>

          {/* Columna 2: Navegación Rápida */}
          <Col xs={6} sm={6} lg={2}>
            <h6 className="footer-column-heading">
              <span className="heading-text">Navegación</span>
              <span className="heading-line" />
            </h6>
            <ul className="footer-links-list list-unstyled mb-0">
              <li>
                <Link to="/" onClick={scrollToTop} className="footer-nav-link">
                  <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                  <span>Inicio</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogo" onClick={scrollToTop} className="footer-nav-link">
                  <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                  <span>Catálogo</span>
                </Link>
              </li>
              <li>
                <Link to="/carrito" onClick={scrollToTop} className="footer-nav-link">
                  <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                  <span>Carrito</span>
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/perfil" onClick={scrollToTop} className="footer-nav-link">
                      <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                      <span>Mi Perfil</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to={isAdmin || isAuxiliar ? "/admin/mis-pedidos" : "/mis-pedidos"} 
                      onClick={scrollToTop} 
                      className="footer-nav-link"
                    >
                      <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                      <span>Mis Pedidos</span>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={scrollToTop} className="footer-nav-link">
                      <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" onClick={scrollToTop} className="footer-nav-link">
                      <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                      <span>Registrarse</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </Col>

          {/* Columna 3: Líneas de Soluciones */}
          <Col xs={6} sm={6} lg={3}>
            <h6 className="footer-column-heading">
              <span className="heading-text">Soluciones</span>
              <span className="heading-line" />
            </h6>
            <ul className="footer-links-list list-unstyled mb-0">
              <li>
                <Link to="/catalogo" onClick={scrollToTop} className="footer-nav-link">
                  <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                  <span>Ventanería & Puertas</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogo" onClick={scrollToTop} className="footer-nav-link">
                  <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                  <span>Perfiles en Aluminio</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogo" onClick={scrollToTop} className="footer-nav-link">
                  <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                  <span>Vidrio Templado</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogo" onClick={scrollToTop} className="footer-nav-link">
                  <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                  <span>Herrajes & Accesorios</span>
                </Link>
              </li>
            </ul>
          </Col>

          {/* Columna 4: Contacto & Redes Sociales */}
          <Col lg={3} md={12}>
            <h6 className="footer-column-heading">
              <span className="heading-text">Contacto</span>
              <span className="heading-line" />
            </h6>

            <div className="footer-contact-items d-flex flex-column gap-2 mb-3">
              <a href="mailto:info@gavat.com" className="contact-item-row text-decoration-none">
                <div className="contact-icon-wrapper">
                  <i className="bi bi-envelope-fill text-gold" aria-hidden="true" />
                </div>
                <div className="contact-text-group">
                  <span className="contact-subtitle d-block small text-light opacity-75">Correo</span>
                  <span className="contact-main-text text-white fw-medium">info@gavat.com</span>
                </div>
              </a>

              <a href="tel:+573001234567" className="contact-item-row text-decoration-none">
                <div className="contact-icon-wrapper">
                  <i className="bi bi-telephone-fill text-gold" aria-hidden="true" />
                </div>
                <div className="contact-text-group">
                  <span className="contact-subtitle d-block small text-light opacity-75">Teléfono</span>
                  <span className="contact-main-text text-white fw-medium">+57 300 123 4567</span>
                </div>
              </a>

              <div className="contact-item-row">
                <div className="contact-icon-wrapper">
                  <i className="bi bi-clock-fill text-gold" aria-hidden="true" />
                </div>
                <div className="contact-text-group">
                  <span className="contact-subtitle d-block small text-light opacity-75">Horario</span>
                  <span className="contact-main-text text-white fw-medium">Lun - Sáb: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Redes Sociales compactas */}
            <div className="footer-social-wrapper">
              <div className="d-flex align-items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn-pill"
                  aria-label="Seguir en Facebook"
                  title="Facebook"
                >
                  <i className="bi bi-facebook" aria-hidden="true" />
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn-pill"
                  aria-label="Seguir en Instagram"
                  title="Instagram"
                >
                  <i className="bi bi-instagram" aria-hidden="true" />
                </a>

                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn-pill social-btn-wa"
                  aria-label="Chatear por WhatsApp"
                  title="WhatsApp"
                >
                  <i className="bi bi-whatsapp" aria-hidden="true" />
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn-pill"
                  aria-label="Seguir en X"
                  title="X (Twitter)"
                >
                  <i className="bi bi-twitter-x" aria-hidden="true" />
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* ========================================================================= */}
      {/* 3. BARRA INFERIOR / SUB-FOOTER COMPACTA                                   */}
      {/* ========================================================================= */}
      <div className="footer-bottom-bar py-2 py-md-2.5">
        <Container>
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 text-center text-md-start">
            <div className="footer-legal-copy">
              <p className="mb-0 small text-light opacity-80" style={{ fontSize: '0.8rem' }}>
                &copy; {currentYear} <span className="text-gold fw-semibold">GAVAT S.A.S.</span> — Todos los derechos reservados.
              </p>
            </div>

            {/* Badges de Garantía y Botón Scroll to top */}
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-end gap-2">
              <span className="bottom-security-badge d-inline-flex align-items-center gap-1 small px-2 py-0.5 rounded">
                <i className="bi bi-shield-check text-gold" aria-hidden="true" />
                <span className="text-white-50">Sitio Seguro</span>
              </span>

              <span className="bottom-security-badge d-inline-flex align-items-center gap-1 small px-2 py-0.5 rounded">
                <i className="bi bi-receipt text-gold" aria-hidden="true" />
                <span className="text-white-50">Facturación DIAN</span>
              </span>

              <button
                type="button"
                onClick={scrollToTop}
                className="btn-scroll-top d-inline-flex align-items-center gap-1 ms-lg-2"
                aria-label="Volver arriba"
                title="Volver arriba"
              >
                <span>Subir</span>
                <i className="bi bi-arrow-up-short fs-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* ========================================================================= */}
      {/* ESTILOS DEL FOOTER - Compacto, Proporcionado y Elegante                   */}
      {/* ========================================================================= */}
      <style>{`
        .gavat-footer {
          background: linear-gradient(180deg, #131f37 0%, #192847 42%, #0d172a 100%);
          color: var(--light-color, #DBE1ED);
          font-family: var(--font-roboto, "Roboto Condensed", sans-serif);
          overflow: hidden;
          border-top: 1px solid rgba(197, 151, 74, 0.28);
        }

        .gavat-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            rgba(245, 194, 113, 0.3) 15%, 
            var(--bs-gold, #f5c271) 50%, 
            rgba(245, 194, 113, 0.3) 85%, 
            transparent 100%
          );
          z-index: 2;
        }

        .footer-glow-ambient {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 75%;
          height: 200px;
          background: radial-gradient(ellipse, rgba(197, 151, 74, 0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .footer-trust-strip {
          position: relative;
          z-index: 1;
          background: rgba(13, 23, 42, 0.45);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        .trust-card {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.25s ease;
        }

        .trust-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(245, 194, 113, 0.3);
          transform: translateY(-2px);
        }

        .trust-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, rgba(245, 194, 113, 0.15) 0%, rgba(199, 152, 78, 0.08) 100%);
          border: 1px solid rgba(245, 194, 113, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.95rem;
          transition: all 0.25s ease;
        }

        .trust-card:hover .trust-icon-box {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271) 0%, var(--bs-gold-dark, #8F6A34) 100%);
        }

        .trust-card:hover .trust-icon-box i {
          color: #0d172a !important;
        }

        .trust-title {
          font-size: 0.82rem;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }

        .trust-desc {
          font-size: 0.72rem;
          line-height: 1.2;
        }

        .footer-brand-logo {
          transition: transform 0.25s ease;
        }

        .footer-brand-logo:hover {
          transform: translateX(2px);
        }

        .footer-brand-img {
          height: 36px;
          object-fit: contain;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
        }

        .footer-brand-title {
          font-family: var(--font-baskerville, "Libre Baskerville", Georgia, serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--bs-gold, #f5c271);
          letter-spacing: 0.04em;
          line-height: 1;
        }

        .footer-brand-tagline {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.55);
        }

        .footer-description {
          font-size: 0.8rem;
          line-height: 1.45;
          max-width: 340px;
        }

        .badge-pill-item {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(245, 194, 113, 0.2);
          border-radius: 2rem;
          padding: 0.15rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .footer-column-heading {
          position: relative;
          padding-bottom: 0.4rem;
          margin-bottom: 0.75rem;
          font-family: var(--font-baskerville, "Libre Baskerville", Georgia, serif);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--bs-gold, #f5c271);
          letter-spacing: 0.02em;
        }

        .footer-column-heading .heading-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 26px;
          height: 2px;
          background: linear-gradient(90deg, var(--bs-gold, #f5c271), transparent);
          border-radius: 2px;
        }

        .footer-links-list li {
          margin-bottom: 0.35rem;
        }

        .footer-nav-link {
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          font-size: 0.84rem;
          transition: all 0.2s ease;
        }

        .link-arrow {
          font-size: 0.7rem;
          opacity: 0.45;
          margin-right: 0.35rem;
          transition: transform 0.2s ease;
        }

        .footer-nav-link:hover {
          color: var(--bs-gold, #f5c271) !important;
          transform: translateX(3px);
        }

        .contact-item-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: transform 0.2s ease;
        }

        .contact-item-row:hover {
          transform: translateX(2px);
        }

        .contact-icon-wrapper {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(245, 194, 113, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.8rem;
        }

        .contact-subtitle {
          font-size: 0.7rem;
          line-height: 1.1;
        }

        .contact-main-text {
          font-size: 0.82rem;
          line-height: 1.2;
        }

        .social-btn-pill {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(245, 194, 113, 0.22);
          color: rgba(255, 255, 255, 0.8);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .social-btn-pill:hover {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271) 0%, var(--bs-gold-dark, #8F6A34) 100%);
          border-color: var(--bs-gold, #f5c271);
          color: #0d172a !important;
          transform: translateY(-2px);
        }

        .social-btn-wa:hover {
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%) !important;
          border-color: #25D366 !important;
          color: #ffffff !important;
        }

        .footer-bottom-bar {
          background: rgba(10, 18, 33, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          position: relative;
          z-index: 2;
        }

        .bottom-security-badge {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.72rem;
        }

        .btn-scroll-top {
          background: rgba(245, 194, 113, 0.08);
          border: 1px solid rgba(245, 194, 113, 0.25);
          color: var(--bs-gold, #f5c271);
          border-radius: 1.5rem;
          padding: 0.18rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-scroll-top:hover {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271) 0%, var(--bs-gold-dark, #8F6A34) 100%);
          color: #0d172a;
          border-color: var(--bs-gold, #f5c271);
          transform: translateY(-1px);
        }

        .text-gold {
          color: var(--bs-gold, #f5c271) !important;
        }

        @media (max-width: 767.98px) {
          .footer-brand-col {
            text-align: center;
          }
          .footer-brand-logo {
            justify-content: center;
          }
          .footer-description {
            max-width: 100%;
          }
          .footer-badge-pills {
            justify-content: center;
          }
          .footer-social-wrapper .d-flex {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;