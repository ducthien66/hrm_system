@echo off
title HRM Monitoring Launcher (Prometheus & Grafana)
cd /d "%~dp0"

echo ===================================================
echo     KHOI DONG HE THONG MONITORING DOCKER
echo     (Prometheus & Grafana)
echo ===================================================
echo.

docker compose up -d prometheus grafana
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
echo  HE THONG GIAM SAT DA KHOI DONG THANH CONG:
echo ===================================================
echo  * Grafana Dashboard : http://localhost:3000 (admin / admin)
echo  * Prometheus UI     : http://localhost:9090
echo ===================================================
echo.
pause
