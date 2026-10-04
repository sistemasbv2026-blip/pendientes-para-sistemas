@echo off
title Subir Proyecto a GitHub
chcp 65001 >nul
cls
echo ===================================================================
echo               SUBIENDO PROYECTO A TU GITHUB
echo ===================================================================
echo.
echo Repositorio: https://github.com/sistemasbv2026-blip/pendientes-para-sistemas.git
echo.

git branch -M main
git push -u origin main

echo.
echo ===================================================================
echo ¡Listo! Si no hubo errores, ya puedes ir a Render y seleccionarlo.
echo ===================================================================
pause
