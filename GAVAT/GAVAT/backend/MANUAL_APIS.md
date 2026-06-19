# 📘 MANUAL DE APIs - PLATAFORMA GAVAT
## Guía Completa para Postman y Consumidores de API

**Versión**: 2.0  
**Última actualización**: Abril 2026  
**Estado**: ✅ Completo y Actualizado

---

## 📋 TABLA DE CONTENIDOS
1. [Configuración Inicial](#configuración-inicial)
2. [Credenciales del Sistema](#credenciales-del-sistema)
3. [Autenticación](#autenticación)
4. [Rutas Públicas](#rutas-públicas)
5. [Rutas de Cliente](#rutas-de-cliente)
6. [Rutas de Comentarios](#rutas-de-comentarios)
7. [Rutas de Administrador](#rutas-de-administrador)
8. [Códigos de Respuesta](#códigos-de-respuesta)
9. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## ⚙️ CONFIGURACIÓN INICIAL

### Base URL
```
http://localhost:5000
```

### Headers Globales (Rutas Protegidas)
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

### Variables de Postman Recomendadas
```json
{
  "base_url": "http://localhost:5000",
  "admin_token": "(token del admin)",
  "cliente_token": "(token del cliente)",
  "admin_id": "1",
  "cliente_id": "2"
}
```

### Instalación de Dependencias
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Iniciar Servidor Backend
```bash
cd backend
npm start
# Servidor corriendo en http://localhost:5000
```

---

## 🔑 CREDENCIALES DEL SISTEMA

### 👨‍💼 ADMINISTRADOR
```
Email: admin@gavat.com
Password: admin1234
Rol: administrador
Permisos: Acceso total
```

### 🛍️ CLIENTES DE PRUEBA
```
Cliente 1:
  Email: cliente1@gavat.com
  Password: cliente1

Cliente 2:
  Email: cliente2@gavat.com
  Password: cliente2

Cliente 3:
  Email: cliente3@gavat.com
  Password: cliente3

Clientes 4 y 5 también disponibles en el seeder
```

---

## 🔐 AUTENTICACIÓN

### 1.1 Registrar Nuevo Usuario

**POST** `/api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "nombre": "Carlos",
  "email": "carlos@example.com",
  "password": "password123",
  "telefono": "3001234567",
  "direccion": "Carrera 50 #25-30, Bogotá"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "usuario": {
      "id": 12,
      "nombre": "Carlos",
      "email": "carlos@example.com",
      "rol": "cliente",
      "telefono": "3001234567",
      "activo": true
    }
  }
}
```

**Errores Posibles**:
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "statusCode": 400
}
```

---

### 1.2 Iniciar Sesión (Login)

**POST** `/api/auth/login`

**Body**:
```json
{
  "email": "admin@gavat.com",
  "password": "admin1234"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "id": 1,
      "nombre": "Admin",
      "email": "admin@gavat.com",
      "rol": "administrador",
      "activo": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoiYWRtaW5pc3RyYWRvciIsImlhdCI6MTcxMzE5NDI4OCwiZXhwIjoxNzEzMjgwNjg4fQ.xyz..."
  }
}
```

---

### 1.3 Obtener Mi Perfil

**GET** `/api/auth/me`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Admin",
    "email": "admin@gavat.com",
    "rol": "administrador",
    "telefono": "3005551234",
    "direccion": "Carrera 50 #25-30",
    "activo": true,
    "createdAt": "2026-02-04"
  }
}
```

---

### 1.4 Actualizar Mi Perfil

**PUT** `/api/auth/me`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Body** (todos los campos son opcionales):
```json
{
  "nombre": "Carlos Updated",
  "telefono": "3109876543",
  "direccion": "Calle nueva 100"
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "usuario": {
      "id": 2,
      "nombre": "Carlos Updated",
      "email": "carlos@example.com",
      "telefono": "3109876543",
      "direccion": "Calle nueva 100"
    }
  }
}
```

---

### 1.5 Cambiar Contraseña

**POST** `/api/auth/cambiar-contraseña`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Body**:
```json
{
  "passwordActual": "password123",
  "passwordNueva": "newpassword456",
  "passwordConfirm": "newpassword456"
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

## 📦 RUTAS PÚBLICAS (Sin Autenticación)

### 2.1 Obtener Todas las Categorías

**GET** `/api/catalogo/categorias`

**Query Params** (Opcional):
```
?pagina=1&limite=10
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": 1,
        "nombre": "Ventanas",
        "descripcion": "Ventanas de aluminio y vidrio",
        "activo": true
      },
      {
        "id": 2,
        "nombre": "Puertas",
        "descripcion": "Puertas de diferentes materiales",
        "activo": true
      }
    ],
    "total": 5,
    "paginaActual": 1,
    "totalPaginas": 1
  }
}
```

---

### 2.2 Obtener Productos del Catálogo

**GET** `/api/catalogo/productos`

**Query Params** (Opcional):
```
?categoriaId=1&subcategoriaId=5&pagina=1&limite=10&busqueda=ventana
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": 1,
        "nombre": "Ventana Corrediza de Aluminio",
        "descripcion": "Ventana de aluminio anodizado",
        "precio": 450000,
        "stock": 15,
        "imagen": "http://localhost:5000/uploads/producto-1.jpg",
        "activo": true,
        "categoria": {
          "id": 1,
          "nombre": "Ventanas"
        },
        "calificacionPromedio": 4.5,
        "totalComentarios": 12
      }
    ],
    "total": 25,
    "paginaActual": 1,
    "totalPaginas": 3
  }
}
```

---

### 2.3 Obtener Detalle de un Producto

**GET** `/api/catalogo/productos/:productoId`

**Ejemplo**: `GET /api/catalogo/productos/1`

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Ventana Corrediza de Aluminio",
    "descripcion": "Ventana de aluminio anodizado de alta calidad",
    "precio": 450000,
    "stock": 15,
    "imagen": "http://localhost:5000/uploads/producto-1.jpg",
    "activo": true,
    "categoria": {
      "id": 1,
      "nombre": "Ventanas"
    },
    "subcategoria": {
      "id": 3,
      "nombre": "Corredizas"
    },
    "calificacionPromedio": 4.5,
    "totalComentarios": 12
  }
}
```

