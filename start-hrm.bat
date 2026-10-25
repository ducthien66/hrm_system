@echo off
chcp 65001 > nul
title HRM ENTERPRISE SYSTEM - KHỞI ĐỘNG HỆ THỐNG
color 0B

echo =====================================================================
echo           HỆ THỐNG QUẢN LÝ NHÂN SỰ DOANH NGHIỆP (HRM ENTERPRISE)
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/4] Kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy Node.js trên máy tính!
    echo Vui lòng cài đặt Node.js tại: https://nodejs.org
    pause
    exit /b 1
)

echo [2/4] Khởi động Backend API (Port 5000)...
if not exist "backend\node_modules" (
    echo      Đang cài đặt dependencies cho Backend...
    cd /d "%~dp0backend"
    call npm install
    cd /d "%~dp0"
)

if not exist "backend\dev.db" (
    echo      Khởi tạo cơ sở dữ liệu và nạp dữ liệu mẫu...
    cd /d "%~dp0backend"
    call npx prisma db push
    call npm run prisma:seed
    cd /d "%~dp0"
)

start "HRM Backend API (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo [3/4] Khởi động Frontend Web (Port 5173)...
if not exist "frontend\node_modules" (
    echo      Đang cài đặt dependencies cho Frontend...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
)

start "HRM Frontend UI (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [4/4] Đang mở trình duyệt web...
timeout /t 4 /nobreak > nul
start http://localhost:5173

echo.
echo =====================================================================
echo      KHỞI ĐỘNG THÀNH CÔNG HỆ THỐNG HRM ENTERPRISE!
echo =====================================================================
echo  - Frontend Web UI : http://localhost:5173
echo  - Backend API     : http://localhost:5000/api/v1
echo  - Health Check    : http://localhost:5000/api/health
echo.
echo  DANH SÁCH TÀI KHOẢN THỬ NGHIỆM (Mật khẩu: Password@123):
echo   1. Super Admin     : admin@hrm.com
echo   2. HR Manager      : hr.manager@hrm.com
echo   3. Accountant      : accountant@hrm.com
echo   4. Dept Manager    : dept.manager@hrm.com
echo   5. Nhân viên       : employee@hrm.com
echo.
echo  (Mẹo: Giao diện đăng nhập có sẵn nút bấm 1-click tự động điền)
echo  (Lưu ý: Vui lòng giữ 2 cửa sổ Backend và Frontend mở khi sử dụng)
echo =====================================================================
echo.
pause
