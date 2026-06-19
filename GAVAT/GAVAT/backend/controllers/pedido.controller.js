/**
 * ============================================
 * CONTROLADOR DE PEDIDOS
 * ============================================
 * Gestiona el proceso de compra (checkout), consulta y cancelación de pedidos.
 * Funciones de CLIENTE: crear pedido, ver mis pedidos, cancelar.
 * Funciones de ADMIN: ver todos los pedidos, cambiar estado, estadísticas.
 * Requiere autenticación (token JWT en todas las rutas).
 */

// Importa el modelo Pedido desde models/Pedido.js → tabla 'Pedido'
const Pedido = require('../models/Pedido');

// Importa el modelo DetallePedido desde models/DetallePedido.js → tabla 'DetallePedido'
// Almacena cada producto dentro de un pedido con su cantidad y precio.
const DetallePedido = require('../models/DetallePedido');

// Importa el modelo Carrito desde models/Carrito.js → tabla 'Carrito'
// Se usa para leer los items del carrito al crear un pedido.
const Carrito = require('../models/Carrito');

// Importa el modelo Producto desde models/Producto.js → tabla 'Producto'
// Se usa para verificar stock y actualizar cantidades.
const Producto = require('../models/Producto');

// Importa el modelo Usuario desde models/Usuario.js → tabla 'Usuario'
// Se usa para incluir datos del usuario en los pedidos.
const Usuario = require('../models/Usuario');

// Importa el modelo Categoria desde models/Categoria.js → tabla 'Categoria'
const Categoria = require('../models/Categoria');

// Importa el modelo Subcategoria desde models/Subcategoria.js → tabla 'Subcategoria'
const Subcategoria = require('../models/Subcategoria');

/**
 * Crear pedido desde el carrito (checkout) - CLIENTE
 * 
 * Ruta: POST /api/cliente/pedidos
 * Body JSON: { direccionEnvio, telefono, metodoPago, notasAdicionales }
 * 
 * Proceso:
 * 1. Valida datos de envío y método de pago
 * 2. Obtiene items del carrito del usuario
 * 3. Verifica stock y productos activos
 * 4. Crea el pedido y sus detalles
 * 5. Reduce el stock de cada producto
 * 6. Vacía el carrito
 * Todo dentro de una TRANSACCIÓN para garantizar consistencia.
 */
