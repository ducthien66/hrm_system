@echo off
title HRM Enterprise - Stop System
cd /d "%~dp0"
echo ===================================================
echo     DANG DUNG CAC DICH VU HRM ENTERPRISE...
echo ===================================================
echo.

docker compose down >nul 2>nul
taskkill /fi "WINDOWTITLE eq HRM Backend API*" /f /t >nul 2>nul
taskkill /fi "WINDOWTITLE eq HRM Frontend UI*" /f /t >nul 2>nul
taskkill /fi "WINDOWTITLE eq HRM Enterprise*" /f /t >nul 2>nul

echo Da dung tat ca cac dich vu HRM (Local & Docker).
echo.
pause
