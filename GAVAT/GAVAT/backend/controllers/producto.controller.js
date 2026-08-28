/**
 * ============================================
 * CONTROLADOR DE PRODUCTOS (Admin)
 * ============================================
 * CRUD completo de productos con subida de imágenes (Multer).
 * Incluye: listar, ver, crear, actualizar, toggle, eliminar, gestión de stock.
 * Solo accesible por administradores (protegido por middleware checkRole).
 * Las rutas están definidas en routes/admin.routes.js
 */
// Importa el modelo Producto desde models/Producto.js → tabla 'Producto'

const Producto = require("../models/Producto");
// Importa el modelo Categoria desde models/Categoria.js → tabla 'Categoria'

const Categoria = require("../models/Categoria");
// Importa el modelo Subcategoria desde models/Subcategoria.js → tabla 'Subcategoria'

const Subcategoria = require("../models/Subcategoria");
const { buildProductListQuery, handleServerError } = require("./_sharedControllerHelpers");
// 'path' es un módulo nativo de Node.js para manejar rutas de archivos.
// Se usa para construir la ruta completa de las imágenes en el disco.

const path = require("node:path");
// 'fs.promises' es el módulo nativo de Node.js para manejar archivos de forma asíncrona.
// Se usa para eliminar imágenes del disco (unlink).

const fs = require("node:fs").promises;

/**
 * Obtener todos los productos (admin)
 *
 * Ruta: GET /api/admin/productos
 * Query params opcionales:
 * - categoriaId, subcategoriaId: Filtrar por categoría/subcategoría
 * - activo: 'true'/'false'
 * - conStock: 'true' → solo productos con stock > 0
 * - buscar: texto para buscar en nombre o descripción
 * - pagina, limite: Paginación
 */

const getProductos = async (req, res) => {
  try {
    const { where, order, limit, offset } = buildProductListQuery(req.query, {
      isPublic: false,
      defaultLimit: 100,
    });

    const opciones = {
      where,
      include: [
        { model: Categoria, as: "categoria", attributes: ["id", "nombre"] },
        { model: Subcategoria, as: "subcategoria", attributes: ["id", "nombre"] },
      ],
      limit,
      offset,
      order,
    };

    const { count, rows: productos } = await Producto.findAndCountAll(opciones);

    res.json({
      success: true,
      data: {
        productos,
        paginacion: {
          total: count,
          pagina: Number.parseInt(req.query.pagina || 1),
          limite: limit,
          totalPaginas: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al obtener productos");
  }
};

/**
 * Obtener un producto por ID (admin)
 *
 * Ruta: GET /api/admin/productos/:id
 * Retorna el producto con su categoría y subcategoría.
 */

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
      include: [
        { model: Categoria, as: "categoria", attributes: ["id", "nombre", "activo"] },
        { model: Subcategoria, as: "subcategoria", attributes: ["id", "nombre", "activo"] },
      ],
    });

    if (!producto) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    res.json({ success: true, data: { producto } });
  } catch (error) {
    return handleServerError(res, error, "Error al obtener producto");
  }
};

/**
 * Crear nuevo producto (admin)
 *
 * Ruta: POST /api/admin/productos
 * Body (multipart/form-data) porque puede incluir imagen:
 * - nombre (requerido), descripcion, precio (requerido), stock (requerido)
 * - categoriaId (requerido), subcategoriaId (requerido)
 * - imagen (archivo opcional - procesado por Multer middleware)
 */

