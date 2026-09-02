/**
 * ============================================
 * CONTROLADOR DE AUTENTICACIÓN
 * ============================================
 * Maneja el registro, login, perfil y cambio de contraseña de usuarios.
 * Es usado por las rutas definidas en routes/auth.routes.js.
 * Cada función recibe (req, res) de Express y responde con JSON.
 */
// Importa el modelo Usuario desde la carpeta models.
// Este modelo representa la tabla 'Usuario' en la BD y permite hacer operaciones CRUD.

const { Op } = require("sequelize");
const Usuario = require("../models/Usuario");
const Pedido = require("../models/Pedido");
// Importa la función generateToken desde config/jwt.js.
// Se usa para crear un token JWT después de un registro o login exitoso.

const { generateToken } = require("../config/jwt");
const { handleServerError } = require("./_sharedControllerHelpers");

/**
 * Registrar nuevo usuario
 *
 * Crea un nuevo usuario con rol 'cliente' en la base de datos.
 * Los administradores solo pueden ser creados desde el seeder o por otro administrador.
 *
 * Ruta: POST /api/auth/register
 * Body esperado: { nombre, apellido, email, password, telefono, direccion }
 */

const register = async (req, res) => {
  try {
    // Desestructura los datos enviados en el body de la petición HTTP.
    const { nombre, apellido, email, password, telefono, direccion } = req.body;
    
    // VALIDACIÓN 1: Verifica que los campos obligatorios existan.
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: email y password son obligatorios",
      });
    }

    // VALIDACIÓN 2: Verifica que el email tenga un formato válido
    const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
    const emailNormalizado = String(email).trim().toLowerCase();
    if (!emailRegex.test(emailNormalizado)) {
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido",
      });
    }

    // VALIDACIÓN 3: Verifica que la contraseña tenga al menos 6 caracteres.
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // VALIDACIÓN 4: Busca en la BD si ya existe un usuario con ese email.
    const usuarioExistente = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    // Procesar y formatear nombre completo si viene nombre y/o apellido
    const partesNombre = [nombre, apellido].filter(Boolean).map(p => String(p).trim()).filter(Boolean);
    const nombreCompleto = partesNombre.length > 0 ? partesNombre.join(' ') : null;

    // Limpieza de campos opcionales (máximo 10 dígitos numéricos para teléfono)
    const telefonoLimpio = telefono && String(telefono).trim() !== '' ? String(telefono).replace(/\D/g, '').slice(0, 10) : null;
    const direccionLimpia = direccion && String(direccion).trim() !== '' ? String(direccion).trim() : null;

    // CREAR USUARIO en la base de datos.
    const nuevoUsuario = await Usuario.create({
      nombre: nombreCompleto,
      email: emailNormalizado,
      password,
      telefono: telefonoLimpio,
      direccion: direccionLimpia,
      rol: "cliente",
    });

    // GENERAR TOKEN JWT con los datos básicos del usuario recién creado.
    const token = generateToken({
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
    });
    // PREPARAR RESPUESTA: convierte el objeto Sequelize a JSON plano
    // y elimina el campo password para no enviarlo al cliente por seguridad.
    const usuarioRespuesta = nuevoUsuario.toJSON();
    delete usuarioRespuesta.password; // Elimina la propiedad password del objeto
    // Responde con status 201 (Created = recurso creado exitosamente)
    // Envía el usuario (sin password) y el token JWT
    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        usuario: usuarioRespuesta, // Datos del usuario sin contraseña
        token, // Token JWT para autenticación
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al registrar usuario");
  }
};

/**
 * Iniciar sesión (Login)
 *
 * Autentica un usuario verificando email y contraseña.
 * Si las credenciales son correctas, retorna el usuario y un token JWT.
 *
 * Ruta: POST /api/auth/login
 * Body esperado: { email, password }
 */

