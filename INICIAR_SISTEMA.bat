@echo off
title Sistema de Detección de Necesidades de Sistemas (TI)
chcp 65001 >nul
cls
echo ===================================================================
echo     SISTEMA DE DETECCIÓN DE NECESIDADES DE SISTEMAS (TI)
echo ===================================================================
echo.
echo  Iniciando el servidor...
echo.
echo  - Formulario para Departamentos:  http://localhost:3000
echo  - Panel de Control TI (Admin):    http://localhost:3000/admin.html
echo.
echo  (El panel se abrirá automáticamente en tu navegador...)
echo ===================================================================
echo.

:: Esperar 1 segundo y abrir el navegador en el Panel TI
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/admin.html"

:: Iniciar servidor Node.js
node server.js

pause
