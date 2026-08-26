import React, { useState, useEffect, forwardRef, memo, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SvgIcon from './SvgIcon';
import { Dropdown } from 'react-bootstrap';

const CustomToggle = forwardRef(({ children, onClick }, ref) => (
  <button
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm border-0 profile-avatar-btn"
    style={{
      width: '40px',
      height: '40px',
      backgroundColor: '#8f6a34',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    }}
  >
    {children}
  </button>
));

CustomToggle.displayName = 'CustomToggle';

const AdminLayout = memo(() => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar collapse state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('gavat_admin_sidebar_collapsed');
    return saved === 'true';
  });

  // Mobile sidebar open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('gavat_admin_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const getPageTitle = useCallback((pathname) => {
    if (pathname.includes('/admin/dashboard') || pathname === '/admin') return 'Dashboard Principal';
    if (pathname.includes('/admin/usuarios')) return 'Gestión de Usuarios';
    if (pathname.includes('/admin/pedidos')) return 'Lista de Pedidos';
    if (pathname.includes('/admin/comentarios')) return 'Gestión de Comentarios';
    if (pathname.includes('/admin/categorias')) return 'Gestión de Categorías';
    if (pathname.includes('/admin/subcategorias')) return 'Gestión de Subcategorías';
    if (pathname.includes('/admin/productos')) return 'Gestión de Productos';
    if (pathname.includes('/admin/facturas')) return 'Gestión de Facturas';
    return 'Panel de Administración';
  }, []);

  const menuItems = [
    { path: '/admin/dashboard', icon: 'access_flash', label: 'Dashboard' },
    { path: '/admin/usuarios', icon: 'account_white', label: 'Gestión de Usuarios' },
    { path: '/admin/pedidos', icon: 'orders', label: 'Lista de Pedidos' },
    { path: '/admin/comentarios', icon: 'comment', label: 'Gestión de Comentarios' },
    { path: '/admin/categorias', icon: 'category', label: 'Gestión de Categorías' },
    { path: '/admin/subcategorias', icon: 'subcategory', label: 'Gestión de Subcategorías' },
    { path: '/admin/productos', icon: 'product', label: 'Gestión de Productos' },
    { path: '/admin/facturas', icon: 'bill', label: 'Gestión de Facturas' }
  ];

  return (
    <div className="admin-layout-container">
      {/* Mobile overlay for sidebar */}
      {isMobileOpen && (
        <div className="admin-sidebar-overlay" onClick={toggleMobileSidebar} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-section d-flex align-items-center justify-content-between">
          {!isCollapsed ? (
            <h4 className="fw-bold mb-0 brand-text-sidebar">GAVAT</h4>
          ) : (
            <h4 className="fw-bold mb-0 brand-text-sidebar mx-auto">G</h4>
          )}
          {/* Close button for mobile */}
          <button className="btn text-white d-md-none p-0 border-0" onClick={toggleMobileSidebar} aria-label="Close menu">
            <i className="bi bi-x fs-3" />
          </button>
        </div>

        <div className="sidebar-menu-wrapper flex-grow-1">
          {!isCollapsed && <div className="sidebar-section-header mb-3">MENÚ PRINCIPAL</div>}
          <nav className="d-flex flex-column gap-1">
            {menuItems.map((item) => {
              const active = location.pathname === item.path || 
                             (item.path === '/admin/dashboard' && location.pathname === '/admin');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-nav-link ${active ? 'active' : ''}`}
                >
                  <SvgIcon name={item.icon} size={18} className="sidebar-icon" />
                  {!isCollapsed && <span className="sidebar-link-text">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <div className="sidebar-footer-toggle-wrap">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Colapsar menú">
            <i className="bi bi-list fs-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace (Top navbar + Content Outlet) */}
      <div className="admin-workspace">
        {/* White Top Navbar */}
        <header className="admin-top-navbar d-flex align-items-center justify-content-between px-4">
          <div className="d-flex align-items-center gap-3">
            {/* Mobile menu trigger */}
            <button className="btn p-0 border-0 d-md-none text-navy" onClick={toggleMobileSidebar} aria-label="Open menu">
              <i className="bi bi-list fs-3" />
            </button>
            <h2 className="admin-page-title mb-0">{getPageTitle(location.pathname)}</h2>
          </div>

          <div className="admin-navbar-right d-flex align-items-center gap-3">
            <span className="text-muted small d-none d-sm-inline">
              Hola, <strong>{user?.nombre || 'Administrador'}</strong>
            </span>

            {/* Profile circular "A" Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle as={CustomToggle}>
                {(user?.nombre || 'Admin')[0].toUpperCase()}
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-dropdown-menu border-0 shadow-lg mt-2">
                <div className="dropdown-profile-header px-3 py-2 border-bottom mb-2">
                  <span className="d-block fw-bold text-navy">{user?.nombre || 'Administrador'}</span>
                  <span className="d-block text-muted small text-truncate" style={{ maxWidth: '180px' }}>
                    {user?.email || 'admin@gavat.com'}
                  </span>
                </div>
                <Dropdown.Item as={Link} to="/login">
                  <i className="bi bi-box-arrow-in-right me-2 text-muted" /> Iniciar Sesión
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/register">
                  <i className="bi bi-person-plus me-2 text-muted" /> Registrarse
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/dashboard">
                  <i className="bi bi-speedometer2 me-2 text-muted" /> Gestor de Administrador
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/">
                  <i className="bi bi-shop me-2 text-muted" /> Ir a Tienda
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2" /> Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-layout-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background-color: #f8fafc;
          overflow: hidden;
        }

        /* SIDEBAR STYLES */
        .admin-sidebar {
          width: 280px;
          background-color: #192847;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1050;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .admin-sidebar.collapsed {
          width: 80px;
        }

        .sidebar-brand-section {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          height: 70px;
          flex-shrink: 0;
        }

        .brand-text-sidebar {
          letter-spacing: 0.1em;
          font-family: 'Libre Baskerville', serif;
          color: #ffffff;
        }

        .sidebar-menu-wrapper {
          padding: 1.5rem 1rem;
          overflow-y: auto;
        }

        .sidebar-section-header {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a0aec0;
          font-weight: 700;
          padding-left: 0.75rem;
        }

        .sidebar-nav-link {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.75) !important;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
        }

        .admin-sidebar.collapsed .sidebar-nav-link {
          justify-content: center;
          padding: 0.8rem 0;
        }

        .sidebar-nav-link:hover {
          color: #ffffff !important;
          background-color: rgba(255, 255, 255, 0.06);
        }

        .sidebar-nav-link.active {
          background-color: #8f6a34;
          color: #ffffff !important;
          font-weight: 600;
        }

        .sidebar-icon {
          flex-shrink: 0;
          transition: margin 0.2s ease;
        }

        .admin-sidebar:not(.collapsed) .sidebar-icon {
          margin-right: 0.75rem;
        }

        .sidebar-link-text {
          opacity: 1;
          transition: opacity 0.2s ease;
        }

        .admin-sidebar.collapsed .sidebar-link-text {
          opacity: 0;
          display: none;
        }

        .sidebar-footer-toggle-wrap {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .admin-sidebar.collapsed .sidebar-footer-toggle-wrap {
          justify-content: center;
        }

        .sidebar-toggle-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .sidebar-toggle-btn:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.1);
        }

        /* WORKSPACE STYLES */
        .admin-workspace {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-width: 0;
          height: 100vh;
        }

        .admin-top-navbar {
          height: 70px;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .admin-page-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #192847;
        }

        .admin-workspace .admin-content-area {
          flex-grow: 1;
          padding: 2rem;
          overflow-y: auto;
          background-color: #f8fafc;
        }

        .profile-avatar-btn:hover {
          transform: scale(1.05);
        }

        .profile-dropdown-menu {
          border-radius: 12px !important;
          padding: 0.5rem 0 !important;
          min-width: 220px;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }

        .profile-dropdown-menu .dropdown-item {
          padding: 0.7rem 1.2rem !important;
          color: #4a5568;
          font-weight: 500;
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
        }

        .profile-dropdown-menu .dropdown-item:hover {
          background-color: #f8fafc !important;
          color: #192847 !important;
        }

        .dropdown-profile-header {
          color: #192847;
        }

        .text-navy {
          color: #192847 !important;
        }

        /* RESPONSIVE DESIGN (MOBILE & TABLET) */
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: -280px;
            width: 280px;
            height: 100vh;
            transition: left 0.3s ease;
            box-shadow: 5px 0 15px rgba(0,0,0,0.1);
          }

          .admin-sidebar.mobile-open {
            left: 0;
          }

          .admin-sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1040;
          }

          .admin-top-navbar {
            padding: 0 1.25rem !important;
          }

          .admin-workspace .admin-content-area {
            padding: 1.25rem;
          }

          /* Hide desktop collapse buttons on mobile */
          .sidebar-footer-toggle-wrap {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