const login = async (req, res) => {
  try {
    // Extrae email y password del body de la petición
    const { email, password } = req.body;
    // VALIDACIÓN 1: Verifica que se enviaron ambos campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }
    // VALIDACIÓN 2: Busca el usuario por email en la BD.
    // .scope('withPassword') es un scope definido en el modelo Usuario
    // que INCLUYE el campo password (normalmente está excluido por seguridad).
    // Se necesita el password aquí para poder compararlo con el que envió el usuario.
    const usuario = await Usuario.scope("withPassword").findOne({
      where: { email }, // Busca donde el email coincida
    });
    // Si no encontró ningún usuario con ese email
    if (!usuario) {
      // Status 401 = Unauthorized (no autorizado)
      // Mensaje genérico "Credenciales inválidas" por seguridad
      // (no revela si el email existe o no)
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }
    // VALIDACIÓN 3: Verifica que la cuenta del usuario esté activa.
    // Un admin puede desactivar cuentas, impidiendo el login.
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo. Contacte al administrador",
      });
    }
    // VALIDACIÓN 4: Compara la contraseña enviada con la almacenada (hasheada).
    // compararPassword() es un método definido en el modelo Usuario
    // que usa bcrypt para comparar de forma segura.
    // Retorna true si coinciden, false si no.
    const passwordValida = await usuario.compararPassword(password);
    // Si la contraseña no coincide
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }
    // GENERAR TOKEN JWT con los datos básicos del usuario autenticado
    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
    // PREPARAR RESPUESTA: elimina el password del objeto antes de enviarlo
    const usuarioSinPassword = usuario.toJSON();
    delete usuarioSinPassword.password;
    // Responde con status 200 (OK) - res.json() usa 200 por defecto
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: {
        usuario: usuarioSinPassword, // Datos del usuario sin contraseña
        token, // Token JWT para usar en futuras peticiones
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al iniciar sesión");
  }
};

/**
 * Obtener perfil del usuario autenticado
 *
 * Retorna los datos actualizados del usuario que hizo la petición.
 * Requiere que el middleware verificarAuth haya validado el token antes.
 *
 * Ruta: GET /api/auth/me
 * Headers requeridos: { Authorization: 'Bearer TOKEN' }
 */

const getMe = async (req, res) => {
  try {
    // req.usuario fue agregado por el middleware verificarAuth (middleware/auth.js)
    // Contiene los datos decodificados del token (id, email, rol).
    // Volvemos a consultar la BD para obtener los datos más recientes del usuario.
    // findByPk() busca por Primary Key (clave primaria = id)
    const usuario = await Usuario.findByPk(req.usuario.id, {
      // attributes.exclude: lista los campos que NO queremos obtener
      // Excluye 'password' para no enviarlo en la respuesta
      attributes: { exclude: ["password"] },
    });
    // Si el usuario fue eliminado después de generar el token
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }
    // Responde con los datos del usuario
    res.json({
      success: true,
      data: {
        usuario,
      },
    });
  } catch (error) {
    return handleServerError(res, error, "Error al obtener perfil");
  }
};

/**
 * Actualizar perfil del usuario autenticado
 *
 * Permite al usuario actualizar su información personal.
 * NO permite cambiar el rol ni el estado activo (solo un admin puede).
 *
 * Ruta: PUT /api/auth/me
 * Headers: { Authorization: 'Bearer TOKEN' }
 * Body: { nombre, apellido, telefono, direccion }
 */

