# Manual de Usuario - Plataforma GAVAT

## 1. Introducción

### 1.1 Objetivo
Este manual describe el uso del sistema GAVAT, una plataforma web de comercio electrónico que permite a los usuarios registrarse, iniciar sesión, consultar el catálogo, gestionar el carrito, realizar pedidos y administrar el contenido del sistema.

### 1.2 Alcance
El manual está dirigido a los usuarios finales del sistema que trabajan con los siguientes roles:
- Cliente
- Auxiliar
- Administrador

### 1.3 Nota importante
El proyecto actual no implementa los módulos de aspirante, empleado o recursos humanos descritos en el texto original. La plataforma real se centra en comercio electrónico y gestión de catálogo, pedidos, facturas y comentarios.

## 2. Mapa del sistema

### 2.1 Modelo lógico
El sistema real de GAVAT está organizado en módulos principales que reflejan la funcionalidad implementada en el backend y frontend.

Módulos implementados:
- Módulo de Iniciar sesión.
- Módulo de Registro.
- Módulo de Rol (atributo de usuario para permisos).
- Módulo de Catálogo.
- Módulo de Carrito.
- Módulo de Pedidos.
- Módulo de Facturas.
- Módulo de Comentarios.
- Módulo de Perfil de usuario.
- Módulo de Administración (gestión de categorías, subcategorías, productos, usuarios, pedidos, facturas y comentarios).

Módulos solicitados en el requisito original pero NO implementados en el proyecto actual:
- Módulo de Cargo.
- Módulo de Convocatoria.
- Módulo de Postulación.
- Módulo de Hoja de vida.
- Módulo de Experiencia.
- Módulo de Estudio.
- Módulo de Entrevista.
- Módulo de Ausencia.
- Módulo de Vacación.
- Módulo de Paz y Salvo.
- Módulo de Vinculación.
- Módulo de Jornada.
- Módulo de Hora extra.
- Módulo de Chat.
- Módulo de Certificado.
- Módulo de Publicación.
- Módulo de Notificación (no existe como módulo independiente, solo notificaciones de sesión o mensajes del frontend).
- Módulo de Sistema de gestión (se implementa como panel administrativo general).

### 2.2 Navegación y procesos reales del sistema
A continuación se describen los pasos para navegar y completar los procesos implementados en GAVAT.

#### Inicio de sesión
Paso | Acción
--- | ---
1 | Abrir la página de inicio y seleccionar "Iniciar sesión".
2 | Ingresar el correo electrónico registrado.
3 | Ingresar la contraseña.
4 | Presionar el botón "Acceder".
5 | El sistema valida credenciales y redirige al usuario según su rol.

#### Registro de usuario
Paso | Acción
--- | ---
1 | Abrir la página de registro desde el enlace de la pantalla de login.
2 | Completar el formulario con nombre, email, contraseña, teléfono y dirección.
3 | Presionar el botón "Registrarse".
4 | El sistema crea la cuenta y permite iniciar sesión inmediatamente.

#### Navegar el catálogo
Paso | Acción
--- | ---
1 | Acceder al catálogo desde la página principal o menú.
2 | Revisar productos disponibles y usar los filtros de categoría si están disponibles.
3 | Seleccionar un producto para ver su detalle.
4 | Consultar descripción, precio, imagen y disponibilidad.

#### Ver detalle de producto
Paso | Acción
--- | ---
1 | En la página del catálogo, hacer clic en un producto.
2 | Leer la información completa del producto.
3 | Elegir la cantidad deseada.
4 | Presionar el botón "Agregar al carrito".

#### Gestionar el carrito
Paso | Acción
--- | ---
1 | Acceder al carrito desde el icono o enlace del menú.
2 | Revisar los productos agregados y sus cantidades.
3 | Actualizar la cantidad de un producto si es necesario.
4 | Eliminar un producto si no se desea comprar.
5 | Vaciar el carrito si se desea empezar de nuevo.
6 | Pulsar el botón de checkout para continuar con el pedido.

#### Realizar un pedido (checkout)
Paso | Acción
--- | ---
1 | Desde el carrito, seleccionar la opción para finalizar la compra.
2 | Completar los datos de envío y contacto requeridos por el formulario.
3 | Confirmar el pedido.
4 | El sistema procesa el pedido y redirige a la página de confirmación.
5 | Consultar el número y estado del pedido si está disponible.

#### Confirmación de pedido
Paso | Acción
--- | ---
1 | Revisar la página de confirmación luego de completar el checkout.
2 | Anotar el número de pedido o detalles mostrados.
3 | Volver al catálogo o al perfil para seguir navegando.

