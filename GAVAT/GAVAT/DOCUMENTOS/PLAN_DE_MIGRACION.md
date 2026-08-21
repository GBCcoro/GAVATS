# 📋 PLAN DE MIGRACIÓN Y DESPLIEGUE EN PRODUCCIÓN
## Sistema E-Commerce GAVAT
**Documento Técnico de Infraestructura, Despliegue y Publicación en Windows Server 2022**

---

## 📌 1. Información General y Ficha Técnica

| Parámetro | Detalle |
| :--- | :--- |
| **Sistema Operativo** | Windows Server 2022 (Datacenter Edition) |
| **Dirección IP Pública** | `100.48.122.211` |
| **Puerto Público de Acceso** | `80` (HTTP Estándar) |
| **URL de Acceso Externo** | `http://100.48.122.211/` |
| **Capa Frontend** | React (SPA) + React Router + Bootstrap |
| **Capa Backend** | Node.js + Express.js + Sequelize ORM |
| **Motor de Base de Datos** | MySQL / MariaDB (XAMPP / MySQL Service - Puerto 3306) |
| **Almacenamiento Multimedia** | Sistema de archivos local (`backend/uploads/`) |

---

## 🏗️ 2. Arquitectura de Despliegue

```mermaid
graph TD
    User["🌐 Usuario Externo / Cliente (Internet)"] -->|Puerto 80 HTTP| Firewall["🛡️ Windows Defender Firewall (Puerto 80 Inbound)"]
    
    subgraph WindowsServer["🖥️ Windows Server 2022 (IP: 100.48.122.211)"]
        Firewall --> ExpressServer["⚡ Servidor Express (Puerto 80)"]
        
        subgraph ModulosBackend["Backend Node.js"]
            ExpressServer -->|Rutas /* (Excepto /api y /uploads)| ReactBuild["📦 React SPA Build (HTML/JS/CSS)"]
            ExpressServer -->|Rutas /api/*| APIRoutes["🔌 API REST (Auth, Catálogo, Pedidos, Admin)"]
            ExpressServer -->|Rutas /uploads/*| FileStorage["📁 Carpeta de Imágenes (/uploads)"]
        end
        
        APIRoutes -->|Sequelize ORM| MySQLDB[("🗄️ MySQL Database 'gavat' (Puerto 3306)")]
    end
```

---

## ⚙️ 3. Requisitos Previos en el Servidor

Antes de iniciar la migración, asegúrese de que el servidor cuente con:
1. **Node.js**: Versión 18.x, 20.x o 24.x LTS instalada.
2. **Motor MySQL**: MySQL Server o XAMPP con el servicio MySQL iniciado en el puerto 3306.
3. **Privilegios de Administrador**: Terminal de PowerShell o CMD con permisos de Administrador para abrir reglas de Firewall.
4. **Puerto 80 Libre**: Verificar que el servicio IIS (World Wide Web Publishing Service / W3SVC) no esté ocupando el puerto 80. Si está activo y no se usa:
   ```powershell
   Stop-Service W3SVC
   Set-Service -Name W3SVC -StartupType Disabled
   ```

---

## 🚀 4. Proceso Paso a Paso de la Migración

### Paso 1: Configuración de la Base de Datos
1. Inicie el servicio de **MySQL** (desde el panel de XAMPP o los servicios de Windows).
2. Abra una terminal en la carpeta `backend/` y ejecute el inicializador de la base de datos:
   ```bash
   cd C:\Users\Administrator\Documents\GitHub\GAVATS\GAVAT\GAVAT\backend
   node config/createDatabase.js
   ```
   > Este comando creará la base de datos `gavat` con el cotejamiento `utf8mb4_unicode_ci` si no existe.

---

### Paso 2: Configuración de Variables de Entorno

#### A. Backend (`backend/.env`)
Crear o verificar el archivo `backend/.env` con la siguiente configuración:

```env
# Puerto del servidor (80 para producción directa)
PORT=80
NODE_ENV=production

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gavat
DB_SYNC_ALTER=false

# Autenticación JWT
JWT_SECRET=gavat_jwt_secret_key_2026_super_secure_production
JWT_EXPIRES_IN=7d

# Orígenes Permitidos (CORS)
FRONTEND_URL=http://localhost,http://100.48.122.211,http://172.31.76.213

# Límites de Archivos (5MB)
MAX_FILE_SIZE=5242880
```

#### B. Frontend (`frontend/.env`)
Crear o verificar el archivo `frontend/.env`:

```env
# Ruta relativa para que use el mismo host y puerto 80
REACT_APP_API_URL=/api

# Metadatos de la aplicación
REACT_APP_NAME=E-commerce GAVAT
REACT_APP_VERSION=1.0.0
```

---

### Paso 3: Configuración del Firewall de Windows Server

Abra PowerShell como **Administrador** y ejecute el siguiente comando para autorizar el tráfico entrante al puerto 80:

