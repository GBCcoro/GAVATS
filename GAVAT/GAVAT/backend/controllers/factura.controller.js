/**
 * ============================================
 * CONTROLADOR DE FACTURAS
 * ============================================
 * Maneja la lógica de negocio relacionada con facturas.
 * Funcionalidades:
 * - Crear factura cuando se paga un pedido
 * - Obtener factura de un pedido
 * - Descargar PDF de factura
 * - Reenviar factura por email (opcional)
 * - Listar facturas del usuario
 * - Anular factura (admin)
 */

const {
  Factura,
  Pedido,
  Usuario,
  DetallePedido,
  Producto,
} = require("../models");
const { Op } = require("sequelize");

const {
  generarFacturaPDF,
  obtenerBufferFactura,
} = require("../services/pdfService");
const {
  handleServerError,
  parsePaginationQuery,
  buildPaginationMeta,
} = require("./_sharedControllerHelpers");

const obtenerDatosFactura = (factura) => ({
  id: factura.id,
  numeroFactura: factura.numeroFactura,
  estado: factura.estado,
  total: factura.total,
  fechaEmision: factura.fechaEmision,
});

const enviarFacturaPDF = async (factura, numeroFactura, res, marcarVista) => {
  const pdfBuffer = await obtenerBufferFactura(numeroFactura);

  if (marcarVista) {
    await factura.update({ estado: "vista" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="factura-${numeroFactura}.pdf"`,
  );
  res.send(pdfBuffer);
};

/**
 * Generar una nueva factura (se llamará automáticamente cuando se pague un pedido)
 * POST /api/cliente/facturas
 * Body: { pedidoId: number }
 */

exports.crearFactura = async (req, res) => {
  try {
    const { pedidoId } = req.body;
    const usuarioId = req.usuario.id;
    // Validar que el pedidoId esté presente
    if (!pedidoId) {
      return res.status(400).json({
        success: false,
        message: "El ID del pedido es obligatorio",
      });
    }
    // Obtener el pedido con sus detalles
    const pedido = await Pedido.findOne({
      where: { id: pedidoId, usuarioId },
      include: [
        {
          model: DetallePedido,
          as: "detalles",
          include: [{ model: Producto, as: "producto" }],
        },
        { model: Usuario, as: "usuario" },
      ],
    });
    // Verificar que el pedido existe y pertenece al usuario
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }
    // Verificar que el pedido está pagado antes de generar la factura
    if (pedido.estado !== "pagado") {
      return res.status(400).json({
        success: false,
        message: "Solo se puede generar factura para pedidos pagados",
      });
    }
    // Verificar que ya no existe una factura para este pedido
    const facturaExistente = await Factura.findOne({ where: { pedidoId } });
    if (facturaExistente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una factura para este pedido",
      });
    }
    // Generar número de factura único
    const ultimaFactura = await Factura.findOne({
      order: [["id", "DESC"]],
    });
    const numeroSecuencial = (ultimaFactura?.id || 0) + 1;
    const ano = new Date().getFullYear();
    const numeroFactura = `FAC-${ano}-${String(numeroSecuencial).padStart(5, "0")}`;
    // Preparar datos de detalles para PDF
    const detalles = pedido.detalles.map((det) => ({
      productoId: det.producto.id,
      nombre: det.producto.nombre,
      cantidad: det.cantidad,
      precioUnitario: det.precioUnitario,
      subtotal: det.subtotal,
    }));
    // Calcular impuesto (19% en Colombia)
    const subtotal = Number.parseFloat(pedido.total) / 1.19; // Asumir que el total ya incluye IVA
    const impuesto = Number.parseFloat(pedido.total) - subtotal;
    // Crear registro de factura en BD
    const factura = await Factura.create({
      pedidoId,
      numeroFactura,
      clienteNombre: pedido.usuario.nombre,
      clienteEmail: pedido.usuario.email,
      clienteDocumento: pedido.usuario.cedula || null,
      direccionEnvio: pedido.direccionEnvio,
      telefonoEnvio: pedido.telefono,
      subtotal: subtotal.toFixed(2),
      impuesto: impuesto.toFixed(2),
      total: pedido.total,
      metodoPago: pedido.metodoPago,
      referenciaPago: null,
      estado: "emitida",
      detalles,
    });
    // Generar PDF de la factura
    try {
      const rutaPDF = await generarFacturaPDF(factura.dataValues, true);
      // Actualizar la ruta del PDF en la BD
      await factura.update({ rutaPDF });
      res.status(201).json({
        success: true,
        message: "Factura creada exitosamente",
        data: obtenerDatosFactura(factura),
      });
    } catch (pdfError) {
      console.error("Error generando PDF:", pdfError);
      // La factura se creó pero sin PDF - se puede regenerar después
      res.status(201).json({
        success: true,
        message: "Factura creada exitosamente (PDF pendiente)",
        data: obtenerDatosFactura(factura),
      });
    }
  } catch (error) {
    return handleServerError(res, error, "Error al crear la factura");
  }
};

/**
 * Obtener la factura de un pedido
 * GET /api/cliente/pedidos/:pedidoId/factura
 */

exports.obtenerFacturaPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const usuarioId = req.usuario.id;
    // Verificar que el pedido pertenece al usuario
    const pedido = await Pedido.findOne({
      where: { id: pedidoId, usuarioId },
    });
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }
    // Obtener la factura
    const factura = await Factura.findOne({
      where: { pedidoId },
    });
    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "No hay factura para este pedido",
      });
    }
    res.status(200).json({
      success: true,
      data: {
        id: factura.id,
        numeroFactura: factura.numeroFactura,
        fechaEmision: factura.fechaEmision,
        clienteNombre: factura.clienteNombre,
        direccionEnvio: factura.direccionEnvio,
        subtotal: factura.subtotal,
        impuesto: factura.impuesto,
        total: factura.total,
        metodoPago: factura.metodoPago,
        estado: factura.estado,
        detalles: factura.detalles,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al obtener la factura");
  }
};

/**
 * Descargar PDF de la factura
 * GET /api/cliente/facturas/:numeroFactura/descargar
 */

exports.descargarFacturaPDF = async (req, res) => {
  try {
    const { numeroFactura } = req.params;
    const usuarioId = req.usuario.id;
    // Verificar que la factura pertenece al usuario
    const factura = await Factura.findOne({
      where: { numeroFactura },
      include: [
        {
          model: Pedido,
          as: "pedido",
          where: { usuarioId },
        },
      ],
    });
    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }
    if (!factura.rutaPDF) {
      return res.status(400).json({
        success: false,
        message: "El PDF de esta factura no está disponible",
      });
    }
    await enviarFacturaPDF(factura, numeroFactura, res, true);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ success: false, message: "Archivo de factura no encontrado" });
    }
    return handleServerError(res, error, "Error al descargar la factura");
  }
};

/**
 * Listar todas las facturas del usuario
 * GET /api/cliente/facturas
 */

exports.listarFacturasUsuario = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { page, limit, offset } = parsePaginationQuery(req.query, {
      defaultLimit: 10,
    });
    const { count, rows } = await Factura.findAndCountAll({
      include: [
        {
          model: Pedido,
          as: "pedido",
          attributes: ["id", "estado"],
          where: { usuarioId },
          required: true,
        },
      ],
      limit,
      offset,
      order: [["fechaEmision", "DESC"]],
    });
    res.status(200).json({
      success: true,
      data: {
        ...buildPaginationMeta(count, page, limit),
        facturas: rows.map((f) => ({
          id: f.id,
          numeroFactura: f.numeroFactura,
          fechaEmision: f.fechaEmision,
          clienteNombre: f.clienteNombre,
          total: f.total,
          estado: f.estado,
          pedidoEstado: f.pedido.estado,
        })),
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al listar las facturas");
  }
};

/**
 * Ver detalle de factura (para admin o propietario)
 * GET /api/admin/facturas/:id
 */

exports.verDetalleFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const factura = await Factura.findOne({
      where: { id },
      include: [
        {
          model: Pedido,
          as: "pedido",
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["id", "nombre", "email"],
            },
          ],
        },
      ],
    });
    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }
    res.status(200).json({
      success: true,
      data: {
        id: factura.id,
        numeroFactura: factura.numeroFactura,
        fechaEmision: factura.fechaEmision,
        clienteNombre: factura.clienteNombre,
        clienteEmail: factura.clienteEmail,
        clienteDocumento: factura.clienteDocumento,
        direccionEnvio: factura.direccionEnvio,
        telefonoEnvio: factura.telefonoEnvio,
        subtotal: factura.subtotal,
        impuesto: factura.impuesto,
        total: factura.total,
        metodoPago: factura.metodoPago,
        referenciaPago: factura.referenciaPago,
        estado: factura.estado,
        rutaPDF: factura.rutaPDF,
        detalles: factura.detalles,
        notas: factura.notas,
        pedido: factura.pedido,
        createdAt: factura.createdAt,
        updatedAt: factura.updatedAt,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al obtener la factura");
  }
};

/**
 * Listar todas las facturas (admin)
 * GET /api/admin/facturas
 */

exports.listarFacturasAdmin = async (req, res) => {
  try {
    const pageNum = Number.parseInt(req.query.pagina || req.query.page, 10) || 1;
    const limitNum = Math.min(Number.parseInt(req.query.limite || req.query.limit, 10) || 25, 1000);
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (req.query.estado && req.query.estado !== 'todos') {
      where.estado = req.query.estado;
    }
    if (req.query.pedidoId) {
      where.pedidoId = req.query.pedidoId;
    }
    if (req.query.buscar && req.query.buscar.trim()) {
      const termino = `%${req.query.buscar.trim()}%`;
      where[Op.or] = [
        { numeroFactura: { [Op.like]: termino } },
        { clienteNombre: { [Op.like]: termino } },
        { clienteEmail: { [Op.like]: termino } }
      ];
    }

    const { count, rows } = await Factura.findAndCountAll({
      where,
      include: [
        {
          model: Pedido,
          as: "pedido",
          attributes: ["id", "estado", "metodoPago"],
          include: [
            { model: Usuario, as: "usuario", attributes: ["nombre", "email"] },
          ],
        },
      ],
      limit: limitNum,
      offset,
      order: [["fechaEmision", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        ...buildPaginationMeta(count, pageNum, limitNum),
        facturas: rows.map((f) => ({
          id: f.id,
          numeroFactura: f.numeroFactura,
          fechaEmision: f.fechaEmision,
          clienteNombre: f.clienteNombre,
          clienteEmail: f.clienteEmail,
          direccionEnvio: f.direccionEnvio,
          telefonoEnvio: f.telefonoEnvio,
          subtotal: f.subtotal,
          impuesto: f.impuesto,
          total: f.total,
          metodoPago: f.metodoPago,
          estado: f.estado,
          pedidoEstado: f.pedido?.estado,
        })),
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al listar las facturas");
  }
};

/**
 * Anular una factura (admin)
 * PUT /api/admin/facturas/:id/anular
 */

exports.anularFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const factura = await Factura.findByPk(id);
    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }
    if (factura.estado === "anulada") {
      return res.status(400).json({
        success: false,
        message: "La factura ya está anulada",
      });
    }
    // Actualizar estado a anulada
    await factura.update({
      estado: "anulada",
      notas: `Anulada. Motivo: ${motivo || "No especificado"}`,
    });
    res.status(200).json({
      success: true,
      message: "Factura anulada exitosamente",
      data: {
        id: factura.id,
        numeroFactura: factura.numeroFactura,
        estado: factura.estado,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al anular la factura");
  }
};

/**
 * Descargar PDF de la factura (admin)
 * GET /api/admin/facturas/:numeroFactura/descargar
 */

exports.descargarFacturaPDFAdmin = async (req, res) => {
  try {
    const { numeroFactura } = req.params;
    // Verificar que la factura existe
    const factura = await Factura.findOne({
      where: { numeroFactura },
    });
    if (!factura) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }
    if (!factura.rutaPDF) {
      return res.status(400).json({
        success: false,
        message: "El PDF de esta factura no está disponible",
      });
    }
    await enviarFacturaPDF(factura, numeroFactura, res, false);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ success: false, message: "Archivo de factura no encontrado" });
    }
    return handleServerError(res, error, "Error al descargar la factura");
  }
};

module.exports = exports;
