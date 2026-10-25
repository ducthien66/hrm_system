@echo off
title HRM Docker Services Launcher
cd /d "%~dp0"

echo ===================================================
echo     KHOI DONG DOCKER STACK - HRM ENTERPRISE
echo     (Backend, Frontend, Prometheus, Grafana)
echo ===================================================
echo.

docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo ===================================================
    echo  [CHU Y] Vui long dam bao Docker Desktop da duoc bat
    echo  va dang chay tren thanh Taskbar!
    echo ===================================================
    echo.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo  CAC DICH VU DOCKER DA SAN SANG:
echo ===================================================
docker compose ps
echo.
echo  * Frontend HRM Web    : http://localhost:5173
echo  * Backend API         : http://localhost:5000
echo  * Grafana Dashboard   : http://localhost:3000 (admin / admin)
echo  * Prometheus UI       : http://localhost:9090
echo.
pause
