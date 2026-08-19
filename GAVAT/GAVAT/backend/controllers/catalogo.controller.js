/**
 * ============================================
 * CONTROLADOR DE CATÁLOGO PÚBLICO
 * ============================================
 * Endpoints públicos para que cualquier visitante vea productos y categorías.
 * NO requieren autenticación (no necesitan token JWT).
 * Es usado por las rutas definidas en routes/auth.routes.js (rutas públicas).
 */
// Importa el modelo Producto desde models/Producto.js.
// Representa la tabla 'Producto' en la BD.

const Producto = require("../models/Producto");
// Importa el modelo Categoria desde models/Categoria.js.
// Representa la tabla 'Categoria' en la BD.

const Categoria = require("../models/Categoria");
// Importa el modelo Subcategoria desde models/Subcategoria.js.
// Representa la tabla 'Subcategoria' en la BD.

const Subcategoria = require("../models/Subcategoria");
const { Op } = require("sequelize");
const { buildProductListQuery, handleServerError } = require("./_sharedControllerHelpers");

const contarProductosDisponibles = (campo, id) =>
  Producto.count({
    where: {
      [campo]: id,
      activo: true,
      stock: { [Op.gt]: 0 },
    },
  });

/**
 * Obtener catálogo de productos (público)
 *
 * Ruta: GET /api/catalogo/productos
 * Query params opcionales (se envían en la URL como ?parametro=valor):
 * - categoriaId: Filtrar por categoría
 * - subcategoriaId: Filtrar por subcategoría
 * - buscar: Texto para buscar en nombre o descripción
 * - precioMin, precioMax: Rango de precios
 * - orden: 'precio_asc' | 'precio_desc' | 'nombre' | 'reciente'
 * - pagina, limite: Paginación
 *
 * Solo muestra productos activos que tengan stock > 0
 */

const getProductos = async (req, res) => {
  try {
    const { where, order, limit, offset } = buildProductListQuery(req.query, {
      isPublic: true,
      defaultLimit: 12,
    });

    const { count, rows: productos } = await Producto.findAndCountAll({
      where,
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre"],
          where: { activo: true },
        },
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
          where: { activo: true },
        },
      ],
      limit,
      offset,
      order,
    });

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
 * Obtener un producto por ID (público)
 *
 * Ruta: GET /api/catalogo/productos/:id
 * Solo retorna el producto si está activo.
 */

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findOne({
      where: { id, activo: true },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre"],
          where: { activo: true },
        },
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
          where: { activo: true },
        },
      ],
    });

    if (!producto) {
      return res.status(404).json({ success: false, message: "Producto no encontrado o no disponible" });
    }

    res.json({ success: true, data: { producto } });
  } catch (error) {
    return handleServerError(res, error, "Error al obtener producto");
  }
};

/**
 * Obtener todas las categorías (público)
 *
 * Ruta: GET /api/catalogo/categorias
 * Solo categorías activas, con contador de productos disponibles en cada una.
 */

const getCategorias = async (req, res) => {
  try {
    // Obtiene todas las categorías activas, ordenadas alfabéticamente
    const categorias = await Categoria.findAll({
      where: { activo: true },
      attributes: ["id", "nombre", "descripcion"],
      order: [["nombre", "ASC"]], // A-Z por nombre
    });
    // Para cada categoría, cuenta cuántos productos activos con stock tiene.
    // Promise.all() ejecuta múltiples promesas en paralelo y espera que todas terminen.
    // .map() transforma cada categoría en una promesa que agrega el contador.
    const categoriasConContador = await Promise.all(
      categorias.map(async (categoria) => {
        const totalProductos = await contarProductosDisponibles(
          "categoriaId",
          categoria.id,
        );
        // Retorna la categoría como objeto plano + el campo totalProductos
        // El spread operator (...) copia todas las propiedades del objeto
        return {
          ...categoria.toJSON(),
          totalProductos,
        };
      }),
    );
    // Responde con las categorías y sus contadores
    res.json({
      success: true,
      data: {
        categorias: categoriasConContador,
      },
    });
  } catch (error) {
    console.error("Error en getCategorias:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener categorías",
      error: error.message,
    });
  }
};

/**
 * Obtener subcategorías de una categoría (público)
 *
 * Ruta: GET /api/catalogo/categorias/:id/subcategorias
 * Retorna las subcategorías activas de la categoría indicada.
 */

const getSubcategoriasPorCategoria = async (req, res) => {
  try {
    // Obtiene el ID de la categoría desde la URL
    const { id } = req.params;
    // Verifica que la categoría exista y esté activa
    const categoria = await Categoria.findOne({
      where: { id, activo: true },
    });
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }
    // Obtiene las subcategorías activas de esta categoría
    const subcategorias = await Subcategoria.findAll({
      where: {
        categoriaId: id, // Que pertenezcan a esta categoría
        activo: true, // Solo activas
      },
      attributes: ["id", "nombre", "descripcion"],
      order: [["nombre", "ASC"]],
    });
    // Cuenta productos disponibles por cada subcategoría
    const subcategoriasConContador = await Promise.all(
      subcategorias.map(async (subcategoria) => {
        const totalProductos = await contarProductosDisponibles(
          "subcategoriaId",
          subcategoria.id,
        );
        return {
          ...subcategoria.toJSON(),
          totalProductos,
        };
      }),
    );
    // Responde con la categoría y sus subcategorías
    res.json({
      success: true,
      data: {
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre,
        },
        subcategorias: subcategoriasConContador,
      },
    });
  } catch (error) {
    console.error("Error en getSubcategoriasPorCategoria:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener subcategorías",
      error: error.message,
    });
  }
};

/**
 * Obtener productos destacados/recientes (público)
 *
 * Ruta: GET /api/catalogo/destacados
 * Query: ?limite=8 (cantidad de productos a mostrar)
 * Retorna los productos más recientes que estén activos y con stock.
 */

const getProductosDestacados = async (req, res) => {
  try {
    // Obtiene el límite de productos a mostrar (por defecto 8)
    const { limite = 8 } = req.query;
    // Busca los productos más recientes que estén activos y con stock
    const productos = await Producto.findAll({
      where: {
        activo: true,
        stock: { [Op.gt]: 0 }, // Stock mayor que 0
      },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre"],
          where: { activo: true },
        },
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
          where: { activo: true },
        },
      ],
      limit: Number.parseInt(limite), // Máximo de productos a retornar
      order: [["createdAt", "DESC"]], // Los más recientes primero
    });
    // Responde con los productos destacados
    res.json({
      success: true,
      data: {
        productos,
      },
    });
  } catch (error) {
    console.error("Error en getProductosDestacados:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos destacados",
      error: error.message,
    });
  }
};
// Exporta las funciones del controlador para usarlas en las rutas públicas.

module.exports = {
  getProductos, // GET /api/catalogo/productos - Catálogo con filtros
  getProductoById, // GET /api/catalogo/productos/:id - Detalle de producto
  getCategorias, // GET /api/catalogo/categorias - Listar categorías
  getSubcategoriasPorCategoria, // GET /api/catalogo/categorias/:id/subcategorias
  getProductosDestacados, // GET /api/catalogo/destacados - Productos recientes
};