---

## 🛒 RUTAS DE CLIENTE

### 3.1 Obtener Mi Carrito

**GET** `/api/cliente/carrito`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "carrito": [
      {
        "id": 1,
        "productoId": 1,
        "nombre": "Ventana Corrediza",
        "cantidad": 2,
        "precio": 450000,
        "subtotal": 900000,
        "imagen": "http://localhost:5000/uploads/producto-1.jpg"
      }
    ],
    "total": 900000,
    "cantidadItems": 1
  }
}
```

---

### 3.2 Agregar Producto al Carrito

**POST** `/api/cliente/carrito`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Body**:
```json
{
  "productoId": 1,
  "cantidad": 2
}
```

**Respuesta (201)**:
```json
{
  "success": true,
  "message": "Producto agregado al carrito",
  "data": {
    "id": 5,
    "productoId": 1,
    "cantidad": 2,
    "precio": 450000,
    "subtotal": 900000
  }
}
```

---

### 3.3 Actualizar Cantidad en Carrito

**PUT** `/api/cliente/carrito/:carritoId`

**Body**:
```json
{
  "cantidad": 5
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Producto actualizado",
  "data": {
    "id": 1,
    "cantidad": 5,
    "subtotal": 2250000
  }
}
```

---

### 3.4 Eliminar Producto del Carrito

**DELETE** `/api/cliente/carrito/:carritoId`

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Producto eliminado del carrito"
}
```

---

### 3.5 Crear Pedido (Checkout)

**POST** `/api/cliente/pedidos`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Body**:
```json
{
  "direccionEnvio": "Carrera 50 #25-30, Bogotá",
  "telefono": "3001234567",
  "metodoPago": "efectivo",
  "notasAdicionales": "Llamar antes de entregar"
}
```

**Métodos de Pago Disponibles**:
- `efectivo` (Pago contra entrega)
- `tarjeta` (Tarjeta de crédito/débito)
- `transferencia` (Transferencia bancaria)

