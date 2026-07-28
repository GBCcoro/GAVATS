# MANUAL TÉCNICO - MÓDULO ADMINISTRADOR
## Sistema GAVAT Construcciones Arquitectónicas

**Versión:** 1.0  
**Fecha:** 2026-07-24  
**Clasificación:** Manual Interno SENA  
**Documentador:** Analista de Software

---

## Tabla de Contenido

1. [ADMINISTRADOR](#1-administrador)
   - [1.1 Objetivo](#11-objetivo)
   - [1.2 Alcance](#12-alcance)
   - [1.3 Funcionalidades](#13-funcionalidades)

2. [MAPA DEL SISTEMA](#2-mapa-del-sistema)
   - [2.1 Modelo Lógico](#21-modelo-lógico)
   - [2.2 Navegación por Módulos](#22-navegación-por-módulos)

4. [FAQ](#4-faq)
5. [ANEXOS](#5-anexos)
6. [GLOSARIO](#6-glosario)
7. [BIBLIOGRAFÍA Y REFERENCIAS](#7-bibliografía-y-referencias)

---

# 1. ADMINISTRADOR

## 1.1 Objetivo

El módulo de Administrador constituye el corazón operativo de la plataforma GAVAT Construcciones Arquitectónicas. Su propósito es proporcionar a los administradores del sistema un entorno centralizado de gestión y control de todos los procesos comerciales, logísticos y administrativos de la empresa.

El administrador actúa como gestor integral de la plataforma, siendo responsable de:

- Mantener la integridad y consistencia de la información en la base de datos
- Controlar la disponibilidad y visibilidad de productos y servicios
- Administrar el equipo de trabajo (usuarios del sistema)
- Supervisar y gestionar todas las transacciones comerciales
- Garantizar la calidad en el servicio al cliente mediante la moderación de contenidos
- Generar reportes y consultar estadísticas del negocio

---

## 1.2 Alcance

El alcance del módulo de Administrador abarca la gestión completa de los siguientes procesos:

### 2.1.1 Autorización y Autenticación
El acceso al panel administrativo está restringido exclusivamente a usuarios con rol **'administrador'** en el sistema. La autenticación se realiza mediante credenciales (correo electrónico y contraseña) validadas contra la base de datos, generando un token JWT (JSON Web Token) que autoriza todas las operaciones posteriores.

### 2.1.2 Gestión de Catálogo
El administrador dispone de control total sobre:
- **Categorías de productos:** Creación, edición, eliminación y control de disponibilidad de categorías principales
- **Subcategorías:** Gestión de subcategorías vinculadas a categorías padre, con control de estado
- **Productos:** Administración completa del inventario, incluyendo descripción, precios, imágenes, disponibilidad y niveles de stock

Todas las operaciones en el catálogo incluyen validaciones de integridad referencial, es decir, no es posible eliminar categorías que contengan subcategorías o productos activos.

### 2.1.3 Gestión de Usuarios
El módulo permite al administrador:
- Crear nuevos usuarios con asignación de roles específicos (cliente, auxiliar, administrador)
- Consultar información completa del usuario sin exposición de contraseñas
- Editar datos de usuarios del sistema
- Activar o desactivar cuentas de usuario (control de acceso)
- Eliminar registros de usuario (con restricciones de integridad referencial en pedidos)

### 2.1.4 Gestión de Pedidos
El administrador tiene visibilidad y control sobre:
- Consulta de todos los pedidos en el sistema (independientemente del cliente)
- Visualización detallada de cada pedido incluyendo ítems, cantidades y precios
- Actualización del estado del pedido (pendiente, pagado, en_proceso, enviado, entregado, cancelado)
- Acceso a estadísticas globales de ventas y pedidos
- Información de trazabilidad con fechas de cambio de estado

### 2.1.5 Moderación de Contenidos
El administrador puede:
- Consultar comentarios y reseñas de productos
- Moderar comentarios (marcar como visible o no visible)
- Eliminar comentarios inapropiados
- Mantener la integridad y calidad de la información visible al cliente

### 2.1.6 Gestión de Facturas
El administrador tiene acceso a:
- Consulta de todas las facturas emitidas en el sistema
- Descarga de facturas en formato PDF
- Información completa de facturación y detalles de transacciones
- Estadísticas de facturación

### 2.1.7 Limitaciones de Alcance
**Funcionalidades NO incluidas en este rol:**
- No puede crear pedidos directamente en nombre del cliente (solo consultar y gestionar)
- No puede modificar contraseñas de otros usuarios (solo crear y desactivar)
- No puede ajustar precios dinámicamente por promociones (funcionalidad no implementada)
- No puede generar recibos manuales (solo acceder a facturas automáticas)

---

## 1.3 Funcionalidades

A continuación se presenta la lista completa de todas las acciones que el administrador puede ejecutar dentro del sistema GAVAT:

### 1.3.1 Autenticación y Acceso
- El administrador puede iniciar sesión utilizando su correo electrónico y contraseña
- El administrador puede cerrar sesión y terminar su sesión activa
- El administrador puede validar su identidad mediante token JWT

### 1.3.2 Panel de Control Principal
- El administrador puede acceder al dashboard del administrador
- El administrador puede visualizar estadísticas generales del sistema (total de categorías, subcategorías, productos, usuarios y pedidos)
- El administrador puede ver alertas de pedidos pendientes
- El administrador puede acceder a botones de navegación rápida hacia módulos principales

### 1.3.3 Gestión de Categorías
- El administrador puede consultar la lista completa de categorías
- El administrador puede crear una nueva categoría proporcionando nombre y descripción
- El administrador puede editar información de categorías existentes
- El administrador puede activar o desactivar categorías (cambio de estado)
- El administrador puede eliminar categorías que no contengan subcategorías ni productos asociados
- El administrador puede visualizar estadísticas por categoría (cantidad de subcategorías, productos activos e inactivos)

### 1.3.4 Gestión de Subcategorías
- El administrador puede consultar la lista completa de subcategorías
- El administrador puede crear una nueva subcategoría indicando categoría padre, nombre y descripción
- El administrador puede editar información de subcategorías existentes
- El administrador puede cambiar la categoría padre de una subcategoría
- El administrador puede activar o desactivar subcategorías
- El administrador puede eliminar subcategorías que no contengan productos asociados
- El administrador puede visualizar estadísticas por subcategoría

### 1.3.5 Gestión de Productos
- El administrador puede consultar la lista completa de productos con paginación y filtros avanzados
- El administrador puede filtrar productos por categoría, subcategoría, estado activo/inactivo y disponibilidad de stock
- El administrador puede buscar productos por nombre o descripción
- El administrador puede crear un nuevo producto con los siguientes datos:
  - Nombre, descripción, precio y cantidad en stock
  - Asignación de categoría y subcategoría
  - Carga de imagen del producto
- El administrador puede editar información de productos existentes
- El administrador puede actualizar la imagen del producto (reemplazar imagen anterior)
- El administrador puede activar o desactivar productos
- El administrador puede modificar el stock de un producto mediante operaciones de:
  - Establecer cantidad exacta
  - Aumentar cantidad
  - Reducir cantidad
- El administrador puede eliminar productos permanentemente (incluyendo imágenes del servidor)
- El administrador puede visualizar detalles completos de cada producto

### 1.3.6 Gestión de Usuarios del Sistema
- El administrador puede consultar lista completa de usuarios registrados en la plataforma
- El administrador puede filtrar usuarios por rol (cliente, auxiliar, administrador)
- El administrador puede filtrar usuarios por estado (activo, inactivo)
- El administrador puede buscar usuarios por nombre, apellido o correo electrónico
- El administrador puede crear nuevo usuario del sistema asignando:
  - Nombre, apellido, correo y contraseña
  - Rol específico (cliente, auxiliar, administrador)
  - Datos de contacto (teléfono y dirección)
- El administrador puede editar información de usuarios existentes
- El administrador puede cambiar el rol de un usuario
- El administrador puede activar o desactivar cuentas de usuario
- El administrador puede eliminar usuarios de forma permanente (con restricciones de integridad)
- El administrador puede visualizar estadísticas de usuarios (total por rol, activos/inactivos)

### 1.3.7 Gestión de Pedidos
- El administrador puede consultar la lista completa de todos los pedidos del sistema
- El administrador puede filtrar pedidos por estado (pendiente, pagado, en_proceso, enviado, entregado, cancelado)
- El administrador puede filtrar pedidos por usuario específico
- El administrador puede visualizar detalles completos de cada pedido incluyendo:
  - Información del cliente
  - Artículos comprados con cantidades y precios unitarios
  - Monto total de la compra
  - Dirección de envío y método de pago
  - Historial de cambios de estado
- El administrador puede cambiar el estado de un pedido
- El administrador puede acceder a estadísticas de pedidos (total, pendientes, completados, cancelados)
- El administrador puede visualizar datos de facturación asociados a pedidos

### 1.3.8 Gestión de Comentarios y Reseñas
- El administrador puede consultar la lista de todos los comentarios de productos
- El administrador puede visualizar comentarios por estado (visibles, ocultos)
- El administrador puede moderar comentarios marcándolos como visible o no visible
- El administrador puede eliminar comentarios de forma permanente
- El administrador puede acceder al histórico de comentarios

### 1.3.9 Gestión de Facturas
- El administrador puede consultar la lista completa de facturas emitidas
- El administrador puede filtrar facturas por rango de fechas
- El administrador puede visualizar detalles de facturación incluyendo:
  - Número de factura y fecha de emisión
  - Información del cliente y pedido
  - Detalles de productos facturados
  - Monto total y método de pago
- El administrador puede descargar facturas en formato PDF
- El administrador puede acceder a estadísticas de facturación

---

# 2. MAPA DEL SISTEMA

## 2.1 Modelo Lógico

El modelo lógico del módulo de Administrador está estructura en los siguientes módulos funcionales:

| # | Módulo | Descripción | Alcance |
|----|--------|-----------|---------|
| 1 | Módulo de Inicio de Sesión | Autenticación segura del administrador | Validación de credenciales, generación de token JWT |
| 2 | Módulo de Dashboard | Panel de control principal | Estadísticas, alertas, accesos rápidos |
| 3 | Módulo de Categorías | Gestión de categorías de productos | CRUD completo, toggle activo/inactivo, estadísticas |
| 4 | Módulo de Subcategorías | Gestión de subcategorías de productos | CRUD completo, vinculación a categorías, toggle |
| 5 | Módulo de Productos | Gestión del inventario | CRUD con imágenes, control de stock, filtros avanzados |
| 6 | Módulo de Usuarios | Gestión de cuentas del sistema | CRUD de usuarios, asignación de roles, toggle |
| 7 | Módulo de Pedidos | Gestión de órdenes de compra | Consulta, cambio de estado, estadísticas |
| 8 | Módulo de Comentarios | Moderación de contenidos | Visualización, moderación, eliminación de comentarios |
| 9 | Módulo de Facturas | Gestión de documentos de facturación | Consulta, descarga PDF, estadísticas |

---

## 2.2 Navegación por Módulos

### Módulo de Inicio de Sesión

**Descripción:** Sistema de autenticación que valida las credenciales del administrador y genera un token de acceso para la sesión.

| Paso | Acción |
|------|--------|
| 1 | Ingresar a la plataforma GAVAT desde la URL principal |
| 2 | Acceder a la página de inicio de sesión (/login) |
| 3 | Ingresar correo electrónico registrado en el campo "Email" |
| 4 | Ingresar contraseña asociada en el campo "Contraseña" |
| 5 | Hacer clic en el botón "Iniciar Sesión" |
| 6 | El sistema valida credenciales contra la base de datos |
| 7 | Si las credenciales son válidas y corresponden a rol administrador, se genera token JWT |
| 8 | El navegador almacena el token en localStorage para futuras peticiones |
| 9 | El usuario es redirigido al dashboard del administrador (/admin/dashboard) |
| 10 | La sesión activa está disponible durante el tiempo de vida del token |

---

### Módulo de Dashboard

**Descripción:** Panel central de administración que proporciona una visión general del estado del sistema mediante estadísticas, alertas y accesos rápidos a funcionalidades principales.

| Paso | Acción |
|------|--------|
| 1 | Acceder a la ruta /admin o /admin/dashboard |
| 2 | El sistema carga estadísticas desde los endpoints de la API |
| 3 | Se obtienen: total de categorías, subcategorías, productos, usuarios y pedidos |
| 4 | Se calcula información de alertas (pedidos pendientes) |
| 5 | El dashboard muestra tarjetas de estadísticas con valores actualizados |
| 6 | Cada tarjeta es un acceso rápido hacia su módulo correspondiente |
| 7 | Hacer clic en una tarjeta redirige al módulo seleccionado |
| 8 | El panel muestra botones de acciones rápidas (agregar producto, categoría, gestionar pedidos) |
| 9 | Se visualiza información de estado del sistema (operativo, BD conectada, sesión activa) |
| 10 | Los datos se actualizan cada vez que se accede al dashboard |

---

### Módulo de Categorías

**Descripción:** Gestión integral de categorías de productos. Permite crear, consultar, editar, eliminar y controlar la disponibilidad de categorías principales.

#### Subcapacidad: Listar Categorías

| Paso | Acción |
|------|--------|
| 1 | Navegar a la ruta /admin/categorias |
| 2 | El sistema realiza petición GET /api/admin/categorias |
| 3 | Se obtiene lista completa de categorías activas e inactivas |
| 4 | Las categorías se muestran en tabla con columnas: nombre, descripción, estado, acciones |
| 5 | Cada fila contiene botones para: ver detalles, editar, activar/desactivar, eliminar |
| 6 | Se pueden ordenar categorías por nombre (A-Z) |

#### Subcapacidad: Crear Categoría

| Paso | Acción |
|------|--------|
| 1 | En la página de categorías, hacer clic en botón "Nueva Categoría" |
| 2 | Se abre formulario modal o página de creación |
| 3 | Completar campos requeridos:
- **Nombre:** Identificación única de la categoría (ej: "Electrónica", "Construcción")
- **Descripción:** Breve descripción de los productos de esta categoría
| 4 | Hacer clic en botón "Guardar" o "Crear" |
| 5 | El sistema valida que no exista una categoría con el mismo nombre |
| 6 | Se realiza petición POST /api/admin/categorias con los datos |
| 7 | La categoría se crea en la base de datos |
| 8 | Se muestra mensaje de éxito al usuario |
| 9 | La nueva categoría aparece en la lista |

#### Subcapacidad: Editar Categoría

| Paso | Acción |
|------|--------|
| 1 | En la lista de categorías, hacer clic en botón "Editar" o ícono de lápiz |
| 2 | Se abre formulario pre-cargado con datos actuales de la categoría |
| 3 | Modificar los campos deseados (nombre, descripción) |
| 4 | Hacer clic en botón "Guardar Cambios" |
| 5 | El sistema valida nuevamente los datos |
| 6 | Se realiza petición PUT /api/admin/categorias/:id |
| 7 | La categoría se actualiza en la base de datos |
| 8 | Se muestra mensaje de éxito |
| 9 | La lista se actualiza con los nuevos datos |

#### Subcapacidad: Activar/Desactivar Categoría

| Paso | Acción |
|------|--------|
| 1 | En la lista de categorías, visualizar columna de "Estado" |
| 2 | Hacer clic en el ícono de estado o botón "Toggle" |
| 3 | Se abre diálogo de confirmación |
| 4 | Confirmar la acción |
| 5 | Se realiza petición PATCH /api/admin/categorias/:id/toggle |
| 6 | El estado de la categoría se invierte (activo ↔ inactivo) |
| 7 | Si se desactiva: automáticamente se desactivan todas sus subcategorías y productos |
| 8 | Se muestra mensaje de éxito |
| 9 | El ícono de estado en la tabla se actualiza |

#### Subcapacidad: Eliminar Categoría

| Paso | Acción |
|------|--------|
| 1 | En la lista de categorías, hacer clic en botón "Eliminar" o ícono de basura |
| 2 | Se abre diálogo de confirmación indicando las restricciones |
| 3 | Se verifica si la categoría contiene subcategorías o productos |
| 4 | Si contiene datos asociados, se muestra error y no se permite eliminar |
| 5 | Si está vacía, solicitar confirmación final |
| 6 | Se realiza petición DELETE /api/admin/categorias/:id |
| 7 | La categoría se elimina permanentemente de la base de datos |
| 8 | Se muestra mensaje de éxito |
| 9 | La categoría desaparece de la lista |

---

### Módulo de Subcategorías

**Descripción:** Gestión de subcategorías vinculadas a categorías padre. Permite crear, consultar, editar, eliminar y controlar disponibilidad de subcategorías.

#### Subcapacidad: Listar Subcategorías

| Paso | Acción |
|------|--------|
| 1 | Navegar a la ruta /admin/subcategorias |
| 2 | El sistema realiza petición GET /api/admin/subcategorias |
| 3 | Se obtiene lista completa de subcategorías |
| 4 | Se puede filtrar por categoría padre mediante dropdown/selector |
| 5 | Se puede filtrar por estado (activo/inactivo) |
| 6 | Las subcategorías se muestran en tabla con columnas: nombre, categoría padre, descripción, estado |
| 7 | Cada fila contiene botones de acción |

#### Subcapacidad: Crear Subcategoría

| Paso | Acción |
|------|--------|
| 1 | En la página de subcategorías, hacer clic en "Nueva Subcategoría" |
| 2 | Se abre formulario de creación |
| 3 | Completar campos requeridos:
- **Categoría Padre:** Seleccionar categoría existente y activa
- **Nombre:** Nombre de la subcategoría (ej: "Celulares", "Cables")
- **Descripción:** Breve descripción
| 4 | Hacer clic en "Guardar" |
| 5 | Se valida que la categoría padre exista y esté activa |
| 6 | Se realiza petición POST /api/admin/subcategorias |
| 7 | La subcategoría se crea en la base de datos |
| 8 | Se muestra mensaje de éxito |
| 9 | La nueva subcategoría aparece en la lista |

#### Subcapacidad: Editar Subcategoría

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Editar" |
| 2 | Se abre formulario pre-cargado |
| 3 | Modificar campos (categoría padre, nombre, descripción) |
| 4 | Hacer clic en "Guardar Cambios" |
| 5 | Se realiza petición PUT /api/admin/subcategorias/:id |
| 6 | Se actualiza en la base de datos |
| 7 | Se muestra mensaje de éxito |
| 8 | La lista se actualiza |

#### Subcapacidad: Activar/Desactivar Subcategoría

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en el ícono/botón de estado |
| 2 | Se abre confirmación |
| 3 | Confirmar acción |
| 4 | Se realiza petición PATCH /api/admin/subcategorias/:id/toggle |
| 5 | El estado se invierte |
| 6 | Si se desactiva: automáticamente desactivan los productos asociados |
| 7 | Se muestra mensaje de éxito |

#### Subcapacidad: Eliminar Subcategoría

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Eliminar" |
| 2 | Se abre diálogo de confirmación |
| 3 | Se verifica si tiene productos asociados |
| 4 | Si tiene productos: mostrar error, no permite eliminar |
| 5 | Si está vacía: solicitar confirmación final |
| 6 | Se realiza petición DELETE /api/admin/subcategorias/:id |
| 7 | Se elimina permanentemente |
| 8 | Se muestra mensaje de éxito |

---

### Módulo de Productos

**Descripción:** Gestión completa del inventario. Permite crear, consultar, editar, eliminar productos; gestionar imágenes, stock y disponibilidad con filtros avanzados.

#### Subcapacidad: Listar Productos

| Paso | Acción |
|------|--------|
| 1 | Navegar a la ruta /admin/productos |
| 2 | Se realiza petición GET /api/admin/productos |
| 3 | Se obtiene lista paginada de productos (100 por página por defecto) |
| 4 | Se pueden aplicar filtros avanzados:
   - **Por Categoría:** Dropdown de categorías disponibles
   - **Por Subcategoría:** Dropdown de subcategorías (según categoría seleccionada)
   - **Por Estado:** Activo/Inactivo
   - **Por Stock:** Mostrar solo productos con stock disponible
   - **Búsqueda:** Buscar por nombre o descripción (partial match)
| 5 | Los productos se muestran en tabla con: nombre, categoría, precio, stock, estado, acciones |
| 6 | Se incluye paginación para navegar entre páginas |
| 7 | Se pueden ordenar por nombre alfabéticamente |

#### Subcapacidad: Crear Producto

| Paso | Acción |
|------|--------|
| 1 | En la página de productos, hacer clic en "Nuevo Producto" |
| 2 | Se abre formulario de creación |
| 3 | Completar campos requeridos:
   - **Nombre:** Nombre descriptivo del producto
   - **Descripción:** Detalles y características
   - **Precio:** Valor unitario en pesos
   - **Stock Inicial:** Cantidad disponible
   - **Categoría:** Seleccionar categoría padre
   - **Subcategoría:** Seleccionar subcategoría (según categoría)
   - **Imagen:** Cargar archivo de imagen (opcional, pero recomendado)
| 4 | El campo de imagen utiliza tipo `file` para carga
| 5 | Solo se aceptan archivos de imagen (jpg, png, etc.)
| 6 | Hacer clic en "Guardar" |
| 7 | El formulario se valida (campos obligatorios, formato de precio/stock) |
| 8 | Se realiza petición POST /api/admin/productos con multipart/form-data (para imagen) |
| 9 | El servidor procesa la imagen y la guarda en /uploads/ |
| 10 | El producto se crea en la base de datos |
| 11 | Se muestra mensaje de éxito |
| 12 | El nuevo producto aparece en la lista |

#### Subcapacidad: Editar Producto

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Editar" o ícono de lápiz |
| 2 | Se abre formulario pre-cargado con datos del producto |
| 3 | Se pueden modificar:
   - Nombre, descripción, precio, stock
   - Categoría y subcategoría
   - Imagen (reemplazar por nueva imagen)
| 4 | Si se sube nueva imagen, se elimina la anterior del servidor |
| 5 | Hacer clic en "Guardar Cambios" |
| 6 | Se realiza petición PUT /api/admin/productos/:id |
| 7 | Se actualiza en la base de datos |
| 8 | Se muestra mensaje de éxito |
| 9 | La lista se actualiza con los nuevos datos |

#### Subcapacidad: Activar/Desactivar Producto

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en ícono/botón de estado |
| 2 | Se abre diálogo de confirmación |
| 3 | Confirmar acción |
| 4 | Se realiza petición PATCH /api/admin/productos/:id/toggle |
| 5 | El estado se invierte (activo ↔ inactivo) |
| 6 | Los productos inactivos no aparecen en el catálogo público |
| 7 | Se muestra mensaje de éxito |

#### Subcapacidad: Gestionar Stock

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Editar Stock" o similar |
| 2 | Se abre diálogo con opciones de modificación |
| 3 | Seleccionar operación:
   - **Establecer:** Definir cantidad exacta
   - **Aumentar:** Sumar cantidad (ej: recepción de mercancía)
   - **Reducir:** Restar cantidad (ej: ajuste por merma)
| 4 | Ingresar cantidad |
| 5 | Hacer clic en "Confirmar" |
| 6 | Se realiza petición PATCH /api/admin/productos/:id/stock |
| 7 | Se actualiza el stock en la base de datos |
| 8 | Se valida que el stock no sea negativo |
| 9 | Se muestra mensaje de éxito |
| 10 | La tabla se actualiza con el nuevo stock |

#### Subcapacidad: Eliminar Producto

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Eliminar" o ícono de basura |
| 2 | Se abre diálogo de confirmación |
| 3 | Confirmar eliminación |
| 4 | Se realiza petición DELETE /api/admin/productos/:id |
| 5 | El servidor automáticamente elimina la imagen del servidor (del disco)
| 6 | El producto se elimina permanentemente de la base de datos |
| 7 | Se muestra mensaje de éxito |
| 8 | El producto desaparece de la lista |

---

### Módulo de Usuarios

**Descripción:** Gestión integral de cuentas de usuario. Permite crear, consultar, editar, eliminar usuarios y asignar roles específicos.

#### Subcapacidad: Listar Usuarios

| Paso | Acción |
|------|--------|
| 1 | Navegar a la ruta /admin/usuarios |
| 2 | Se realiza petición GET /api/admin/usuarios |
| 3 | Se obtiene lista paginada de usuarios (10 por página por defecto) |
| 4 | Se pueden aplicar filtros:
   - **Por Rol:** Cliente, Auxiliar, Administrador
   - **Por Estado:** Activo/Inactivo
   - **Búsqueda:** Por nombre, apellido o email
| 5 | Los usuarios se muestran en tabla con: nombre, apellido, email, rol, estado, acciones |
| 6 | Se incluye paginación |
| 7 | Los datos de password no se visualizan por seguridad |

#### Subcapacidad: Crear Usuario

| Paso | Acción |
|------|--------|
| 1 | En la página de usuarios, hacer clic en "Nuevo Usuario" |
| 2 | Se abre formulario de creación |
| 3 | Completar campos obligatorios:
   - **Nombre:** Nombre del usuario
   - **Apellido:** Apellido del usuario
   - **Email:** Correo único (validar formato)
   - **Contraseña:** Mínimo 6 caracteres
   - **Rol:** Seleccionar Cliente, Auxiliar o Administrador
   - **Teléfono:** Contacto (opcional)
   - **Dirección:** Ubicación (opcional)
| 4 | Hacer clic en "Guardar" |
| 5 | Se valida que el email no esté registrado |
| 6 | Se realiza petición POST /api/admin/usuarios (requiere middleware soloAdministrador) |
| 7 | La contraseña se encripta automáticamente antes de guardar |
| 8 | El usuario se crea en la base de datos |
| 9 | Se muestra mensaje de éxito |
| 10 | El nuevo usuario aparece en la lista |

#### Subcapacidad: Editar Usuario

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Editar" |
| 2 | Se abre formulario pre-cargado |
| 3 | Se pueden modificar:
   - Nombre, apellido, teléfono, dirección
   - Rol del usuario
| 4 | NO se puede modificar el email desde esta opción por seguridad |
| 5 | Hacer clic en "Guardar Cambios" |
| 6 | Se realiza petición PUT /api/admin/usuarios/:id |
| 7 | Se actualiza en la base de datos |
| 8 | Se muestra mensaje de éxito |

#### Subcapacidad: Activar/Desactivar Usuario

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en ícono/botón de estado |
| 2 | Se abre diálogo de confirmación |
| 3 | Confirmar acción |
| 4 | Se realiza petición PATCH /api/admin/usuarios/:id/toggle |
| 5 | El estado se invierte (activo ↔ inactivo) |
| 6 | Si se desactiva: el usuario NO puede iniciar sesión |
| 7 | Se muestra mensaje de éxito |

#### Subcapacidad: Eliminar Usuario

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Eliminar" |
| 2 | Se abre diálogo de confirmación |
| 3 | Se valida si el usuario tiene pedidos asociados |
| 4 | Si tiene pedidos: mostrar restricción, no permite eliminar |
| 5 | Si no tiene pedidos: solicitar confirmación final |
| 6 | Se realiza petición DELETE /api/admin/usuarios/:id |
| 7 | El usuario se elimina permanentemente |
| 8 | Se muestra mensaje de éxito |

---

### Módulo de Pedidos

**Descripción:** Gestión y supervisión de órdenes de compra. Permite consultar, visualizar detalles, cambiar estado y acceder a estadísticas de todos los pedidos del sistema.

#### Subcapacidad: Listar Pedidos

| Paso | Acción |
|------|--------|
| 1 | Navegar a la ruta /admin/pedidos |
| 2 | Se realiza petición GET /api/admin/pedidos |
| 3 | Se obtiene lista paginada de pedidos (20 por página por defecto) |
| 4 | Se pueden aplicar filtros:
   - **Por Estado:** Pendiente, Pagado, En Proceso, Enviado, Entregado, Cancelado
   - **Por Usuario:** Seleccionar cliente específico
   - **Por Fechas:** Rango de fechas de creación
   - **Búsqueda:** Buscar por número de pedido o email del cliente
| 5 | Los pedidos se muestran en tabla con: ID, cliente, fecha, estado, monto total, acciones |
| 6 | Se incluye paginación |
| 7 | Se pueden ordenar por fecha (más recientes primero) |

#### Subcapacidad: Ver Detalles de Pedido

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en un pedido o botón "Ver Detalles" |
| 2 | Se realiza petición GET /api/admin/pedidos/:id |
| 3 | Se abre vista detallada del pedido |
| 4 | Se muestra información completa:
   - **Cliente:** Nombre, email, teléfono
   - **Dirección de Envío:** Dirección completa del pedido
   - **Método de Pago:** Efectivo, Tarjeta, Transferencia, etc.
   - **Ítems del Pedido:** Tabla con productos, cantidades y precios
   - **Subtotal y Monto Total**
   - **Estado Actual:** Pendiente/Pagado/En Proceso/Enviado/Entregado/Cancelado
   - **Historial de Cambios:** Fechas en que cambió de estado
| 5 | Desde esta vista se pueden cambiar el estado del pedido |

#### Subcapacidad: Cambiar Estado del Pedido

| Paso | Acción |
|------|--------|
| 1 | En vista detallada, seleccionar botón "Cambiar Estado" o dropdown de estados |
| 2 | Se muestran los estados disponibles:
   - Pendiente
   - Pagado
   - En Proceso
   - Enviado
   - Entregado
   - Cancelado
| 3 | Seleccionar nuevo estado |
| 4 | Se abre diálogo de confirmación |
| 5 | Confirmar cambio |
| 6 | Se realiza petición PUT /api/admin/pedidos/:id/estado |
| 7 | El estado se actualiza en la base de datos |
| 8 | El sistema automáticamente registra la fecha y hora del cambio |
| 9 | Se muestra mensaje de éxito |
| 10 | La vista detallada se actualiza con el nuevo estado |

#### Subcapacidad: Estadísticas de Pedidos

| Paso | Acción |
|------|--------|
| 1 | En la página de pedidos, hacer clic en "Estadísticas" o acceder a sección de reportes |
| 2 | Se realiza petición GET /api/admin/pedidos/estadisticas |
| 3 | Se muestran métricas como:
   - Total de pedidos en el sistema
   - Cantidad de pedidos por estado
   - Pedidos completados vs. pendientes
   - Monto total de ventas
   - Monto promedio por pedido
| 4 | Los datos se visualizan en gráficos o tablas resumen |

---

### Módulo de Comentarios

**Descripción:** Moderación de comentarios y reseñas de productos. Permite visualizar, moderar y eliminar comentarios para mantener la calidad del contenido público.

#### Subcapacidad: Listar Comentarios

| Paso | Acción |
|------|--------|
| 1 | Navegar a la ruta /admin/comentarios |
| 2 | Se realiza petición GET /api/admin/comentarios |
| 3 | Se obtiene lista de todos los comentarios |
| 4 | Se pueden filtrar por:
   - **Estado:** Visible, No Visible
   - **Producto:** Seleccionar producto específico
   - **Usuario:** Filtrar por autor del comentario
| 5 | Los comentarios se muestran con: autor, producto, calificación, texto, estado, acciones |

#### Subcapacidad: Moderar Comentario

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Moderar" o ícono de moderación |
| 2 | Se abre vista del comentario |
| 3 | Se puede ver:
   - Contenido completo del comentario
   - Autor y fecha
   - Producto comentado
   - Calificación asignada
| 4 | Hacer clic en "Marcar como Visible" o "Marcar como No Visible" |
| 5 | Se abre diálogo de confirmación |
| 6 | Confirmar acción |
| 7 | Se realiza petición PUT /api/admin/comentarios/:id/moderar |
| 8 | El estado se actualiza en la base de datos |
| 9 | Se muestra mensaje de éxito |
| 10 | Los comentarios "No Visible" no aparecen en el catálogo público |

#### Subcapacidad: Eliminar Comentario

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en botón "Eliminar" |
| 2 | Se abre diálogo de confirmación |
| 3 | Confirmar eliminación |
| 4 | Se realiza petición DELETE /api/admin/comentarios/:id |
| 5 | El comentario se elimina permanentemente |
| 6 | Se muestra mensaje de éxito |

---

### Módulo de Facturas

**Descripción:** Gestión de documentos de facturación. Permite consultar, visualizar y descargar facturas en formato PDF.

#### Subcapacidad: Listar Facturas

| Paso | Acción |
|------|--------|
| 1 | Navegar a la ruta /admin/facturas |
| 2 | Se realiza petición GET /api/admin/facturas |
| 3 | Se obtiene lista de facturas emitidas |
| 4 | Se pueden filtrar por:
   - **Rango de Fechas:** Fecha inicio y fin
   - **Cliente:** Seleccionar usuario específico
| 5 | Las facturas se muestran con: número, fecha, cliente, monto total, acciones |
| 6 | Se incluye paginación |

#### Subcapacidad: Ver Detalles de Factura

| Paso | Acción |
|------|--------|
| 1 | En la lista, hacer clic en factura o botón "Ver Detalles" |
| 2 | Se realiza petición GET /api/admin/facturas/:id |
| 3 | Se abre vista detallada con:
   - Número de factura y fecha de emisión
   - Datos del cliente (nombre, email, dirección)
   - Datos del pedido asociado
   - Ítems facturados (productos, cantidades, precios)
   - Subtotal, impuestos (si aplica), total
   - Método de pago
| 4 | Desde aquí se puede descargar el PDF |

#### Subcapacidad: Descargar Factura en PDF

| Paso | Acción |
|------|--------|
| 1 | En la vista detallada de factura, hacer clic en "Descargar PDF" |
| 2 | Se abre diálogo de descarga o se inicia directamente |
| 3 | Se realiza petición GET /api/admin/facturas/:id/pdf |
| 4 | El servidor genera el PDF con toda la información de la factura |
| 5 | Se envía el archivo al navegador |
| 6 | El usuario lo descarga automáticamente con nombre: FACTURA_XXX.pdf |
| 7 | El archivo contiene información completa y formateada profesionalmente |

#### Subcapacidad: Estadísticas de Facturación

| Paso | Acción |
|------|--------|
| 1 | En la página de facturas, hacer clic en "Estadísticas" |
| 2 | Se realiza petición GET /api/admin/facturas/estadisticas |
| 3 | Se muestran métricas como:
   - Total de facturas emitidas
   - Monto total facturado
   - Promedio de factura
   - Facturas por período (mensual, anual)
| 4 | Se visualiza en gráficos o tablas resumen |

---

## Conclusión

El módulo de Administrador en GAVAT Construcciones Arquitectónicas constituye un sistema robusto y completo de gestión operativa. Mediante la interfaz gráfica intuitiva y los endpoints API bien estructurados, permite al administrador ejercer control total sobre:

- **Inventario:** Gestión completa de categorías, subcategorías y productos
- **Usuarios:** Control de acceso y roles del equipo de trabajo
- **Comercial:** Supervisión de pedidos y facturación
- **Calidad:** Moderación de contenidos y comentarios

Todas las operaciones están protegidas mediante autenticación JWT y validaciones de integridad referencial, garantizando la consistencia y seguridad de la información en todo momento.

---

## 4. FAQ

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo inicio sesión como administrador? | Debes ingresar tu correo y contraseña en la página de login; el sistema verifica tu rol y genera un token JWT para acceso. |
| ¿Qué puede hacer un administrador que no puede hacer un auxiliar? | El administrador puede eliminar usuarios, gestionar roles y eliminar categorías, subcategorías y productos, funciones que el auxiliar no puede realizar. |
| ¿Puede el administrador cambiar el estado de un pedido? | Sí, el administrador puede cambiar el estado de cualquier pedido en el sistema, incluyendo pendiente, pagado, en_proceso, enviado, entregado y cancelado. |
| ¿El administrador puede ver facturas? | Sí, puede consultar todas las facturas emitidas, ver detalles y descargar PDF. |
| ¿Cómo se controla la eliminación de categorías? | El sistema verifica integridad referencial: no permite eliminar una categoría si contiene subcategorías o productos activos. |
| ¿Qué información puede editar el administrador de un usuario? | Puede editar nombre, apellido, correo, rol, teléfono, dirección y estado de la cuenta, pero no puede ver la contraseña actual. |
| ¿El administrador puede moderar comentarios? | Sí, puede marcar comentarios como visibles o no visibles y también eliminarlos si son inapropiados. |
| ¿Qué ocurre si un producto no tiene stock? | El administrador puede desactivar o editar el stock del producto; el sistema no permitirá agregar al carrito productos sin stock disponible. |
| ¿Puedo asignar un nuevo rol a un usuario existente? | Sí, el administrador puede actualizar el rol de cualquier usuario registrado en el sistema. |
| ¿Cómo se protege la información del administrador? | Se utiliza autenticación JWT y validaciones en el backend para asegurar que solo usuarios con rol administrador accedan a estas funciones. |

## 5. ANEXOS

### 5.1 Horario de atención
- No especificado en el proyecto.  
- El documento no contiene información de horarios de soporte administrativo.

### 5.2 Correo de soporte
- info@gavat.com  
- Esta dirección aparece como contacto en el frontend del proyecto.

### 5.3 Navegadores compatibles
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari
- Cualquier navegador moderno compatible con React 19 y Bootstrap 5
- Configuración de compatibilidad tomada del `browserslist` de frontend: `>0.2%`, `not dead`, `not op_mini all`, `last 1 chrome version`, `last 1 firefox version`, `last 1 safari version`.

### 5.4 Requisitos mínimos para utilizar la plataforma
- Conexión estable a Internet.  
- Navegador web moderno actualizado.  
- Para desarrollo local: Node.js v14 o superior y el backend corriendo en `http://localhost:5000`.  
- No se define hardware mínimo específico en los documentos del proyecto.

### 5.5 Información complementaria
- La plataforma utiliza autenticación por token JWT para las operaciones protegidas.  
- El administrador accede a funciones exclusivas no disponibles para los roles cliente o auxiliar.  
- No existe un horario de atención definido en los documentos del proyecto.  
- Las facturas se pueden generar y descargar en formato PDF.

## 6. GLOSARIO

| Término | Definición |
|---------|------------|
| Administrador | Usuario con máximo nivel de control que gestiona categorías, productos, usuarios, pedidos y facturas. |
| Auxiliar | Usuario con permisos limitados que apoya en la gestión operativa sin capacidad de eliminar datos críticos. |
| Usuario | Persona que accede al sistema con un rol asignado. |
| Producto | Artículo disponible para venta con atributos como nombre, descripción, precio, stock e imagen. |
| Categoría | Agrupación principal de productos que facilita la organización del catálogo. |
| Subcategoría | Agrupación secundaria dentro de una categoría que detalla mejor el tipo de producto. |
| Pedido | Orden de compra creada por un usuario, que registra productos, cantidades, estado y datos de envío. |
| Factura | Documento de facturación asociado a un pedido que contiene detalles de la transacción. |
| Comentario | Reseña o valoración que un cliente puede dejar sobre un producto comprado. |
| Carrito de compras | Espacio temporal donde el usuario agrega productos antes de completar la compra. |
| Token JWT | Credencial de acceso codificada que autoriza peticiones protegidas del usuario. |
| Autenticación | Proceso de verificación de identidad mediante correo y contraseña. |
| Rol | Definición del nivel de permisos de un usuario dentro del sistema. |
| Estado del pedido | Fase en la que se encuentra un pedido (pendiente, pagado, en_proceso, enviado, entregado, cancelado). |
| Integridad referencial | Restricción de bases de datos que evita eliminar registros relacionados. |
| Backend | Parte del sistema que procesa la lógica, gestiona datos y responde a las peticiones de la aplicación. |
| Frontend | Interfaz de usuario de la aplicación web, construida con React y Bootstrap. |
| Stock | Cantidad disponible de un producto en inventario. |
| Dashboard | Panel de control donde se muestran estadísticas y accesos rápidos. |
| API | Conjunto de rutas y controladores que exponen funcionalidades del backend. |

## 7. BIBLIOGRAFÍA Y REFERENCIAS

| Referencia | Enlace / Nota |
|-----------|----------------|
| Manual de Usuario | Documento interno del proyecto |
| Documento de Requisitos | Documento interno del proyecto |
| Manual de Auxiliar | Documento interno del proyecto |
| Manual de Usuario | Documento interno del proyecto |
| Desarrollo Frontend | Documento interno del proyecto |
| Desarrollo Técnico | Documento interno del proyecto |
| Manual de APIs | Documento interno del proyecto |
| Pruebas Postman | Documento interno del proyecto |
| Estado de Requerimientos | Documento interno del proyecto |
| Plan de Trabajo | Documento interno del proyecto |

---

**Documento preparado por:** Analista de Software SENA  
**Fecha:** 2026-07-24  
**Versión:** 1.0  
**Estado:** Aprobado para uso interno
