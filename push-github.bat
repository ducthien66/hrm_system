@echo off
title HRM Enterprise - Push to GitHub
cd /d "%~dp0"

echo ===================================================
echo     DONG BO MA NGUON LEN GITHUB CUA BAN
echo ===================================================
echo.

set /p REPO_URL="Nhap link GitHub repository cua ban (vi du: https://github.com/username/hrm-system.git): "

if "%REPO_URL%"=="" (
    echo [LOI] Ban chua nhap link repository!
    pause
    exit /b 1
)

echo.
echo [1/3] Cau hinh nhanh chinh (main)...
git branch -M main

echo [2/3] Ket noi remote origin...
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo [3/3] Dang day toan bo ma nguon len GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo  [THANH CONG] Ma nguon da duoc day len GitHub!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo  [HUONG DAN] Neu GitHub yeu cau dang nhap, cua so dang nhap GitHub se hien len hoac ban nhap Personal Access Token (PAT).
    echo ===================================================
)

echo.
pause
