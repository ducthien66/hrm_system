# HỆ THỐNG QUẢN LÝ NHÂN SỰ DOANH NGHIỆP (HRM SYSTEM)

Hệ thống Quản lý Nhân sự (Human Resource Management - HRM) được xây dựng theo kiến trúc phân tầng chuẩn Enterprise, giải quyết toàn diện 100% nghiệp vụ vòng đời nhân sự (Employee Lifecycle).

- **Múi giờ chuẩn:** `Asia/Ho_Chi_Minh` (GMT+7)
- **Định dạng ngày tháng:** `dd/MM/yyyy`
- **Tiền tệ:** Việt Nam Đồng (VND)
- **Quy định pháp lý:** Áo dụng Bộ luật Lao động Việt Nam, mức giảm trừ gia cảnh thuế TNCN hiện hành (Bản thân 11.000.000 ₫/tháng, Người phụ thuộc 4.400.000 ₫/tháng), mức trích nộp bảo hiểm bắt buộc (BHXH 8%, BHYT 1.5%, BHTN 1%).

---

## 1. CÔNG NGHỆ SỬ DỤNG

### Frontend
- **Framework & Core:** React 18, TypeScript, Vite.
- **Styling & UI:** Tailwind CSS, Lucide React (Icons).
- **Routing & State:** React Router v6, Context API (`AuthContext`).
- **Data & Charts:** Axios (JWT Interceptor, Token auto-attach), Recharts (Biểu đồ phân bổ phòng ban & xu hướng nhân sự).
- **Validation:** Zod.

### Backend
- **Platform & Server:** Node.js v20+, Express.js (TypeScript ES Modules).
- **Database & ORM:** Prisma ORM, hỗ trợ SQLite (phát triển/kiểm thử cục bộ không cần cài đặt ngoài) và PostgreSQL 16 (triển khai production qua Docker Compose).
- **Authentication & Security:** JWT (Access Token + Refresh Token), bcryptjs (Băm mật khẩu 10 vòng salt), Rate Limiting (chống brute-force), Helmet & CORS Whitelisting.
- **Architecture:** Controller - Service - Repository/Prisma Layer, Centralized Error Handling, Immutable Audit Logging.

### Testing & DevOps
- **Kiểm thử tự động:** Vitest, Supertest (10/10 test cases passed).
- **Giám sát & Quan sát hệ thống (Observability):** Prometheus & Grafana (Dashboard giám sát độ trễ API, HTTP Status Codes, Memory Heap & Event Loop Lag).
- **Containerization:** Dockerfile (Multi-stage build cho Frontend & Backend) & `docker-compose.yml` (PostgreSQL 16, Prometheus, Grafana).

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```
hrm-system/
├── docker-compose.yml         # Triển khai PostgreSQL 16 và container dịch vụ
├── package.json               # Root scripts điều khiển toàn dự án
├── README.md                  # Hướng dẫn chi tiết vận hành
├── backend/                   # Ứng dụng Backend API (Node.js + TS + Prisma)
│   ├── src/
│   │   ├── config/            # Biến môi trường, kết nối Database
│   │   ├── constants/         # Roles, Status enums
│   │   ├── controllers/       # Điều phối HTTP Request/Response
│   │   ├── middlewares/       # Auth (JWT), RBAC Gate, Validate, Error
│   │   ├── routes/            # REST API Routes (12 modules)
│   │   ├── services/          # Xử lý nghiệp vụ lõi (Lương, BHXH, Nghỉ phép)
│   │   ├── utils/             # Format tiền VND, ngày dd/MM/yyyy, JWT
│   │   ├── validators/        # Zod Schemas xác thực đầu vào
│   │   ├── app.ts             # Khởi tạo Express & Middleware
│   │   └── server.ts          # Lắng nghe HTTP server
│   ├── prisma/
│   │   ├── schema.prisma      # Sơ đồ 34 bảng quan hệ dữ liệu
│   │   ├── dev.db             # SQLite database thực tế
│   │   └── seed.ts            # Dữ liệu mẫu (Nhân viên, phòng ban, lương)
│   ├── tests/
│   │   └── api.test.ts        # Bộ kiểm thử tự động (Vitest + Supertest)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/                  # Ứng dụng Frontend SPA (React + Vite + Tailwind)
    ├── src/
    │   ├── components/        # Sidebar (19 menus), Header, Modals, Pagination
    │   ├── context/           # AuthContext (quản lý đăng nhập & phân quyền)
    │   ├── pages/             # Dashboard, Employees, Attendance, Payroll, Leave...
    │   ├── routes/            # AppRoutes (Protected routes & RBAC guard)
    │   ├── services/          # Axios instance
    │   ├── types/             # TypeScript types đồng bộ backend
    │   ├── utils/             # formatVND, formatDateVN
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 3. TÀI KHOẢN ĐĂNG NHẬP THỬ NGHIỆM

Hệ thống đã được nạp dữ liệu mẫu thực tế. Mật khẩu chung cho tất cả tài khoản là: **`Password@123`**

| Vai trò | Email đăng nhập | Mô tả quyền hạn |
|---|---|---|
| **Super Admin** | `admin@hrm.com` | Toàn quyền quản trị hệ thống, phân quyền, xem audit log, cài đặt |
| **HR Manager** | `hr.manager@hrm.com` | Quản lý hồ sơ nhân viên, phòng ban, hợp đồng, tuyển dụng, duyệt đơn phép |
| **Accountant** | `accountant@hrm.com` | Quản lý kỳ lương, tính lương tự động, chốt bảng lương, xem quỹ lương |
| **Dept Manager** | `dept.manager@hrm.com` | Quản lý nhân viên thuộc phòng ban, phê duyệt đơn nghỉ phép của cấp dưới |
| **Employee** | `employee@hrm.com` | Xem hồ sơ cá nhân, check-in chấm công, gửi đơn xin phép, xem phiếu lương |

> **Mẹo:** Trên giao diện đăng nhập (`/login`), có sẵn các nút bấm 1-click để tự động điền tài khoản tương ứng, giúp kiểm thử nhanh chóng và thuận tiện.

---

## 4. HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY HỆ THỐNG

### Cách 1: Khởi chạy 1-Click trên Windows (Tiện lợi nhất)
Chỉ cần nhấp đúp chuột vào file:
- **`run.bat`**: Tự động khởi động cả Backend API (`http://localhost:5000`) và Frontend UI (`http://localhost:5173`) trong một cửa sổ và tự động mở trình duyệt sau 5 giây.
- **`start-monitoring.bat`**: Khởi chạy nhanh bộ đôi giám sát Prometheus (`http://localhost:9090`) & Grafana (`http://localhost:3000`).
- **`stop-hrm.bat`**: Dừng nhanh toàn bộ các dịch vụ HRM đang chạy.

