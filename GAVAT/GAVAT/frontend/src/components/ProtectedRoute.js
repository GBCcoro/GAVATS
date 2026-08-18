import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, adminOnly = false }) => {
  const { user, loading, isAdmin, isAuxiliar } = useAuth();

  // Mientras carga, mostrar loading con estilos personalizados
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-positiva protected-route-loading">
        <div className="text-center">
          <div
            className="spinner-border mb-3 protected-route-spinner"
            role="status"
            aria-live="polite"
            aria-label="Cargando"
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-dark protected-route-message">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere admin y no es admin ni auxiliar
  if (requireAdmin && !isAdmin && !isAuxiliar) {
    return <Navigate to="/" replace />;
  }

  // Si requiere admin solo (no auxiliar)
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Si todo está bien, renderizar el componente
  return children;
};

export default ProtectedRoute;