const { Op } = require('sequelize');

/**
 * Construye el objeto where/order/limit/offset para consultas de productos.
 * - query: req.query (objeto)
 * - opts: { isPublic: boolean, defaultLimit: number }
 *
 * Devuelve: { where, order, limit, offset }
 */
function buildProductListQuery(query = {}, opts = {}) {
  const { isPublic = false, defaultLimit = isPublic ? 12 : 100 } = opts;
  const {
    categoriaId,
    subcategoriaId,
    buscar,
    precioMin,
    precioMax,
    orden,
    pagina = 1,
    limite = defaultLimit,
    activo,
    conStock,
  } = query;

  const where = {};

  // Helpers: pequeñas funciones para responsabilidades únicas
  const applyActiveAndStock = () => {
    if (isPublic) {
      where.activo = true;
      where.stock = { [Op.gt]: 0 };
    } else {
      if (activo !== undefined) where.activo = activo === 'true';
      if (conStock === 'true') where.stock = { [Op.gt]: 0 };
    }
  };

  const applyCategoryFilters = () => {
    if (categoriaId) where.categoriaId = Number.parseInt(categoriaId, 10);
    if (subcategoriaId) where.subcategoriaId = Number.parseInt(subcategoriaId, 10);
  };

  const applySearchFilter = () => {
    if (!buscar) return;
    where[Op.or] = [
      { nombre: { [Op.like]: `%${buscar}%` } },
      { descripcion: { [Op.like]: `%${buscar}%` } },
    ];
  };

  const applyPriceFilter = () => {
    if (precioMin === undefined && precioMax === undefined) return;
    where.precio = {};
    if (precioMin !== undefined) where.precio[Op.gte] = Number.parseFloat(precioMin);
    if (precioMax !== undefined) where.precio[Op.lte] = Number.parseFloat(precioMax);
  };

  const buildOrder = () => {
    if (isPublic) {
      switch (orden) {
        case 'precio_asc':
          return [['precio', 'ASC']];
        case 'precio_desc':
          return [['precio', 'DESC']];
        case 'nombre':
          return [['nombre', 'ASC']];
        case 'reciente':
        default:
          return [['createdAt', 'DESC']];
      }
    }
    return [['nombre', 'ASC']];
  };

  // Aplicar filtros
  applyActiveAndStock();
  applyCategoryFilters();
  applySearchFilter();
  applyPriceFilter();

  const order = buildOrder();

  const limitNum = (() => {
    const n = Number.parseInt(limite, 10);
    return Number.isNaN(n) ? defaultLimit : n;
  })();

  const pageNum = (() => {
    const p = Number.parseInt(pagina, 10);
    return Number.isNaN(p) ? 1 : p;
  })();

  const offset = (pageNum - 1) * limitNum;

  return { where, order, limit: limitNum, offset };
}

function handleServerError(res, error, message = 'Error del servidor') {
  console.error(message + ':', error);
  return res.status(500).json({ success: false, message, error: error.message });
}

module.exports = {
  buildProductListQuery,
  handleServerError,
};
