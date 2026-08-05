# PLAN DE CAPACITACIÓN - SISTEMA GAVAT

## FICHA DE CONTROL DE CAMBIOS

| PROYECTO | SISTEMA GAVAT E-COMMERCE |
|----------|--------------------------|
| DOCUMENTO | Plan de Capacitación |
| VERSIÓN | 1.0 |
| FECHA CREACIÓN | 2026-07-28 |
| FECHA CAMBIO | 2026-07-28 |
| RESPONSABLES | Analista de Software, Líder de Proyecto |
| LÍDER | Coordinador del Proyecto |

### HISTORIAL

| FECHA | NÚMERO DE VERSIÓN | OBSERVACIONES | AUTOR(ES) | VER |
|-------|-------------------|---------------|-----------|-----|
| 2026-07-28 | 1.0 | Documento inicial de capacitación para roles Administrador, Auxiliar y Cliente | Analista de Software | 1.0 |

---

## 1. INTRODUCCIÓN

### 1.1 Propósito y Objetivos

El Plan de capacitación tiene como objetivo guiar a las personas involucradas en el proyecto GAVAT en el manejo y gestión de la plataforma de comercio electrónico. Busca uniformizar criterios, sensibilizar y capacitar a cada rol según su responsabilidad en el manejo de usuarios, productos, pedidos, facturación y moderación de contenido.

Esta capacitación orienta a los roles de Administrador, Auxiliar y Cliente, facilitando la adopción de buenas prácticas, el uso seguro del sistema y la correcta ejecución de los procesos definidos en la plataforma.

### 1.2 Presentación del Sistema de Información (SI)

El sistema GAVAT es una solución de comercio electrónico diseñada para administrar productos, categorías, subcategorías, clientes, pedidos, facturas y comentarios. Su interfaz web permite al cliente final navegar por un catálogo de productos, buscar por categorías, agregar productos al carrito, realizar el checkout y consultar el historial de pedidos.

Para los roles administrativos, el sistema ofrece un panel de control que permite gestionar usuarios, administrar el catálogo de productos, controlar pedidos, consultar facturas en PDF y moderar comentarios. El software está construido con una arquitectura frontend/backend comunicada por servicios REST, y aplica control de acceso basado en roles para proteger la información y las operaciones.

### 1.3 Personal involucrado

| Nombre | Rol |
|--------|-----|
| [Nombre del cliente] | Representante del cliente |
| [Nombre del proveedor] | Coordinador de proyecto |
| [Nombre del responsable] | Analista de software / Responsable de capacitación |
| [Nombre de soporte] | Soporte técnico / Desarrollador |

### 1.4 Definiciones, acrónimos y abreviaturas

- GAVAT: Sistema de Gestión de Comercio Electrónico GAVAT.
- JWT: JSON Web Token.
- Admin: Administrador del sistema.
- Auxiliar: Usuario con permisos limitados para apoyo operativo.
- Cliente: Usuario final que compra a través de la plataforma.
- Frontend: Interfaz de usuario del sistema.
- Backend: Lógica y servicios del servidor.
- Checkout: Proceso de pago y confirmación de pedido.
- Catálogo: Listado de productos disponibles en la tienda.
- Factura: Documento generado al completar una venta.
- Pedido: Orden de compra registrada en el sistema.

## 2. CONVENCIONES

- Los títulos y subtítulos se numeran en forma secuencial para facilitar la referencia.
- Los términos técnicos y roles se escriben con mayúscula inicial al definirlos por primera vez.
- Se emplean listas ordenadas y desordenadas para describir procedimientos y elementos clave.
- Las actividades de capacitación se presentan con objetivos, temas, duración y resultados esperados.
- Las tablas se utilizan para mostrar información estructurada y fácil de comparar.

## 3. ACTIVIDADES Y FUNCIONES DE LA CAPACITACIÓN

Se describe detalladamente el paso a paso de las fases y momentos de la capacitación, teniendo en cuenta los tiempos, los participantes y los resultados esperados.

Consta de dos fases de capacitación:

a. Entrenamiento de líderes o supervisores de las jornadas de capacitación.

b. Entrenamiento de participantes operativos y usuarios finales.

A continuación se describen las etapas necesarias para entrenar a los grupos:

### ETAPA 1: ENTRENAMIENTO DE LÍDERES O SUPERVISORES DE LAS JORNADAS DE CAPACITACIÓN

Objetivo de la actividad: Definir el procedimiento y rol de los líderes o supervisores de las jornadas, identificando el rol que se debe asumir y las normas a cumplir.

Temas a tratar: Habilidades de liderazgo, objetivo de la actividad, normas de comunicación, resolución de dudas y seguimiento del aprendizaje.