const updateMe = async (req, res) => {
  try {
    // Solo extrae los campos que el usuario tiene PERMITIDO cambiar.
    // No extrae 'rol' ni 'activo' por seguridad.
    const { nombre, apellido, email, telefono, direccion, passwordActual } = req.body;
    // Busca el usuario en la BD con scope 'withPassword' para verificar contraseña si es administrador
    const usuario = await Usuario.scope("withPassword").findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Regla de seguridad: Para hacer cambios en la cuenta de Administrador, es OBLIGATORIO ingresar la contraseña
    if (usuario.rol === "administrador") {
      if (!passwordActual) {
        return res.status(400).json({
          success: false,
          message: "Se requiere ingresar tu contraseña actual para autorizar los cambios en la cuenta de Administrador",
        });
      }
      const bcrypt = require("bcryptjs");
      const esPasswordValida = await bcrypt.compare(passwordActual, usuario.password);
      if (!esPasswordValida) {
        return res.status(400).json({
          success: false,
          message: "Contraseña incorrecta. No se pudieron aplicar los cambios",
        });
      }
    }

    let tokenActualizado = null;

    // Si viene email y es diferente al actual, validar formato y unicidad
    if (email !== undefined && email !== null) {
      const emailNormalizado = String(email).trim().toLowerCase();
      if (!emailNormalizado) {
        return res.status(400).json({
          success: false,
          message: "El correo electrónico no puede estar vacío",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
      if (!emailRegex.test(emailNormalizado)) {
        return res.status(400).json({
          success: false,
          message: "Formato de correo electrónico inválido",
        });
      }

      if (emailNormalizado !== usuario.email.toLowerCase()) {
        // Regla: El auxiliar no tiene permitido modificar su correo electrónico
        if (usuario.rol === "auxiliar") {
          return res.status(403).json({
            success: false,
            message: "Las cuentas con rol Auxiliar no tienen permitido modificar su correo electrónico",
          });
        }

        const usuarioExistente = await Usuario.findOne({
          where: {
            email: emailNormalizado,
            id: { [Op.ne]: usuario.id },
          },
        });

        if (usuarioExistente) {
          return res.status(400).json({
            success: false,
            message: "El correo electrónico ya está registrado por otro usuario",
          });
        }

        usuario.email = emailNormalizado;
        tokenActualizado = generateToken({
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol,
        });
      }
    }

    // ACTUALIZAR CAMPOS: solo actualiza si el campo viene definido en el body.
    if (nombre !== undefined) usuario.nombre = nombre;
    if (apellido !== undefined) usuario.apellido = apellido;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (direccion !== undefined) usuario.direccion = direccion;

    // .save() persiste los cambios en la base de datos.
    await usuario.save();

    // Responde con los datos actualizados.
    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: {
        usuario: usuario.toJSON(),
        ...(tokenActualizado ? { token: tokenActualizado } : {}),
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico ya está registrado por otro usuario",
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors?.[0]?.message || "Datos de perfil inválidos",
      });
    }
    return handleServerError(res, error, "Error al actualizar perfil");
  }
};

/**
 * Cambiar contraseña del usuario autenticado
 *
 * Requiere la contraseña actual como verificación de seguridad.
 * La nueva contraseña se hashea automáticamente por el hook beforeUpdate.
 *
 * Ruta: PUT /api/auth/change-password
 * Headers: { Authorization: 'Bearer TOKEN' }
 * Body: { passwordActual, passwordNueva }
 */

const changePassword = async (req, res) => {
  try {
    // Extrae las dos contraseñas del body
    const { passwordActual, passwordNueva } = req.body;
    // VALIDACIÓN 1: Verifica que ambas contraseñas fueron enviadas
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        success: false,
        message: "Se requiere contraseña actual y nueva contraseña",
      });
    }
    // VALIDACIÓN 2: Verifica longitud mínima de la nueva contraseña
    if (passwordNueva.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }
    // VALIDACIÓN 3: Busca el usuario CON el password incluido (scope especial).
    // Necesitamos el password para comparar la contraseña actual.
    const usuario = await Usuario.scope("withPassword").findByPk(
      req.usuario.id,
    );
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }
    // VALIDACIÓN 4: Verifica que la contraseña actual proporcionada sea correcta.
    // Compara con bcrypt la contraseña en texto plano vs la hasheada en la BD.
    const passwordValida = await usuario.compararPassword(passwordActual);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }
    // ACTUALIZAR CONTRASEÑA: asigna la nueva contraseña al usuario.
    // El hook beforeUpdate del modelo se encargará de hashearla automáticamente
    // antes de guardarla en la BD (nunca se guarda en texto plano).
    usuario.password = passwordNueva;
    await usuario.save(); // Guarda los cambios en la BD
    // Responde confirmando el cambio (no envía el password ni token nuevo)
    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    return handleServerError(res, error, "Error al cambiar contraseña");
  }
};