---

### Cách 2: Khởi chạy thủ công bằng dòng lệnh

#### Bước 1: Khởi động Backend API
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

Server Backend sẽ lắng nghe tại: **`http://localhost:5000`**  
Endpoint kiểm tra sức khỏe: **`http://localhost:5000/api/health`**

#### Bước 2: Khởi động Frontend UI
Mở một cửa sổ dòng lệnh thứ hai:
```bash
cd frontend
npm install
npm run dev
```

Giao diện ứng dụng sẽ chạy tại: **`http://localhost:5173`**

---

### Cách 3: Triển khai hoàn chỉnh bằng Docker Compose
Đảm bảo **Docker Desktop** đã được bật trên máy tính của bạn:

```bash
# Di chuyển vào đúng thư mục dự án:
cd C:\Users\MTLA\.gemini\antigravity\scratch\hrm-system

# Hoặc trên Git Bash:
cd ~/.gemini/antigravity/scratch/hrm-system

# Khởi động toàn bộ stack dịch vụ:
docker compose up -d
```
Hoặc nhấp đúp chuột vào file [`start-docker.bat`](file:///C:/Users/MTLA/.gemini/antigravity/scratch/hrm-system/start-docker.bat).

---

## 5. HƯỚNG DẪN CHẠY BỘ KIỂM THỬ TỰ ĐỘNG

Bộ kiểm thử được viết bằng **Vitest** và **Supertest**, kiểm tra từ luồng xác thực, phân quyền RBAC, kiểm tra dữ liệu đầu vào, đến luồng tính toán lương tự động:

```bash
cd backend
npm run test
```

**Kết quả kiểm thử:**
- `10/10 test cases passed` (100% thành công)
- Bao gồm: Sức khỏe hệ thống, Đăng nhập Super Admin, Đăng nhập Employee, Kiểm tra sai mật khẩu (401), Chặn truy cập không có token (401), Lấy danh sách nhân viên có phân trang, Lấy cơ cấu phòng ban, Chặn nhân viên thường tạo hồ sơ (403), Dữ liệu Dashboard thời gian thực, Tính toán bảng lương tự động.

---

## 6. QUY TRÌNH NGHIỆP VỤ NỔI BẬT

### 6.1. Luồng Chấm công (Time & Attendance)
1. Nhân viên truy cập menu **Chấm công**.
2. Nhấn nút **Check-in (Vào ca)**: Hệ thống ghi nhận thời điểm thực tế, đối soát với giờ ca chuẩn (08:30). Nếu đi muộn sau 15 phút ân hạn, tự động gắn cờ `LATE` và số phút đi muộn.
3. Nhấn nút **Check-out (Tan ca)**: Hệ thống kiểm tra điều kiện tiên quyết (phải có Check-in trước), tính toán tổng số giờ làm việc thực tế (tự động trừ 60 phút nghỉ trưa) và ghi nhận về sớm hoặc làm thêm giờ (OT).

### 6.2. Luồng Nghỉ phép (Leave Management)
1. Nhân viên kiểm tra hạn mức ngày phép (mặc định 12 ngày phép năm theo quy định).
2. Tạo đơn xin nghỉ phép (chọn loại phép, ngày bắt đầu, ngày kết thúc, lý do). Hệ thống tự động kiểm tra số dư và kiểm tra trùng lặp ngày nghỉ.
3. Quản lý trực tiếp hoặc HR duyệt đơn:
   - Nếu **Chấp thuận**: Hệ thống thực hiện Database Transaction để trừ số dư phép khả dụng, ghi nhận lịch sử biến động số dư (`LeaveBalanceHistory`), cập nhật trạng thái đơn thành `APPROVED` và tạo thông báo cho nhân viên.
   - Nếu **Từ chối**: Bắt buộc nhập lý do từ chối để nhân viên nắm rõ.

### 6.3. Luồng Tiền lương & Thuế TNCN (Payroll & Tax)
1. Kế toán mở kỳ lương mới (ví dụ: Tháng 10/2026).
2. Nhấn nút **Tính lương tự động**: Hệ thống quét toàn bộ nhân viên đang làm việc, kéo số ngày công thực tế từ dữ liệu chấm công.
3. Tính toán:
   - Thu nhập gộp = Lương theo ngày công thực tế + Phụ cấp (ăn trưa, đi lại, điện thoại).
   - Khấu trừ bảo hiểm: BHXH 8%, BHYT 1.5%, BHTN 1%.
   - Giảm trừ gia cảnh: 11.000.000 ₫ (bản thân) + 4.400.000 ₫/người phụ thuộc.
   - Thuế TNCN: Áp dụng biểu thuế lũy tiến từng phần 7 bậc theo Luật Thuế Thu nhập cá nhân Việt Nam.
   - Lương thực nhận (Net) = Thu nhập gộp - Khấu trừ bảo hiểm - Thuế TNCN.
4. Kế toán kiểm tra và nhấn **Khóa sổ** để bảo vệ dữ liệu chống can thiệp.
5. Nhân viên đăng nhập xem đúng phiếu lương chi tiết của chính mình.

---

## 7. GIÁM SÁT HỆ THỐNG VỚI PROMETHEUS & GRAFANA

Dự án đã tích hợp sẵn hệ thống quan sát toàn diện (**Enterprise Observability**):
- **Metrics Endpoint:** `http://localhost:5000/metrics` (Chuẩn định dạng Prometheus).
- **Prometheus Server:** `http://localhost:9090` (Tự động cào dữ liệu định kỳ mỗi 5 giây).
- **Grafana Dashboard:** `http://localhost:3000` (Tài khoản: `admin` / `admin`).

Dashboard HRM được nạp sẵn tự động (**Auto-provisioned**), bao gồm các bảng đo lường:
1. **Lưu lượng truy cập API (Traffic):** Tần suất request thời gian thực theo HTTP Status code (`200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Error`).
2. **Độ trễ API (Latency):** Thời gian phản hồi trung bình, bách phân vị `p50` và `p95`.
3. **Tài nguyên Node.js (Resources):** Phân bổ bộ nhớ Heap Used, Heap Total, RSS Memory và độ trễ Event Loop.
4. **Phiên làm việc (Active Handles):** Giám sát số socket và timer đang hoạt động.

---

## 8. TRIỂN KHAI PRODUCTION VỚI DOCKER COMPOSE

Dự án cung cấp sẵn cấu hình Docker Compose với PostgreSQL 16:

```bash
# Khởi động dịch vụ Database PostgreSQL 16 và toàn bộ hệ thống
docker compose up -d --build

# Kiểm tra trạng thái các container
docker compose ps
```

### Sao lưu và phục hồi cơ sở dữ liệu PostgreSQL
```bash
# Sao lưu cơ sở dữ liệu:
docker exec -t hrm_postgres pg_dump -U hrm_user hrm_db > backup_hrm_$(date +%Y%m%d).sql

# Phục hồi cơ sở dữ liệu từ file backup:
cat backup_hrm_20261025.sql | docker exec -i hrm_postgres psql -U hrm_user -d hrm_db
```