#### Consultar mis pedidos
Paso | Acción
--- | ---
1 | Iniciar sesión como cliente.
2 | Ir al perfil o al menú de usuario.
3 | Seleccionar la sección "Mis pedidos".
4 | Revisar la lista de pedidos realizados.
5 | Hacer clic en un pedido para ver su detalle.

#### Ver detalle de pedido
Paso | Acción
--- | ---
1 | En la sección de pedidos, elegir un pedido específico.
2 | Revisar productos, cantidades, total y estado.
3 | Consultar si el pedido está en estado "pendiente" para poder cancelarlo.

#### Cancelar pedido
Paso | Acción
--- | ---
1 | Ir a la lista de pedidos en "Mis pedidos".
2 | Localizar el pedido en estado "pendiente".
3 | Presionar el botón o enlace de cancelación.
4 | Confirmar la cancelación.
5 | El sistema actualiza el estado del pedido y restaura el stock si aplica.

#### Crear comentario sobre producto
Paso | Acción
--- | ---
1 | Iniciar sesión como cliente.
2 | Ir al detalle de un producto comprado.
3 | Elegir la opción para escribir un comentario o reseña.
4 | Ingresar el texto y la calificación.
5 | Enviar el comentario.
6 | El sistema registra el comentario y lo hace visible según la moderación.

#### Consultar comentarios de producto
Paso | Acción
--- | ---
1 | Acceder al detalle de un producto.
2 | Buscar la sección de comentarios o reseñas.
3 | Revisar los comentarios visibles de otros usuarios.

#### Generar y descargar facturas (cliente)
Paso | Acción
--- | ---
1 | Iniciar sesión como cliente.
2 | Ir a la sección de facturas o pedidos.
3 | Seleccionar el pedido pagado para generar factura.
4 | Solicitar la factura si el sistema lo permite.
5 | Descargar el archivo PDF de la factura.

#### Ver y actualizar perfil
Paso | Acción
--- | ---
1 | Iniciar sesión en el sistema.
2 | Ir al perfil de usuario desde el menú.
3 | Revisar los datos personales.
4 | Actualizar campos como nombre, teléfono o dirección.
5 | Guardar los cambios.

#### Acceder al panel administrativo
Paso | Acción
--- | ---
1 | Iniciar sesión con credenciales de administrador o auxiliar.
2 | Seleccionar la opción de "Administración" o el dashboard.
3 | Revisar las métricas y accesos rápidos disponibles.

#### Gestionar categorías
Paso | Acción
--- | ---
1 | En el panel administrativo, ir a la sección de categorías.
2 | Revisar la lista de categorías existentes.
3 | Crear una nueva categoría si se desea.
4 | Editar una categoría existente.
5 | Activar o desactivar una categoría.
6 | Eliminar la categoría si se cuenta con permisos de administrador.

#### Gestionar subcategorías
Paso | Acción
--- | ---
1 | En el panel administrativo, ir a la sección de subcategorías.
2 | Revisar la lista de subcategorías.
3 | Crear una nueva subcategoría.
4 | Editar una subcategoría existente.
5 | Activar o desactivar una subcategoría.
6 | Eliminar la subcategoría si se cuenta con permisos de administrador.

#### Gestionar productos
Paso | Acción
--- | ---
1 | En el panel administrativo, ir a la sección de productos.
2 | Revisar la lista de productos disponibles.
3 | Crear un nuevo producto con nombre, descripción, precio, stock y categoría.
4 | Subir una imagen para el producto.
5 | Editar los datos de un producto existente.
6 | Activar o desactivar el producto.
7 | Actualizar el stock si es necesario.
8 | Eliminar el producto si se cuenta con permisos de administrador.

#### Gestionar usuarios (administrador)
Paso | Acción
--- | ---
1 | En el panel administrativo, ir a la sección de usuarios.
2 | Revisar la lista de usuarios registrados.
3 | Crear un nuevo usuario si se necesita.
4 | Editar la información de un usuario existente.
5 | Activar o desactivar una cuenta.
6 | Eliminar un usuario si se cuenta con permisos de administrador.

#### Gestionar pedidos (admin/auxiliar)
Paso | Acción
--- | ---
1 | En el panel administrativo, ir a la sección de pedidos.
2 | Revisar la lista de pedidos del sistema.
3 | Filtrar por estado si la interfaz lo permite.
4 | Seleccionar un pedido para ver su detalle.
5 | Actualizar el estado del pedido (por ejemplo, pendiente a enviado).

#### Gestionar facturas (admin/auxiliar)
Paso | Acción
--- | ---
1 | En el panel administrativo, ir a la sección de facturas.
2 | Revisar la lista de facturas del sistema.
3 | Seleccionar una factura para ver su detalle.
4 | Descargar el PDF de la factura.
5 | Anular la factura si se cuenta con los permisos necesarios.

