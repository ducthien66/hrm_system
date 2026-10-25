@echo off
title HRM Docker Services Launcher
cd /d "%~dp0"

echo ===================================================
echo     KHOI DONG CAC DICH VU DOCKER HRM ENTERPRISE
echo     (PostgreSQL 16, Prometheus, Grafana)
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
echo  * Grafana Dashboard : http://localhost:3000 (admin / admin)
echo  * Prometheus UI     : http://localhost:9090
echo  * Database Postgres : Cổng 5432
echo.
pause
