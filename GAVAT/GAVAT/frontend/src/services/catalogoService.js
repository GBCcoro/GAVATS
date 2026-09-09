/**
 * ============================================
 * SERVICIO DE CATÁLOGO (PÚBLICO)
 * ============================================
 * Funciones para ver productos, categorías (sin autenticación)
 */

import api from './api';

/**
 * Helper genérico para peticiones GET del catálogo con manejo de error estándar
 */
const fetchCatalogo = async (endpoint, config = {}) => {
  try {
    const response = await api.get(endpoint, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error de conexión' };
  }
};

const catalogoService = {
  /**
   * Obtener productos con filtros
   */
  getProductos: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, typeof val === 'string' ? val.trim() : val);
      }
    });

    const queryString = params.toString();
    return fetchCatalogo(`/catalogo/productos${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Obtener un producto por ID
   */
  getProductoById: (id) => fetchCatalogo(`/catalogo/productos/${id}`),

  /**
   * Obtener todas las categorías activas
   */
  getCategorias: () => fetchCatalogo('/catalogo/categorias'),

  /**
   * Obtener subcategorías por categoría
   */
  getSubcategoriasPorCategoria: (categoriaId) =>
    fetchCatalogo(`/catalogo/categorias/${categoriaId}/subcategorias`),

  /**
   * Obtener productos destacados
   */
  getProductosDestacados: () => fetchCatalogo('/catalogo/destacados'),
};

export default catalogoService;
