@echo off
title HRM Enterprise - System Runner
cd /d "%~dp0"

echo ===================================================
echo     HE THONG QUAN LY NHAN SU (HRM ENTERPRISE)
echo ===================================================
echo.
echo  * Frontend Web : http://localhost:5173
echo  * Backend API  : http://localhost:5000
echo.
echo  Tai khoan thu nghiem:
echo   - Super Admin : admin@hrm.com
echo   - HR Manager  : hr.manager@hrm.com
echo   - Accountant  : accountant@hrm.com
echo   - Nhan vien   : employee@hrm.com
echo   [Mat khau     : Password@123]
echo.
echo  Dang khoi dong he thong...
echo  Trinh duyet se tu dong mo sau 5 giay.
echo ===================================================
echo.

start "" cmd /c "ping 127.0.0.1 -n 6 >nul && start http://localhost:5173"

call npm.cmd run dev

if %errorlevel% neq 0 (
    echo.
    echo [THONG BAO] Tien trinh da dung lai hoac gap su co.
    pause
)
