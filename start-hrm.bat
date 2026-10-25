@echo off
title HRM Enterprise Launcher
cd /d "%~dp0"

echo ===================================================
echo     KHOI DONG HE THONG QUAN LY NHAN SU HRM
echo ===================================================
echo.

echo [1/3] Khoi dong Backend API tai port 5000...
start "HRM Backend API" cmd /k "%~dp0backend\run.bat"

echo [2/3] Khoi dong Frontend UI tai port 5173...
start "HRM Frontend UI" cmd /k "%~dp0frontend\run.bat"

echo [3/3] Dang mo trinh duyet web http://localhost:5173 ...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173

echo.
echo ===================================================
echo     HE THONG HRM ENTERPRISE DA DUOC KHOI DONG!
echo ===================================================
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:5000
echo.
echo  Danh sach tai khoan thu nghiem:
echo   - Super Admin  : admin@hrm.com
echo   - HR Manager   : hr.manager@hrm.com
echo   - Accountant   : accountant@hrm.com
echo   - Dept Manager : dept.manager@hrm.com
echo   - Employee     : employee@hrm.com
echo   [Mat khau chung: Password@123]
echo.
echo  Luu y: Vui long khong tat 2 cua so Backend va Frontend.
echo ===================================================
echo.
pause
