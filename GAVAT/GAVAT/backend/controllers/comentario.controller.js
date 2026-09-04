/**
 * ============================================
 * CONTROLADOR DE COMENTARIOS/RESEÑAS
 * ============================================
 * Gestiona la creación, visualización y moderación de comentarios sobre productos.
 * Funciones de CLIENTE: crear comentario (solo si compró el producto), ver comentarios.
 * Funciones de ADMIN: moderar comentarios (visible/no_visible), eliminar.
 * Requiere autenticación (token JWT en crear y moderar).
 */

const Comentario = require('../models/Comentario');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const DetallePedido = require('../models/DetallePedido');
const Pedido = require('../models/Pedido');
const {
  handleServerError,
  sendNotFound,
  parsePaginationQuery,
  normalizeBooleanLabel,
} = require('./_sharedControllerHelpers');
const { Op } = require('sequelize');

const serializarComentario = (comentario) => ({
  id: comentario.id,
  usuarioId: comentario.usuarioId,
  autor: comentario.usuario?.nombre || null,
  email: comentario.usuario?.email || null,
  productoId: comentario.productoId,
  producto: comentario.producto?.nombre || null,
  comentario: comentario.comentario,
  calificacion: comentario.calificacion,
  estado: normalizeBooleanLabel(comentario.estado),
  fecha: comentario.fecha,
});

/**
 * Crear comentario sobre un producto - CLIENTE
 * 
 * Ruta: POST /api/cliente/comentarios
 * Body JSON: { productoId, comentario, calificacion }
 * 
 * Restricciones:
 * - El usuario debe estar autenticado (cliente)
 * - El usuario debe haber comprado el producto previamente
 * - Calificación debe ser número entre 1 y 5
 * - El comentario no puede estar vacío
 * 
 * Retorna:
 * - 201: Comentario creado exitosamente
 * - 400: Faltan campos, usuario no compró el producto, o validación fallida
 * - 401: Usuario no autenticado
 * - 404: Producto no existe
 * - 500: Error interno del servidor
 */
const crearComentario = async (req, res) => {
  try {
    // Extrae datos del body y del usuario autenticado
    const usuarioId = req.usuario.id;
    const { productoId, comentario, calificacion } = req.body;

    // VALIDACIÓN 1: Campos requeridos
    if (!productoId || !comentario || calificacion === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: productoId, comentario y calificacion'
      });
    }

    // VALIDACIÓN 2: Calificación válida (1-5)
    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe ser un número entero entre 1 y 5'
      });
    }

    // VALIDACIÓN 3: Comentario dentro de límites
    const comentarioTrimmed = comentario.trim();
    if (comentarioTrimmed.length === 0 || comentarioTrimmed.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'El comentario debe tener entre 1 y 200 caracteres'
      });
    }

    // VALIDACIÓN 4: Producto existe
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return sendNotFound(res, 'El producto especificado no existe');
    }

    // VALIDACIÓN 5: El usuario ha comprado este producto (CRÍTICO)
    const compraPrevia = await DetallePedido.findOne({
      include: [
        {
          model: Pedido,
          as: 'pedido',
          where: { usuarioId },
          attributes: ['id', 'estado']
        }
      ],
      where: { productoId }
    });

    if (!compraPrevia) {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes comentar productos que hayas comprado'
      });
    }

    // Crea el comentario visible por defecto
    const nuevoComentario = await Comentario.create({
      usuarioId,
      productoId,
      comentario: comentarioTrimmed,
      calificacion,
      estado: true
    });

    // Retorna el comentario creado
    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente.',
      data: {
        id: nuevoComentario.id,
        productoId: nuevoComentario.productoId,
        comentario: nuevoComentario.comentario,
        calificacion: nuevoComentario.calificacion,
        estado: nuevoComentario.estado ? 'visible' : 'no_visible',
        fecha: nuevoComentario.fecha
      }
    });

  } catch (error) {
    return handleServerError(res, error, 'Error al crear el comentario');
  }
};

/**
 * Ver comentarios de un producto - PÚBLICO
 * 
 * Ruta: GET /api/catalogo/productos/:productoId/comentarios?pagina=1&limite=10
 * 
 * Características:
 * - Muestra solo comentarios visibles por defecto
 * - Paginación: 10 comentarios por página
 * - Ordena por fecha descendente (más recientes primero)
 * - Incluye información del usuario que comentó
 * - Calcula promedio de calificación
 * - No requiere autenticación
 * 
 * Parámetros:
 * - productoId: ID del producto
 * - pagina: número de página (default: 1)
 * - limite: comentarios por página (default: 10, máximo: 20)
 * 
 * Retorna:
 * - 200: Lista de comentarios paginada
 * - 404: Producto no existe
 * - 500: Error interno
 */
const obtenerComentariosProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { page, limit, offset } = parsePaginationQuery(req.query, {
      pageKey: 'pagina',
      limitKey: 'limite',
      defaultLimit: 10,
      maxLimit: 20,
    });

    // VALIDACIÓN: Producto existe
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return sendNotFound(res, 'El producto especificado no existe');
    }

    // Obtiene comentarios visibles
    const { count, rows: comentarios } = await Comentario.findAndCountAll({
      where: {
        productoId,
        estado: true
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ],
      order: [['fecha', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    const comentariosVisibles = await Comentario.findAll({
      where: {
        productoId,
        estado: true
      },
      raw: true
    });

    const calificacionPromedio = comentariosVisibles.length > 0
      ? (comentariosVisibles.reduce((sum, c) => sum + c.calificacion, 0) / comentariosVisibles.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          calificacionPromedio: Number.parseFloat(calificacionPromedio),
          totalComentarios: comentariosVisibles.length
        },
        comentarios: comentarios.map(serializarComentario),
        paginacion: {
          paginaActual: page,
          totalPaginas: Math.ceil(count / limit),
          totalComentarios: count,
          comentariosPorPagina: limit
        }
      }
    });

  } catch (error) {
    return handleServerError(res, error, 'Error al obtener comentarios');
  }
};

/**
 * Eliminar comentario - ADMIN
 * 
 * Ruta: DELETE /api/admin/comentarios/:comentarioId
 * 
 * Restricciones:
 * - Solo administradores pueden eliminar comentarios
 * 
 * Retorna:
 * - 200: Comentario eliminado
 * - 401: No es administrador
 * - 404: Comentario no existe
 * - 500: Error interno
 */
const eliminarComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;

    // Busca el comentario
    const comentario = await Comentario.findByPk(comentarioId);
    if (!comentario) {
      return sendNotFound(res, 'El comentario especificado no existe');
    }

    // Obtiene datos antes de eliminar
    const productoId = comentario.productoId;

    // Elimina el comentario
    await comentario.destroy();

    res.status(200).json({
      success: true,
      message: 'Comentario eliminado exitosamente',
      data: {
        id: comentarioId,
        productoId
      }
    });

  } catch (error) {
    return handleServerError(res, error, 'Error al eliminar el comentario');
  }
};

/**
 * Moderar comentario - ADMIN
 * 
 * Ruta: PUT /api/admin/comentarios/:comentarioId/moderar
 * Body JSON: { estado: 'visible' | 'no_visible' } o { visible: true | false }
 */
const moderarComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const { estado, visible } = req.body;

    if (estado === undefined && visible === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar estado o visible para modificar el comentario'
      });
    }

    let nuevoEstado;
    if (visible !== undefined) {
      if (typeof visible !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'visible debe ser true o false'
        });
      }
      nuevoEstado = visible;
    } else {
      const estadoTexto = estado.toString().toLowerCase();
      if (!['visible', 'no_visible'].includes(estadoTexto)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser "visible" o "no_visible"'
        });
      }
      nuevoEstado = estadoTexto === 'visible';
    }

    const comentario = await Comentario.findByPk(comentarioId);
    if (!comentario) {
      return sendNotFound(res, 'Comentario no encontrado');
    }

    await comentario.update({ estado: nuevoEstado });

    res.status(200).json({
      success: true,
      message: `Comentario ${normalizeBooleanLabel(nuevoEstado)}`,
      data: {
        id: comentario.id,
        estado: normalizeBooleanLabel(nuevoEstado)
      }
    });
  } catch (error) {
    return handleServerError(res, error, 'Error al moderar el comentario');
  }
};

/**
 * Toggle visibilidad de comentario - ADMIN
 *
 * Ruta: PATCH /api/admin/comentarios/:comentarioId/toggle
 */
const toggleComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const comentario = await Comentario.findByPk(comentarioId);
    if (!comentario) {
      return sendNotFound(res, 'Comentario no encontrado');
    }

    const nuevoEstado = !comentario.estado;
    await comentario.update({ estado: nuevoEstado });

    res.status(200).json({
      success: true,
      message: `Comentario ${normalizeBooleanLabel(nuevoEstado)}`,
      data: {
        id: comentario.id,
        estado: normalizeBooleanLabel(nuevoEstado)
      }
    });
  } catch (error) {
    return handleServerError(res, error, 'Error al cambiar la visibilidad del comentario');
  }
};

/**
 * Editar comentario propio - CLIENTE
 * 
 * Ruta: PUT /api/cliente/comentarios/:comentarioId
 * Body JSON: { comentario, calificacion }
 * Solo el autor puede editar su propio comentario.
 */
