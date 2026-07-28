# MANUAL TÉCNICO - MÓDULO USUARIO
## Sistema GAVAT Construcciones Arquitectónicas

**Versión:** 1.0  
**Fecha:** 2026-07-24  
**Clasificación:** Manual Interno SENA  
**Documentador:** Analista de Software

---

## Tabla de Contenido

1. [USUARIO](#1-usuario)
   - [1.1 Objetivo](#11-objetivo)
   - [1.2 Alcance](#12-alcance)
   - [1.3 Funcionalidades](#13-funcionalidades)

2. [MAPA DEL SISTEMA](#2-mapa-del-sistema)
   - [2.1 Modelo Lógico](#21-modelo-lógico)
   - [2.2 Navegación por Módulos](#22-navegación-por-módulos)

---

# 1. USUARIO

## 1.1 Objetivo

El módulo de Usuario constituye la interfaz de cliente final de la plataforma GAVAT Construcciones Arquitectónicas. Su propósito es proporcionar a los clientes un entorno de comercio electrónico donde pueden explorar, seleccionar y adquirir productos de manera segura y conveniente.

El usuario actúa como cliente final de la plataforma, siendo responsable de:

- Gestionar su cuenta y perfil personal
- Explorar el catálogo de productos disponibles
- Realizar búsquedas y filtrados de productos
- Gestionar su carrito de compras
- Realizar pedidos de compra
- Consultar el historial y estado de sus pedidos
- Generar comentarios y reseñas sobre productos adquiridos

---

## 1.2 Alcance

El alcance del módulo de Usuario abarca la participación en los siguientes procesos comerciales:

### 1.2.1 Registro y Autenticación
El usuario puede crear una nueva cuenta registrándose con correo electrónico y contraseña. Posterior a la creación de cuenta, puede iniciar sesión en cualquier momento para acceder a sus funcionalidades personales. La autenticación se realiza mediante token JWT que valida todas las operaciones protegidas.

### 1.2.2 Gestión de Perfil
El usuario tiene acceso total a:
- Consultar información personal (nombre, email, teléfono, dirección)
- Editar datos de perfil
- Cambiar contraseña
- Mantener información de contacto actualizada

### 1.2.3 Exploración de Catálogo
El usuario dispone de:
- Acceso público al catálogo completo de productos activos
- Visualización de categorías y subcategorías
- Búsqueda de productos por nombre o descripción
- Filtrado por categoría o subcategoría
- Visualización de detalles de productos (descripción, precio, imagen, stock)
- Consulta de productos destacados o más recientes

**Nota importante:** El usuario visualiza únicamente productos con estado activo. Los productos desactivados por administrador no son visibles.

### 1.2.4 Gestión del Carrito
El usuario puede:
- Agregar productos al carrito personal
- Visualizar contenido del carrito con detalles de productos
- Modificar cantidad de productos en el carrito
- Eliminar productos específicos del carrito
- Vaciar el carrito completamente

### 1.2.5 Proceso de Compra
El usuario puede:
- Realizar el proceso de checkout para convertir el carrito en pedido
- Confirmar dirección de envío
- Seleccionar método de pago
- Completar la compra

### 1.2.6 Gestión de Pedidos
El usuario tiene acceso a:
- Consulta del historial completo de pedidos realizados
- Visualización de detalles de cada pedido (productos, cantidades, precios, estado)
- Información de trazabilidad del pedido (cambios de estado)
- Cancelación de pedidos que aún estén en estado pendiente

### 1.2.7 Comentarios y Reseñas
El usuario puede:
- Consultar comentarios de productos publicados por otros clientes
- Crear comentarios y reseñas **únicamente** sobre productos que ha comprado
- Asignar calificación de 1 a 5 estrellas en sus comentarios
- Escribir comentarios de hasta 200 caracteres

### 1.2.8 Limitaciones de Alcance
**Funcionalidades NO permitidas al usuario:**
- No puede acceder a funciones administrativas
- No puede ver, editar o eliminar comentarios de otros usuarios
- No puede cambiar el estado de sus pedidos manualmente
- No puede crear comentarios sobre productos no comprados
- No puede crear cuentas de otros usuarios
- No puede acceder a información de otros clientes


## 1.3 Funcionalidades

A continuación se presenta la lista completa de todas las acciones que el usuario puede ejecutar dentro del sistema GAVAT:

### 1.3.1 Registro y Creación de Cuenta
- El usuario puede registrarse en la plataforma proporcionando correo y contraseña
- El usuario puede completar información opcional (nombre, teléfono, dirección)
- El usuario recibe automáticamente un token JWT para sesión inmediata tras registro
- El usuario cuenta con validación de email único para evitar duplicados
- El usuario requiere contraseña de mínimo 6 caracteres

### 1.3.2 Autenticación y Acceso
- El usuario puede iniciar sesión con correo y contraseña
- El usuario puede cerrar sesión terminando su sesión activa
- El usuario puede mantener su sesión activa mediante token JWT
- El usuario es redirigido automáticamente si intenta acceder sin autenticación

### 1.3.3 Gestión de Perfil
- El usuario puede visualizar su perfil completo (nombre, email, teléfono, dirección)
- El usuario puede editar su nombre en el perfil
- El usuario puede actualizar su teléfono de contacto
- El usuario puede actualizar su dirección de envío
- El usuario puede cambiar su contraseña mediante verificación de la actual
- El usuario puede ver su rol en el sistema (cliente)

### 1.3.4 Exploración del Catálogo
- El usuario puede visualizar el listado completo de productos disponibles
- El usuario puede navegar entre páginas del catálogo
- El usuario puede ver productos organizados con paginación
- El usuario puede visualizar imagen, nombre, descripción y precio de cada producto
- El usuario puede filtrar productos por categoría
- El usuario puede filtrar productos por subcategoría
- El usuario puede observar el stock disponible de cada producto

### 1.3.5 Búsqueda de Productos
- El usuario puede buscar productos por nombre
- El usuario puede buscar productos por descripción
- El usuario puede combinar búsqueda con filtros de categoría
- El usuario puede combinar búsqueda con filtros de subcategoría
- El usuario obtiene resultados relevantes en tiempo real
- El usuario puede ver cantidad de resultados encontrados

### 1.3.6 Visualización de Detalles de Producto
- El usuario puede ver página detallada de un producto
- El usuario puede visualizar imagen cowmpleta del producto
- El usuario puede leer descripción completa
- El usuario puede ver precio unitario
- El usuario puede ver cantidad en stock disponible
- El usuario puede visualizar categoría y wwwsubcategoría del producto
- El usuario puede ver comentarios publicados sobre el producto
- El usuario puede ver calificación promedio del producto

### 1.3.7 Gestión del Carrito de Compras
- El usuario puede agregar productos al carrito
- El usuario puede especificar cantidad al agregar
- El usuario puede visualizar todos los items en su carrito
- El usuario puede ver cantidad de items en el carrito
- El usuario puede ver total del carrito calculado automáticamente
- El usuario puede modificar la cantidad de un producto en el carrito
- El usuario puede eliminar un producto específico del carrito
- El usuario puede vaciar el carrito completamente
- El usuario puede ver detalles de cada producto en el carrito (nombre, precio, subtotal)

### 1.3.8 Proceso de Compra y Checkout
- El usuario puede acceder a la página de checkout desde el carrito
- El usuario puede confirmar dirección de envío
- El usuario puede ingresar teléfono de contacto para la entrega
- El usuario puede seleccionar método de pago (efectivo, tarjeta, transferencia)
- El usuario puede ver resumen de orden antes de finalizar
- El usuario puede confirmar y completar la compra
- El usuario recibe confirmación de pedido exitosamente realizado

### 1.3.9 Gestión de Pedidos
- El usuario puede visualizar historial completo de sus pedidos
- El usuario puede ver todos los pedidos realizados con estado actual
- El usuario puede filtrar pedidos por estado (pendiente, pagado, en_proceso, enviado, entregado, cancelado)
- El usuario puede visualizar detalles completos de cada pedido
- El usuario puede ver productos comprados en cada pedido con cantidades y precios
- El usuario puede ver monto total de cada pedido
- El usuario puede ver fecha de creación del pedido
- El usuario puede ver dirección de envío del pedido
- El usuario puede ver método de pago utilizado
- El usuario puede consultar historial de cambios de estado
- El usuario puede cancelar un pedido si está en estado pendiente
- El usuario no puede cancelar pedidos ya pagados o en proceso de envío

### 1.3.10 Comentarios y Reseñas de Productos
- El usuario puede visualizar comentarios publicados en los productos
- El usuario puede crear un comentario sobre un producto comprado
- El usuario puede asignar una calificación de 1 a 5 estrellas
- El usuario puede escribir descripción del comentario (máximo 200 caracteres)
- El usuario ve restricción de no poder comentar productos no comprados
- El usuario recibe confirmación al crear comentario exitosamente
- El usuario puede ver comentarios de otros usuarios sobre productos

---

# 2. MAPA DEL SISTEMA

## 2.1 Modelo Lógico

El modelo lógico del módulo de Usuario está estructurado en los siguientes módulos funcionales:

| # | Módulo | Descripción | Alcance |
|----|--------|-----------|---------|
| 1 | Módulo de Registro | Creación de nuevas cuentas | Validación de datos, generación de token JWT |
| 2 | Módulo de Inicio de Sesión | Autenticación de usuarios | Validación de credenciales, generación de token |
| 3 | Módulo de Perfil | Gestión de datos personales | Consulta, edición, cambio de contraseña |
| 4 | Módulo de Catálogo | Exploración de productos | Listar, filtrar, buscar, visualizar detalles |
| 5 | Módulo de Carrito | Gestión de compra provisional | Agregar, editar, eliminar, vaciar, ver total |
| 6 | Módulo de Checkout | Proceso de compra | Confirmación de datos, selección de pago, pedido |
| 7 | Módulo de Pedidos | Gestión de compras realizadas | Consulta, detalles, cancelación, historial |
| 8 | Módulo de Comentarios | Reseñas de productos | Visualización y creación de comentarios |

---

## 2.2 Navegación por Módulos

### Módulo de Registro

**Descripción:** Sistema de creación de nuevas cuentas de usuario que permite acceso a la plataforma.

| Paso | Acción |
|------|--------|
| 1 | Acceder a la página de registro (/register) desde la página principal |
| 2 | Ingresar correo electrónico en el campo "Email" |
| 3 | Ingresar contraseña en el campo "Contraseña" (mínimo 6 caracteres) |
| 4 | Ingresar nombre (opcional) en el campo "Nombre" |
| 5 | Ingresar teléfono (opcional) en el campo "Teléfono" |
| 6 | Ingresar dirección (opcional) en el campo "Dirección" |
| 7 | Hacer clic en botón "Registrarse" |
| 8 | El sistema valida que el email no esté registrado |
| 9 | El sistema valida el formato del email y longitud de contraseña |
| 10 | Se crea la cuenta en la base de datos con rol "cliente" |
| 11 | Se genera token JWT automáticamente |
| 12 | El usuario es redirigido automáticamente al dashboard/inicio |
| 13 | Se muestra mensaje de bienvenida |

---

### Módulo de Inicio de Sesión

**Descripción:** Sistema de autenticación que valida credenciales y proporciona acceso a funcionalidades personales.

| Paso | Acción |
|------|--------|
| 1 | Acceder a la página de login (/login) |
| 2 | Ingresar correo electrónico en el campo "Email" |
| 3 | Ingresar contraseña en el campo "Contraseña" |
| 4 | Hacer clic en botón "Iniciar Sesión" |
| 5 | El sistema busca el usuario por email |
| 6 | El sistema valida que la contraseña sea correcta |
| 7 | El sistema verifica que la cuenta esté activa |
| 8 | Se genera token JWT válido |
| 9 | El token se almacena localmente en el navegador |
| 10 | El usuario es redirigido a la página principal autenticado |
| 11 | Se muestra mensaje de bienvenida |
| 12 | El menú muestra opciones personalizadas para usuario autenticado |

---

### Módulo de Perfil

**Descripción:** Gestión de información personal del usuario donde puede consultar y actualizar datos.

#### Subcapacidad: Consultar Perfil

| Paso | Acción |
|------|--------|
| 1 | Acceder a la ruta de perfil (/perfil) desde menú usuario |
| 2 | El sistema obtiene datos del usuario autenticado |
| 3 | Se muestra formulario pre-cargado con información personal |
| 4 | Se visualizan campos: nombre, email, teléfono, dirección |
| 5 | Se muestra rol actual (Cliente) |
| 6 | Se visualiza fecha de creación de cuenta |
| 7 | Se muestra estado de cuenta (Activa) |

#### Subcapacidad: Editar Perfil

| Paso | Acción |
|------|--------|
| 1 | En la página de perfil, hacer clic en botón "Editar Perfil" |
| 2 | Se habilitan los campos para edición |
| 3 | Modificar nombre de usuario (campo editable) |
| 4 | Modificar número de teléfono (campo editable) |
| 5 | Modificar dirección de envío (campo editable) |
| 6 | Hacer clic en "Guardar Cambios" |
| 7 | El sistema valida los datos ingresados |
| 8 | Se realiza petición PUT /api/auth/me |
| 9 | Los datos se actualizan en la base de datos |
| 10 | Se muestra mensaje de éxito |
| 11 | El perfil muestra la información actualizada |

#### Subcapacidad: Cambiar Contraseña

| Paso | Acción |
|------|--------|
| 1 | En la página de perfil, hacer clic en "Cambiar Contraseña" |
| 2 | Se abre sección de cambio de contraseña |
| 3 | Ingresar contraseña actual en campo "Contraseña Actual" |
| 4 | Ingresar nueva contraseña en campo "Nueva Contraseña" (mín. 6 caracteres) |
| 5 | Confirmar nueva contraseña en campo "Confirmar Contraseña" |
| 6 | Hacer clic en "Cambiar Contraseña" |
| 7 | El sistema valida que la contraseña actual sea correcta |
| 8 | El sistema verifica que las nuevas contraseñas coincidan |
| 9 | Se realiza petición PUT /api/auth/change-password |
| 10 | La contraseña se actualiza en la base de datos |
| 11 | Se muestra mensaje de éxito |
| 12 | Se sugiere re-iniciar sesión con nueva contraseña |

---

### Módulo de Catálogo

**Descripción:** Exploración del catálogo de productos disponibles para compra.

#### Subcapacidad: Listar Productos

| Paso | Acción |
|------|--------|
| 1 | Acceder a la sección "Catálogo" desde menú principal |
| 2 | Se realiza petición GET /api/catalogo/productos |
| 3 | Se obtiene lista paginada de productos activos (12 por página) |
| 4 | Los productos se muestran en grid con imagen, nombre, precio |
| 5 | Se incluye paginación para navegación entre páginas |
| 6 | Se muestra total de productos encontrados |
| 7 | Se pueden visualizar categorías activas en menú lateral |
| 8 | Se pueden visualizar subcategorías en menú lateral |

#### Subcapacidad: Filtrar por Categoría

| Paso | Acción |
|------|--------|
| 1 | En el catálogo, visualizar lista de categorías en menú izquierdo |
| 2 | Hacer clic en una categoría específica |
| 3 | Se realiza petición GET /api/catalogo/productos?categoriaId=X |
| 4 | Se obtiene lista filtrada de productos de esa categoría |
| 5 | Se muestran solo productos activos de la categoría seleccionada |
| 6 | El nombre de la categoría se destaca como filtro activo |
| 7 | Se puede deshacer el filtro haciendo clic nuevamente |

#### Subcapacidad: Filtrar por Subcategoría

| Paso | Acción |
|------|--------|
| 1 | En el catálogo, seleccionar una categoría primero |
| 2 | Se muestran subcategorías disponibles para esa categoría |
| 3 | Hacer clic en una subcategoría |
| 4 | Se realiza petición GET /api/catalogo/productos?subcategoriaId=X |
| 5 | Se obtiene lista filtrada de productos de esa subcategoría |
| 6 | Se muestran solo productos activos de la subcategoría |
| 7 | Se puede combinar filtro de categoría y subcategoría |
| 8 | Se puede remover filtros individuales |

#### Subcapacidad: Buscar Productos

| Paso | Acción |
|------|--------|
| 1 | En el catálogo, localizar campo de búsqueda |
| 2 | Ingresar término de búsqueda (nombre o descripción) |
| 3 | Hacer clic en botón "Buscar" o presionar Enter |
| 4 | Se realiza petición GET /api/catalogo/productos?buscar=termino |
| 5 | Se ejecuta búsqueda por nombre o descripción del producto |
| 6 | Se retornan solo productos que coincidan con la búsqueda |
| 7 | Se muestran resultados en grid con paginación |
| 8 | Se puede combinar búsqueda con filtros de categoría |
| 9 | Se muestra cantidad de resultados encontrados |
| 10 | Se puede limpiar la búsqueda |

#### Subcapacidad: Ver Productos Destacados

| Paso | Acción |
|------|--------|
| 1 | Acceder a la página de inicio (HomePage) |
| 2 | Se realiza petición GET /api/catalogo/destacados |
| 3 | Se obtiene lista de productos más recientes/destacados |
| 4 | Se muestran productos con imagen, nombre, precio |
| 5 | Se pueden hacer clic en cualquier producto destacado |
| 6 | Se navega a la página de detalle del producto |

---

### Módulo de Carrito

**Descripción:** Gestión del carrito de compras provisional del usuario.

#### Subcapacidad: Ver Carrito

| Paso | Acción |
|------|--------|
| 1 | Acceder a la página de carrito (/carrito) |
| 2 | Se realiza petición GET /api/cliente/carrito |
| 3 | Se obtienen todos los items en el carrito del usuario |
| 4 | Se muestran en tabla: producto, cantidad, precio unitario, subtotal |
| 5 | Se muestra imagen de cada producto |
| 6 | Se muestra cantidad total de items diferentes |
| 7 | Se muestra cantidad total de unidades |
| 8 | Se calcula y muestra el total del carrito |
| 9 | Se incluyen botones de acción por cada item (editar, eliminar) |
| 10 | Se muestra botón para vaciar el carrito completo |

#### Subcapacidad: Agregar Producto al Carrito

| Paso | Acción |
|------|--------|
| 1 | En página de producto, visualizar cantidad y botón "Agregar al Carrito" |
| 2 | Ingresar cantidad deseada (default: 1) |
| 3 | Hacer clic en "Agregar al Carrito" |
| 4 | Se realiza petición POST /api/cliente/carrito |
| 5 | El sistema verifica que el producto exista y esté activo |
| 6 | El sistema verifica disponibilidad de stock |
| 7 | Si el producto ya está en carrito, suma cantidad |
| 8 | Se crea o actualiza item en la tabla Carrito |
| 9 | Se muestra mensaje de confirmación |
| 10 | Opcionalmente redirige a página de carrito |

#### Subcapacidad: Editar Cantidad en Carrito

| Paso | Acción |
|------|--------|
| 1 | En la página de carrito, localizar item a modificar |
| 2 | Ver campo de cantidad actual del producto |
| 3 | Ingresar nueva cantidad deseada |
| 4 | Hacer clic en botón "Actualizar" o icono de edición |
| 5 | Se realiza petición PUT /api/cliente/carrito/:id |
| 6 | El sistema verifica stock disponible |
| 7 | Se rechaza si la cantidad supera el stock |
| 8 | Se actualiza la cantidad en la base de datos |
| 9 | Se recalcula el subtotal del item |
| 10 | Se recalcula el total del carrito |
| 11 | Se muestra el carrito actualizado |

#### Subcapacidad: Eliminar Item del Carrito

| Paso | Acción |
|------|--------|
| 1 | En la página de carrito, localizar item a eliminar |
| 2 | Hacer clic en botón "Eliminar" o icono de basura |
| 3 | Se abre diálogo de confirmación |
| 4 | Confirmar eliminación |
| 5 | Se realiza petición DELETE /api/cliente/carrito/:id |
| 6 | El item se elimina de la tabla Carrito |
| 7 | Se recalcula el total del carrito |
| 8 | Se muestra carrito actualizado sin el item |

#### Subcapacidad: Vaciar Carrito

| Paso | Acción |
|------|--------|
| 1 | En la página de carrito, hacer clic en "Vaciar Carrito" |
| 2 | Se abre diálogo de confirmación |
| 3 | Confirmar vaciado del carrito |
| 4 | Se realiza petición DELETE /api/cliente/carrito |
| 5 | Todos los items se eliminan de la tabla Carrito |
| 6 | Se muestra carrito vacío |
| 7 | Se muestra mensaje: "Tu carrito está vacío" |

---

### Módulo de Checkout

**Descripción:** Proceso final de compra donde se confirman datos y se crea el pedido.

| Paso | Acción |
|------|--------|
| 1 | Hacer clic en "Proceder al Pago" desde página de carrito |
| 2 | Se valida que el carrito no esté vacío |
| 3 | Se redirige a página de checkout (/checkout) |
| 4 | Se muestran datos pre-cargados del perfil del usuario |
| 5 | Se muestra dirección de envío registrada |
| 6 | Se permite editar dirección de envío para este pedido |
| 7 | Se solicita confirmar teléfono de contacto |
| 8 | Se muestran opciones de método de pago (efectivo, tarjeta, transferencia) |
| 9 | Se visualiza resumen de order con todos los items |
| 10 | Se muestra total final a pagar |
| 11 | Hacer clic en "Confirmar Compra" |
| 12 | Se realiza petición POST /api/cliente/pedidos |
| 13 | El sistema crea el pedido y sus detalles |
| 14 | El sistema reduce el stock de los productos |
| 15 | El carrito se vacía automáticamente |
| 16 | Se redirige a página de confirmación |
| 17 | Se muestra número de pedido y confirmación |

---

### Módulo de Pedidos

**Descripción:** Gestión del historial de compras y seguimiento de órdenes realizadas.

#### Subcapacidad: Listar Mis Pedidos

| Paso | Acción |
|------|--------|
| 1 | Acceder a "Mis Pedidos" desde menú usuario o navegación |
| 2 | Se realiza petición GET /api/cliente/pedidos |
| 3 | Se obtiene lista de todos los pedidos del usuario |
| 4 | Se muestran en tabla: número, fecha, estado, total, acciones |
| 5 | Se pueden filtrar por estado |
| 6 | Se muestra paginación si hay muchos pedidos |
| 7 | Se ordenan por fecha (más recientes primero) |
| 8 | Se muestra icono o badge con estado actual |

#### Subcapacidad: Ver Detalles de Pedido

| Paso | Acción |
|------|--------|
| 1 | En lista de pedidos, hacer clic en un pedido específico |
| 2 | Se realiza petición GET /api/cliente/pedidos/:id |
| 3 | Se abre página de detalle del pedido |
| 4 | Se muestra número de pedido |
| 5 | Se muestra fecha de creación |
| 6 | Se muestra estado actual |
| 7 | Se muestran todos los productos comprados en tabla |
| 8 | Se muestra cantidad, precio unitario, subtotal de cada producto |
| 9 | Se muestra monto total del pedido |
| 10 | Se muestra dirección de envío |
| 11 | Se muestra método de pago utilizado |
| 12 | Se muestra historial de cambios de estado |
| 13 | Se muestran botones de acciones permitidas (cancelar si aplica) |

#### Subcapacidad: Cancelar Pedido

| Paso | Acción |
|------|--------|
| 1 | En la página de detalle de pedido, revisar estado actual |
| 2 | Si el estado es "Pendiente", se muestra botón "Cancelar Pedido" |
| 3 | Si el pedido fue pagado o está en envío, opción de cancelar es bloqueada |
| 4 | Hacer clic en "Cancelar Pedido" |
| 5 | Se abre diálogo de confirmación |
| 6 | Confirmar cancelación del pedido |
| 7 | Se realiza petición PUT /api/cliente/pedidos/:id/cancelar |
| 8 | El sistema verifica que el pedido esté en estado "Pendiente" |
| 9 | Se restaura el stock de los productos |
| 10 | El estado del pedido cambia a "Cancelado" |
| 11 | Se muestra mensaje de éxito |
| 12 | Se actualiza la página mostrando estado cancelado |

---

### Módulo de Comentarios

**Descripción:** Sistema de reseñas y comentarios sobre productos comprados.

#### Subcapacidad: Ver Comentarios de Producto

| Paso | Acción |
|------|--------|
| 1 | En la página de detalle de producto, desplazarse a sección de comentarios |
| 2 | Se muestra lista de comentarios publicados en el producto |
| 3 | Se muestra calificación promedio del producto (en estrellas) |
| 4 | Se muestra total de comentarios recibidos |
| 5 | Cada comentario muestra: autor, calificación, fecha, texto |
| 6 | Se muestra nombre del usuario que hizo el comentario |
| 7 | Se muestra calificación de 1 a 5 estrellas |
| 8 | Se muestra fecha de creación del comentario |
| 9 | Se muestra el texto del comentario (máximo 200 caracteres) |
| 10 | Los comentarios se ordenan por fecha (más recientes primero) |

#### Subcapacidad: Crear Comentario

| Paso | Acción |
|------|--------|
| 1 | En página de producto, hacer clic en "Dejar un Comentario" |
| 2 | Se valida que el usuario esté autenticado |
| 3 | Se valida que el usuario haya comprado este producto |
| 4 | Si no compró, se muestra mensaje: "Solo puedes comentar productos que hayas comprado" |
| 5 | Si compró, se abre formulario de comentario |
| 6 | Seleccionar calificación de 1 a 5 estrellas |
| 7 | Ingresar texto del comentario (máximo 200 caracteres) |
| 8 | Se muestra contador de caracteres disponibles |
| 9 | Hacer clic en "Publicar Comentario" |
| 10 | Se realiza petición POST /api/cliente/comentarios |
| 11 | El sistema valida que el usuario compró el producto |
| 12 | Se valida que la calificación esté entre 1 y 5 |
| 13 | Se valida que el comentario no esté vacío |
| 14 | El comentario se crea y aparece visible inmediatamente |
| 15 | Se muestra mensaje de éxito |
| 16 | El comentario aparece en la lista (generalmente al inicio) |

---

## Conclusión

El módulo de Usuario en GAVAT Construcciones Arquitectónicas constituye la interfaz de cliente final para el comercio electrónico. Mediante la interfaz gráfica intuitiva y procesos simplificados, permite al usuario:

- **Gestión Personal:** Crear cuenta, autenticarse, mantener perfil actualizado
- **Exploración:** Navegar catálogo, buscar y filtrar productos
- **Compra:** Gestionar carrito, realizar checkout, completar pedido
- **Seguimiento:** Consultar pedidos, conocer estado, cancelar si aplica
- **Interacción:** Crear comentarios sobre productos comprados

Todas las operaciones están protegidas mediante autenticación JWT. El usuario accede únicamente a información que le corresponde (su perfil, sus pedidos, sus comentarios). Las funcionalidades administrativas son completamente inaccesibles para este rol.

---

**Documento preparado por:** Analista de Software SENA  
**Fecha:** 2026-07-24  
**Versión:** 1.0  
**Estado:** Aprobado para uso interno