/**
 * Desactivar cuenta propia (confirmación sencilla, solo para clientes)
 *
 * Ruta: PUT /api/auth/deactivate
 * Headers: { Authorization: 'Bearer TOKEN' }
 */
const deactivateMe = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Regla de seguridad: Solo clientes pueden desactivarse desde su perfil
    if (usuario.rol !== "cliente") {
      return res.status(403).json({
        success: false,
        message: "Solo los clientes pueden desactivar su propia cuenta desde el perfil",
      });
    }

    // Desactivar la cuenta (pasa a estado Inactivo)
    usuario.activo = false;
    await usuario.save();

    return res.json({
      success: true,
      message: "Cuenta desactivada exitosamente",
    });
  } catch (error) {
    return handleServerError(res, error, "Error al desactivar la cuenta");
  }
};

/**
 * Eliminar cuenta propia definitivamente (requiere correo y contraseña, solo para clientes)
 *
 * Ruta: DELETE /api/auth/me  o  POST /api/auth/delete-account
 * Headers: { Authorization: 'Bearer TOKEN' }
 * Body: { email, password }
 */
const deleteMe = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Se requiere ingresar tu correo y contraseña para confirmar la eliminación",
      });
    }

    const usuario = await Usuario.scope("withPassword").findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Regla de seguridad: Solo clientes pueden auto-eliminarse desde su perfil
    if (usuario.rol !== "cliente") {
      return res.status(403).json({
        success: false,
        message: "Solo los clientes pueden eliminar su cuenta desde el perfil",
      });
    }

    // Verificar que el correo ingresado coincida con la cuenta del usuario autenticado
    if (String(email).trim().toLowerCase() !== usuario.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico no coincide con tu cuenta actual",
      });
    }

    // Verificar la contraseña con bcrypt
    const bcrypt = require("bcryptjs");
    const esPasswordValida = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValida) {
      return res.status(400).json({
        success: false,
        message: "Contraseña incorrecta. No se pudo eliminar la cuenta",
      });
    }

    // Si tiene pedidos asociados, desactivar la cuenta para preservar la integridad referencial fiscal (RESTRICT)
    const tienePedidos = await Pedido.count({ where: { usuarioId: usuario.id } });
    if (tienePedidos > 0) {
      usuario.activo = false;
      await usuario.save();
      return res.json({
        success: true,
        message: "Cuenta eliminada exitosamente",
      });
    }

    // Si no tiene pedidos, se elimina definitivamente
    await usuario.destroy();
    return res.json({
      success: true,
      message: "Cuenta eliminada exitosamente",
    });
  } catch (error) {
    return handleServerError(res, error, "Error al eliminar la cuenta");
  }
};

// Exporta todas las funciones del controlador como un objeto.
// Estas funciones se importan en routes/auth.routes.js para asociarlas a las rutas.
// Ejemplo en rutas: router.post('/register', authController.register);

module.exports = {
  register, // POST /api/auth/register - Registro de nuevos usuarios
  login, // POST /api/auth/login - Inicio de sesión
  getMe, // GET /api/auth/me - Obtener perfil propio
  updateMe, // PUT /api/auth/me - Actualizar perfil propio
  changePassword, // PUT /api/auth/change-password - Cambiar contraseña
  deactivateMe, // PUT /api/auth/deactivate - Desactivar cuenta propia (cliente)
  deleteMe, // DELETE /api/auth/me - Eliminar cuenta propia definitiva con contraseña (cliente)
};
