@echo off
title GAVAT - Publicar en Produccion (Puerto 80)
cls
echo ========================================================
echo   PUBLICANDO GAVAT E-COMMERCE EN PUERTO 80 (PRODUCCION)
echo   IP Publica: http://100.48.122.211
echo ========================================================
echo.

echo [1/4] Abriendo puerto 80 en Firewall de Windows...
powershell -Command "New-NetFirewallRule -DisplayName 'GAVAT E-Commerce HTTP (Puerto 80)' -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue"

echo.
echo [2/4] Configurando variables de entorno...
cd /d "%~dp0backend"
set PORT=80
set NODE_ENV=production
set FRONTEND_URL=http://localhost,http://100.48.122.211,http://172.31.76.213

echo.
echo [3/4] Compilando Frontend (React)...
cd /d "%~dp0frontend"
call npm run build

echo.
echo [4/4] Iniciando Servidor Unificado en Puerto 80...
cd /d "%~dp0backend"
node server.js
pause