```powershell
New-NetFirewallRule -DisplayName "GAVAT E-Commerce HTTP (Puerto 80)" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

Para verificar que la regla fue creada con éxito:
```powershell
Get-NetFirewallRule -DisplayName "GAVAT E-Commerce HTTP (Puerto 80)" | Select-Object DisplayName, Enabled, Direction, Action
```

---

### Paso 4: Compilación del Frontend (Build de Producción)

Ejecute la compilación optimizada de React para generar los bundles estáticos minificados:

```bash
cd C:\Users\Administrator\Documents\GitHub\GAVATS\GAVAT\GAVAT\frontend
npm run build
```

Esto generará la carpeta `frontend/build/` lista para ser servida por Express.

---

### Paso 5: Publicación y Puesta en Marcha

Se han preparado dos scripts automatizados para levantar el sistema:

#### Opción A: Despliegue en Producción Unificado (Recomendada)
Ejecute el script:
```cmd
cd C:\Users\Administrator\Documents\GitHub\GAVATS\GAVAT\GAVAT
publicar-produccion.bat
```

**¿Qué hace este script?**
1. Valida y aplica la regla del Firewall en el puerto 80.
2. Establece las variables de entorno de producción.
3. Compila el frontend (`npm run build`).
4. Inicia el servidor Node.js en el puerto 80 sirviendo la API, las imágenes y el Frontend unificados.

#### Opción B: Proxy Gateway (Para Entornos de Desarrollo)
Si se desea mantener `npm start` en caliente en frontend y backend:
```cmd
cd C:\Users\Administrator\Documents\GitHub\GAVATS\GAVAT\GAVAT
publicar-proxy-dev.bat
```

---

## 🔄 5. Configuración del Servicio Persistente 24/7 (PM2)

Para garantizar que el software se mantenga en ejecución continua incluso si se cierra la sesión de Windows o se reinicia el servidor:

1. **Instalar PM2 globalmente**:
   ```bash
   npm install -g pm2
   npm install -g pm2-windows-startup
   ```

2. **Registrar el servicio de inicio en Windows**:
   ```bash
   pm2-startup install
   ```

3. **Iniciar la aplicación con PM2**:
   ```bash
   cd C:\Users\Administrator\Documents\GitHub\GAVATS\GAVAT\GAVAT\backend
   pm2 start server.js --name "gavat-ecommerce" --env NODE_ENV=production
   pm2 save
   ```

4. **Comandos de gestión**:
   - Ver estado: `pm2 status`
   - Ver logs en tiempo real: `pm2 logs gavat-ecommerce`
   - Reiniciar: `pm2 restart gavat-ecommerce`
   - Detener: `pm2 stop gavat-ecommerce`

---

## ✅ 6. Matriz de Verificación Post-Migración

| Ítem | Prueba a Realizar | Resultado Esperado | Estado |
| :---: | :--- | :--- | :---: |
| **1** | Acceso al home desde navegador externo (`http://100.48.122.211/`) | Carga del Catálogo/Home sin errores | 🟢 |
| **2** | Verificación del Health Check (`http://100.48.122.211/api/health`) | `{"success":true,"status":"healthy","database":"connected"}` | 🟢 |
| **3** | Inicio de sesión Administrador (`admin@gavat.com` / `admin123`) | Redirección a `/admin/dashboard` | 🟢 |
| **4** | Inicio de sesión Cliente (`cliente1@gavat.com` / `cliente1`) | Redirección a `/catalogo` | 🟢 |
| **5** | Visualización de imágenes de productos | Carga de archivos desde `/uploads/` | 🟢 |
| **6** | Flujo de Compra (Carrito ➔ Pedido) | Registro en BD y generación de factura PDF | 🟢 |
| **7** | Navegación directa en React Router (`/catalogo`, `/perfil`, `/login`) | Carga directa sin error 404 de Express | 🟢 |

---

## 🛡️ 7. Plan de Contingencia y Recuperación (Rollback)

### Copias de Seguridad (Backup)
1. **Base de Datos**:
   ```bash
   mysqldump -u root -p gavat > C:\Respaldos\gavat_backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%.sql
   ```
2. **Archivos Multimedia**:
   Hacer copia de la carpeta `backend/uploads/`.

### Restauración (Restore)
1. Para restaurar la base de datos:
   ```bash
   mysql -u root -p gavat < C:\Respaldos\gavat_backup_YYYYMMDD.sql
   ```
2. Reemplazar la carpeta `backend/uploads/` desde el respaldo.
3. Reiniciar el servicio con `pm2 restart gavat-ecommerce` o ejecutando `publicar-produccion.bat`.

---

## 👥 8. Cuentas de Acceso Predeterminadas (Seeders)

| Rol | Correo Electrónico | Contraseña | Panel / Acceso |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@gavat.com` | `admin123` | Panel de Administración Total |
| **Auxiliar** | `auxiliar@gavat.com` | `aux123` | Panel de Gestión Operativa |
| **Cliente** | `cliente1@gavat.com` | `cliente1` | Catálogo y Carrito de Compras |