#### Gestionar comentarios (admin/auxiliar)
Paso | Acción
--- | ---
1 | En el panel administrativo, ir a la sección de comentarios.
2 | Revisar los comentarios registrados.
3 | Modificar el estado de visibilidad de un comentario.
4 | Eliminar un comentario si se cuenta con permisos de administrador.

### 2.3 Módulos solicitados pero no disponibles
El texto original describe otros módulos que no forman parte de la versión actual del sistema.

Estos módulos quedan como posibles ampliaciones en futuras versiones:
- Cargo
- Convocatoria
- Postulación
- Hoja de vida
- Experiencia
- Estudio
- Entrevista
- Ausencia
- Vacación
- Paz y Salvo
- Vinculación
- Jornada
- Hora extra
- Chat
- Certificado
- Publicación
- Notificación (como módulo independiente)

## 3. Roles y permisos

### 2.1 Cliente
El cliente es el usuario final que realiza compras en la plataforma.
Funciones principales:
- Registrarse en el sistema.
- Iniciar sesión.
- Navegar el catálogo de productos.
- Ver el detalle de un producto.
- Agregar productos al carrito.
- Modificar cantidades o eliminar productos del carrito.
- Vaciar el carrito.
- Realizar pedidos (checkout).
- Consultar historial de pedidos.
- Ver el detalle de pedidos propios.
- Cancelar pedidos en estado pendiente.
- Crear comentarios sobre productos comprados.
- Consultar y actualizar su perfil.
- Generar facturas de pedidos pagados y descargarlas en PDF.

### 2.2 Auxiliar
El auxiliar es un rol intermedio con acceso al panel administrativo, pero con permisos limitados respecto al administrador.
Funciones principales:
- Ver, crear y actualizar categorías.
- Ver, crear y actualizar subcategorías.
- Ver, crear y actualizar productos.
- Activar o desactivar categorías, subcategorías y productos.
- Consultar pedidos y actualizar su estado.
- Consultar estadísticas de pedidos.
- Gestionar facturas y descargar PDFs.
- Ver y moderar comentarios.

Limitaciones del auxiliar:
- No puede eliminar categorías, subcategorías ni productos.
- No puede gestionar usuarios.

### 2.3 Administrador
El administrador tiene control total del sistema.
Funciones principales:
- Todas las funcionalidades del auxiliar.
- Gestionar usuarios: listar, crear, actualizar, activar/desactivar y eliminar cuando sea permitido.
- Eliminar categorías, subcategorías y productos.
- Gestionar pedidos: ver todos los pedidos, cambiar estado y consultar estadísticas.
- Gestionar facturas: listar todas las facturas, ver detalle, descargar PDF y anular facturas.
- Gestionar comentarios: ver todos los comentarios, moderar visibilidad y eliminar comentarios.

## 3. Funcionalidades clave del sistema

### 3.1 Autenticación
- Registro de usuarios: `POST /api/auth/register`.
- Inicio de sesión: `POST /api/auth/login`.
- Obtener perfil: `GET /api/auth/me`.
- Actualizar perfil: `PUT /api/auth/me`.
- Cambiar contraseña: `PUT /api/auth/change-password`.

### 3.2 Catálogo de productos
- Ver productos disponibles: `GET /api/catalogo/productos`.
- Ver detalle de producto: `GET /api/catalogo/productos/:id`.
- Ver categorías activas: `GET /api/catalogo/categorias`.
- Ver subcategorías de una categoría: `GET /api/catalogo/categorias/:id/subcategorias`.
- Ver productos destacados: `GET /api/catalogo/destacados`.

### 3.3 Cliente: carrito y pedidos
- Ver carrito: `GET /api/cliente/carrito`.
- Agregar producto al carrito: `POST /api/cliente/carrito`.
- Actualizar cantidad de item: `PUT /api/cliente/carrito/:id`.
- Eliminar item del carrito: `DELETE /api/cliente/carrito/:id`.
- Vaciar carrito: `DELETE /api/cliente/carrito`.
- Crear pedido: `POST /api/cliente/pedidos`.
- Ver mis pedidos: `GET /api/cliente/pedidos`.
- Ver detalle de pedido: `GET /api/cliente/pedidos/:id`.
- Cancelar pedido pendiente: `PUT /api/cliente/pedidos/:id/cancelar`.

### 3.4 Cliente: comentarios y facturas
- Crear comentario sobre producto: `POST /api/cliente/comentarios`.
- Ver comentarios de producto: `GET /api/catalogo/productos/:productoId/comentarios`.
- Crear factura para pedido pagado: `POST /api/cliente/facturas`.
- Ver facturas propias: `GET /api/cliente/facturas`.
- Obtener factura por pedido: `GET /api/cliente/pedidos/:pedidoId/factura`.
- Descargar factura PDF: `GET /api/cliente/facturas/:numeroFactura/descargar`.