const crearProducto = async (req, res) => {
  try {
    // Extrae los campos del body. Con multipart/form-data (por Multer), los campos
    // de texto vienen en req.body y el archivo en req.file.
    const { nombre, descripcion, precio, stock, categoriaId, subcategoriaId } =
      req.body;
    // VALIDACIÓN 1: Verifica que todos los campos obligatorios estén presentes
    if (!nombre || !precio || !categoriaId || !subcategoriaId) {
      return res.status(400).json({
        success: false,
        message:
          "Faltan campos requeridos: nombre, precio, categoriaId y subcategoriaId",
      });
    }
    // VALIDACIÓN 2: Verifica que la categoría exista y esté activa
    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: `No existe una categoría con ID ${categoriaId}`,
      });
    }
    if (!categoria.activo) {
      return res.status(400).json({
        success: false,
        message: `La categoría "${categoria.nombre}" está inactiva`,
      });
    }
    // VALIDACIÓN 3: Verifica que la subcategoría exista, esté activa y pertenezca a la categoría
    const subcategoria = await Subcategoria.findByPk(subcategoriaId);
    if (!subcategoria) {
      return res.status(404).json({
        success: false,
        message: `No existe una subcategoría con ID ${subcategoriaId}`,
      });
    }
    if (!subcategoria.activo) {
      return res.status(400).json({
        success: false,
        message: `La subcategoría "${subcategoria.nombre}" está inactiva`,
      });
    }
    // Verifica que la subcategoría pertenezca a la categoría seleccionada
    if (subcategoria.categoriaId !== Number.parseInt(categoriaId)) {
      return res.status(400).json({
        success: false,
        message: `La subcategoría "${subcategoria.nombre}" no pertenece a la categoría seleccionada`,
      });
    }
    // VALIDACIÓN 4: Precio debe ser mayor a 0
    if (Number.parseFloat(precio) <= 0) {
      return res.status(400).json({
        success: false,
        message: "El precio debe ser mayor a 0",
      });
    }
    // Stock no puede ser negativo
    if (Number.parseInt(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "El stock no puede ser negativo",
      });
    }
    // Si se subió una imagen, Multer la pone en memoria en req.file.buffer.
    const imagen = req.file ? req.file.buffer : null;
    const mimeType = req.file ? req.file.mimetype : null;
    // Crea el registro en la tabla Producto (INSERT INTO Producto ...)
    const nuevoProducto = await Producto.create({
      nombre,
      descripcion: descripcion || null, // Null si no se envía
      precio: Number.parseFloat(precio), // Convierte a número decimal
      stock: Number.parseInt(stock) || 0, // Convierte a entero, default 0
      categoriaId: Number.parseInt(categoriaId), // FK a la tabla Categoria
      subcategoriaId: Number.parseInt(subcategoriaId), // FK a la tabla Subcategoria
      imagen, // Buffer binario o null
      mimeType, // Tipo MIME o null
      activo: true, // Se crea activo por defecto
    });
    // Recarga el producto con sus relaciones (categoría y subcategoría)
    await nuevoProducto.reload({
      include: [
        { model: Categoria, as: "categoria", attributes: ["id", "nombre"] },
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
        },
      ],
    });
    // 201 = Created
    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: {
        producto: nuevoProducto,
      },
    });
  } catch (error) {
    console.error("Error en crearProducto:", error);
    // Captura errores de validación del modelo Sequelize
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Errores de validación",
        errors: error.errors.map((e) => e.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al crear producto",
      error: error.message,
    });
  }
};

const validarCategoriaParaActualizacion = async (categoriaId, producto) => {
  if (!categoriaId || categoriaId === producto.categoriaId) {
    return null;
  }
  const categoria = await Categoria.findByPk(categoriaId);
  if (!categoria?.activo) {
    return {
      status: 400,
      message: "Categoría inválida o inactiva",
    };
  }
  return null;
};

const validarSubcategoriaParaActualizacion = async (
  subcategoriaId,
  categoriaId,
  producto,
) => {
  if (!subcategoriaId || subcategoriaId === producto.subcategoriaId) {
    return null;
  }
  const subcategoria = await Subcategoria.findByPk(subcategoriaId);
  if (!subcategoria?.activo) {
    return {
      status: 400,
      message: "Subcategoría inválida o inactiva",
    };
  }
  const catId = categoriaId || producto.categoriaId;
  if (subcategoria.categoriaId !== Number.parseInt(catId)) {
    return {
      status: 400,
      message: "La subcategoría no pertenece a la categoría seleccionada",
    };
  }
  return null;
};

const validarNumerosParaActualizacion = (precio, stock) => {
  if (precio !== undefined && Number.parseFloat(precio) <= 0) {
    return {
      status: 400,
      message: "El precio debe ser mayor a 0",
    };
  }
  if (stock !== undefined && Number.parseInt(stock) < 0) {
    return {
      status: 400,
      message: "El stock no puede ser negativo",
    };
  }
  return null;
};