**Respuesta (201)**:
```json
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "id": 15,
    "usuarioId": 2,
    "estado": "pendiente",
    "direccionEnvio": "Carrera 50 #25-30, Bogotá",
    "metodoPago": "efectivo",
    "total": 900000,
    "detalles": [
      {
        "id": 25,
        "productoId": 1,
        "nombre": "Ventana Corrediza",
        "cantidad": 2,
        "precio": 450000,
        "subtotal": 900000
      }
    ],
    "createdAt": "2026-04-15T10:30:00Z"
  }
}
```

---

### 3.6 Obtener Mis Pedidos

**GET** `/api/cliente/pedidos`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Query Params**:
```
?pagina=1&limite=10&estado=pendiente
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "pedidos": [
      {
        "id": 15,
        "estado": "pendiente",
        "total": 900000,
        "cantidadProductos": 1,
        "fecha": "2026-04-15",
        "metodoPago": "efectivo"
      }
    ],
    "total": 1,
    "paginaActual": 1,
    "totalPaginas": 1
  }
}
```

---

### 3.7 Obtener Detalle de un Pedido

**GET** `/api/cliente/pedidos/:pedidoId`

**Ejemplo**: `GET /api/cliente/pedidos/15`

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "id": 15,
    "usuarioId": 2,
    "estado": "pendiente",
    "direccionEnvio": "Carrera 50 #25-30, Bogotá",
    "telefono": "3001234567",
    "metodoPago": "efectivo",
    "notasAdicionales": "Llamar antes de entregar",
    "total": 900000,
    "detalles": [
      {
        "id": 25,
        "productoId": 1,
        "nombre": "Ventana Corrediza",
        "cantidad": 2,
        "precioUnitario": 450000,
        "subtotal": 900000
      }
    ],
    "createdAt": "2026-04-15T10:30:00Z"
  }
}
```

---

### 3.8 Cancelar Pedido

**PUT** `/api/cliente/pedidos/:pedidoId/cancelar`

**Body**:
```json
{
  "motivo": "Cambié de opinión"
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Pedido cancelado exitosamente",
  "data": {
    "id": 15,
    "estado": "cancelado",
    "motivoCancelacion": "Cambié de opinión"
  }
}
```

---

## 💬 RUTAS DE COMENTARIOS Y RESEÑAS

### 4.1 Crear Comentario (Cliente)

**POST** `/api/cliente/comentarios`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Body**:
```json
{
  "productoId": 1,
  "comentario": "Excelente producto, muy buena calidad. Entrega rápida.",
  "calificacion": 5
}
```

**Restricciones**:
- El usuario DEBE haber comprado el producto previamente
- `calificacion` debe ser un entero entre 1 y 5
- El comentario debe tener entre 1 y 1000 caracteres

**Respuesta (201)**:
```json
{
  "success": true,
  "message": "Comentario creado exitosamente.",
  "data": {
    "id": 8,
    "productoId": 1,
    "comentario": "Excelente producto, muy buena calidad. Entrega rápida.",
    "calificacion": 5,
    "estado": "visible",
    "fecha": "2026-04-15T10:30:00Z"
  }
}
```

**Errores Posibles**:
```json
{
  "success": false,
  "message": "Solo puedes comentar productos que hayas comprado",
  "statusCode": 400
}
```

---

### 4.2 Obtener Comentarios de un Producto (Público)

**GET** `/api/catalogo/productos/:productoId/comentarios`

**Query Params**:
```
?pagina=1&limite=10
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "producto": {
      "id": 1,
      "nombre": "Ventana Corrediza de Aluminio",
      "calificacionPromedio": 4.5,
      "totalComentarios": 12
    },
    "comentarios": [
      {
        "id": 8,
        "autor": "Carlos",
        "comentario": "Excelente producto, muy buena calidad.",
        "calificacion": 5,
        "estado": "visible",
        "fecha": "2026-04-15T10:30:00Z"
      }
    ],
    "paginacion": {
      "paginaActual": 1,
      "totalPaginas": 2,
      "totalComentarios": 12,
      "comentariosPorPagina": 10
    }
  }
}
```

---

### 4.3 Editar Comentario Propio (Cliente)

**PUT** `/api/cliente/comentarios/:comentarioId`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Body**:
```json
{
  "comentario": "Nuevo texto del comentario.",
  "calificacion": 4
}
```

**Restricciones**:
- Solo el autor del comentario puede editarlo
- El comentario debe tener entre 1 y 1000 caracteres
- La calificación debe ser un entero entre 1 y 5

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Comentario actualizado correctamente",
  "data": {
    "id": 8,
    "comentario": "Nuevo texto del comentario.",
    "calificacion": 4,
    "estado": "visible"
  }
}
```

