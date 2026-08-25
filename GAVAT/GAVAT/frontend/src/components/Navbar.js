/**
 * ============================================
 * NAVBAR COMPONENT - Adaptado a la paleta del proyecto
 * ============================================
 * Barra de navegación principal con menú responsive, colores personalizados
 * y cierre automático al hacer clic fuera del menú o navegar.
 */

import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const NavigationBar = memo(() => {
  const { user, isAuthenticated, isAdmin, isAuxiliar, isCliente, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const navbarRef = useRef(null);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  // Cerrar menú al hacer clic fuera del navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLogout = useCallback(() => {
    setExpanded(false);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleLinkClick = useCallback(() => {
    setExpanded(false);
  }, []);

  const isActive = useCallback((path) => location.pathname === path, [location]);

  return (
    <Navbar 
      ref={navbarRef}
      expand="lg" 
      sticky="top" 
      expanded={expanded}
      onToggle={setExpanded}
      className="custom-navbar shadow-sm"
    >
      <Container>
        {/* LOGO (Siempre a la izquierda) */}
        <Navbar.Brand as={Link} to="/" onClick={handleLinkClick} className="brand-logo d-flex align-items-center">
          <img 
            src="/assests/icons/logo-gavat-navbar.png" 
            alt="GAVAT" 
            className="navbar-brand-img"
          />
          <span className="brand-name">GAVAT</span>
        </Navbar.Brand>

        {/* Grupo de Acciones en Móvil (Siempre visible a la derecha en móviles) */}
        <div className="d-flex align-items-center d-lg-none mobile-actions-wrapper">
          {/* Carrito en Móvil */}
          <Link 
            to="/carrito" 
            onClick={handleLinkClick}
            className={`nav-link-custom-mobile me-2 ${isActive('/carrito') ? 'active' : ''}`} 
            aria-label="Carrito de compras"
          >
            <i className="bi bi-cart3 fs-4" />
          </Link>

          {/* Menú Usuario en Móvil */}
          <NavDropdown
            title={
              isAuthenticated ? (
                <span className="user-name-text text-gold small fw-bold">
                  {user?.rol === 'administrador' ? 'Admin' : user?.rol === 'auxiliar' ? 'Auxiliar' : 'Cliente'}
                </span>
              ) : (
                <div className="user-icon-btn d-flex align-items-center justify-content-center">
                  <img src="/assests/icons/account_white.svg" alt="Usuario" className="user-icon-img" />
                </div>
              )
            }
            id="user-dropdown-mobile"
            align="end"
            className="nav-dropdown-custom user-dropdown-mobile-container me-2"
          >
            {isAuthenticated ? (
              <>
                <div className="dropdown-header-custom px-3 py-2 border-bottom mb-2">
                  <span className="d-block fw-bold text-gold small">{user?.nombre}</span>
                  <span className="d-block text-truncate text-white-50 small" style={{ maxWidth: '180px' }}>
                    {user?.email}
                  </span>
                </div>
                <NavDropdown.Item as={Link} to="/perfil" onClick={handleLinkClick}>
                  <i className="bi bi-person me-2" /> Mi Perfil
                </NavDropdown.Item>
                {isCliente && (
                  <NavDropdown.Item as={Link} to="/mis-pedidos" onClick={handleLinkClick}>
                    <i className="bi bi-box-seam me-2" /> Mis Pedidos
                  </NavDropdown.Item>
                )}
                {(isAdmin || isAuxiliar) && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin/mis-pedidos" onClick={handleLinkClick}>
                      <i className="bi bi-box-seam me-2" /> Mis Pedidos (Admin)
                    </NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2" /> Cerrar Sesión
                </NavDropdown.Item>
              </>
            ) : (
              <>
                <NavDropdown.Item as={Link} to="/login" onClick={handleLinkClick}>
                  <i className="bi bi-box-arrow-in-right me-2" /> Iniciar Sesión
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/register" onClick={handleLinkClick}>
                  <i className="bi bi-person-plus me-2" /> Registrarse
                </NavDropdown.Item>
              </>
            )}
          </NavDropdown>

          {/* Hamburger Toggler */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 p-1 custom-toggler-btn" />
        </div>

        {/* Contenido Colapsable (Desktop e Interior de Menú Móvil) */}
        <Navbar.Collapse id="basic-navbar-nav" className="order-3 order-lg-2">
          {/* Enlaces de la Izquierda */}
          <Nav className="me-auto align-items-lg-center navbar-left-group">
            <Nav.Link as={Link} to="/" onClick={handleLinkClick} className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}>
              <i className="bi bi-house-door me-2 d-lg-none" />Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/catalogo" onClick={handleLinkClick} className={`nav-link-custom ${isActive('/catalogo') ? 'active' : ''}`}>
              <i className="bi bi-grid me-2 d-lg-none" />Catálogo
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/carrito" 
              onClick={handleLinkClick}
              className={`nav-link-custom d-none d-lg-flex align-items-center ${isActive('/carrito') ? 'active' : ''}`}
            >
              <i className="bi bi-cart3 me-2" />Carrito
            </Nav.Link>
          </Nav>

          {/* Opciones de la Derecha (Desktop) */}
          <Nav className="align-items-lg-center d-none d-lg-flex navbar-right-group">
            {/* Dropdown de Administración */}
            {(isAdmin || isAuxiliar) && (
              <NavDropdown
                title={
                  <>
                    <img src="/assests/icons/access_flash.svg" alt="Administración" width="16" height="16" className="me-1 navbar-icon-svg" />
                    <span className="text-gold">Administración</span>
                  </>
                }
                id="admin-dropdown-desktop"
                className="nav-dropdown-custom admin-dropdown-pill me-3"
                align="end"
              >
                <div className="dropdown-header-custom px-3 py-2 border-bottom mb-2 text-gold small fw-bold d-flex align-items-center">
                  <img src="/assests/icons/access_flash.svg" alt="Panel" width="16" height="16" className="me-2 navbar-icon-svg" /> Panel Administrativo
                </div>
                <NavDropdown.Item as={Link} to="/admin/dashboard" onClick={handleLinkClick}>
                  <img src="/assests/icons/access_flash.svg" alt="Dashboard" width="16" height="16" className="me-2 navbar-icon-svg" /> Dashboard
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/categorias" onClick={handleLinkClick}>
                  <img src="/assests/icons/category.svg" alt="Categorías" width="16" height="16" className="me-2 navbar-icon-svg" /> Categorías
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/subcategorias" onClick={handleLinkClick}>
                  <img src="/assests/icons/subcategory.svg" alt="Subcategorías" width="16" height="16" className="me-2 navbar-icon-svg" /> Subcategorías
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/productos" onClick={handleLinkClick}>
                  <img src="/assests/icons/product.svg" alt="Productos" width="16" height="16" className="me-2 navbar-icon-svg" /> Productos
                </NavDropdown.Item>
                {isAdmin && (
                  <NavDropdown.Item as={Link} to="/admin/usuarios" onClick={handleLinkClick}>
                    <img src="/assests/icons/account_white.svg" alt="Usuarios" width="16" height="16" className="me-2 navbar-icon-svg" /> Usuarios
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/admin/facturas" onClick={handleLinkClick}>
                  <img src="/assests/icons/bill.svg" alt="Facturas" width="16" height="16" className="me-2 navbar-icon-svg" /> Facturas
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/pedidos" onClick={handleLinkClick}>
                  <img src="/assests/icons/orders.svg" alt="Pedidos" width="16" height="16" className="me-2 navbar-icon-svg" /> Pedidos
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/comentarios" onClick={handleLinkClick}>
                  <img src="/assests/icons/comment.svg" alt="Comentarios" width="16" height="16" className="me-2 navbar-icon-svg" /> Comentarios
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/mis-pedidos" onClick={handleLinkClick}>
                  <img src="/assests/icons/orders.svg" alt="Pedidos" width="16" height="16" className="me-2 navbar-icon-svg" /> Mis Pedidos (Admin)
                </NavDropdown.Item>
              </NavDropdown>
            )}

            {/* Menú Usuario Desktop */}
            <NavDropdown
              title={
                isAuthenticated ? (
                  <span className="user-name-text text-gold small fw-bold">
                    {user?.nombre}
                  </span>
                ) : (
                  <div className="user-icon-btn d-flex align-items-center justify-content-center">
                    <img src="/assests/icons/account_white.svg" alt="Usuario" className="user-icon-img" />
                  </div>
                )
              }
              id="user-dropdown-desktop"
              align="end"
              className="nav-dropdown-custom user-dropdown-desktop-container"
            >
              {isAuthenticated ? (
                <>
                  <div className="dropdown-header-custom px-3 py-2 border-bottom mb-2">
                    <span className="d-block fw-bold text-gold small">{user?.nombre}</span>
                    <span className="d-block text-truncate text-white-50 small" style={{ maxWidth: '180px' }}>
                      {user?.email}
                    </span>
                  </div>
                  <NavDropdown.Item as={Link} to="/perfil" onClick={handleLinkClick}>
                    <i className="bi bi-person me-2" /> Mi Perfil
                  </NavDropdown.Item>
                  {isCliente && (
                    <NavDropdown.Item as={Link} to="/mis-pedidos" onClick={handleLinkClick}>
                      <i className="bi bi-box-seam me-2" /> Mis Pedidos
                    </NavDropdown.Item>
                  )}
                  {(isAdmin || isAuxiliar) && (
                    <>
                      <NavDropdown.Item as={Link} to="/admin/mis-pedidos" onClick={handleLinkClick}>
                        <i className="bi bi-box-seam me-2" /> Mis Pedidos (Admin)
                      </NavDropdown.Item>
                    </>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2" /> Cerrar Sesión
                  </NavDropdown.Item>
                </>
              ) : (
                <>
                  <NavDropdown.Item as={Link} to="/login" onClick={handleLinkClick}>
                    <i className="bi bi-box-arrow-in-right me-2" /> Iniciar Sesión
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/register" onClick={handleLinkClick}>
                    <i className="bi bi-person-plus me-2" /> Registrarse
                  </NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>

          {/* Menú Administración para Móviles (Visible solo en pantallas pequeñas adentro del collapse) */}
          {(isAdmin || isAuxiliar) && (
            <div className="d-lg-none border-top mt-3 pt-2 admin-mobile-menu">
              <div className="px-3 py-2 text-gold fw-bold small d-flex align-items-center">
                <img src="/assests/icons/access_flash.svg" alt="Administración" width="16" height="16" className="me-2 navbar-icon-svg" /> ADMINISTRACIÓN
              </div>
              <Nav.Link as={Link} to="/admin/dashboard" onClick={handleLinkClick} className="nav-link-custom ps-4">
                <img src="/assests/icons/access_flash.svg" alt="Dashboard" width="16" height="16" className="me-2 navbar-icon-svg" /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/categorias" onClick={handleLinkClick} className="nav-link-custom ps-4">
                <img src="/assests/icons/category.svg" alt="Categorías" width="16" height="16" className="me-2 navbar-icon-svg" /> Categorías
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/subcategorias" onClick={handleLinkClick} className="nav-link-custom ps-4">
                <img src="/assests/icons/subcategory.svg" alt="Subcategorías" width="16" height="16" className="me-2 navbar-icon-svg" /> Subcategorías
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/productos" onClick={handleLinkClick} className="nav-link-custom ps-4">
                <img src="/assests/icons/product.svg" alt="Productos" width="16" height="16" className="me-2 navbar-icon-svg" /> Productos
              </Nav.Link>
              {isAdmin && (
                <Nav.Link as={Link} to="/admin/usuarios" onClick={handleLinkClick} className="nav-link-custom ps-4">
                  <img src="/assests/icons/account_white.svg" alt="Usuarios" width="16" height="16" className="me-2 navbar-icon-svg" /> Usuarios
                </Nav.Link>
              )}
              <Nav.Link as={Link} to="/admin/facturas" onClick={handleLinkClick} className="nav-link-custom ps-4">
                <img src="/assests/icons/bill.svg" alt="Facturas" width="16" height="16" className="me-2 navbar-icon-svg" /> Facturas
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/pedidos" onClick={handleLinkClick} className="nav-link-custom ps-4">
                <img src="/assests/icons/orders.svg" alt="Pedidos" width="16" height="16" className="me-2 navbar-icon-svg" /> Pedidos
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/comentarios" onClick={handleLinkClick} className="nav-link-custom ps-4">
                <img src="/assests/icons/comment.svg" alt="Comentarios" width="16" height="16" className="me-2 navbar-icon-svg" /> Comentarios
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/mis-pedidos" onClick={handleLinkClick} className="nav-link-custom ps-4">
                <img src="/assests/icons/orders.svg" alt="Pedidos" width="16" height="16" className="me-2 navbar-icon-svg" /> Mis Pedidos (Admin)
              </Nav.Link>
            </div>
          )}
        </Navbar.Collapse>
      </Container>

      {/* Estilos personalizados integrados y optimizados */}
      <style>{`
        .custom-navbar {
          background-color: rgba(25, 40, 71, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.6rem 0;
          transition: all 0.3s ease;
        }
        .navbar-icon-svg {
          vertical-align: middle;
          margin-bottom: 2px;
        }
        .navbar-brand-img {
          height: 38px;
          margin-right: 10px;
          transition: transform 0.3s ease;
        }
        .brand-logo:hover .navbar-brand-img {
          transform: rotate(-8deg) scale(1.08);
        }
        .brand-logo {
          font-weight: 700;
          font-size: 1.3rem;
          text-decoration: none;
        }
        .brand-name {
          color: var(--bs-gold, #f5c271);
          letter-spacing: 0.05em;
        }

        /* Nav links default styling */
        .nav-link-custom {
          color: rgba(255, 255, 255, 0.85) !important;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.5rem 0.9rem !important;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }
        .nav-link-custom:hover {
          color: var(--bs-gold, #f5c271) !important;
          background-color: rgba(255, 255, 255, 0.08);
        }
        .nav-link-custom.active {
          color: var(--bs-gold, #f5c271) !important;
          font-weight: 600;
          border-bottom: 2px solid var(--bs-gold, #f5c271);
          border-radius: 0.5rem 0.5rem 0 0;
          background-color: rgba(255, 255, 255, 0.04);
        }
        .text-gold {
          color: var(--bs-gold, #f5c271) !important;
          font-weight: 600;
        }
        
        /* User Button Icon styling */
        .user-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(245, 194, 113, 0.2);
          color: var(--bs-gold, #f5c271);
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .user-icon-btn:hover {
          background-color: rgba(255, 255, 255, 0.15);
          border-color: var(--bs-gold, #f5c271);
          box-shadow: 0 0 12px rgba(245, 194, 113, 0.35);
          transform: scale(1.05);
        }
        .user-name-text {
          color: var(--fnt-light, #ffffff);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .user-icon-img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }

        /* Mobile specific styles */
        .nav-link-custom-mobile {
          color: rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }
        .nav-link-custom-mobile:hover, .nav-link-custom-mobile.active {
          color: var(--bs-gold, #f5c271);
          background-color: rgba(255, 255, 255, 0.1);
        }
        .custom-toggler-btn {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.5rem;
          padding: 0.4rem;
        }
        .custom-toggler-btn .navbar-toggler-icon {
          filter: invert(1) sepia(1) saturate(5) hue-rotate(330deg);
        }

        /* Dropdowns Styling */
        .nav-dropdown-custom .dropdown-toggle::after {
          color: var(--bs-gold, #f5c271) !important;
          transition: transform 0.25s ease;
        }
        .nav-dropdown-custom.show .dropdown-toggle::after {
          transform: rotate(180deg);
        }
        
        /* Admin Pill Button Styling */
        .admin-dropdown-pill .dropdown-toggle {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: rgba(245, 194, 113, 0.12) !important;
          border: 1.5px solid rgba(245, 194, 113, 0.38) !important;
          border-radius: 2rem !important;
          padding: 0.45rem 1.15rem !important;
          color: var(--bs-gold, #f5c271) !important;
          font-size: 0.92rem;
          font-weight: 600;
          line-height: 1.2;
          white-space: nowrap;
          transition: all 0.25s ease;
        }
        .admin-dropdown-pill .dropdown-toggle::after {
          margin-left: 0.45rem !important;
          vertical-align: middle !important;
          align-self: center !important;
        }
        .admin-dropdown-pill .dropdown-toggle:hover,
        .admin-dropdown-pill.show .dropdown-toggle {
          background: rgba(245, 194, 113, 0.22) !important;
          border-color: var(--bs-gold, #f5c271) !important;
          box-shadow: 0 0 14px rgba(245, 194, 113, 0.3);
          transform: translateY(-1px);
        }

        /* Hide caret arrow for icon-only button */
        .user-dropdown-desktop-container:has(.user-icon-btn) .dropdown-toggle::after,
        .user-dropdown-mobile-container:has(.user-icon-btn) .dropdown-toggle::after {
          display: none !important;
        }

        .nav-dropdown-custom .dropdown-menu {
          background-color: #192847;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          border-radius: 0.75rem;
          padding: 0.5rem;
          margin-top: 0.6rem;
          min-width: 220px;
        }
        .nav-dropdown-custom .dropdown-item {
          color: rgba(255, 255, 255, 0.85) !important;
          border-radius: 0.5rem;
          padding: 0.6rem 1.2rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .nav-dropdown-custom .dropdown-item i {
          opacity: 0.8;
        }
        .nav-dropdown-custom .dropdown-item:hover,
        .nav-dropdown-custom .dropdown-item:focus {
          color: #000000 !important;
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e)) !important;
          font-weight: 600;
        }
        .nav-dropdown-custom .dropdown-item:hover i,
        .nav-dropdown-custom .dropdown-item:focus i {
          opacity: 1;
          color: #000000 !important;
        }
        .nav-dropdown-custom .dropdown-item.text-danger:hover {
          background: #dc3545 !important;
          color: #ffffff !important;
        }
        .nav-dropdown-custom .dropdown-item.text-danger:hover i {
          color: #ffffff !important;
        }
        .dropdown-header-custom {
          color: var(--bs-gold, #f5c271);
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .dropdown-divider {
          border-color: rgba(255, 255, 255, 0.1);
          margin: 0.4rem 0;
        }
      `}</style>
    </Navbar>
  );
});

export default NavigationBar;