import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('HRM API Test Suite', () => {
  let adminToken = '';
  let employeeToken = '';

  it('1. GET /api/health - Endpoint kiểm tra sức khỏe hệ thống', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.timezone).toBe('Asia/Ho_Chi_Minh');
  });

  it('2. POST /api/v1/auth/login - Đăng nhập tài khoản Super Admin thành công', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@hrm.com', password: 'Password@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@hrm.com');
    expect(res.body.data.user.role.code).toBe('SUPER_ADMIN');

    adminToken = res.body.data.accessToken;
  });

  it('3. POST /api/v1/auth/login - Đăng nhập tài khoản Employee thành công', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee@hrm.com', password: 'Password@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role.code).toBe('EMPLOYEE');

    employeeToken = res.body.data.accessToken;
  });

  it('4. POST /api/v1/auth/login - Đăng nhập mật khẩu sai trả về 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@hrm.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('5. GET /api/v1/employees - Từ chối khi không có JWT Token (401)', async () => {
    const res = await request(app).get('/api/v1/employees');
    expect(res.status).toBe(401);
  });

  it('6. GET /api/v1/employees - Lấy danh sách nhân sự thành công có phân trang', async () => {
    const res = await request(app)
      .get('/api/v1/employees?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.total).toBeGreaterThanOrEqual(5);
  });

  it('7. GET /api/v1/departments - Lấy danh sách phòng ban và headcount', async () => {
    const res = await request(app)
      .get('/api/v1/departments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  it('8. POST /api/v1/employees - Nhân viên thường (EMPLOYEE) không có quyền tạo nhân sự (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.unauthorized@hrm.com',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('9. GET /api/v1/reports/dashboard - Lấy dữ liệu tổng quan Dashboard thời gian thực', async () => {
    const res = await request(app)
      .get('/api/v1/reports/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cards.totalEmployees).toBeGreaterThanOrEqual(5);
    expect(res.body.data.charts.departmentDistribution).toBeDefined();
  });

  it('10. POST /api/v1/payroll/calculate - Kế toán/Admin tính lương thành công', async () => {
    // 1. Lấy danh sách kỳ lương hoặc tạo kỳ mới
    let periodsRes = await request(app)
      .get('/api/v1/payroll/periods')
      .set('Authorization', `Bearer ${adminToken}`);

    let periodId = periodsRes.body.data[0]?.id;

    if (!periodId) {
      const createPeriodRes = await request(app)
        .post('/api/v1/payroll/periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Kỳ lương Tháng 10/2026',
          month: 10,
          year: 2026,
          startDate: '2026-10-01',
          endDate: '2026-10-31',
        });
      periodId = createPeriodRes.body.data.id;
    }

    // 2. Kích hoạt tính lương
    const calcRes = await request(app)
      .post('/api/v1/payroll/calculate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ periodId });

    expect(calcRes.status).toBe(200);
    expect(calcRes.body.success).toBe(true);
    expect(calcRes.body.data.totalGross).toBeGreaterThan(0);
    expect(calcRes.body.data.totalNet).toBeGreaterThan(0);
    expect(calcRes.body.data.payslips.length).toBeGreaterThanOrEqual(5);
  });
});