---

### 4.4 Eliminar Comentario Propio (Cliente)

**DELETE** `/api/cliente/comentarios/:comentarioId`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Comentario eliminado correctamente",
  "data": {
    "id": 8,
    "productoId": 1
  }
}
```

---

## 👨‍💼 RUTAS DE ADMINISTRADOR

### 5.1 Obtener Comentarios por Usuario

**GET** `/api/admin/comentarios/usuario/:usuarioId`

**Headers**:
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Descripción**:
Busca todos los comentarios creados por un usuario específico.

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": 2,
      "nombre": "Carlos",
      "email": "carlos@example.com"
    },
    "comentarios": [
      {
        "id": 5,
        "productoId": 1,
        "producto": "Ventana Corrediza",
        "comentario": "Buen producto pero tardó en llegar",
        "calificacion": 4,
        "estado": "visible",
        "fecha": "2026-04-14T15:20:00Z"
      }
    ]
  }
}
```

---

### 5.2 Modificar Visibilidad de Comentario

**PUT** `/api/admin/comentarios/:comentarioId/moderar`

**Headers**:
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Body**:
```json
{
  "estado": "no_visible"
}
```

**Alternativa**:
```json
{
  "visible": false
}
```

**Estados Válidos**:
- `visible`
- `no_visible`

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Comentario no_visible",
  "data": {
    "id": 5,
    "estado": "no_visible"
  }
}
```

---

### 5.3 Alternar Visibilidad de Comentario

**PATCH** `/api/admin/comentarios/:comentarioId/toggle`

**Headers**:
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Descripción**:
Cambia el estado de visibilidad de `visible` a `no_visible` o viceversa.

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Comentario visible",
  "data": {
    "id": 5,
    "estado": "visible"
  }
}
```

---

### 5.4 Eliminar Comentario

**DELETE** `/api/admin/comentarios/:comentarioId`

**Headers**:
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Comentario eliminado exitosamente",
  "data": {
    "id": 5,
    "productoId": 1
  }
}
```

---

### 5.4 Obtener Todas las Categorías

**GET** `/api/admin/categorias`

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": 1,
        "nombre": "Ventanas",
        "descripcion": "Productos de ventanas",
        "activo": true
      }
    ],
    "total": 5
  }
}
```

---

### 5.5 Crear Nueva Categoría

**POST** `/api/admin/categorias`

**Body**:
```json
{
  "nombre": "Cerramientos",
  "descripcion": "Sistemas de cerramiento para fachadas"
}
```

**Respuesta (201)**:
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": 6,
    "nombre": "Cerramientos",
    "descripcion": "Sistemas de cerramiento para fachadas",
    "activo": true
  }
}
```

---

### 5.6 Obtener Todos los Productos

**GET** `/api/admin/productos`

**Query Params**:
```
?pagina=1&limite=20&activo=true
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": 1,
        "nombre": "Ventana Corrediza",
        "precio": 450000,
        "stock": 15,
        "activo": true,
        "categoria": "Ventanas"
      }
    ],
    "total": 25
  }
}
```

---

### 5.7 Crear Nuevo Producto

**POST** `/api/admin/productos`

**Headers**:
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: multipart/form-data
```

**Body** (form-data):
```
nombre: "Puerta Pivotante"
descripcion: "Puerta de vidrio pivotante para oficinas"
precio: 850000
stock: 10
categoriaId: 2
subcategoriaId: 4
imagen: <archivo.jpg>
```

