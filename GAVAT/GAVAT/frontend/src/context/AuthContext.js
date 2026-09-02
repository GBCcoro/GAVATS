/**
 * ============================================
 * CONTEXT DE AUTENTICACIÓN
 * ============================================
 * Gestión del estado global del usuario autenticado
 */

import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import authService from '../services/authService';
import carritoService from '../services/carritoService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading] = useState(false);

  // Login
  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.usuario);
    
    // Sincronizar carrito local con el servidor después de establecer el usuario
    setTimeout(async () => {
      try {
        const resultado = await carritoService.sincronizarCarritoLocal();
        if (resultado.sincronizados > 0) {
          console.log(`✅ ${resultado.sincronizados} productos sincronizados al carrito`);
        }
      } catch (error) {
        console.error('Error sincronizando carrito:', error);
      }
    }, 500);
    
    return response;
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);
    setUser(response.usuario);
    
    // Sincronizar carrito local con el servidor después de establecer el usuario
    setTimeout(async () => {
      try {
        const resultado = await carritoService.sincronizarCarritoLocal();
        if (resultado.sincronizados > 0) {
          console.log(`✅ ${resultado.sincronizados} productos sincronizados al carrito`);
        }
      } catch (error) {
        console.error('Error sincronizando carrito:', error);
      }
    }, 500);
    
    return response;
  }, []);

  // Logout
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async (userData) => {
    const response = await authService.updateProfile(userData);
    const usuario = response?.data?.usuario || response?.usuario || response?.data;
    if (usuario) {
      setUser(usuario);
    }
    return response;
  }, []);

  // Desactivar cuenta propia (cliente)
  const desactivarCuenta = useCallback(async () => {
    const response = await authService.desactivarCuenta ? await authService.desactivarCuenta() : await authService.deleteAccount();
    setUser(null);
    return response;
  }, []);

  const deleteAccount = desactivarCuenta;

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    desactivarCuenta,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'administrador',
    isAuxiliar: user?.rol === 'auxiliar',
    isCliente: user?.rol === 'cliente',
  }), [user, loading, login, register, logout, updateProfile, desactivarCuenta]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
