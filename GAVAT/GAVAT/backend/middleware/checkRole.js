/**

 * ============================================

 * MIDDLEWARE DE VERIFICACIÓN DE ROLES

 * ============================================

 * Estos middlewares controlan el ACCESO según el rol del usuario.

 * Se usan en cadena DESPUÉS del middleware verificarAuth (middleware/auth.js).

 * 

 * Flujo en una ruta protegida:

 *   Petición HTTP → verificarAuth (valida JWT, adjunta req.usuario) → esAdministrador (verifica rol) → controlador

 * 

 * Si el usuario no tiene el rol requerido → responde 403 (Prohibido) y NO llega al controlador.

 * 

 * Códigos HTTP usados:

 *   401 = No autorizado (no hay usuario logueado)

 *   403 = Prohibido (logueado pero sin permisos suficientes)

 */

/**

 * esAdministrador — Solo permite acceso a administradores

 * 

 * Verifica que req.usuario.rol === 'administrador'.

 * req.usuario fue adjuntado por verificarAuth en el paso anterior.

 * 

 * Uso en rutas de admin (routes/admin.routes.js):

 *   router.post('/crear', verificarAuth, esAdministrador, controlador);

 */

const crearMiddlewareDeRol =
  (rolesPermitidos, mensajeDenegado, nombre) => (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          message: "No autorizado. Debes iniciar sesión primero",
        });
      }

      if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
          success: false,
          message: mensajeDenegado,
        });
      }

      next();
    } catch (error) {
      console.error(`Error en middleware ${nombre}:`, error);
      return res.status(500).json({
        success: false,
        message: "Error al verificar permisos",
        error: error.message,
      });
    }
  };

const esAdministrador = crearMiddlewareDeRol(
  ["administrador"],
  "Acceso denegado. Se requieren permisos de administrador",
  "esAdministrador",
);

/**

 * esCliente — Solo permite acceso a clientes

 * 

 * Verifica que req.usuario.rol === 'cliente'.

 * Se usa en rutas exclusivas para clientes como el carrito de compras.

 * 

 * Uso en rutas de cliente (routes/cliente.routes.js):

 *   router.post('/carrito', verificarAuth, esCliente, controlador);

 */

const esCliente = crearMiddlewareDeRol(
  ["cliente"],
  "Acceso denegado. Esta función es solo para clientes",
  "esCliente",
);

/**

 * tieneRol — Permite acceso a MÚLTIPLES roles (middleware flexible/dinámico)

 * 

 * A diferencia de esAdministrador o esCliente que verifican UN solo rol,

 * tieneRol recibe un ARRAY de roles permitidos y acepta cualquiera de ellos.

 * 

 * Es una "función que retorna un middleware" (patrón factory/closure en JavaScript).

 * 

 * Uso en rutas con múltiples roles:

 *   router.get('/perfil', verificarAuth, tieneRol(['cliente', 'administrador']), controlador);

 * 

 * @param {Array} rolesPermitidos - Array de strings con los roles válidos. Ej: ['cliente', 'administrador']

 * @returns {Function} Middleware de Express (req, res, next)

 */

