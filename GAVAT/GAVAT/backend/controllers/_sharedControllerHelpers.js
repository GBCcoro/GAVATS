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
    if (categoriaId && !Number.isNaN(Number.parseInt(categoriaId, 10))) {
      where.categoriaId = Number.parseInt(categoriaId, 10);
    }
    if (subcategoriaId && !Number.isNaN(Number.parseInt(subcategoriaId, 10))) {
      where.subcategoriaId = Number.parseInt(subcategoriaId, 10);
    }
  };

  const applySearchFilter = () => {
    if (!buscar || typeof buscar !== 'string' || !buscar.trim()) return;
    const term = buscar.trim();
    where[Op.or] = [
      { nombre: { [Op.like]: `%${term}%` } },
      { descripcion: { [Op.like]: `%${term}%` } },
    ];
  };

  const applyPriceFilter = () => {
    const min = precioMin !== undefined && precioMin !== '' ? Number.parseFloat(precioMin) : NaN;
    const max = precioMax !== undefined && precioMax !== '' ? Number.parseFloat(precioMax) : NaN;
    if (Number.isNaN(min) && Number.isNaN(max)) return;
    where.precio = {};
    if (!Number.isNaN(min)) where.precio[Op.gte] = min;
    if (!Number.isNaN(max)) where.precio[Op.lte] = max;
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
    switch (orden) {
      case 'id_desc':
        return [['id', 'DESC']];
      case 'precio_asc':
        return [['precio', 'ASC']];
      case 'precio_desc':
        return [['precio', 'DESC']];
      case 'nombre_desc':
        return [['nombre', 'DESC']];
      case 'nombre':
      case 'nombre_asc':
        return [['nombre', 'ASC']];
      case 'id_asc':
      case 'id':
      default:
        return [['id', 'ASC']];
    }
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
  console.error(`${message}:`, error);
  return res.status(500).json({ success: false, message, error: error.message });
}

function sendNotFound(res, message = 'Registro no encontrado') {
  return res.status(404).json({ success: false, message });
}

function parsePaginationQuery(query = {}, options = {}) {
  const {
    pageKey = 'page',
    limitKey = 'limit',
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = Number.MAX_SAFE_INTEGER,
  } = options;

  const page = Number.parseInt(query[pageKey], 10) || defaultPage;
  const limit = Math.min(Number.parseInt(query[limitKey], 10) || defaultLimit, maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildPaginationMeta(total, page, limit) {
  return {
    total,
    pagina: page,
    limite: limit,
    totalPaginas: Math.ceil(total / limit) || 0,
  };
}

function normalizeBooleanLabel(value) {
  return value ? 'visible' : 'no_visible';
}

module.exports = {
  buildProductListQuery,
  handleServerError,
  sendNotFound,
  parsePaginationQuery,
  buildPaginationMeta,
  normalizeBooleanLabel,
};