### 3.5 Administración
#### Categorías
- Listar categorías: `GET /api/admin/categorias`.
- Ver categoría: `GET /api/admin/categorias/:id`.
- Crear categoría: `POST /api/admin/categorias`.
- Actualizar categoría: `PUT /api/admin/categorias/:id`.
- Activar/desactivar categoría: `PATCH /api/admin/categorias/:id/toggle`.
- Eliminar categoría: `DELETE /api/admin/categorias/:id` (solo administrador).

#### Subcategorías
- Listar subcategorías: `GET /api/admin/subcategorias`.
- Ver subcategoría: `GET /api/admin/subcategorias/:id`.
- Crear subcategoría: `POST /api/admin/subcategorias`.
- Actualizar subcategoría: `PUT /api/admin/subcategorias/:id`.
- Activar/desactivar subcategoría: `PATCH /api/admin/subcategorias/:id/toggle`.
- Eliminar subcategoría: `DELETE /api/admin/subcategorias/:id` (solo administrador).

#### Productos
- Listar productos: `GET /api/admin/productos`.
- Ver producto: `GET /api/admin/productos/:id`.
- Crear producto: `POST /api/admin/productos`.
- Actualizar producto: `PUT /api/admin/productos/:id`.
- Activar/desactivar producto: `PATCH /api/admin/productos/:id/toggle`.
- Actualizar stock: `PATCH /api/admin/productos/:id/stock`.
- Eliminar producto: `DELETE /api/admin/productos/:id` (solo administrador).

#### Usuarios
- Listar usuarios: `GET /api/admin/usuarios`.
- Ver usuario: `GET /api/admin/usuarios/:id`.
- Crear usuario: `POST /api/admin/usuarios`.
- Actualizar usuario: `PUT /api/admin/usuarios/:id`.
- Activar/desactivar usuario: `PATCH /api/admin/usuarios/:id/toggle`.
- Eliminar usuario: `DELETE /api/admin/usuarios/:id` (solo administrador).

#### Pedidos
- Listar pedidos: `GET /api/admin/pedidos`.
- Ver pedido: `GET /api/admin/pedidos/:id`.
- Actualizar estado de pedido: `PUT /api/admin/pedidos/:id/estado`.
- Ver estadísticas de pedidos: `GET /api/admin/pedidos/estadisticas`.

#### Facturas
- Listar facturas: `GET /api/admin/facturas`.
- Ver factura: `GET /api/admin/facturas/:id`.
- Descargar factura PDF: `GET /api/admin/facturas/:numeroFactura/descargar`.
- Anular factura: `PUT /api/admin/facturas/:id/anular`.

#### Comentarios
- Ver todos los comentarios: `GET /api/admin/comentarios`.
- Ver comentarios por usuario: `GET /api/admin/comentarios/usuario/:usuarioId`.
- Moderar comentario: `PUT /api/admin/comentarios/:comentarioId/moderar`.
- Alternar visibilidad: `PATCH /api/admin/comentarios/:comentarioId/toggle`.
- Eliminar comentario: `DELETE /api/admin/comentarios/:comentarioId` (solo administrador).

## 4. Flujo de uso sugerido

### 4.1 Cliente
1. Registrarse o iniciar sesión.
2. Navegar el catálogo y usar los filtros.
3. Agregar productos al carrito.
4. Revisar el carrito y modificar cantidades.
5. Realizar el pedido.
6. Consultar el historial de pedidos.
7. Descargar facturas de pedidos pagados.

### 4.2 Administrador
1. Iniciar sesión con credenciales de administrador.
2. Ver estadísticas del sistema.
3. Crear y gestionar categorías, subcategorías y productos.
4. Revisar y gestionar pedidos.
5. Gestionar facturas y comentarios.
6. Gestionar usuarios del sistema.

### 4.3 Auxiliar
1. Iniciar sesión con credenciales de auxiliar.
2. Gestionar categorías, subcategorías y productos.
3. Revisar pedidos y estadísticas.
4. Moderar comentarios.
5. Gestionar facturas según permisos.

## 5. Consideraciones finales
- El sistema guarda la sesión mediante token JWT en el frontend.
- Las rutas protegidas requieren `Authorization: Bearer <token>`.
- El frontend está construido con React y el backend con Node.js, Express y Sequelize.
- El proyecto actual no incluye funcionalidades de solicitudes de vacaciones, paz y salvo, entrevistas o gestión de vinculación.

---

*Documento generado a partir de la implementación real del proyecto GAVAT.*