- Total de personas: 6 (02 propuestas por el cliente y 04 contratados o miembros del equipo de soporte).
- Intensidad horaria: 4 horas.
- Resultados esperados: Supervisores capaces de guiar las sesiones, resolver dudas y asegurar el cumplimiento del plan de capacitación.

### ETAPA 2: ENTRENAMIENTO DE PARTICIPANTES

Objetivo de la actividad: Capacitar al personal operativo y a los usuarios finales para usar el sistema GAVAT según su rol.

Temas a tratar: Introducción al sistema, uso de cada módulo según el rol, seguridad de credenciales, proceso de pedidos y facturación, manejo del carrito y control de comentarios.

- Total de personas: 12-15 participantes (administradores, auxiliares y clientes seleccionados).
- Intensidad horaria: 8 horas, distribuidas en sesiones prácticas y teóricas.
- Resultados esperados: Participantes capaces de utilizar correctamente el sistema, seguir los procedimientos establecidos y resolver problemas básicos.

## 4. REVISIÓN LOGÍSTICA

- Ambiente de entrenamiento: usar el entorno de pruebas local del proyecto GAVAT con frontend en `http://localhost:3000` y backend en `http://localhost:5000`.
- Requisitos de hardware: computadoras con navegador moderno (Chrome, Edge o Firefox), instalación de Node.js, MySQL y acceso al repositorio `GAVAT/GAVAT`.
- Requisitos de software: servidor backend ejecutando `npm install` y `npm start` en `GAVAT/GAVAT/backend`, frontend ejecutando `npm install` y `npm start` en `GAVAT/GAVAT/frontend`.
- Cuentas de prueba: al menos un usuario administrador, un usuario auxiliar y uno o más clientes creados para los ejercicios prácticos.
- Documentación de apoyo: manuales técnicos `MANUAL_ADMINISTRADOR.md`, `MANUAL_AUXILIAR.md`, `MANUAL_USUARIO.md` y el plan de capacitación disponible en la carpeta `DOCUMENTOS`.
- Responsables logísticos: Coordinador del proyecto, soporte técnico y representante del cliente, con apoyo del analista de software.

## 5. PRESUPUESTO

Se realiza el presupuesto de recursos y servicios necesarios para la capacitación basada en el proyecto GAVAT.

| ELEMENTO | UNIDAD | CANTIDAD | COSTO UNITARIO | VALOR |
|----------|--------|----------|----------------|-------|
| Equipos | Unid. | 20 | 1.50 | 30.00 |
| Sillas | Caja | 3 | 20.00 | 60.00 |
| Escritorios | Resma | 1 | 20.00 | 20.00 |
| Carpetas | Docena | 2 | 15.00 | 30.00 |
| Documentos | - | 1 | 20.00 | 20.00 |
| Servicios profesionales (Aseo) | Servicio | 1 | 200.00 | 200.00 |
| Proyector Multimedia | Alquiler | 2 | 60.00 | 120.00 |
| Refrigerios y otros | - | 1 | 0.00 | 0.00 |
| | | | **SUBTOTAL** | 480.00 |
| | | | **IMPREVISTOS (10%)** | 48.00 |
| | | | **TOTAL** | 528.00 |

## 6. ALCANCE

Este plan aplica a:
- Administradores del sistema (rol Admin)
- Auxiliares operativos (rol Auxiliar)
- Usuarios clientes finales (rol Cliente)

El alcance incluye:
- Procesos de autenticación y acceso
- Gestión de catálogo, productos, categorías y subcategorías
- Administración de usuarios
- Gestión de pedidos y control de estados
- Uso del carrito y proceso de checkout
- Gestión de facturas y reportes
- Moderación de comentarios
- Buenas prácticas de seguridad y operación

## 7. PÚBLICO OBJETIVO

- Administradores del sistema: personas responsables de la gestión integral de la plataforma.
- Auxiliares operativos: personal que apoya en la gestión de inventario, pedidos, facturas y moderación.
- Clientes: usuarios finales que compran productos a través de la plataforma.

## 8. OBJETIVOS DE CAPACITACIÓN

1. Familiarizar a los usuarios con la plataforma GAVAT y su estructura funcional.
2. Enseñar el uso correcto de las funcionalidades según cada rol.
3. Garantizar el manejo seguro de credenciales y la protección de datos.
4. Reducir errores operativos y aumentar la eficiencia en la gestión de pedidos y productos.
5. Preparar a los participantes para resolver problemas básicos y utilizar la documentación del sistema.

## 9. CONTENIDOS DE CAPACITACIÓN

