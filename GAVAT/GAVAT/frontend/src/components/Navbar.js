/**
 * ============================================
 * NAVBAR COMPONENT - Adaptado a la paleta del proyecto
 * ============================================
 * Barra de navegación principal con menú responsive y colores personalizados
 */

import React, { memo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const NavigationBar = memo(() => {
  const { user, isAuthenticated, isAdmin, isAuxiliar, isCliente, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const isActive = useCallback((path) => location.pathname === path, [location]);

  return (
    <Navbar expand="lg" sticky="top" className="custom-navbar shadow-sm">
      <Container>
        {/* LOGO (Siempre a la izquierda) */}
        <Navbar.Brand as={Link} to="/" className="brand-logo d-flex align-items-center">
          <img 
            src="/gavat.png" 
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
            className={`nav-link-custom-mobile me-2 ${isActive('/carrito') ? 'active' : ''}`} 
            aria-label="Carrito de compras"
          >
            <i className="bi bi-cart3 fs-4" />
          </Link>

          {/* Menú Usuario en Móvil (Solo Icono) */}
          <NavDropdown
            title={
              <div className="user-icon-btn d-flex align-items-center justify-content-center">
                <img src="/assests/icons/account_white.svg" alt="Usuario" className="user-icon-img" />
              </div>
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
                <NavDropdown.Item as={Link} to="/perfil">
                  <i className="bi bi-person me-2" /> Mi Perfil
                </NavDropdown.Item>
                {isCliente && (
                  <NavDropdown.Item as={Link} to="/mis-pedidos">
                    <i className="bi bi-box-seam me-2" /> Mis Pedidos
                  </NavDropdown.Item>
                )}
                {(isAdmin || isAuxiliar) && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin/mis-pedidos">
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
                <NavDropdown.Item as={Link} to="/login">
                  <i className="bi bi-box-arrow-in-right me-2" /> Iniciar Sesión
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/register">
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
            <Nav.Link as={Link} to="/" className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}>
              <i className="bi bi-house-door me-2 d-lg-none" />Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/catalogo" className={`nav-link-custom ${isActive('/catalogo') ? 'active' : ''}`}>
              <i className="bi bi-grid me-2 d-lg-none" />Catálogo
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/carrito" 
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
                  <span className="d-flex align-items-center text-gold">
                    <i className="bi bi-shield-lock me-1" /> Administración
                  </span>
                }
                id="admin-dropdown-desktop"
                className="nav-dropdown-custom me-3"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/admin/dashboard">
                  <i className="bi bi-speedometer2 me-2" /> Dashboard
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/categorias">Categorías</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/subcategorias">Subcategorías</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/productos">Productos</NavDropdown.Item>
                {isAdmin && (
                  <NavDropdown.Item as={Link} to="/admin/usuarios">Usuarios</NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/admin/facturas">Facturas</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/pedidos">Pedidos</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/comentarios">Comentarios</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/mis-pedidos">Mis Pedidos (Admin)</NavDropdown.Item>
              </NavDropdown>
            )}

            {/* Dropdown de Usuario (Desktop) */}
            <NavDropdown
              title={
                <div className="user-icon-btn d-flex align-items-center justify-content-center">
                  <img src="/assests/icons/account_white.svg" alt="Usuario" className="user-icon-img" />
                  {isAuthenticated && (
                    <span className="ms-2 user-name-text d-none d-xl-inline">
                      {user?.nombre?.split(' ')[0]}
                    </span>
                  )}
                </div>
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
                  <NavDropdown.Item as={Link} to="/perfil">
                    <i className="bi bi-person me-2" /> Mi Perfil
                  </NavDropdown.Item>
                  {isCliente && (
                    <NavDropdown.Item as={Link} to="/mis-pedidos">
                      <i className="bi bi-box-seam me-2" /> Mis Pedidos
                    </NavDropdown.Item>
                  )}
                  {(isAdmin || isAuxiliar) && (
                    <>
                      <NavDropdown.Item as={Link} to="/admin/mis-pedidos">
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
                  <NavDropdown.Item as={Link} to="/login">
                    <i className="bi bi-box-arrow-in-right me-2" /> Iniciar Sesión
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/register">
                    <i className="bi bi-person-plus me-2" /> Registrarse
                  </NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>

          {/* Menú Administración para Móviles (Visible solo en pantallas pequeñas adentro del collapse) */}
          {(isAdmin || isAuxiliar) && (
            <div className="d-lg-none border-top mt-3 pt-2 admin-mobile-menu">
              <div className="px-3 py-2 text-gold fw-bold small">
                <i className="bi bi-shield-lock me-1" /> ADMINISTRACIÓN
              </div>
              <Nav.Link as={Link} to="/admin/dashboard" className="nav-link-custom ps-4">
                <i className="bi bi-speedometer2 me-2" /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/categorias" className="nav-link-custom ps-4">Categorías</Nav.Link>
              <Nav.Link as={Link} to="/admin/subcategorias" className="nav-link-custom ps-4">Subcategorías</Nav.Link>
              <Nav.Link as={Link} to="/admin/productos" className="nav-link-custom ps-4">Productos</Nav.Link>
              {isAdmin && (
                <Nav.Link as={Link} to="/admin/usuarios" className="nav-link-custom ps-4">Usuarios</Nav.Link>
              )}
              <Nav.Link as={Link} to="/admin/facturas" className="nav-link-custom ps-4">Facturas</Nav.Link>
              <Nav.Link as={Link} to="/admin/pedidos" className="nav-link-custom ps-4">Pedidos</Nav.Link>
              <Nav.Link as={Link} to="/admin/comentarios" className="nav-link-custom ps-4">Comentarios</Nav.Link>
              <Nav.Link as={Link} to="/admin/mis-pedidos" className="nav-link-custom ps-4">Mis Pedidos (Admin)</Nav.Link>
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
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-light, #f0db7f));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: 0.5px;
        }
        .nav-link-custom {
          color: rgba(255, 255, 255, 0.85) !important;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.5rem 1rem !important;
          border-radius: 0.5rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 0.15rem;
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
        
        /* Hide caret arrow for user menu dropdowns */
        .user-dropdown-desktop-container .dropdown-toggle::after,
        .user-dropdown-mobile-container .dropdown-toggle::after {
          display: none !important;
        }

        .nav-dropdown-custom .dropdown-menu {
          background-color: #192847;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          border-radius: 0.75rem;
          padding: 0.5rem;
          margin-top: 0.6rem;
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
        .nav-dropdown-custom .dropdown-item:hover {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          color: var(--fnt-black, #000000) !important;
          transform: translateX(3px);
        }
        .nav-dropdown-custom .dropdown-item:hover i {
          opacity: 1;
        }
        .nav-dropdown-custom .dropdown-divider {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .dropdown-header-custom {
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 0.5rem;
        }

        /* Mobile specific collapse styling */
        @media (max-width: 991.98px) {
          .navbar-collapse {
            background-color: #192847;
            border-radius: 0.75rem;
            margin-top: 0.75rem;
            padding: 1rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .nav-link-custom {
            margin: 0.25rem 0;
            padding: 0.6rem 1rem !important;
          }
          .nav-link-custom.active {
            border-bottom: none;
            border-left: 3px solid var(--bs-gold, #f5c271);
            border-radius: 0.5rem;
            background-color: rgba(255, 255, 255, 0.04);
          }
          .admin-mobile-menu {
            border-color: rgba(255, 255, 255, 0.1) !important;
          }
        }
      `}</style>
    </Navbar>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;