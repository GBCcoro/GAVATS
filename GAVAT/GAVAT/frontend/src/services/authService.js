/**
 * ============================================
 * SERVICIO DE AUTENTICACIÓN
 * ============================================
 * Funciones para registro, login y gestión de perfil
 */

import api from './api';

const authService = {
  /**
   * Registrar nuevo usuario
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Guardar token y usuario en localStorage
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      }
      
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Iniciar sesión
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Guardar token y usuario en localStorage
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      }
      
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Actualizar perfil
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/me', userData);
      
      // Actualizar usuario y token en localStorage
      if (response.data.success) {
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        const updatedUser = response.data.data?.usuario || response.data.usuario;
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Desactivar cuenta propia (solo clientes)
   */
  desactivarCuenta: async () => {
    try {
      const response = await api.delete('/auth/me');
      authService.logout();
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  deleteAccount: async () => {
    return authService.desactivarCuenta();
  },

  /**
   * Obtener usuario actual del localStorage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verificar si hay token válido
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Verificar si es administrador
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.rol === 'administrador';
  },

  /**
   * Verificar si es auxiliar
   */
  isAuxiliar: () => {
    const user = authService.getCurrentUser();
    return user?.rol === 'auxiliar';
  },

  /**
   * Verificar si es cliente
   */
  isCliente: () => {
    const user = authService.getCurrentUser();
    return user?.rol === 'cliente';
  },
};

export default authService;