const crearPedido = async (req, res) => {
  // Importa la instancia de sequelize desde config/database.js para usar transacciones.
  // Una transacción agrupa varias operaciones SQL: si una falla, TODAS se revierten.
  const { sequelize } = require('../config/database');
  // Inicia la transacción. t es el objeto transacción que se pasa a cada operación.
  const t = await sequelize.transaction();
  
  try {
    // Extrae datos del body JSON enviado por el frontend.
    // metodoPago tiene valor por defecto 'efectivo' si no se envía.
    const { direccionEnvio, telefono, metodoPago = 'efectivo', notasAdicionales, solicitudPedido } = req.body;
    
    // VALIDACIÓN 1: La dirección de envío es obligatoria
    if (!direccionEnvio || direccionEnvio.trim() === '') {
      await t.rollback();   // Revierte la transacción antes de responder
      return res.status(400).json({
        success: false,
        message: 'La dirección de envío es requerida'
      });
    }
    
    // VALIDACIÓN 1b: El teléfono es obligatorio
    if (!telefono || telefono.trim() === '') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'El teléfono es requerido'
      });
    }
    
    // VALIDACIÓN 2: El método de pago debe ser uno de los válidos
    const metodosValidos = ['efectivo', 'tarjeta', 'transferencia'];
    // .includes() verifica si el valor está en el array
    if (!metodosValidos.includes(metodoPago)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Método de pago inválido. Opciones: ${metodosValidos.join(', ')}`
      });
    }
    
    // VALIDACIÓN 3: Obtiene todos los items del carrito del usuario autenticado.
    // req.usuario.id viene del middleware de autenticación (auth.js) que decodifica el JWT.
    // transaction: t → esta consulta es parte de la transacción.
    const itemsCarrito = await Carrito.findAll({
      where: { usuarioId: req.usuario.id },
      include: [{
        model: Producto,
        as: 'producto',
        attributes: ['id', 'nombre', 'precio', 'stock', 'activo']
      }],
      transaction: t
    });
    
    // Si el carrito está vacío, no se puede crear un pedido
    if (itemsCarrito.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío'
      });
    }
    
    // VALIDACIÓN 4: Recorre cada item para verificar stock y estado del producto.
    // erroresValidacion acumula los errores encontrados para mostrarlos todos juntos.
    const erroresValidacion = [];
    let totalPedido = 0;        // Acumulador del total del pedido
    
    // Recorre cada item del carrito con un for...of (permite await dentro)
    for (const item of itemsCarrito) {
      const producto = item.producto;     // Producto asociado al item (por el include)
      
      // Verifica que el producto siga activo (pudo desactivarse después de agregarlo al carrito)
      if (!producto.activo) {
        erroresValidacion.push(`${producto.nombre} ya no está disponible`);
        continue;    // Salta al siguiente item
      }
      
      // Verifica que haya stock suficiente para la cantidad solicitada
      if (item.cantidad > producto.stock) {
        erroresValidacion.push(
          `${producto.nombre}: stock insuficiente (disponible: ${producto.stock}, solicitado: ${item.cantidad})`
        );
        continue;
      }
      
      // Suma al total del pedido: precioUnitario × cantidad
      totalPedido += parseFloat(item.precioUnitario) * item.cantidad;
    }
    
    // Si hubo errores de validación en algún producto, revierte y muestra todos los errores
    if (erroresValidacion.length > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Error en validación del carrito',
        errores: erroresValidacion
      });
    }
    
    // CREAR EL PEDIDO → INSERT INTO Pedido (...)
    const pedido = await Pedido.create({
      usuarioId: req.usuario.id,     // ID del usuario autenticado
      total: totalPedido,            // Total calculado arriba
      estado: 'pendiente',           // Estado inicial del pedido
      direccionEnvio,                // Dirección enviada por el usuario
      telefono,                      // Teléfono de contacto
      metodoPago,                    // 'efectivo', 'tarjeta' o 'transferencia'
      notas: solicitudPedido || notasAdicionales || null  // Solicitud del pedido / notas opcionales
    }, { transaction: t });          // Parte de la transacción
    
    // CREAR DETALLES DEL PEDIDO Y ACTUALIZAR STOCK
    const detallesPedido = [];    // Array para guardar los detalles creados
    
    for (const item of itemsCarrito) {
      const producto = item.producto;
      
      // Crea un registro en DetallePedido por cada producto del carrito
      const detalle = await DetallePedido.create({
        pedidoId: pedido.id,                                  // FK al pedido recién creado
        productoId: producto.id,                              // FK al producto
        cantidad: item.cantidad,                              // Cantidad solicitada
        precioUnitario: item.precioUnitario,                  // Precio al momento de la compra
        subtotal: parseFloat(item.precioUnitario) * item.cantidad  // Subtotal de este item
      }, { transaction: t });
      
      detallesPedido.push(detalle);   // Agrega al array de detalles
      
      // Reduce el stock del producto según la cantidad comprada
      producto.stock -= item.cantidad;
      await producto.save({ transaction: t });   // Guarda el nuevo stock
    }
    
    // VACIAR EL CARRITO del usuario después de crear el pedido.
    // destroy() con where elimina todos los registros que coincidan.
    await Carrito.destroy({
      where: { usuarioId: req.usuario.id },
      transaction: t
    });
    
    // CONFIRMAR TRANSACCIÓN → ejecuta todos los cambios en la BD de forma permanente.
    // Si algo hubiera fallado antes, t.rollback() habría revertido todo.
    await t.commit();
    
    // Recarga el pedido con sus relaciones para enviar la respuesta completa.
    // reload() vuelve a consultar la BD con los includes especificados.
    await pedido.reload({
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']   // Datos del usuario
        },
        {
          model: DetallePedido,
          as: 'detalles',
          include: [{
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre', 'precio', 'imagen']   // Datos del producto
          }]
        }
      ]
    });
    
    // 201 = Created. Pedido creado exitosamente.
    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: {
        pedido
      }
    });
    
  } catch (error) {
    // Si ocurre cualquier error inesperado, revierte TODA la transacción
    await t.rollback();
    console.error('Error en crearPedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear pedido',
      error: error.message
    });
  }
};

/**
 * Obtener pedidos del usuario autenticado - CLIENTE
 * 
 * Ruta: GET /api/cliente/pedidos
 * Query params: ?estado=pendiente&pagina=1&limite=10
 */
const getMisPedidos = async (req, res) => {
  try {
    // Extrae filtro de estado y paginación de los query params
    const { estado, pagina = 1, limite = 10 } = req.query;
    
    // Filtro base: solo los pedidos del usuario autenticado
    const where = { usuarioId: req.usuario.id };
    // Si se envía filtro de estado, lo agrega al WHERE
    if (estado) where.estado = estado;
    
    // Calcula el offset para paginación
    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    
    // Consulta pedidos con paginación.
    // findAndCountAll retorna { count: total, rows: registros }
    const { count, rows: pedidos } = await Pedido.findAndCountAll({
      where,
      include: [
        {
          model: DetallePedido,
          as: 'detalles',           // Detalles de cada pedido
          include: [{
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre', 'imagen']   // Solo datos básicos del producto
          }]
        }
      ],
      limit: parseInt(limite),
      offset,
      order: [['createdAt', 'DESC']]    // Más recientes primero
    });
    
    // Responde con los pedidos y la paginación
    res.json({
      success: true,
      data: {
        pedidos,
        paginacion: {
          total: count,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(count / parseInt(limite))
        }
      }
    });
    
  } catch (error) {
    console.error('Error en getMisPedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: error.message
    });
  }
};

/**
 * Obtener un pedido específico por ID - CLIENTE / ADMIN
 * 
 * Ruta: GET /api/cliente/pedidos/:id
 * El cliente solo ve sus pedidos, el admin y el auxiliar pueden ver cualquiera.
 */
const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Construye filtro: siempre filtra por ID del pedido.
    const where = { id };
    // Si es cliente, agrega filtro por usuarioId (solo ve sus pedidos).
    if (req.usuario.rol === 'cliente') {
      where.usuarioId = req.usuario.id;
    }
    
    // Busca el pedido con todos sus detalles y relaciones
    const pedido = await Pedido.findOne({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: DetallePedido,
          as: 'detalles',
          include: [{
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre', 'descripcion', 'precio', 'imagen'],
            include: [
              {
                model: Categoria,            // Categoría del producto
                as: 'categoria',
                attributes: ['id', 'nombre']
              },
              {
                model: Subcategoria,         // Subcategoría del producto
                as: 'subcategoria',
                attributes: ['id', 'nombre']
              }
            ]
          }]
        }
      ]
    });
    
    // Si no encontró el pedido (no existe o no pertenece al usuario)
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    // Responde con el pedido completo
    res.json({
      success: true,
      data: {
        pedido
      }
    });
    
  } catch (error) {
    console.error('Error en getPedidoById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedido',
      error: error.message
    });
  }
};

/**
 * Cancelar un pedido - CLIENTE
 * 
 * Ruta: PUT /api/cliente/pedidos/:id/cancelar
 * Solo se puede cancelar si está en estado 'pendiente'.
 * Al cancelar, devuelve el stock a los productos.
 * Usa transacción para garantizar consistencia.
 */
const cancelarPedido = async (req, res) => {
  // Importa sequelize para usar transacciones
  const { sequelize } = require('../config/database');
  const t = await sequelize.transaction();   // Inicia transacción
  
  try {
    const { id } = req.params;
    
    // Busca el pedido del usuario autenticado con sus detalles y productos.
    // El WHERE filtra por ID del pedido Y por el ID del usuario (seguridad: no puede cancelar pedidos ajenos).
    const pedido = await Pedido.findOne({
      where: {
        id,
        usuarioId: req.usuario.id    // Solo sus propios pedidos
      },
      include: [{
        model: DetallePedido,
        as: 'detalles',
        include: [{
          model: Producto,
          as: 'producto'              // Producto completo para actualizar stock
        }]
      }],
      transaction: t
    });
    
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    // Solo se puede cancelar un pedido que esté en estado 'pendiente'
    if (!pedido.puedeSerCancelado()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `No se puede cancelar un pedido en estado '${pedido.estado}'`
      });
    }
    
    // Usa el método del modelo para cancelar de forma consistente y devolver stock.
    await pedido.cancelar(t);
    
    // Confirma la transacción → todos los cambios se aplican permanentemente
    await t.commit();
    
    // Recarga el pedido con sus detalles para la respuesta
    await pedido.reload({
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto'
            }
          ]
        }
      ]
    });
    
    // Responde confirmando la cancelación
    res.json({
      success: true,
      message: 'Pedido cancelado exitosamente',
      data: {
        pedido
      }
    });
    
  } catch (error) {
    await t.rollback();    // Revierte todo si hay error
    console.error('Error en cancelarPedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar pedido',
      error: error.message
    });
  }
};

/**
 * Obtener todos los pedidos - ADMIN
 * 
 * Ruta: GET /api/admin/pedidos
 * Query params: ?estado=pendiente&usuarioId=1&pagina=1&limite=20
 * El admin puede ver pedidos de todos los usuarios.
 */
const getAllPedidos = async (req, res) => {
  try {
    // Extrae filtros y paginación de los query params
    const { estado, usuarioId, pagina = 1, limite = 20 } = req.query;
    
    // Construye filtros dinámicamente según lo que se envíe
    const where = {};
    if (estado) where.estado = estado;           // Filtro por estado
    if (usuarioId) where.usuarioId = usuarioId;  // Filtro por usuario específico
    
    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    
    // Consulta todos los pedidos con datos del usuario y detalles
    const { count, rows: pedidos } = await Pedido.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']    // Datos del usuario que hizo el pedido
        },
        {
          model: DetallePedido,
          as: 'detalles',
          include: [{
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre', 'imagen']
          }]
        }
      ],
      limit: parseInt(limite),
      offset,
      order: [['createdAt', 'DESC']]     // Más recientes primero
    });
    
    // Responde con todos los pedidos y la paginación
    res.json({
      success: true,
      data: {
        pedidos,
        paginacion: {
          total: count,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(count / parseInt(limite))
        }
      }
    });
    
  } catch (error) {
    console.error('Error en getAllPedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de un pedido - ADMIN
 * 
 * Ruta: PUT /api/admin/pedidos/:id/estado
 * Body JSON: { estado }
 * Estados válidos: 'pendiente' | 'en_proceso' | 'enviado' | 'entregado' | 'cancelado'
 */
const actualizarEstadoPedido = async (req, res) => {
  const { sequelize } = require('../config/database');

  try {
    const { id } = req.params;       // ID del pedido desde la URL
    const { estado } = req.body;      // Nuevo estado desde el body JSON

    // Valida que el estado sea uno de los permitidos
    const estadosValidos = ['pendiente', 'pagado', 'en_proceso', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Opciones: ${estadosValidos.join(', ')}`
      });
    }

    // Busca el pedido sin transacción primero
    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Si el admin solicita cancelar el pedido, usa transacción para restaurar stock
    if (estado === 'cancelado') {
      if (!pedido.puedeSerCancelado()) {
        return res.status(400).json({
          success: false,
          message: `No se puede cancelar un pedido en estado '${pedido.estado}'`
        });
      }
      
      // Usa transacción solo para cancelar
      const t = await sequelize.transaction();
      try {
        await pedido.cancelar(t);
        await t.commit();
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } else {
      // Para otros estados, no usa transacción (evita deadlock)
      pedido.estado = estado;
      await pedido.save();
    }

    // Recarga el pedido con los datos del usuario incluidos
    await pedido.reload({
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    // Responde con el pedido actualizado
    res.json({
      success: true,
      message: 'Estado del pedido actualizado',
      data: {
        pedido
      }
    });
    
  } catch (error) {
    console.error('Error en actualizarEstadoPedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del pedido',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de pedidos - ADMIN
 * 
 * Ruta: GET /api/admin/pedidos/estadisticas
 * Query params opcionales: desde, hasta, limite
 * Retorna: total de pedidos, pedidos hoy, ventas totales, pedidos agrupados por estado,
 * ventas por periodo, productos más vendidos, categorías top y clientes top.
 */
const getEstadisticasPedidos = async (req, res) => {
  try {
    const { Op, fn, col } = require('sequelize');
    const { desde, hasta, limite = 10 } = req.query;
    const limiteNum = parseInt(limite, 10) || 10;
    const filtrosFecha = {};

    if (desde) {
      const fechaDesde = new Date(desde);
      if (Number.isNaN(fechaDesde.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro desde debe ser una fecha válida'
        });
      }
      filtrosFecha[Op.gte] = fechaDesde;
    }

    if (hasta) {
      const fechaHasta = new Date(hasta);
      if (Number.isNaN(fechaHasta.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro hasta debe ser una fecha válida'
        });
      }
      filtrosFecha[Op.lte] = fechaHasta;
    }

    const wherePedidos = Object.keys(filtrosFecha).length ? { createdAt: filtrosFecha } : {};

    const totalPedidos = await Pedido.count({ where: wherePedidos });
    const ventasTotales = await Pedido.sum('total', { where: wherePedidos }) || 0;

    const pedidosPorEstadoRaw = await Pedido.findAll({
      attributes: [
        'estado',
        [fn('COUNT', col('id')), 'cantidad'],
        [fn('SUM', col('total')), 'totalVentas']
      ],
      where: wherePedidos,
      group: ['estado']
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const pedidosHoy = await Pedido.count({
      where: {
        createdAt: { [Op.gte]: hoy }
      }
    });

    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const pedidosUltimos30Dias = await Pedido.count({
      where: {
        createdAt: { [Op.gte]: hace30Dias }
      }
    });

    const ventasUltimos30Dias = await Pedido.sum('total', {
      where: {
        createdAt: { [Op.gte]: hace30Dias }
      }
    }) || 0;

    const clientesActivosUltimos30Dias = await Pedido.count({
      distinct: true,
      col: 'usuarioId',
      where: {
        createdAt: { [Op.gte]: hace30Dias }
      }
    });

    const ventasPorPeriodoRaw = await Pedido.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'fecha'],
        [fn('COUNT', col('id')), 'cantidadPedidos'],
        [fn('SUM', col('total')), 'totalVentas']
      ],
      where: wherePedidos,
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });

    const productosMasVendidosRaw = await DetallePedido.findAll({
      attributes: [
        'productoId',
        [fn('SUM', col('cantidad')), 'unidadesVendidas'],
        [fn('SUM', col('subtotal')), 'ventasTotales']
      ],
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre']
        },
        {
          model: Pedido,
          as: 'pedido',
          attributes: [],
          where: wherePedidos,
          required: true
        }
      ],
      group: ['productoId', 'producto.id', 'producto.nombre'],
      order: [[fn('SUM', col('cantidad')), 'DESC']],
      limit: limiteNum
    });

    const categoriasTopRaw = await DetallePedido.findAll({
      attributes: [
        [col('producto.categoria.id'), 'categoriaId'],
        [col('producto.categoria.nombre'), 'categoriaNombre'],
        [fn('SUM', col('cantidad')), 'unidadesVendidas'],
        [fn('SUM', col('subtotal')), 'ventasTotales']
      ],
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: [],
          include: [
            {
              model: Categoria,
              as: 'categoria',
              attributes: []
            }
          ]
        },
        {
          model: Pedido,
          as: 'pedido',
          attributes: [],
          where: wherePedidos,
          required: true
        }
      ],
      group: ['producto.categoria.id', 'producto.categoria.nombre'],
      order: [[fn('SUM', col('subtotal')), 'DESC']],
      limit: limiteNum
    });

    const clientesTopRaw = await Pedido.findAll({
      attributes: [
        'usuarioId',
        [fn('COUNT', col('id')), 'ordenes'],
        [fn('SUM', col('total')), 'totalComprado']
      ],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ],
      where: wherePedidos,
      group: ['usuarioId', 'usuario.id', 'usuario.nombre', 'usuario.email'],
      order: [[fn('SUM', col('total')), 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        totalPedidos,
        pedidosHoy,
        pedidosUltimos30Dias,
        clientesActivosUltimos30Dias,
        ventasTotales: parseFloat(ventasTotales).toFixed(2),
        ventasUltimos30Dias: parseFloat(ventasUltimos30Dias).toFixed(2),
        pedidosPorEstado: pedidosPorEstadoRaw.map((p) => ({
          estado: p.estado,
          cantidad: parseInt(p.getDataValue('cantidad')),
          totalVentas: parseFloat(p.getDataValue('totalVentas') || 0).toFixed(2)
        })),
        ventasPorPeriodo: pedidosPorPeriodoRaw.map((item) => ({
          fecha: item.getDataValue('fecha'),
          cantidadPedidos: parseInt(item.getDataValue('cantidadPedidos')),
          totalVentas: parseFloat(item.getDataValue('totalVentas') || 0).toFixed(2)
        })),
        productosMasVendidos: productosMasVendidosRaw.map((item) => ({
          productoId: item.productoId,
          nombre: item.producto?.nombre || 'Producto desconocido',
          unidadesVendidas: parseInt(item.getDataValue('unidadesVendidas')),
          ventasTotales: parseFloat(item.getDataValue('ventasTotales') || 0).toFixed(2)
        })),
        categoriasTop: categoriasTopRaw.map((item) => ({
          categoriaId: item.getDataValue('categoriaId'),
          categoriaNombre: item.getDataValue('categoriaNombre'),
          unidadesVendidas: parseInt(item.getDataValue('unidadesVendidas')),
          ventasTotales: parseFloat(item.getDataValue('ventasTotales') || 0).toFixed(2)
        })),
        clientesTop: clientesTopRaw.map((item) => ({
          usuarioId: item.usuarioId,
          nombre: item.usuario?.nombre || 'Cliente desconocido',
          email: item.usuario?.email || null,
          ordenes: parseInt(item.getDataValue('ordenes')),
          totalComprado: parseFloat(item.getDataValue('totalComprado') || 0).toFixed(2)
        }))
      }
    });

  } catch (error) {
    console.error('Error en getEstadisticasPedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Exporta todas las funciones del controlador para usarlas en las rutas.
module.exports = {
  // Funciones de CLIENTE (rutas en routes/cliente.routes.js)
  crearPedido,               // POST /api/cliente/pedidos - Checkout
  getMisPedidos,             // GET  /api/cliente/pedidos - Mis pedidos
  getPedidoById,             // GET  /api/cliente/pedidos/:id - Detalle de un pedido
  cancelarPedido,            // PUT  /api/cliente/pedidos/:id/cancelar - Cancelar pedido
  
  // Funciones de ADMIN (rutas en routes/admin.routes.js)
  getAllPedidos,              // GET /api/admin/pedidos - Todos los pedidos
  actualizarEstadoPedido,    // PUT /api/admin/pedidos/:id/estado - Cambiar estado
  getEstadisticasPedidos     // GET /api/admin/pedidos/estadisticas - Dashboard
};
