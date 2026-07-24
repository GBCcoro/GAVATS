# MANUAL TÉCNICO - MÓDULO AUXILIAR
## Sistema GAVAT Construcciones Arquitectónicas

**Versión:** 1.0  
**Fecha:** 2026-07-24  
**Clasificación:** Manual Interno SENA  
**Documentador:** Analista de Software

---

## Tabla de Contenido

1. [AUXILIAR](#1-auxiliar)
   - [1.1 Objetivo](#11-objetivo)
   - [1.2 Alcance](#12-alcance)
   - [1.3 Funcionalidades](#13-funcionalidades)

2. [MAPA DEL SISTEMA](#2-mapa-del-sistema)
   - [2.1 Modelo Lógico](#21-modelo-lógico)
   - [2.2 Navegación por Módulos](#22-navegación-por-módulos)

---

# 1. AUXILIAR

## 1.1 Objetivo

El módulo de Auxiliar constituye el nivel operativo intermedio de la plataforma GAVAT Construcciones Arquitectónicas. Su propósito es proporcionar a los auxiliares administrativos un entorno de gestión de procesos comerciales con capacidades limitadas, bajo la supervisión del administrador.

El auxiliar actúa como operario administrativo de la plataforma, siendo responsable de:

- Facilitar la gestión del catálogo de productos bajo restricciones de seguridad
- Asistir en la supervisión de pedidos y su procesamiento
- Mantener la calidad de contenidos mediante moderación de comentarios
- Generar y acceder a reportes de facturación
- Cumplir funciones operativas específicas sin capacidad de eliminación de datos

---

## 1.2 Alcance

El alcance del módulo de Auxiliar abarca la gestión parcial de los siguientes procesos:

### 1.2.1 Autorización y Autenticación
El acceso al panel de auxiliar está restringido exclusivamente a usuarios con rol **'auxiliar'** en el sistema. La autenticación se realiza mediante las mismas credenciales que el administrador (correo electrónico y contraseña), generando un token JWT que autoriza operaciones específicas según el rol.

### 1.2.2 Gestión de Catálogo (Parcial)
El auxiliar dispone de control limitado sobre:
- **Categorías de productos:** Creación, edición y control de disponibilidad (NO eliminación)
- **Subcategorías:** Gestión parcial con restricción de eliminación
- **Productos:** Administración de inventario sin capacidad de eliminación permanente

**Restricción crítica:** El auxiliar NO puede eliminar categorías, subcategorías ni productos. Todas las operaciones de eliminación requieren permisos de administrador exclusivamente.

### 1.2.3 Gestión de Usuarios
**NO PERMITIDO.** El auxiliar no tiene acceso a ninguna funcionalidad de gestión de usuarios. La creación, edición, modificación de roles y eliminación de usuarios es exclusiva del administrador.

### 1.2.4 Gestión de Pedidos
El auxiliar tiene visibilidad y capacidad limitada sobre:
- Consulta de todos los pedidos del sistema
- Visualización detallada de detalles de pedidos
- Actualización del estado de pedidos en el proceso comercial
- Acceso a información de trazabilidad

### 1.2.5 Moderación de Contenidos
El auxiliar puede:
- Consultar comentarios y reseñas de productos
- Moderar comentarios (marcar como visible o no visible)
- **NO puede eliminar comentarios** (operación exclusiva de administrador)

### 1.2.6 Gestión de Facturas
El auxiliar tiene acceso a:
- Consulta de facturas emitidas
- Visualización de detalles de facturación
- Descarga de facturas en formato PDF
- Anulación de facturas en determinadas condiciones

### 1.2.7 Limitaciones de Alcance
**Funcionalidades NO permitidas al auxiliar:**
- Eliminación de categorías, subcategorías y productos
- Cualquier operación relacionada con gestión de usuarios
- Eliminación de comentarios
- Modificación de precios dinámicamente
- Creación manual de usuarios o asignación de roles

---

## 1.3 Funcionalidades

A continuación se presenta la lista completa de todas las acciones que el auxiliar puede ejecutar dentro del sistema GAVAT:

### 1.3.1 Autenticación y Acceso
- El auxiliar puede iniciar sesión utilizando su correo electrónico y contraseña registrados
- El auxiliar puede cerrar sesión y terminar su sesión activa
- El auxiliar puede validar su identidad mediante token JWT
- El auxiliar obtiene acceso al panel de auxiliar con funcionalidades limitadas

### 1.3.2 Panel de Control Principal
- El auxiliar puede acceder al dashboard del panel de auxiliar
- El auxiliar puede visualizar estadísticas del sistema (total de categorías, subcategorías, productos y pedidos)
- El auxiliar puede ver alertas de pedidos pendientes
- El auxiliar puede acceder a botones de navegación rápida hacia módulos principales asignados

### 1.3.3 Gestión de Categorías (Sin Eliminación)
- El auxiliar puede consultar la lista completa de categorías
- El auxiliar puede crear una nueva categoría proporcionando nombre y descripción
- El auxiliar puede editar información de categorías existentes
- El auxiliar puede activar o desactivar categorías (cambio de estado)
- El auxiliar **NO puede eliminar categorías** (operación exclusiva de administrador)
- El auxiliar puede visualizar estadísticas por categoría

### 1.3.4 Gestión de Subcategorías (Sin Eliminación)
- El auxiliar puede consultar la lista completa de subcategorías
- El auxiliar puede crear una nueva subcategoría indicando categoría padre, nombre y descripción
- El auxiliar puede editar información de subcategorías existentes
- El auxiliar puede cambiar la categoría padre de una subcategoría
- El auxiliar puede activar o desactivar subcategorías
- El auxiliar **NO puede eliminar subcategorías** (operación exclusiva de administrador)
- El auxiliar puede visualizar estadísticas por subcategoría

### 1.3.5 Gestión de Productos (Sin Eliminación)
- El auxiliar puede consultar la lista completa de productos con paginación y filtros avanzados
- El auxiliar puede filtrar productos por categoría, subcategoría, estado y disponibilidad de stock
- El auxiliar puede buscar productos por nombre o descripción
- El auxiliar puede crear un nuevo producto con datos completos (nombre, descripción, precio, stock, categoría, imagen)
- El auxiliar puede editar información de productos existentes
- El auxiliar puede actualizar la imagen del producto
- El auxiliar puede activar o desactivar productos
- El auxiliar puede modificar el stock de un producto mediante operaciones de establecer, aumentar o reducir
- El auxiliar **NO puede eliminar productos** (operación exclusiva de administrador)
- El auxiliar puede visualizar detalles completos de cada producto

### 1.3.6 Gestión de Usuarios
- **El auxiliar NO tiene acceso a ninguna funcionalidad de gestión de usuarios**
- El auxiliar no puede listar usuarios
- El auxiliar no puede crear nuevos usuarios
- El auxiliar no puede editar información de usuarios
- El auxiliar no puede cambiar roles de usuarios
- El auxiliar no puede activar o desactivar cuentas de usuario
- El auxiliar no puede eliminar usuarios

### 1.3.7 Gestión de Pedidos
- El auxiliar puede consultar la lista completa de todos los pedidos del sistema
- El auxiliar puede filtrar pedidos por estado (pendiente, pagado, en_proceso, enviado, entregado, cancelado)
- El auxiliar puede filtrar pedidos por usuario específico
- El auxiliar puede visualizar detalles completos de cada pedido
- El auxiliar puede cambiar el estado de un pedido en el flujo de procesamiento
- El auxiliar puede acceder a información de trazabilidad con histórico de cambios
- El auxiliar puede consultar información de facturación asociada a pedidos

### 1.3.8 Gestión de Comentarios y Reseñas
- El auxiliar puede consultar la lista de comentarios de productos
- El auxiliar puede visualizar comentarios por estado (visibles, ocultos)
- El auxiliar puede moderar comentarios marcándolos como visible o no visible
- El auxiliar **NO puede eliminar comentarios** (operación exclusiva de administrador)
- El auxiliar puede acceder al histórico de comentarios

### 1.3.9 Gestión de Facturas
- El auxiliar puede consultar la lista completa de facturas emitidas
- El auxiliar puede filtrar facturas por rango de fechas
- El auxiliar puede visualizar detalles de facturación completos
- El auxiliar puede descargar facturas en formato PDF
- El auxiliar puede anular una factura bajo condiciones específicas del sistema
- El auxiliar puede acceder a información de facturación

---

# 2. MAPA DEL SISTEMA

## 2.1 Modelo Lógico

El modelo lógico del módulo de Auxiliar está estructurado en los siguientes módulos funcionales:

| # | Módulo | Descripción | Alcance |
|----|--------|-----------|---------|
| 1 | Módulo de Inicio de Sesión | Autenticación del auxiliar | Validación de credenciales, generación de token JWT |
| 2 | Módulo de Dashboard | Panel de control para auxiliar | Estadísticas limitadas, alertas, accesos rápidos |
| 3 | Módulo de Categorías | Gestión parcial de categorías | Crear, consultar, editar, toggle (SIN eliminación) |
| 4 | Módulo de Subcategorías | Gestión parcial de subcategorías | Crear, consultar, editar, toggle (SIN eliminación) |
| 5 | Módulo de Productos | Gestión parcial del inventario | Crear, consultar, editar, stock, toggle (SIN eliminación) |
| 6 | Módulo de Pedidos | Gestión de órdenes de compra | Consulta, cambio de estado, detalles |
| 7 | Módulo de Comentarios | Moderación de contenidos | Visualización, moderación, toggle (SIN eliminación) |
| 8 | Módulo de Facturas | Gestión de documentos | Consulta, descarga PDF, anulación |

---

## 2.2 Navegación por Módulos

### Módulo de Inicio de Sesión

**Descripción:** Sistema de autenticación que valida las credenciales del auxiliar y genera un token de acceso para la sesión operativa.

| Paso | Acción |
|------|--------|
| 1 | Ingresar a la plataforma GAVAT desde la URL principal |
| 2 | Acceder a la página de inicio de sesión (/login) |
| 3 | Ingresar correo electrónico registrado con rol auxiliar |
| 4 | Ingresar contraseña asociada al usuario auxiliar |
| 5 | Hacer clic en el botón "Iniciar Sesión" |
| 6 | El sistema valida credenciales contra la base de datos |
| 7 | Se verifica que el rol sea 'auxiliar' |
| 8 | Si las credenciales son válidas, se genera token JWT |
| 9 | El navegador almacena el token en localStorage |
| 10 | El usuario es redirigido al panel de auxiliar con funcionalidades limitadas |

---

### Módulo de Dashboard

**Descripción:** Panel central del auxiliar que proporciona una visión general de operaciones permitidas mediante estadísticas y accesos rápidos a funcionalidades.

| Paso | Acción |
|------|--------|
| 1 | Acceder a la ruta del panel de auxiliar tras iniciar sesión |
| 2 | El sistema carga estadísticas desde los endpoints de la API |
| 3 | Se obtienen: total de categorías, subcategorías, productos y pedidos |
| 4 | Se calcula información de alertas (pedidos pendientes) |
| 5 | El dashboard muestra tarjetas de estadísticas con valores actualizados |
| 6 | Se muestran solo los módulos accesibles al auxiliar |
| 7 | Hacer clic en una tarjeta redirige al módulo seleccionado |
| 8 | El panel muestra botones de acciones rápidas permitidas |
| 9 | Se visualiza información de estado del sistema |
| 10 | Los datos se actualizan cada vez que se accede al dashboard |

---

### Módulo de Categorías

**Descripción:** Gestión parcial de categorías de productos. Permite crear, consultar, editar y controlar disponibilidad sin capacidad de eliminación.

#### Subcapacidad: Listar Categorías

| Paso | Acción |
|------|--------|
| 1 | Navegar a la sección de categorías desde el panel |
| 2 | El sistema realiza petición GET /api/admin/categorias |
| 3 | Se obtiene lista completa de categorías activas e inactivas |
| 4 | Las categorías se muestran en tabla con columnas: nombre, descripción, estado, acciones |
| 5 | Cada fila contiene botones para: ver detalles, editar, activar/desactivar |
| 6 | Se pueden ordenar categorías por nombre (A-Z) |
| 7 | El botón "Eliminar" NO está disponible (restricción de rol) |

#### Subcapacidad: Crear Categoría

| Paso | Acción |
|------|--------|
| 1 | En la página de categorías, hacer clic en botón "Nueva Categoría" |
| 2 | Se abre formulario modal o página de creación |
| 3 | Completar campos requeridos:
   - **Nombre:** Identificación única de la categoría
   - **Descripción:** Breve descripción de los productos
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
| 2 | Se abre formulario pre-cargado con datos actuales |
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

---

### Módulo de Subcategorías

**Descripción:** Gestión parcial de subcategorías vinculadas a categorías padre. Permite crear, consultar, editar sin capacidad de eliminación.

#### Subcapacidad: Listar Subcategorías

| Paso | Acción |
|------|--------|
| 1 | Navegar a la sección de subcategorías desde el panel |
| 2 | El sistema realiza petición GET /api/admin/subcategorias |
| 3 | Se obtiene lista completa de subcategorías |
| 4 | Se puede filtrar por categoría padre mediante dropdown/selector |
| 5 | Se puede filtrar por estado (activo/inactivo) |
| 6 | Las subcategorías se muestran en tabla con: nombre, categoría padre, descripción, estado |
| 7 | Cada fila contiene botones de acción permitidos (sin eliminación) |

#### Subcapacidad: Crear Subcategoría

| Paso | Acción |
|------|--------|
| 1 | En la página de subcategorías, hacer clic en "Nueva Subcategoría" |
| 2 | Se abre formulario de creación |
| 3 | Completar campos requeridos:
   - **Categoría Padre:** Seleccionar categoría existente y activa
   - **Nombre:** Nombre de la subcategoría
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

---

### Módulo de Productos

**Descripción:** Gestión parcial del inventario. Permite crear, consultar, editar, gestionar stock y controlar disponibilidad sin capacidad de eliminación.

#### Subcapacidad: Listar Productos

| Paso | Acción |
|------|--------|
| 1 | Navegar a la sección de productos desde el panel |
| 2 | Se realiza petición GET /api/admin/productos |
| 3 | Se obtiene lista paginada de productos |
| 4 | Se pueden aplicar filtros avanzados:
   - **Por Categoría:** Dropdown de categorías disponibles
   - **Por Subcategoría:** Dropdown de subcategorías
   - **Por Estado:** Activo/Inactivo
   - **Por Stock:** Mostrar solo productos con stock disponible
   - **Búsqueda:** Buscar por nombre o descripción
| 5 | Los productos se muestran en tabla con: nombre, categoría, precio, stock, estado |
| 6 | Se incluye paginación para navegar entre páginas |
| 7 | El botón "Eliminar" NO está disponible (restricción de rol) |

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
   - **Subcategoría:** Seleccionar subcategoría
   - **Imagen:** Cargar archivo de imagen (opcional)
| 4 | El campo de imagen utiliza tipo `file` para carga |
| 5 | Solo se aceptan archivos de imagen (jpg, png, etc.) |
| 6 | Hacer clic en "Guardar" |
| 7 | El formulario se valida (campos obligatorios, formato) |
| 8 | Se realiza petición POST /api/admin/productos con multipart/form-data |
| 9 | El servidor procesa la imagen y la guarda |
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
   - Imagen (reemplazar por nueva)
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
| 1 | En la lista, hacer clic en botón "Editar Stock" |
| 2 | Se abre diálogo con opciones de modificación |
| 3 | Seleccionar operación:
   - **Establecer:** Definir cantidad exacta
   - **Aumentar:** Sumar cantidad
   - **Reducir:** Restar cantidad
| 4 | Ingresar cantidad |
| 5 | Hacer clic en "Confirmar" |
| 6 | Se realiza petición PATCH /api/admin/productos/:id/stock |
| 7 | Se actualiza el stock en la base de datos |
| 8 | Se valida que el stock no sea negativo |
| 9 | Se muestra mensaje de éxito |
| 10 | La tabla se actualiza con el nuevo stock |

---

### Módulo de Pedidos

**Descripción:** Gestión de órdenes de compra. Permite consultar, visualizar detalles y cambiar estado de pedidos.

#### Subcapacidad: Listar Pedidos

| Paso | Acción |
|------|--------|
| 1 | Navegar a la sección de pedidos desde el panel |
| 2 | Se realiza petición GET /api/admin/pedidos |
| 3 | Se obtiene lista paginada de pedidos |
| 4 | Se pueden aplicar filtros:
   - **Por Estado:** Pendiente, Pagado, En Proceso, Enviado, Entregado, Cancelado
   - **Por Usuario:** Seleccionar cliente específico
   - **Búsqueda:** Buscar por ID de pedido o email del cliente
| 5 | Los pedidos se muestran en tabla con: ID, cliente, fecha, estado, monto total |
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
   - **Dirección de Envío:** Dirección completa
   - **Método de Pago:** Efectivo, Tarjeta, Transferencia
   - **Ítems del Pedido:** Tabla con productos, cantidades y precios
   - **Monto Total**
   - **Estado Actual**
   - **Historial de Cambios:** Fechas de cambios de estado
| 5 | Desde esta vista se pueden cambiar el estado del pedido |

#### Subcapacidad: Cambiar Estado del Pedido

| Paso | Acción |
|------|--------|
| 1 | En vista detallada, seleccionar botón "Cambiar Estado" o dropdown |
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
| 8 | El sistema automáticamente registra la fecha y hora |
| 9 | Se muestra mensaje de éxito |
| 10 | La vista detallada se actualiza con el nuevo estado |

---

### Módulo de Comentarios

**Descripción:** Moderación de comentarios y reseñas. Permite visualizar y moderar sin capacidad de eliminación.

#### Subcapacidad: Listar Comentarios

| Paso | Acción |
|------|--------|
| 1 | Navegar a la sección de comentarios desde el panel |
| 2 | Se realiza petición GET /api/admin/comentarios |
| 3 | Se obtiene lista de todos los comentarios |
| 4 | Se pueden filtrar por:
   - **Estado:** Visible, No Visible
   - **Producto:** Seleccionar producto específico
   - **Usuario:** Filtrar por autor del comentario
| 5 | Los comentarios se muestran con: autor, producto, calificación, texto, estado |
| 6 | El botón "Eliminar" NO está disponible (restricción de rol) |

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

---

### Módulo de Facturas

**Descripción:** Gestión de documentos de facturación. Permite consultar, visualizar y descargar facturas.

#### Subcapacidad: Listar Facturas

| Paso | Acción |
|------|--------|
| 1 | Navegar a la sección de facturas desde el panel |
| 2 | Se realiza petición GET /api/admin/facturas |
| 3 | Se obtiene lista de facturas emitidas |
| 4 | Se pueden filtrar por:
   - **Rango de Fechas:** Fecha inicio y fin
   - **Cliente:** Seleccionar usuario específico
| 5 | Las facturas se muestran con: número, fecha, cliente, monto total |
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
   - Subtotal y total
   - Método de pago
| 4 | Desde aquí se puede descargar el PDF |

#### Subcapacidad: Descargar Factura en PDF

| Paso | Acción |
|------|--------|
| 1 | En la vista detallada de factura, hacer clic en "Descargar PDF" |
| 2 | Se abre diálogo de descarga o se inicia directamente |
| 3 | Se realiza petición GET /api/admin/facturas/:id/pdf |
| 4 | El servidor genera el PDF con la información de la factura |
| 5 | Se envía el archivo al navegador |
| 6 | El usuario lo descarga automáticamente |
| 7 | El archivo contiene información completa y formateada |

#### Subcapacidad: Anular Factura

| Paso | Acción |
|------|--------|
| 1 | En la vista detallada de factura, hacer clic en "Anular" |
| 2 | Se abre diálogo de confirmación con restricciones |
| 3 | El sistema valida condiciones para anulación |
| 4 | Confirmar acción |
| 5 | Se realiza petición PUT /api/admin/facturas/:id/anular |
| 6 | La factura se marca como anulada en la base de datos |
| 7 | Se registra la fecha y hora de anulación |
| 8 | Se muestra mensaje de éxito |

---

## Conclusión

El módulo de Auxiliar en GAVAT Construcciones Arquitectónicas constituye un sistema operativo de gestión parcial con capacidades limitadas respecto al administrador. Mediante la interfaz gráfica intuitiva y acceso a endpoints API con restricciones, permite al auxiliar ejercer control operativo sobre:

- **Inventario:** Gestión parcial de categorías, subcategorías y productos (sin eliminación)
- **Comercial:** Supervisión de pedidos y facturación
- **Calidad:** Moderación de contenidos y comentarios (sin eliminación)

Todas las operaciones están protegidas mediante autenticación JWT. Las operaciones de eliminación están **excluidas completamente** del rol de auxiliar como medida de seguridad. La gestión de usuarios es **inaccesible** para este rol, garantizando que solo administradores pueden crear y modificar cuentas de usuario.

---

**Documento preparado por:** Analista de Software SENA  
**Fecha:** 2026-07-24  
**Versión:** 1.0  
**Estado:** Aprobado para uso interno