const tieneRol = (rolesPermitidos) => {
  // Retorna la función middleware que Express ejecutará

  // Los rolesPermitidos quedan "capturados" por el closure

  return (req, res, next) => {
    try {
      // Verifica que exista usuario autenticado

      if (!req.usuario) {
        return res.status(401).json({
          success: false,

          message: "No autorizado. Debes iniciar sesión primero",
        });
      }

      // includes() verifica si el rol del usuario está dentro del array de roles permitidos

      // Ejemplo: ['cliente', 'administrador'].includes('cliente') → true

      if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
          success: false,

          // join(', ') convierte el array a texto: ['cliente', 'admin'] → "cliente, admin"

          message: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}`,
        });
      }

      // El rol del usuario está en la lista de permitidos → continúa

      next();
    } catch (error) {
      console.error("Error en middleware tieneRol:", error);

      return res.status(500).json({
        success: false,

        message: "Error al verificar permisos",

        error: error.message,
      });
    }
  };
};

/**

 * esPropioUsuarioOAdmin — Verifica que el usuario accede a SUS propios datos

 * 

 * Compara el ID del usuario autenticado (req.usuario.id) con el ID de la URL (req.params).

 * EXCEPCIÓN: Los administradores pueden acceder a datos de CUALQUIER usuario.

 * 

 * Uso en rutas que manejan datos personales:

 *   router.get('/pedidos/:usuarioId', verificarAuth, esPropioUsuarioOAdmin, controlador);

 */

const esPropioUsuarioOAdmin = (req, res, next) => {
  try {
    // Verifica que haya usuario autenticado

    if (!req.usuario) {
      return res.status(401).json({
        success: false,

        message: "No autorizado. Debes iniciar sesión primero",
      });
    }

    // EXCEPCIÓN: Los administradores tienen acceso total → pasan directamente

    if (req.usuario.rol === "administrador") {
      return next();
    }

    // Obtiene el ID del usuario de los parámetros de la URL

    // Busca primero :usuarioId, luego :id (dependiendo de cómo se definió la ruta)

    const usuarioIdParam = req.params.usuarioId || req.params.id;

    // Compara el ID de la URL con el ID del usuario autenticado

    // Number.parseInt() convierte el string de la URL a número para comparar correctamente

    if (Number.parseInt(usuarioIdParam) !== req.usuario.id) {
      return res.status(403).json({
        // 403 = Intenta acceder a datos de otro usuario

        success: false,

        message: "Acceso denegado. No puedes acceder a datos de otros usuarios",
      });
    }

    // El usuario accede a SUS propios datos → continúa al controlador

    next();
  } catch (error) {
    console.error("Error en middleware esPropioUsuarioOAdmin:", error);

    return res.status(500).json({
      success: false,

      message: "Error al verificar permisos",

      error: error.message,
    });
  }
};

/**

 * esAdminOAuxiliar — Permite acceso a administradores Y auxiliares

 * 

 * Se usa para rutas del panel de administración que los auxiliares también pueden ver.

 * Verifica que req.usuario.rol sea 'administrador' O 'auxiliar'.

 * 

 * Uso en rutas:

 *   router.get('/lista', verificarAuth, esAdminOAuxiliar, controlador);

 */

const esAdminOAuxiliar = crearMiddlewareDeRol(
  ["administrador", "auxiliar"],
  "Acceso denegado. Se requieren permisos de administrador o auxiliar",
  "esAdminOAuxiliar",
);

/**

 * soloAdministrador — Bloquea incluso a auxiliares

 * 

 * Más restrictivo que esAdminOAuxiliar.

 * Se usa para operaciones CRÍTICAS como eliminar datos o cambiar configuraciones.

 * Solo 'administrador' pasa; 'auxiliar' es rechazado.

 * 

 * Uso en rutas críticas:

 *   router.delete('/eliminar/:id', verificarAuth, soloAdministrador, controlador);

 */

const soloAdministrador = crearMiddlewareDeRol(
  ["administrador"],
  "Acceso denegado. Solo administradores pueden realizar esta operación",
  "soloAdministrador",
);

// Exporta todos los middlewares de roles para usarlos en las rutas (routes/*.routes.js)

module.exports = {
  esAdministrador, // Solo admin → rutas CRUD de admin

  esCliente, // Solo cliente → carrito, pedidos propios

  tieneRol, // Múltiples roles → flexible, recibe array

  esPropioUsuarioOAdmin, // Dueño de los datos o admin → datos personales

  esAdminOAuxiliar, // Admin o auxiliar → panel de gestión

  soloAdministrador, // Solo admin (ni auxiliar) → operaciones críticas
};