const reemplazarImagenProducto = async (producto, archivo) => {
  if (!archivo) {
    return;
  }
  if (
    producto.imagen &&
    typeof producto.imagen === "string" &&
    !producto.imagen.startsWith("data:")
  ) {
    const rutaImagenAnterior = path.join(
      __dirname,
      "../uploads",
      producto.imagen,
    );
    try {
      await fs.unlink(rutaImagenAnterior);
    } catch (err) {
      console.error("Error al eliminar imagen anterior:", err);
    }
  }
  producto.imagen = archivo.buffer;
  producto.mimeType = archivo.mimetype;
};

/**
 * Actualizar producto existente (admin)
 *
 * Ruta: PUT /api/admin/productos/:id
 * Body (multipart/form-data):
 * - nombre, descripcion, precio, stock, categoriaId, subcategoriaId, activo
 * - imagen (archivo opcional - si se envía, reemplaza la anterior)
 */

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      precio,
      stock,
      categoriaId,
      subcategoriaId,
      activo,
    } = req.body;
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }
    const errorCategoria = await validarCategoriaParaActualizacion(
      categoriaId,
      producto,
    );
    if (errorCategoria) {
      return res.status(errorCategoria.status).json({
        success: false,
        message: errorCategoria.message,
      });
    }
    const errorSubcategoria = await validarSubcategoriaParaActualizacion(
      subcategoriaId,
      categoriaId,
      producto,
    );
    if (errorSubcategoria) {
      return res.status(errorSubcategoria.status).json({
        success: false,
        message: errorSubcategoria.message,
      });
    }
    const errorNumerico = validarNumerosParaActualizacion(precio, stock);
    if (errorNumerico) {
      return res.status(errorNumerico.status).json({
        success: false,
        message: errorNumerico.message,
      });
    }
    await reemplazarImagenProducto(producto, req.file);
    if (nombre !== undefined) producto.nombre = nombre;
    if (descripcion !== undefined) producto.descripcion = descripcion;
    if (precio !== undefined) producto.precio = Number.parseFloat(precio);
    if (stock !== undefined) producto.stock = Number.parseInt(stock);
    if (categoriaId !== undefined)
      producto.categoriaId = Number.parseInt(categoriaId);
    if (subcategoriaId !== undefined)
      producto.subcategoriaId = Number.parseInt(subcategoriaId);
    if (activo !== undefined) producto.activo = activo;
    await producto.save();
    await producto.reload({
      include: [
        { model: Categoria, as: "categoria", attributes: ["id", "nombre"] },
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
        },
      ],
    });
    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: { producto },
    });
  } catch (error) {
    console.error("Error en actualizarProducto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar producto",
      error: error.message,
    });
  }
};

/**
 * Activar/Desactivar producto (toggle) (admin)
 * 
 * Ruta: PATCH /api/admin/productos/:id/toggle
 * Invierte el estado activo del producto.
 */
const toggleProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca el producto por ID
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Si se va a activar, verificar que la categoría y subcategoría estén activas
    if (!producto.activo) {
      const categoria = await Categoria.findByPk(producto.categoriaId);
      if (!categoria || !categoria.activo) {
        return res.status(400).json({
          success: false,
          message: `No se puede activar el producto porque la categoría "${categoria ? categoria.nombre : producto.categoriaId}" está inactiva`
        });
      }
      const subcategoria = await Subcategoria.findByPk(producto.subcategoriaId);
      if (!subcategoria || !subcategoria.activo) {
        return res.status(400).json({
          success: false,
          message: `No se puede activar el producto porque la subcategoría "${subcategoria ? subcategoria.nombre : producto.subcategoriaId}" está inactiva`
        });
      }
    }

    // Invierte el estado: true → false, false → true
    producto.activo = !producto.activo;
    await producto.save();
    
    // Responde indicando el nuevo estado
    res.json({
      success: true,
      message: `Producto ${producto.activo ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        producto
      }
    });
    
  } catch (error) {
    console.error('Error en toggleProducto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del producto',
      error: error.message
    });
  }
};

/**
 * Eliminar producto (admin)
 * 
 * Ruta: DELETE /api/admin/productos/:id
 * Elimina el producto de la BD.
 */
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Limpiar todas las dependencias relacionadas para permitir la eliminación real
    try {
      const DetallePedido = require('../models/DetallePedido');
      await DetallePedido.destroy({ where: { productoId: id } });
    } catch (e) {
      console.warn('Advertencia al limpiar DetallePedido:', e.message);
    }

    try {
      const Carrito = require('../models/Carrito');
      await Carrito.destroy({ where: { productoId: id } });
    } catch (e) {
      console.warn('Advertencia al limpiar Carrito:', e.message);
    }

    try {
      const Comentario = require('../models/Comentario');
      await Comentario.destroy({ where: { productoId: id } });
    } catch (e) {
      console.warn('Advertencia al limpiar Comentario:', e.message);
    }
    
    // Si tiene imagen almacenada en disco, eliminarla
    if (producto.imagen && typeof producto.imagen === 'string' && !producto.imagen.startsWith('data:') && !producto.imagen.startsWith('http')) {
      const rutaImagen = path.join(__dirname, '../uploads', producto.imagen);
      try {
        await fs.unlink(rutaImagen);
      } catch (err) {
        // Ignorar si el archivo no existe
      }
    }

    // Eliminar definitivamente el producto de la base de datos
    await producto.destroy();
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente de la base de datos'
    });
    
  } catch (error) {
    console.error('Error en eliminarProducto:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar producto',
      error: error.message
    });
  }
};

/**
 * Actualizar stock de un producto (admin)
 * 
 * Ruta: PATCH /api/admin/productos/:id/stock
 * Body JSON: { cantidad, operacion: 'aumentar' | 'reducir' | 'establecer' }
 * 
 * - aumentar: suma la cantidad al stock actual
 * - reducir: resta la cantidad del stock actual
 * - establecer: reemplaza el stock con la cantidad dada
 */
const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, operacion } = req.body;   // Datos del body JSON
    
    // Valida que se enviaron ambos campos
    if (cantidad === undefined || cantidad === null || !operacion) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere cantidad y operación'
      });
    }
    
    // Convierte la cantidad a número entero
    const cantidadNum = Number.parseInt(cantidad);
    if (Number.isNaN(cantidadNum) || cantidadNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser un número entero mayor o igual a 0'
      });
    }
    
    // Busca el producto por ID
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    let nuevoStock;   // Variable para almacenar el stock resultante
    
    // Según la operación, calcula el nuevo stock
    switch (operacion) {
      case 'aumentar':
        nuevoStock = producto.stock + cantidadNum;
        break;
      case 'reducir':
        // Verifica que haya suficiente stock antes de reducir
        if (cantidadNum > producto.stock) {
          return res.status(400).json({
            success: false,
            message: `No hay suficiente stock. Stock actual: ${producto.stock}`
          });
        }
        nuevoStock = producto.stock - cantidadNum;
        break;
      case 'establecer':
        // Simplemente establece el valor directamente
        nuevoStock = cantidadNum;
        break;
      default:
        // Si la operación no es válida
        return res.status(400).json({
          success: false,
          message: 'Operación inválida. Usa: aumentar, reducir o establecer'
        });
    }
    
    const stockAnterior = producto.stock;

    // Asigna el nuevo stock y guarda en la BD
    producto.stock = nuevoStock;
    await producto.save();
    
    // Responde con el resultado de la operación
    let mensajeOperacion;
    if (operacion === 'aumentar') {
      mensajeOperacion = 'aumentado';
    } else if (operacion === 'reducir') {
      mensajeOperacion = 'reducido';
    } else {
      mensajeOperacion = 'establecido';
    }

    res.json({
      success: true,
      message: `Stock ${mensajeOperacion} exitosamente`,
      data: {
        productoId: producto.id,
        nombre: producto.nombre,
        stockAnterior: operacion === 'establecer' ? null : stockAnterior,
        stockNuevo: producto.stock
      }
    });
    
  } catch (error) {
    console.error('Error en actualizarStock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  toggleProducto,
  eliminarProducto,
  actualizarStock
};
