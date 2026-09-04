/**
 * ============================================
 * CONTROLADOR DE DASHBOARD (Admin)
 * ============================================
 * Proporciona métricas y estadísticas consolidadas del sistema.
 * Optimizado para ejecutar conteos puros a nivel de base de datos (COUNT(*)),
 * sin cargar filas, modelos o relaciones en memoria de Node.js.
 */

const {
  Usuario,
  Categoria,
  Subcategoria,
  Producto,
  Pedido,
  Factura,
  Comentario,
} = require('../models');

/**
 * Obtener estadísticas globales para el Dashboard
 * 
 * Ruta: GET /api/admin/dashboard/stats
 * Acceso: Administrador y Auxiliar
 * 
 * Realiza conteos en paralelo directo en MySQL (SELECT COUNT(*) FROM table).
 * Tiempo de ejecución estimado: < 15ms.
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      categorias,
      subcategorias,
      productos,
      usuarios,
      pedidos,
      pedidosPendientes,
      facturas,
      comentarios,
    ] = await Promise.all([
      Categoria.count(),
      Subcategoria.count(),
      Producto.count(),
      Usuario.count(),
      Pedido.count(),
      Pedido.count({ where: { estado: 'pendiente' } }),
      Factura.count(),
      Comentario.count(),
    ]);

    return res.json({
      success: true,
      data: {
        categorias,
        subcategorias,
        productos,
        usuarios,
        pedidos,
        pedidosPendientes,
        facturas,
        comentarios,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
