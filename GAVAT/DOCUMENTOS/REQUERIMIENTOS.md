# REQUERIMIENTOS DEL SISTEMA GAVAT E-COMMERCE

**Proyecto:** Sistema de Gestión de E-commerce GAVAT  
**Versión:** 1.0  
**Fecha:** 2026-06-13  
**Estado:** En Desarrollo

---

## 📋 TABLA DE CONTENIDOS

1. [Requerimientos Funcionales](#requerimientos-funcionales)
2. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
3. [Casos de Uso](#casos-de-uso)
4. [Restricciones de Acceso](#restricciones-de-acceso)

---

## REQUERIMIENTOS FUNCIONALES

### 1. MÓDULO DE AUTENTICACIÓN Y AUTORIZACIÓN

#### RF-1.1: Registro de Usuarios
- **Descripción:** Los usuarios pueden crear una cuenta proporcionando email, contraseña, nombre, apellido y teléfono.
- **Actores:** Visitante (Cliente)
- **Precondiciones:** El email debe ser único en el sistema.
- **Flujo:**
  1. Usuario ingresa datos de registro
  2. Sistema valida formato de email
  3. Sistema valida que email no exista
  4. Sistema valida teléfono (10 dígitos, inicio con 3)
  5. Sistema hasea la contraseña
  6. Sistema crea usuario con rol "cliente"
  7. Sistema genera JWT token
  8. Sistema sincroniza carrito local con servidor
- **Resultado:** Usuario registrado y autenticado, token generado

#### RF-1.2: Login de Usuarios
- **Descripción:** Los usuarios autenticados pueden acceder al sistema.
- **Actores:** Usuario registrado
- **Precondiciones:** Usuario debe existir en la BD.
- **Flujo:**
  1. Usuario ingresa email y contraseña
  2. Sistema valida credenciales
  3. Sistema genera JWT token
  4. Sistema sincroniza carrito local
  5. Sistema redirige según rol:
     - Cliente → Catálogo
     - Administrador/Auxiliar → Dashboard
- **Resultado:** Usuario autenticado con sesión activa

#### RF-1.3: Cierre de Sesión
- **Descripción:** Los usuarios pueden cerrar sesión.
- **Actores:** Usuario autenticado
- **Flujo:**
  1. Usuario hace clic en "Cerrar Sesión"
  2. Sistema limpia token del localStorage
  3. Sistema limpia carrito local
  4. Sistema redirige a login
- **Resultado:** Sesión finalizada

#### RF-1.4: Control de Acceso por Roles
- **Descripción:** El sistema restringe acceso a funcionalidades según el rol del usuario.
- **Roles:**
  - **Cliente:** Acceso a catálogo, carrito, pedidos, comentarios
  - **Auxiliar:** Acceso a dashboard, gestión de categorías, productos, pedidos, comentarios
  - **Administrador:** Acceso completo a todas las funcionalidades
- **Restricciones:**
  - Usuarios no autenticados: Solo acceso a catálogo público
  - Facturas: Solo Admin
  - Gestión de usuarios: Solo Admin
  - Comentarios: Admin + Auxiliar (moderación), Clientes (creación)

---

### 2. MÓDULO DE GESTIÓN DE PRODUCTOS Y CATÁLOGO

#### RF-2.1: Visualización del Catálogo
- **Descripción:** Los usuarios pueden ver productos activos del catálogo.
- **Actores:** Visitante, Cliente, Administrador, Auxiliar
- **Funcionalidades:**
  - Listar productos activos con imagen, nombre, precio, stock
  - Filtrar por categoría y subcategoría
  - Buscar por nombre o descripción
  - Ordenar por precio (ascendente/descendente)
  - Paginar resultados (25 items por página)
  - Ver detalles del producto
- **Resultado:** Catálogo visible y navegable

#### RF-2.2: Gestión de Categorías (Admin/Auxiliar)
- **Descripción:** Gestión CRUD completa de categorías.
- **Actores:** Administrador, Auxiliar
- **Operaciones:**
  - Crear nueva categoría (nombre, descripción)
  - Editar categoría existente
  - Eliminar categoría (con cascada a productos)
  - Activar/desactivar categoría
  - Listar categorías con paginación
- **Validaciones:**
  - Nombre único
  - Nombre requerido
  - Máximo 200 caracteres en descripción
- **Resultado:** Categorías gestionadas correctamente

#### RF-2.3: Gestión de Subcategorías (Admin/Auxiliar)
- **Descripción:** Gestión CRUD de subcategorías asociadas a categorías.
- **Actores:** Administrador, Auxiliar
- **Operaciones:**
  - Crear subcategoría (nombre, descripción, categoría)
  - Editar subcategoría
  - Eliminar subcategoría
  - Activar/desactivar
  - Listar subcategorías filtradas por categoría
- **Validaciones:**
  - Nombre único por categoría
  - Categoría debe existir
  - Máximo 200 caracteres en descripción
- **Resultado:** Subcategorías gestionadas

#### RF-2.4: Gestión de Productos (Admin/Auxiliar)
- **Descripción:** Gestión CRUD completa de productos del catálogo.
- **Actores:** Administrador, Auxiliar
- **Operaciones:**
  - Crear producto (nombre, descripción, precio, stock, imagen, categoría, subcategoría)
  - Editar producto existente
  - Eliminar producto
  - Activar/desactivar producto
  - Subir/cambiar imagen del producto
  - Listar productos con filtros y búsqueda
  - Exportar listado a PDF o Excel
- **Validaciones:**
  - Nombre requerido y único
  - Precio > 0
  - Stock >= 0
  - Categoría y subcategoría requeridas
  - Imagen en formato PNG, JPG, JPEG, GIF
  - Máximo 1MB por imagen
- **Resultado:** Productos gestionados en el catálogo

#### RF-2.5: Detalles del Producto
- **Descripción:** Ver información completa de un producto.
- **Actores:** Visitante, Cliente, Administrador, Auxiliar
- **Información mostrada:**
  - Imagen del producto
  - Nombre, descripción, precio
  - Stock disponible
  - Categoría y subcategoría
  - Calificación promedio de comentarios
  - Lista de comentarios públicos (5 por página)
  - Selector de cantidad (1 a stock máximo)
  - Botón "Agregar al Carrito"
  - Breadcrumb de navegación
- **Funcionalidades:**
  - Aumentar/disminuir cantidad
  - Entrada directa de cantidad con validación
  - Ver comentarios de otros clientes
  - Dejar comentario (si es cliente autenticado)
- **Resultado:** Información completa del producto visible

---

### 3. MÓDULO DE CARRITO DE COMPRAS

#### RF-3.1: Gestión del Carrito Local
- **Descripción:** El sistema mantiene un carrito local en el navegador.
- **Actores:** Visitante, Cliente
- **Operaciones:**
  - Agregar producto al carrito (con cantidad)
  - Actualizar cantidad de producto
  - Eliminar producto del carrito
  - Limpiar carrito completo
  - Calcular total automáticamente
- **Almacenamiento:** localStorage del navegador
- **Información por item:** {productoId, nombre, precio, cantidad, imagen}
- **Resultado:** Carrito gestionado localmente

#### RF-3.2: Visualización del Carrito
- **Descripción:** Los usuarios pueden ver el contenido del carrito.
- **Actores:** Visitante, Cliente
- **Información mostrada:**
  - Tabla con productos (imagen, nombre, precio, cantidad, subtotal)
  - Total a pagar
  - Cantidad de items
  - Mensaje si carrito está vacío
  - Botones: "Continuar comprando", "Ir a checkout"
- **Funcionalidades:**
  - Editar cantidad desde el carrito
  - Eliminar productos
  - Ver total actualizado en tiempo real
- **Resultado:** Carrito visible y editable

#### RF-3.3: Sincronización del Carrito
- **Descripción:** Al login/registro, el carrito local se sincroniza con el servidor.
- **Actores:** Cliente autenticado
- **Flujo:**
  1. Usuario hace login
  2. Sistema obtiene carrito del localStorage
  3. Sistema envía items al servidor
  4. Sistema almacena en BD para el usuario
  5. Sistema limpia localStorage
- **Resultado:** Carrito sincronizado entre dispositivos

---

### 4. MÓDULO DE PEDIDOS Y CHECKOUT

#### RF-4.1: Proceso de Checkout
- **Descripción:** Los clientes pueden completar la compra.
- **Actores:** Cliente autenticado
- **Precondiciones:** 
  - Usuario debe estar autenticado
  - Carrito debe tener al menos un producto
  - Stock debe estar disponible
- **Flujo:**
  1. Usuario accede a checkout
  2. Sistema muestra resumen de compra
  3. Usuario revisa datos de envío
  4. Usuario confirma pedido
  5. Sistema valida stock de cada producto
  6. Sistema crea pedido en BD
  7. Sistema crea detalles de pedido para cada item
  8. Sistema reduce stock de productos
  9. Sistema limpia carrito
  10. Sistema redirige a confirmación
- **Resultado:** Pedido creado y almacenado

#### RF-4.2: Historial de Pedidos (Cliente)
- **Descripción:** Los clientes pueden ver sus pedidos anteriores.
- **Actores:** Cliente autenticado
- **Información mostrada:**
  - Lista de pedidos con ID, fecha, total, estado
  - Búsqueda por ID o rango de fechas
  - Paginación (10 por página)
  - Link para ver detalles
- **Estados posibles:** Pendiente, Procesando, Enviado, Entregado, Cancelado
- **Resultado:** Histórico de compras visible

#### RF-4.3: Detalles de Pedido
- **Descripción:** Ver detalles completos de un pedido.
- **Actores:** Cliente (su pedido), Administrador/Auxiliar (cualquier pedido)
- **Información mostrada:**
  - Número de pedido, fecha de creación
  - Cliente (nombre, email, teléfono)
  - Estado actual del pedido
  - Tabla de productos (nombre, cantidad, precio unitario, subtotal)
  - Total a pagar
  - Historial de cambios de estado
- **Resultado:** Detalles del pedido visible

#### RF-4.4: Gestión de Pedidos (Admin/Auxiliar)
- **Descripción:** Administrar pedidos del sistema.
- **Actores:** Administrador, Auxiliar
- **Operaciones:**
  - Listar todos los pedidos
  - Filtrar por estado (Pendiente, Procesando, etc.)
  - Buscar por número de pedido o cliente
  - Ver detalles del pedido
  - Cambiar estado del pedido
  - Ver historial de cambios
  - Exportar pedidos a PDF/Excel
- **Resultado:** Pedidos administrados

---

### 5. MÓDULO DE FACTURAS

#### RF-5.1: Generación de Facturas
- **Descripción:** Sistema genera PDF de factura para cada pedido.
- **Actores:** Administrador
- **Precondiciones:** Pedido debe existir y estar en estado "Entregado" o "Procesando"
- **Información en factura:**
  - Datos de la empresa GAVAT
  - Número único de factura
  - Fecha de emisión
  - Datos del cliente (nombre, email, teléfono)
  - Tabla de productos (descripción, cantidad, precio, subtotal)
  - Subtotal, impuestos (si aplica), total
  - Número de pedido asociado
- **Generación:** Automática en PDF usando librería pdfService
- **Almacenamiento:** En carpeta `/backend/facturas/`
- **Resultado:** Factura generada y almacenada

#### RF-5.2: Descarga de Facturas (Admin)
- **Descripción:** Los administradores pueden descargar facturas.
- **Actores:** Administrador
- **Flujo:**
  1. Admin visualiza pedido
  2. Admin hace clic en "Descargar Factura"
  3. Sistema genera/obtiene PDF
  4. Sistema inicia descarga
- **Resultado:** Archivo PDF descargado

#### RF-5.3: Gestión de Facturas (Admin)
- **Descripción:** Listar y gestionar facturas emitidas.
- **Actores:** Administrador
- **Operaciones:**
  - Listar todas las facturas
  - Filtrar por rango de fechas
  - Buscar por número de factura
  - Ver detalles de factura
  - Descargar factura PDF
  - Marcar como "vista"
- **Resultado:** Facturas gestionadas

---

### 6. MÓDULO DE COMENTARIOS Y CALIFICACIONES

#### RF-6.1: Crear Comentarios (Cliente)
- **Descripción:** Los clientes pueden dejar comentarios y calificación en productos.
- **Actores:** Cliente autenticado
- **Precondiciones:**
  - Usuario debe ser cliente
  - Usuario debe estar autenticado
- **Información requerida:**
  - Calificación (1-5 estrellas)
  - Comentario de texto (máximo 1000 caracteres)
- **Validaciones:**
  - Calificación entre 1-5
  - Texto no vacío
  - Máximo 1000 caracteres
- **Resultado:** Comentario creado y guardado

#### RF-6.2: Editar Comentarios (Cliente)
- **Descripción:** Los clientes pueden editar sus propios comentarios.
- **Actores:** Cliente autenticado (autor del comentario)
- **Funcionalidades:**
  - Editar calificación
  - Editar texto del comentario
  - Cambiar estado de visibilidad (oculto/visible)
- **Validaciones:** Mismas que creación
- **Resultado:** Comentario actualizado

#### RF-6.3: Eliminar Comentarios
- **Descripción:** Clientes pueden eliminar sus comentarios, Admin/Auxiliar pueden eliminar cualquiera.
- **Actores:** Cliente (propio), Administrador/Auxiliar (cualquiera)
- **Precondiciones:** Comentario debe existir
- **Resultado:** Comentario eliminado de la BD

#### RF-6.4: Visualización de Comentarios
- **Descripción:** Ver comentarios de un producto en su página de detalles.
- **Actores:** Visitante, Cliente, Administrador, Auxiliar
- **Información mostrada:**
  - Nombre del usuario (sin email completo por privacidad)
  - Calificación en estrellas (doradas)
  - Texto del comentario
  - Fecha del comentario
  - Paginación (5 comentarios por página)
  - Botón "Anterior/Siguiente"
- **Filtros:** Solo mostrar comentarios públicos (visibilidad = true)
- **Resultado:** Comentarios visibles públicamente

#### RF-6.5: Moderación de Comentarios (Admin/Auxiliar)
- **Descripción:** Administrar y moderar comentarios de productos.
- **Actores:** Administrador, Auxiliar
- **Operaciones:**
  - Listar todos los comentarios
  - Filtrar por estado (públicos, ocultos, pendientes)
  - Buscar por usuario o producto
  - Ver detalles (usuario, email, producto, comentario)
  - Cambiar visibilidad (mostrar/ocultar comentario)
  - Eliminar comentario inapropiado
  - Paginación (20 por página)
- **Resultado:** Comentarios moderados

---

### 7. MÓDULO DE USUARIOS (ADMIN)

#### RF-7.1: Gestión de Usuarios
- **Descripción:** Los administradores pueden gestionar todos los usuarios.
- **Actores:** Administrador
- **Operaciones:**
  - Listar usuarios (activos/inactivos)
  - Buscar usuario por email o nombre
  - Ver detalles del usuario
  - Editar datos del usuario
  - Cambiar rol (cliente, auxiliar, administrador)
  - Activar/desactivar usuario
  - Eliminar usuario
- **Información de usuario:**
  - ID, nombre, apellido, email, teléfono
  - Rol, estado (activo/inactivo)
  - Fecha de creación
  - Última actividad
- **Resultado:** Usuarios gestionados

#### RF-7.2: Creación de Usuarios (Admin)
- **Descripción:** El administrador puede crear nuevos usuarios.
- **Actores:** Administrador
- **Operaciones:**
  - Ingresar datos de usuario
  - Asignar rol (cliente, auxiliar, admin)
  - Generar contraseña automática o manual
  - Enviar datos al usuario (opcional)
- **Validaciones:** Mismas que registro
- **Resultado:** Usuario creado en el sistema

---

### 8. MÓDULO DE DASHBOARD

#### RF-8.1: Dashboard de Administrador
- **Descripción:** Panel principal con estadísticas del sistema.
- **Actores:** Administrador, Auxiliar
- **Información mostrada (como cards):**
  - Total de categorías
  - Total de subcategorías
  - Total de productos
  - Total de usuarios (solo Admin)
  - Total de pedidos
  - Pedidos pendientes
  - Total de facturas (solo Admin)
  - Total de comentarios
  - Cada card es clickeable y lleva a la sección correspondiente
- **Funcionalidades:**
  - Cargar estadísticas al entrar
  - Actualizar manualmente (botón refresh)
  - Acceso rápido a módulos
- **Resultado:** Dashboard con estadísticas visibles

#### RF-8.2: Navegación de Admin
- **Descripción:** Menú de administración para acceder a módulos.
- **Actores:** Administrador, Auxiliar
- **Opciones según rol:**
  - Admin: Todas las opciones
  - Auxiliar: Excluye Usuarios y Facturas
- **Items del menú:**
  - Dashboard
  - Categorías
  - Subcategorías
  - Productos
  - Usuarios (solo Admin)
  - Pedidos
  - Facturas (solo Admin)
  - Comentarios
- **Resultado:** Navegación funcional

---

### 9. MÓDULO DE NAVEGACIÓN Y LAYOUTS

#### RF-9.1: Navbar (Barra de Navegación)
- **Descripción:** Barra superior con links y opciones según autenticación.
- **Actores:** Todos los usuarios
- **Elementos:**
  - Logo GAVAT
  - Links: Inicio, Catálogo
  - Menú desplegable "Administración" (si es Admin/Auxiliar)
  - Link Carrito con contador de items
  - Link "Mis Pedidos" (si es Cliente)
  - Link "Ver Tienda" (si es Admin/Auxiliar)
  - Nombre de usuario y botón "Cerrar Sesión"
  - Responsive con hamburger menu en móvil
- **Resultado:** Navegación clara y accesible

#### RF-9.2: Footer
- **Descripción:** Pie de página con información general.
- **Actores:** Todos
- **Información:**
  - Sobre GAVAT
  - Enlaces rápidos
  - Contacto
  - Redes sociales
  - Copyright
- **Resultado:** Footer informativo

#### RF-9.3: Breadcrumb
- **Descripción:** Ruta de navegación en páginas de detalle.
- **Ubicaciones:** Producto, Pedido
- **Formato:** Home > Categoría > Producto
- **Funcionalidad:** Links clickeables para navegar
- **Resultado:** Orientación clara del usuario

---

### 10. MÓDULO DE BÚSQUEDA Y FILTRADO

#### RF-10.1: Búsqueda de Productos
- **Descripción:** Búsqueda por nombre o descripción en catálogo.
- **Actores:** Todos
- **Funcionalidades:**
  - Buscar en tiempo real
  - Búsqueda case-insensitive
  - Coincidencia parcial permitida
  - Búsqueda en nombre y descripción
- **Resultado:** Productos filtrados según búsqueda

#### RF-10.2: Filtrado por Categoría/Subcategoría
- **Descripción:** Filtrar productos por clasificación.
- **Actores:** Todos
- **Funcionalidades:**
  - Seleccionar categoría
  - Filtrar subcategorías según categoría
  - Aplicar filtros combinados
  - Limpiar filtros
- **Resultado:** Productos filtrados

#### RF-10.3: Exportación de Datos
- **Descripción:** Exportar listados a PDF o Excel.
- **Actores:** Admin, Auxiliar
- **Funcionalidades:**
  - Exportar productos a PDF/Excel
  - Exportar pedidos a PDF/Excel
  - Incluir todos los campos relevantes
  - Respetar filtros actuales
- **Resultado:** Archivo descargado

---

## REQUERIMIENTOS NO FUNCIONALES

### 1. RENDIMIENTO

#### RNF-1.1: Velocidad de Carga
- **Objetivo:** Tiempo inicial de carga < 3 segundos
- **Aplicable a:** Todas las páginas
- **Métrica:** First Contentful Paint (FCP) < 1.5s
- **Implementación:**
  - Code splitting en React
  - Lazy loading de componentes
  - Optimización de imágenes
  - Minificación de assets

#### RNF-1.2: Velocidad de Respuesta API
- **Objetivo:** Respuesta < 500ms para 90% de peticiones
- **Aplicable a:** Todos los endpoints
- **Optimizaciones:**
  - Índices en BD
  - Caché de respuestas
  - Paginación de resultados

#### RNF-1.3: Escalabilidad de BD
- **Objetivo:** Soportar 100,000+ productos, 10,000+ usuarios
- **Implementación:**
  - Indexes en campos de búsqueda
  - Queries optimizadas
  - Partition tables si es necesario

---

### 2. SEGURIDAD

#### RNF-2.1: Autenticación
- **Requisito:** JWT con expiración (24-72 horas)
- **Almacenamiento:** localStorage del navegador
- **Validación:** En cada petición protegida
- **Implementación:**
  - Tokens firmados con clave secreta
  - Refresh token cada X tiempo
  - Logout limpia token

#### RNF-2.2: Autorización (Role-Based Access Control)
- **Requisito:** Control de acceso granular por rol
- **Validación:** En backend para cada endpoint
- **Roles:** Cliente, Auxiliar, Administrador
- **Implementación:**
  - Middleware de verificación
  - Rutas protegidas por rol
  - Manejo de 403 Forbidden

#### RNF-2.3: Protección de Contraseñas
- **Requisito:** Contraseñas hasheadas con bcrypt
- **Mínimo 6 caracteres**
- **No se permite contraseña = email**
- **Implementación:**
  - Hash con salt (10 rounds)
  - Nunca retornar contraseña en API
  - Validación en creación/cambio

#### RNF-2.4: Validación de Entrada
- **Requisito:** Validar todos los inputs
- **Aplicable a:** Frontend y Backend
- **Validaciones:**
  - Email formato válido
  - Teléfono formato correcto
  - Rangos numéricos (precio, stock)
  - Límites de caracteres
  - XSS prevention

#### RNF-2.5: HTTPS
- **Requisito:** Todas las comunicaciones encriptadas
- **Aplicable a:** Producción
- **Certificado:** SSL/TLS válido

#### RNF-2.6: Protección CSRF
- **Requisito:** Token CSRF en formularios
- **Implementación:** Headers personalizados en Axios

#### RNF-2.7: Rate Limiting
- **Requisito:** Limitar peticiones por usuario
- **Objetivo:** Prevenir ataques de fuerza bruta
- **Implementación:** 10 intentos de login en 15 minutos

---

### 3. CONFIABILIDAD Y DISPONIBILIDAD

#### RNF-3.1: Disponibilidad del Servicio
- **Objetivo:** 99.5% uptime
- **Monitoreo:** Alerts si cae el servidor
- **Backup:** Diario de BD

#### RNF-3.2: Recuperación de Errores
- **Objetivo:** Sistema se recupera automáticamente de errores
- **Implementación:**
  - Try-catch en operaciones críticas
  - Rollback automático en transacciones
  - Logging detallado de errores

#### RNF-3.3: Integridad de Datos
- **Requisito:** Garantizar consistencia de BD
- **Implementación:**
  - Transacciones para operaciones múltiples
  - Foreign keys con cascada
  - Validación de stock antes de pedido

---

### 4. USABILIDAD

#### RNF-4.1: Interfaz Intuitiva
- **Requisito:** Usuario sin capacitación puede usar sistema
- **Implementación:**
  - Menús claros y lógicos
  - Botones con etiquetas obvias
  - Feedback visual en acciones
  - Validación con mensajes claros

#### RNF-4.2: Responsiveness
- **Requisito:** Funciona en móvil, tablet, desktop
- **Breakpoints:** 320px, 768px, 1024px
- **Implementación:**
  - Grid flexibles
  - Imágenes responsive
  - Touch-friendly buttons (mín 44px)

#### RNF-4.3: Accesibilidad
- **Requisito:** WCAG 2.0 AA compliance
- **Implementación:**
  - Alt text en imágenes
  - Labels en formularios
  - Navegación por teclado
  - Contraste de colores suficiente

#### RNF-4.4: Consistencia Visual
- **Requisito:** Diseño coherente en toda la app
- **Implementación:**
  - Variables CSS globales
  - Componentes reutilizables
  - Paleta de colores consistente

---

### 5. COMPATIBILIDAD

#### RNF-5.1: Navegadores
- **Soportados:**
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Mobile:** iOS Safari, Chrome Android

#### RNF-5.2: Resoluciones
- **Mínimo:** 320px ancho (mobile)
- **Máximo:** 2560px ancho (4K)
- **Óptimo:** 1920px (Full HD)

#### RNF-5.3: Sistemas Operativos
- Windows 10+
- macOS 10.15+
- Linux (principales distros)
- iOS 12+
- Android 6+

---

### 6. MANTENIBILIDAD

#### RNF-6.1: Código Limpio
- **Requisito:** Código legible y bien estructurado
- **Implementación:**
  - Naming convenciones claras
  - Funciones pequeñas (< 50 líneas)
  - Comments en lógica compleja
  - ESLint configurado

#### RNF-6.2: Documentación
- **Requisito:** Código documentado
- **Documentos:**
  - README.md
  - API Documentation
  - Architecture overview
  - Setup instructions

#### RNF-6.3: Versionamiento
- **Requisito:** Control de versiones con Git
- **Workflow:** Feature branches, PRs, releases
- **Tags:** Versiones semánticas

#### RNF-6.4: Testing
- **Requisito:** Tests automatizados
- **Coverage:** > 80% para código crítico
- **Tipos:**
  - Unit tests
  - Integration tests
  - E2E tests

---

### 7. ESCALABILIDAD

#### RNF-7.1: Arquitectura Modular
- **Requisito:** Sistema fácil de extender
- **Implementación:**
  - Separación de concerns
  - Componentes independientes
  - Services desacoplados

#### RNF-7.2: Manejo de Carga
- **Requisito:** Soporta picos de tráfico
- **Implementación:**
  - Load balancing
  - Caching distribuido
  - Connection pooling en BD

---

### 8. CUMPLIMIENTO LEGAL

#### RNF-8.1: Privacidad (RGPD/Leyes Locales)
- **Requisito:** Proteger datos personales
- **Implementación:**
  - Política de privacidad clara
  - Consentimiento explícito
  - Derecho al olvido
  - Encriptación de datos sensibles

#### RNF-8.2: Protección de Datos
- **Requisito:** Datos almacenados seguros
- **Implementación:**
  - Encriptación en reposo
  - Backups encriptados
  - No logs con información sensible

---

## CASOS DE USO PRINCIPALES

### CU-1: Cliente Compra Producto

**Actores:** Cliente
**Precondiciones:** Cliente debe estar registrado y autenticado

**Flujo Principal:**
1. Cliente navega a catálogo
2. Cliente busca/filtra productos
3. Cliente hace clic en producto
4. Cliente ve detalles y comentarios
5. Cliente selecciona cantidad
6. Cliente hace clic "Agregar al Carrito"
7. Sistema muestra confirmación
8. Cliente continúa comprando o va a checkout
9. Sistema calcula total
10. Cliente confirma compra
11. Sistema procesa pedido
12. Sistema muestra confirmación

**Excepciones:**
- Stock insuficiente → Mostrar mensaje
- Precio cambió → Mostrar actualizado
- Producto desactivado → No permitir

---

### CU-2: Auxiliar Gestiona Productos

**Actores:** Auxiliar, Sistema
**Precondiciones:** Auxiliar debe estar autenticado

**Flujo Principal:**
1. Auxiliar accede a dashboard
2. Auxiliar hace clic en "Productos"
3. Sistema lista productos
4. Auxiliar aplica filtros/busca
5. Auxiliar selecciona un producto
6. Auxiliar edita información
7. Auxiliar sube nueva imagen
8. Auxiliar guarda cambios
9. Sistema valida datos
10. Sistema actualiza BD
11. Sistema muestra confirmación

**Alternativas:**
- Crear nuevo → Formulario vacío
- Eliminar → Confirmación requerida
- Exportar → PDF o Excel

---

### CU-3: Admin Modera Comentarios

**Actores:** Administrador, Sistema
**Precondiciones:** Existen comentarios en el sistema

**Flujo Principal:**
1. Admin accede a dashboard
2. Admin hace clic en "Comentarios"
3. Sistema lista comentarios
4. Admin aplica filtros (estado, producto)
5. Admin selecciona comentario
6. Admin ve detalles (usuario, producto, texto)
7. Admin decide acción:
   - Mostrar comentario
   - Ocultar comentario
   - Eliminar comentario
8. Sistema actualiza estado
9. Sistema muestra confirmación

---

## RESTRICCIONES DE ACCESO

| Funcionalidad | Cliente | Auxiliar | Administrador |
|---|:---:|:---:|:---:|
| Ver Catálogo | ✅ | ✅ | ✅ |
| Crear Pedido | ✅ | ❌ | ✅ |
| Ver Mis Pedidos | ✅ | ❌ | ❌ |
| Crear Comentario | ✅ | ❌ | ✅ |
| Editar Propio Comentario | ✅ | ❌ | ✅ |
| Moderar Comentarios | ❌ | ✅ | ✅ |
| Gestionar Productos | ❌ | ✅ | ✅ |
| Gestionar Categorías | ❌ | ✅ | ✅ |
| Gestionar Usuarios | ❌ | ❌ | ✅ |
| Ver Facturas | ❌ | ❌ | ✅ |
| Generar Factura | ❌ | ❌ | ✅ |
| Ver Dashboard | ❌ | ✅ | ✅ |
| Exportar Datos | ❌ | ✅ | ✅ |
| Cambiar Estado Pedido | ❌ | ✅ | ✅ |

---

**Documento generado:** 2026-06-13  
**Versión:** 1.0  
**Estado:** Completado
