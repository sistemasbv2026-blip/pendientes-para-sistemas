@echo off
title Enlace Publico: Pendiente para Sistemas
chcp 65001 >nul
cls
echo ===================================================================
echo        ENLACE PUBLICO DE INTERNET: PENDIENTE PARA SISTEMAS
echo ===================================================================
echo.
echo  Conectando tu enlace personalizado...
echo.
echo  Tu enlace para enviar a los departamentos es:
echo  =============================================================
echo     👉 https://pendientes-para-sistemas.loca.lt
echo  =============================================================
echo.
echo  Este enlace funciona desde cualquier red, celular o casa.
echo  No cierres esta ventana mientras quieras que el link siga activo.
echo ===================================================================
echo.

npx --yes localtunnel --port 3000 --subdomain pendientes-para-sistemas

pause