### Módulo 1: Introducción al sistema GAVAT
- Visión general del proyecto.
- Arquitectura general: frontend, backend, base de datos.
- Roles y permisos: Administrador, Auxiliar, Cliente.
- Requerimientos básicos del sistema.

### Módulo 2: Autenticación y acceso
- Registro de usuario (para clientes).
- Inicio de sesión y token JWT.
- Cierre de sesión seguro.
- Control de acceso por roles.

### Módulo 3: Gestión de catálogo
- Navegación del catálogo público.
- Filtrado y búsqueda de productos.
- Detalle de producto: imágenes, stock, descripción.

### Módulo 4: Gestión de categorías y subcategorías (Admin/Auxiliar)
- Crear, editar y activar/desactivar categorías.
- Crear, editar y activar/desactivar subcategorías.
- Restricciones de eliminación y dependencias.

### Módulo 5: Gestión de productos (Admin/Auxiliar)
- Crear productos con nombre, descripción, precio, stock, categoría y subcategoría.
- Editar productos existentes.
- Subir y actualizar imágenes.
- Activar/desactivar productos.
- Eliminar productos (solo Admin).

### Módulo 6: Gestión de usuarios (Admin)
- Listar usuarios.
- Crear nuevos usuarios y asignar roles.
- Editar datos de usuario.
- Activar/desactivar cuentas.
- Eliminar usuarios con control de integridad.

### Módulo 7: Gestión de pedidos
- Visualización y seguimiento de pedidos.
- Cambiar estados de pedido: pendiente, pagado, en_proceso, enviado, entregado, cancelado.
- Consulta de detalles de pedidos y facturación.
- Control de trazabilidad.

### Módulo 8: Carrito de compras y checkout (Cliente)
- Agregar productos al carrito.
- Editar cantidades y eliminar ítems.
- Sincronización del carrito local al iniciar sesión.
- Proceso de checkout y creación de pedido.

### Módulo 9: Comentarios y moderación
- Uso de comentarios de producto (Cliente).
- Moderación de comentarios en backend (Admin/Auxiliar).
- Control de visibilidad y eliminación de comentarios (Admin).

### Módulo 10: Facturas y reportes
- Consulta de facturas emitidas.
- Descarga de facturas en PDF.
- Anulación de facturas (según políticas del sistema).
- Uso de reportes de ventas y pedidos.

### Módulo 11: Seguridad y buenas prácticas
- Manejo seguro de credenciales.
- Uso adecuado del rol asignado.
- Respaldo de datos y usos permitidos.
- Comunicación de incidentes.

## 10. METODOLOGÍA

- Sesiones teóricas cortas para explicar procesos y roles.
- Ejercicios prácticos en el sistema real o ambiente de pruebas.
- Demostraciones guiadas con casos de uso típicos.
- Resolución de dudas en cada módulo.
- Uso de ejemplos reales de la plataforma.

## 11. MATERIALES Y RECURSOS

- Documentación del sistema GAVAT (manuales de usuario, administrador y auxiliar).
- Acceso al ambiente de pruebas del frontend y backend.
- Computador con navegador web.
- Guía de pasos rápidos para cada rol.
- Planilla de seguimiento de entrenamiento.

## 12. CRONOGRAMA SUGERIDO

| Sesión | Duración | Contenido |
|--------|----------|-----------|
| Sesión 1 | 2 horas | Introducción, autenticación, roles, catálogo público |
| Sesión 2 | 2 horas | Gestión de categorías, subcategorías y productos |
| Sesión 3 | 2 horas | Gestión de usuarios y pedidos (Admin/Auxiliar) |
| Sesión 4 | 2 horas | Carrito, checkout y pedidos cliente |
| Sesión 5 | 2 horas | Comentarios, facturas, seguridad y evaluación |

## 13. EVALUACIÓN

- Prueba práctica de uso por rol.
- Ejecución de casos de uso definidos en cada sesión.
- Verificación de que el participante puede:
  - Iniciar y cerrar sesión correctamente.
  - Gestionar productos y categorías según su rol.
  - Procesar pedidos y facturas.
  - Usar el carrito y finalizar compras.
- Revisión de un formulario de retroalimentación.

## 14. RESPONSABLES

- Responsable de capacitación: Analista de Software.
- Líder de proyecto: Coordinador de GAVAT.
- Soporte técnico: Equipo de desarrollo backend/frontend.

## 15. OBSERVACIONES

- El plan está basado en el estado actual del código y los módulos documentados.
- Si se incorporan nuevas funcionalidades, el plan deberá actualizarse.
- Se recomienda mantener el documento accesible en el repositorio de `DOCUMENTOS`.
