/**
 * ============================================
 * FOOTER COMPONENT - Estilo Prémium GAVAT
 * ============================================
 * Pie de página completamente armonizado con la identidad visual:
 * Azul Marino Profundo (#192847), Acentos Dorados (#f5c271 / #c7984e),
 * franja de valor de marca, navegación dinámica, accesibilidad y diseño responsive.
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
      {/* Halo radial de iluminación ambiental sutil */}
      <div className="footer-glow-ambient" aria-hidden="true" />

      {/* ========================================================================= */}
      {/* 1. FRANJA DE CONFIANZA & VALOR (Trust Strip)                              */}
      {/* ========================================================================= */}
      <div className="footer-trust-strip">
        <Container>
          <Row className="g-3 py-4">
            <Col xs={12} sm={6} lg={3}>
              <div className="trust-card d-flex align-items-center gap-3 p-3 rounded-3 h-100">
                <div className="trust-icon-box">
                  <i className="bi bi-truck fs-4 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <h6 className="trust-title mb-1 text-white fw-bold">Despacho Nacional</h6>
                  <p className="trust-desc mb-0 text-light opacity-75 small">
                    Envíos seguros y coordinados a todo el país.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <div className="trust-card d-flex align-items-center gap-3 p-3 rounded-3 h-100">
                <div className="trust-icon-box">
                  <i className="bi bi-patch-check-fill fs-4 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <h6 className="trust-title mb-1 text-white fw-bold">Calidad Certificada</h6>
                  <p className="trust-desc mb-0 text-light opacity-75 small">
                    Aluminio arquitectónico y vidrio templado de precisión.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <div className="trust-card d-flex align-items-center gap-3 p-3 rounded-3 h-100">
                <div className="trust-icon-box">
                  <i className="bi bi-headset fs-4 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <h6 className="trust-title mb-1 text-white fw-bold">Asesoría Técnica</h6>
                  <p className="trust-desc mb-0 text-light opacity-75 small">
                    Acompañamiento experto para cada proyecto.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <div className="trust-card d-flex align-items-center gap-3 p-3 rounded-3 h-100">
                <div className="trust-icon-box">
                  <i className="bi bi-shield-lock-fill fs-4 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <h6 className="trust-title mb-1 text-white fw-bold">Compra 100% Segura</h6>
                  <p className="trust-desc mb-0 text-light opacity-75 small">
                    Transacciones protegidas y facturación electrónica.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTENIDO PRINCIPAL DEL FOOTER (4 Columnas)                             */}
      {/* ========================================================================= */}
      <Container className="py-5">
        <Row className="gy-4 gx-lg-5">
          {/* Columna 1: Identidad Corporativa */}
          <Col lg={4} md={12} className="footer-brand-col">
            <Link to="/" onClick={scrollToTop} className="footer-brand-logo d-inline-flex align-items-center text-decoration-none mb-3">
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

            <p className="footer-description text-light opacity-85 mb-3">
              Especialistas en carpintería de aluminio de alta precisión, ventanería modular, 
              cancelería, vidrio templado y herrajes prémium para proyectos residenciales y corporativos.
            </p>

            <div className="footer-badge-pills d-flex flex-wrap gap-2 pt-1">
              <span className="badge-pill-item">
                <i className="bi bi-stars text-gold me-1" aria-hidden="true" /> Alta Precisión
              </span>
              <span className="badge-pill-item">
                <i className="bi bi-geo-alt-fill text-gold me-1" aria-hidden="true" /> Colombia
              </span>
              <span className="badge-pill-item">
                <i className="bi bi-award-fill text-gold me-1" aria-hidden="true" /> Garantía Oficial
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
              <li>
                <Link to="/catalogo" onClick={scrollToTop} className="footer-nav-link">
                  <i className="bi bi-chevron-right link-arrow" aria-hidden="true" />
                  <span>Proyectos Especiales</span>
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

            <div className="footer-contact-items d-flex flex-column gap-3 mb-4">
              <a href="mailto:info@gavat.com" className="contact-item-row text-decoration-none">
                <div className="contact-icon-wrapper">
                  <i className="bi bi-envelope-fill text-gold" aria-hidden="true" />
                </div>
                <div className="contact-text-group">
                  <span className="contact-subtitle d-block small text-light opacity-75">Correo oficial</span>
                  <span className="contact-main-text text-white fw-medium">info@gavat.com</span>
                </div>
              </a>

              <a href="tel:+573001234567" className="contact-item-row text-decoration-none">
                <div className="contact-icon-wrapper">
                  <i className="bi bi-telephone-fill text-gold" aria-hidden="true" />
                </div>
                <div className="contact-text-group">
                  <span className="contact-subtitle d-block small text-light opacity-75">Línea de atención</span>
                  <span className="contact-main-text text-white fw-medium">+57 300 123 4567</span>
                </div>
              </a>

              <div className="contact-item-row">
                <div className="contact-icon-wrapper">
                  <i className="bi bi-clock-fill text-gold" aria-hidden="true" />
                </div>
                <div className="contact-text-group">
                  <span className="contact-subtitle d-block small text-light opacity-75">Horario comercial</span>
                  <span className="contact-main-text text-white fw-medium">Lun - Sáb: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Redes Sociales con diseño interactivo */}
            <div className="footer-social-wrapper">
              <span className="d-block small fw-bold text-gold text-uppercase tracking-wider mb-2">
                Conéctate con nosotros
              </span>
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
                  aria-label="Seguir en X (Twitter)"
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
      {/* 3. BARRA INFERIOR / SUB-FOOTER                                            */}
      {/* ========================================================================= */}
      <div className="footer-bottom-bar py-3">
        <Container>
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-center text-md-start">
            <div className="footer-legal-copy">
              <p className="mb-0 small text-light opacity-80">
                &copy; {currentYear} <span className="text-gold fw-semibold">GAVAT S.A.S.</span> — Todos los derechos reservados.
              </p>
              <span className="legal-subtext d-block small text-white-50">
                Soluciones arquitectónicas de precisión, carpintería de aluminio y vidrio templado.
              </span>
            </div>

            {/* Badges de Garantía y Botón Scroll to top */}
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-end gap-2">
              <span className="bottom-security-badge d-inline-flex align-items-center gap-1 small px-2 py-1 rounded">
                <i className="bi bi-shield-check text-gold" aria-hidden="true" />
                <span className="text-white-50">Sitio Seguro</span>
              </span>

              <span className="bottom-security-badge d-inline-flex align-items-center gap-1 small px-2 py-1 rounded">
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
                <i className="bi bi-arrow-up-short fs-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* ========================================================================= */}
      {/* ESTILOS DEL FOOTER - Integración perfecta con la paleta y fuentes de GAVAT */}
      {/* ========================================================================= */}
      <style>{`
        /* Contenedor principal con gradiente profundo y borde dorado superior */
        .gavat-footer {
          background: linear-gradient(180deg, #131f37 0%, #192847 42%, #0d172a 100%);
          color: var(--light-color, #DBE1ED);
          font-family: var(--font-roboto, "Roboto Condensed", sans-serif);
          overflow: hidden;
          border-top: 1px solid rgba(197, 151, 74, 0.28);
        }

        /* Línea de brillo degradado en el borde superior */
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

        /* Halo de luz de fondo para dar profundidad */
        .footer-glow-ambient {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 75%;
          height: 280px;
          background: radial-gradient(ellipse, rgba(197, 151, 74, 0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Franja superior de valor / confianza */
        .footer-trust-strip {
          position: relative;
          z-index: 1;
          background: rgba(13, 23, 42, 0.55);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .trust-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .trust-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(245, 194, 113, 0.35);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }

        .trust-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(245, 194, 113, 0.15) 0%, rgba(199, 152, 78, 0.08) 100%);
          border: 1px solid rgba(245, 194, 113, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .trust-card:hover .trust-icon-box {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271) 0%, var(--bs-gold-dark, #8F6A34) 100%);
          transform: scale(1.05);
        }

        .trust-card:hover .trust-icon-box i {
          color: #0d172a !important;
        }

        .trust-title {
          font-size: 0.95rem;
          letter-spacing: 0.01em;
        }

        .trust-desc {
          line-height: 1.35;
          font-size: 0.8rem;
        }

        /* Marca y Logotipo */
        .footer-brand-logo {
          transition: transform 0.3s ease;
        }

        .footer-brand-logo:hover {
          transform: translateX(2px);
        }

        .footer-brand-img {
          height: 44px;
          object-fit: contain;
          transition: transform 0.3s ease;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
        }

        .footer-brand-logo:hover .footer-brand-img {
          transform: rotate(-6deg) scale(1.06);
        }

        .footer-brand-title {
          font-family: var(--font-baskerville, "Libre Baskerville", Georgia, serif);
          font-size: 1.55rem;
          font-weight: 700;
          color: var(--bs-gold, #f5c271);
          letter-spacing: 0.05em;
          line-height: 1.1;
        }

        .footer-brand-tagline {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.6);
        }

        .footer-description {
          font-size: 0.88rem;
          line-height: 1.6;
          max-width: 380px;
        }

        /* Pastillas de atributos de marca */
        .badge-pill-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(245, 194, 113, 0.25);
          border-radius: 2rem;
          padding: 0.25rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.85);
          transition: all 0.2s ease;
        }

        .badge-pill-item:hover {
          background: rgba(245, 194, 113, 0.12);
          border-color: var(--bs-gold, #f5c271);
          color: #ffffff;
        }

        /* Títulos de columnas */
        .footer-column-heading {
          position: relative;
          padding-bottom: 0.65rem;
          margin-bottom: 1.25rem;
          font-family: var(--font-baskerville, "Libre Baskerville", Georgia, serif);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--bs-gold, #f5c271);
          letter-spacing: 0.02em;
        }

        .footer-column-heading .heading-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 34px;
          height: 2px;
          background: linear-gradient(90deg, var(--bs-gold, #f5c271), transparent);
          border-radius: 2px;
        }

        /* Enlaces de navegación */
        .footer-links-list li {
          margin-bottom: 0.65rem;
        }

        .footer-nav-link {
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.75);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 400;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .link-arrow {
          font-size: 0.75rem;
          opacity: 0.5;
          margin-right: 0.4rem;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }

        .footer-nav-link:hover {
          color: var(--bs-gold, #f5c271) !important;
          transform: translateX(5px);
        }

        .footer-nav-link:hover .link-arrow {
          opacity: 1;
          transform: translateX(2px);
          color: var(--bs-gold, #f5c271);
        }

        /* Filas de información de contacto */
        .contact-item-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: transform 0.2s ease;
        }

        .contact-item-row:hover {
          transform: translateX(3px);
        }

        .contact-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(245, 194, 113, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .contact-item-row:hover .contact-icon-wrapper {
          background: rgba(245, 194, 113, 0.15);
          border-color: var(--bs-gold, #f5c271);
          box-shadow: 0 0 10px rgba(245, 194, 113, 0.25);
        }

        .contact-subtitle {
          font-size: 0.75rem;
          line-height: 1.2;
        }

        .contact-main-text {
          font-size: 0.88rem;
          line-height: 1.3;
        }

        /* Botones de Redes Sociales */
        .social-btn-pill {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1.5px solid rgba(245, 194, 113, 0.25);
          color: rgba(255, 255, 255, 0.85);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .social-btn-pill:hover {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271) 0%, var(--bs-gold-dark, #8F6A34) 100%);
          border-color: var(--bs-gold, #f5c271);
          color: #0d172a !important;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 16px rgba(245, 194, 113, 0.35);
        }

        .social-btn-wa:hover {
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%) !important;
          border-color: #25D366 !important;
          color: #ffffff !important;
          box-shadow: 0 6px 16px rgba(37, 211, 102, 0.35) !important;
        }

        /* Barra Inferior (Sub-Footer) */
        .footer-bottom-bar {
          background: rgba(10, 18, 33, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          z-index: 2;
        }

        .legal-subtext {
          font-size: 0.75rem;
          margin-top: 2px;
        }

        .bottom-security-badge {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.75rem;
        }

        /* Botón Scroll to top */
        .btn-scroll-top {
          background: rgba(245, 194, 113, 0.1);
          border: 1px solid rgba(245, 194, 113, 0.3);
          color: var(--bs-gold, #f5c271);
          border-radius: 2rem;
          padding: 0.25rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-scroll-top:hover {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271) 0%, var(--bs-gold-dark, #8F6A34) 100%);
          color: #0d172a;
          border-color: var(--bs-gold, #f5c271);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 194, 113, 0.25);
        }

        .text-gold {
          color: var(--bs-gold, #f5c271) !important;
        }

        /* Ajustes Mobile */
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
          .footer-social-wrapper {
            text-align: center;
          }
          .footer-social-wrapper .d-flex {
            justify-content: center;
          }
          .contact-item-row {
            justify-content: flex-start;
          }
        }
      `}</style>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;