/**
 * ============================================
 * RUTAS DE COMENTARIOS/RESEÑAS
 * ============================================
 * Define los endpoints para comentarios y reseñas de productos.
 * 
 * Rutas:
 * - POST   /comentarios                          → Crear comentario (cliente autenticado)
 * - GET    /catalogo/productos/:productoId/comentarios    → Ver comentarios de producto (público)
 * - PUT    /admin/comentarios/:comentarioId/moderar → Moderar comentario (admin)
 * - PATCH  /admin/comentarios/:comentarioId/toggle  → Alternar visibilidad (admin)
 * - DELETE /admin/comentarios/:comentarioId      → Eliminar comentario (admin)
 * - GET    /admin/comentarios/usuario/:usuarioId → Buscar comentarios por usuario (admin)
 */

const express = require('express');
const router = express.Router();

// Importa el controlador de comentarios
const {
  crearComentario,
  obtenerComentariosProducto,
  editarComentario,
  eliminarComentarioPropio,
  moderarComentario,
  toggleComentario,
  eliminarComentario,
  obtenerTodosComentarios,
  obtenerComentariosPorUsuario
} = require('../controllers/comentario.controller');

// Importa middlewares de autenticación
const { verificarAuth } = require('../middleware/auth');
const { esAdminOAuxiliar, soloAdministrador } = require('../middleware/checkRole');

/**
 * RUTAS CLIENTE (requieren autenticación)
 */

/**
 * POST /api/cliente/comentarios
 * Crea un nuevo comentario sobre un producto
 * Requiere: usuario autenticado, haber comprado el producto
 */
router.post('/cliente/comentarios', verificarAuth, crearComentario);

/**
 * PUT /api/cliente/comentarios/:comentarioId
 * Edita un comentario propio.
 */
router.put('/cliente/comentarios/:comentarioId', verificarAuth, editarComentario);

/**
 * DELETE /api/cliente/comentarios/:comentarioId
 * Elimina un comentario propio.
 */
router.delete('/cliente/comentarios/:comentarioId', verificarAuth, eliminarComentarioPropio);

/**
 * RUTAS PÚBLICAS (sin autenticación)
 */

/**
 * GET /api/catalogo/productos/:productoId/comentarios
 * Obtiene comentarios visibles de un producto con paginación
 * Query params: pagina, limite
 */
router.get('/catalogo/productos/:productoId/comentarios', obtenerComentariosProducto);

/**
 * RUTAS ADMIN (requieren autenticación y rol admin)
 */

/**
 * PUT /api/admin/comentarios/:comentarioId/moderar
 * Moderar un comentario (visible o no_visible)
 * Body: { estado: 'visible' | 'no_visible' } o { visible: true | false }
 */
router.put('/admin/comentarios/:comentarioId/moderar', verificarAuth, esAdminOAuxiliar, moderarComentario);

/**
 * PATCH /api/admin/comentarios/:comentarioId/toggle
 * Alterna la visibilidad del comentario.
 */
router.patch('/admin/comentarios/:comentarioId/toggle', verificarAuth, esAdminOAuxiliar, toggleComentario);

/**
 * DELETE /api/admin/comentarios/:comentarioId
 * Eliminar un comentario (solo administrador)
 */
router.delete('/admin/comentarios/:comentarioId', verificarAuth, soloAdministrador, eliminarComentario);

/**
 * GET /api/admin/comentarios
 * Lista todos los comentarios de todos los usuarios.
 * Query params opcionales: pagina, limite
 */
router.get('/admin/comentarios', verificarAuth, esAdminOAuxiliar, obtenerTodosComentarios);

/**
 * GET /api/admin/comentarios/usuario/:usuarioId
 * Busca comentarios creados por un usuario específico.
 */
router.get('/admin/comentarios/usuario/:usuarioId', verificarAuth, esAdminOAuxiliar, obtenerComentariosPorUsuario);

module.exports = router;
