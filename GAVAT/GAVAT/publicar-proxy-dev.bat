@echo off
title GAVAT - Gateway Proxy (Puerto 80)
cls
echo ========================================================
echo   INICIANDO GAVAT EN MODO DESARROLLO CON PROXY PUERTO 80
echo   IP Publica: http://100.48.122.211
echo ========================================================
echo.

echo [1/3] Abriendo puerto 80 en Firewall de Windows...
powershell -Command "New-NetFirewallRule -DisplayName 'GAVAT E-Commerce HTTP (Puerto 80)' -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue"

echo.
echo [2/3] Iniciando Backend y Frontend en segundo plano...
start "GAVAT Backend (Puerto 5000)" cmd /k "cd /d %~dp0backend && npm start"
start "GAVAT Frontend (Puerto 3000)" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo [3/3] Iniciando Proxy Gateway en Puerto 80...
timeout /t 5 >nul
cd /d "%~dp0"
node proxy-gateway.js
pause