const editarComentario = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { comentarioId } = req.params;
    const { comentario, calificacion } = req.body;

    const comentarioBD = await Comentario.findByPk(comentarioId);
    if (!comentarioBD) {
      return sendNotFound(res, 'Comentario no encontrado');
    }

    if (comentarioBD.usuarioId !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este comentario'
      });
    }

    if (!comentario && calificacion === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar el comentario o la calificación para actualizar'
      });
    }

    const updates = {};
    if (comentario !== undefined) {
      const comentarioTrimmed = comentario.toString().trim();
      if (comentarioTrimmed.length === 0 || comentarioTrimmed.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'El comentario debe tener entre 1 y 1000 caracteres'
        });
      }
      updates.comentario = comentarioTrimmed;
    }

    if (calificacion !== undefined) {
      if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
        return res.status(400).json({
          success: false,
          message: 'La calificación debe ser un número entero entre 1 y 5'
        });
      }
      updates.calificacion = calificacion;
    }

    await comentarioBD.update(updates);

    res.status(200).json({
      success: true,
      message: 'Comentario actualizado correctamente',
      data: {
        id: comentarioBD.id,
        comentario: comentarioBD.comentario,
        calificacion: comentarioBD.calificacion,
        estado: normalizeBooleanLabel(comentarioBD.estado)
      }
    });
  } catch (error) {
    return handleServerError(res, error, 'Error al editar el comentario');
  }
};

/**
 * Eliminar comentario propio - CLIENTE
 * 
 * Ruta: DELETE /api/cliente/comentarios/:comentarioId
 * Solo el autor puede eliminar su propio comentario.
 */
const eliminarComentarioPropio = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { comentarioId } = req.params;

    const comentarioBD = await Comentario.findByPk(comentarioId);
    if (!comentarioBD) {
      return sendNotFound(res, 'Comentario no encontrado');
    }

    if (comentarioBD.usuarioId !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este comentario'
      });
    }

    await comentarioBD.destroy();

    res.status(200).json({
      success: true,
      message: 'Comentario eliminado correctamente',
      data: {
        id: comentarioId,
        productoId: comentarioBD.productoId
      }
    });
  } catch (error) {
    return handleServerError(res, error, 'Error al eliminar el comentario');
  }
};

/**
 * Obtener comentarios de un usuario - ADMIN
 * 
 * Ruta: GET /api/admin/comentarios/usuario/:usuarioId
 * Permite al administrador ubicar comentarios de un usuario específico.
 */
const obtenerComentariosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ['id', 'nombre', 'email']
    });

    if (!usuario) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    const comentarios = await Comentario.findAll({
      where: { usuarioId },
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email
        },
        comentarios: comentarios.map(serializarComentario)
      }
    });
  } catch (error) {
    return handleServerError(res, error, 'Error al obtener comentarios por usuario');
  }
};

/**
 * Obtener todos los comentarios - ADMIN
 *
 * Ruta: GET /api/admin/comentarios
 * Query params: pagina, limite
 */
const obtenerTodosComentarios = async (req, res) => {
  try {
    const pagina = Number.parseInt(req.query.pagina || req.query.page, 10) || 1;
    const limite = Math.min(Number.parseInt(req.query.limite || req.query.limit, 10) || 25, 1000);
    const offset = (pagina - 1) * limite;

    const where = {};
    if (req.query.estado && req.query.estado !== 'todos') {
      if (req.query.estado === 'visible' || req.query.estado === 'true') {
        where.estado = true;
      } else if (req.query.estado === 'no_visible' || req.query.estado === 'false') {
        where.estado = false;
      }
    }

    if (req.query.buscar && req.query.buscar.trim()) {
      const termino = `%${req.query.buscar.trim()}%`;
      where[Op.or] = [
        { comentario: { [Op.like]: termino } },
        { '$usuario.nombre$': { [Op.like]: termino } },
        { '$usuario.email$': { [Op.like]: termino } },
        { '$producto.nombre$': { [Op.like]: termino } }
      ];
    }

    const { count, rows: comentarios } = await Comentario.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha', 'DESC']],
      limit: limite,
      offset,
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: {
        comentarios: comentarios.map(serializarComentario),
        paginacion: {
          pagina,
          paginaActual: pagina,
          limite,
          comentariosPorPagina: limite,
          total: count,
          totalComentarios: count,
          totalPaginas: Math.ceil(count / limite) || 0
        }
      }
    });
  } catch (error) {
    return handleServerError(res, error, 'Error al obtener todos los comentarios');
  }
};

// =============================================
// EXPORTACIÓN DE FUNCIONES
// =============================================
module.exports = {
  crearComentario,              // POST /api/cliente/comentarios
  obtenerComentariosProducto,   // GET /api/catalogo/productos/:productoId/comentarios
  editarComentario,             // PUT /api/cliente/comentarios/:comentarioId
  eliminarComentarioPropio,     // DELETE /api/cliente/comentarios/:comentarioId
  moderarComentario,            // PUT /api/admin/comentarios/:comentarioId/moderar
  toggleComentario,             // PATCH /api/admin/comentarios/:comentarioId/toggle
  eliminarComentario,           // DELETE /api/admin/comentarios/:comentarioId
  obtenerTodosComentarios,      // GET /api/admin/comentarios
  obtenerComentariosPorUsuario // GET /api/admin/comentarios/usuario/:usuarioId
};