**Respuesta (201)**:
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": 26,
    "nombre": "Puerta Pivotante",
    "precio": 850000,
    "stock": 10,
    "imagen": "http://localhost:5000/uploads/producto-26.jpg",
    "activo": true
  }
}
```

---

### 5.8 Obtener Todos los Pedidos

**GET** `/api/admin/pedidos`

**Query Params**:
```
?pagina=1&limite=20&estado=pendiente
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "pedidos": [
      {
        "id": 15,
        "cliente": "Carlos",
        "cantidadProductos": 2,
        "total": 900000,
        "estado": "pendiente",
        "fecha": "2026-04-15"
      }
    ],
    "total": 45,
    "paginaActual": 1
  }
}
```

---

### 5.9 Actualizar Estado de Pedido

**PUT** `/api/admin/pedidos/:pedidoId/estado`

**Body**:
```json
{
  "estado": "en_camino"
}
```

**Estados Válidos**:
- `pendiente`: Esperando procesamiento
- `procesado`: En preparación
- `en_camino`: En ruta de envío
- `entregado`: Entregado al cliente
- `cancelado`: Pedido cancelado

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Estado de pedido actualizado",
  "data": {
    "id": 15,
    "estado": "en_camino",
    "actualizadoEn": "2026-04-15T12:00:00Z"
  }
}
```

---

## ✅ CÓDIGOS DE RESPUESTA HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| **200** | OK | Petición exitosa, se devuelven datos |
| **201** | Created | Recurso creado exitosamente |
| **204** | No Content | Eliminación exitosa (sin contenido) |
| **400** | Bad Request | Datos inválidos o incompletos |
| **401** | Unauthorized | No autorizado / Token inválido o expirado |
| **403** | Forbidden | Acceso denegado (rol insuficiente) |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto (ej: email duplicado) |
| **500** | Server Error | Error interno del servidor |

---

## 🔍 EJEMPLO PRÁCTICO COMPLETO: Flujo de Compra

### Paso 1: Registrarse
```bash
POST /api/auth/register
Body: { nombre, email, password, telefono, direccion }
Response: { usuario, token }
```

### Paso 2: Ver Productos
```bash
GET /api/catalogo/productos?categoriaId=1
Response: { productos[], total }
```

### Paso 3: Agregar al Carrito
```bash
POST /api/cliente/carrito
Headers: { Authorization: Bearer <token> }
Body: { productoId: 1, cantidad: 2 }
Response: { item agregado }
```

### Paso 4: Crear Pedido
```bash
POST /api/cliente/pedidos
Headers: { Authorization: Bearer <token> }
Body: { direccionEnvio, telefono, metodoPago }
Response: { pedido creado, id: 15 }
```

### Paso 5: Comentar Producto (opcional)
```bash
POST /api/cliente/comentarios
Headers: { Authorization: Bearer <token> }
Body: { productoId: 1, comentario, calificacion: 5 }
Response: { comentario creado, estado: visible }
```

### Paso 6 (Admin): Buscar Comentarios de un Usuario
```bash
GET /api/admin/comentarios/usuario/2
Headers: { Authorization: Bearer <admin_token> }
Response: { comentarios del usuario }
```

### Paso 7 (Admin): Cambiar Visibilidad de un Comentario
```bash
PUT /api/admin/comentarios/5/moderar
Headers: { Authorization: Bearer <admin_token> }
Body: { estado: "no_visible" }
Response: { comentario no_visible }
```

### Paso 8 (Admin): Alternar Visibilidad
```bash
PATCH /api/admin/comentarios/5/toggle
Headers: { Authorization: Bearer <admin_token> }
Response: { comentario visible }
```

---

## 🚀 VARIABLES DE ENTORNO (.env)

```env
# Puerto del servidor
PORT=5000

# Credenciales MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=GAVAT

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=24h

# Node Environment
NODE_ENV=development

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000
```

---

## 📞 SOPORTE Y NOTAS

- **Todas las fechas** se retornan en formato ISO 8601: `2026-04-15T10:30:00Z`
- **Los precios** se manejan en pesos colombianos (COP)
- **Tokens JWT** expiran en 24 horas
- **Las imágenes** se guardan en `backend/uploads/`
- **Paginación** comienza en 1 (no en 0)

---

**Última actualización**: Abril 15, 2026
**Versión del Backend**: 2.0
**Autor**: GAVAT Development Team
