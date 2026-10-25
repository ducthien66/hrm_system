@echo off
chcp 65001 > nul
title HRM ENTERPRISE SYSTEM - DỪNG HỆ THỐNG
echo =====================================================================
echo         ĐANG DỪNG CÁC DỊCH VỤ CỦA HỆ THỐNG HRM ENTERPRISE...
echo =====================================================================
echo.

taskkill /fi "WINDOWTITLE eq HRM Backend API (Port 5000)*" /f /t >nul 2>nul
taskkill /fi "WINDOWTITLE eq HRM Frontend UI (Port 5173)*" /f /t >nul 2>nul

echo Đã dừng các cửa sổ dịch vụ Backend và Frontend.
echo.
pause
