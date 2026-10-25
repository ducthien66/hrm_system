import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu (Seeding database)...');

  // 1. Tạo các vai trò chuẩn (Roles)
  const roleSuperAdmin = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {},
    create: {
      code: 'SUPER_ADMIN',
      name: 'Quản trị viên tối cao',
      description: 'Toàn quyền kiểm soát và vận hành hệ thống',
    },
  });

  const roleHRManager = await prisma.role.upsert({
    where: { code: 'HR_MANAGER' },
    update: {},
    create: {
      code: 'HR_MANAGER',
      name: 'Trưởng phòng Nhân sự',
      description: 'Quản lý toàn bộ hồ sơ nhân sự, hợp đồng, tuyển dụng và đào tạo',
    },
  });

  const roleAccountant = await prisma.role.upsert({
    where: { code: 'ACCOUNTANT' },
    update: {},
    create: {
      code: 'ACCOUNTANT',
      name: 'Kế toán Tiền lương',
      description: 'Quản lý cấu trúc lương, chấm công, tính lương và chốt bảng lương',
    },
  });

  const roleDeptManager = await prisma.role.upsert({
    where: { code: 'DEPT_MANAGER' },
    update: {},
    create: {
      code: 'DEPT_MANAGER',
      name: 'Trưởng phòng Ban',
      description: 'Quản lý nhân viên thuộc phòng ban, phê duyệt đơn nghỉ phép và đánh giá KPI',
    },
  });

  const roleEmployee = await prisma.role.upsert({
    where: { code: 'EMPLOYEE' },
    update: {},
    create: {
      code: 'EMPLOYEE',
      name: 'Nhân viên',
      description: 'Xem thông tin cá nhân, check-in chấm công, gửi đơn xin phép và xem phiếu lương',
    },
  });

  // 2. Tạo phòng ban (Departments)
  const deptIT = await prisma.department.upsert({
    where: { code: 'IT' },
    update: {},
    create: {
      code: 'IT',
      name: 'Phòng Kỹ thuật & Công nghệ',
      description: 'Nghiên cứu và phát triển các sản phẩm phần mềm công nghệ',
    },
  });

  const deptHR = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: {
      code: 'HR',
      name: 'Phòng Nhân sự & Hành chính',
      description: 'Quản trị nhân tài, chế độ phúc lợi và truyền thông nội bộ',
    },
  });

  const deptFinance = await prisma.department.upsert({
    where: { code: 'ACC' },
    update: {},
    create: {
      code: 'ACC',
      name: 'Phòng Kế toán - Tài chính',
      description: 'Quản lý thu chi ngân sách, kiểm toán và chi trả tiền lương',
    },
  });

  const deptSales = await prisma.department.upsert({
    where: { code: 'SALES' },
    update: {},
    create: {
      code: 'SALES',
      name: 'Phòng Kinh doanh & Tiếp thị',
      description: 'Phát triển thị trường, bán hàng và dịch vụ khách hàng',
    },
  });

  // 3. Tạo chức danh công việc (Positions)
  const posTechLead = await prisma.position.upsert({
    where: { code: 'TECH_LEAD' },
    update: {},
    create: {
      code: 'TECH_LEAD',
      name: 'Trưởng nhóm Kỹ thuật (Technical Lead)',
      gradeLevel: 4,
      departmentId: deptIT.id,
      description: 'Quản trị kiến trúc hệ thống và dẫn dắt đội ngũ kỹ thuật',
    },
  });

  const posSeniorDev = await prisma.position.upsert({
    where: { code: 'SR_DEV' },
    update: {},
    create: {
      code: 'SR_DEV',
      name: 'Kỹ sư phần mềm Senior',
      gradeLevel: 3,
      departmentId: deptIT.id,
      description: 'Phát triển các module phức tạp và tối ưu hiệu năng',
    },
  });

  const posHRLead = await prisma.position.upsert({
    where: { code: 'HR_LEAD' },
    update: {},
    create: {
      code: 'HR_LEAD',
      name: 'Trưởng phòng Nhân sự',
      gradeLevel: 4,
      departmentId: deptHR.id,
      description: 'Hoạch định chiến lược nguồn nhân lực doanh nghiệp',
    },
  });

  const posChiefAccountant = await prisma.position.upsert({
    where: { code: 'CHIEF_ACC' },
    update: {},
    create: {
      code: 'CHIEF_ACC',
      name: 'Kế toán trưởng',
      gradeLevel: 4,
      departmentId: deptFinance.id,
      description: 'Chịu trách nhiệm toàn bộ công tác tài chính kế toán',
    },
  });

  // 4. Tạo ca làm việc (Work Shifts)
  const shiftStandard = await prisma.workShift.upsert({
    where: { id: 'shift-standard' },
    update: {},
    create: {
      id: 'shift-standard',
      name: 'Ca hành chính chuẩn',
      startTime: '08:30',
      endTime: '17:30',
      breakMinutes: 60,
      workHours: 8.0,
      isNightShift: false,
    },
  });

  // 5. Tạo loại nghỉ phép (Leave Types)
  const leaveAnnual = await prisma.leaveType.upsert({
    where: { code: 'ANNUAL' },
    update: {},
    create: {
      code: 'ANNUAL',
      name: 'Nghỉ phép năm',
      daysPerYear: 12,
      isPaid: true,
      description: 'Nghỉ phép năm theo quy định Bộ luật Lao động (12 ngày/năm)',
    },
  });

  const leaveSick = await prisma.leaveType.upsert({
    where: { code: 'SICK' },
    update: {},
    create: {
      code: 'SICK',
      name: 'Nghỉ ốm đau hưởng BHXH',
      daysPerYear: 30,
      isPaid: false,
      description: 'Chế độ ốm đau do cơ quan Bảo hiểm xã hội chi trả',
    },
  });

  const leaveUnpaid = await prisma.leaveType.upsert({
    where: { code: 'UNPAID' },
    update: {},
    create: {
      code: 'UNPAID',
      name: 'Nghỉ không hưởng lương',
      daysPerYear: 15,
      isPaid: false,
      description: 'Nghỉ việc riêng không hưởng lương theo thỏa thuận',
    },
  });

  // 6. Tạo nhân viên và người dùng (Password chuẩn: Password@123)
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // 6.1. Super Admin
  const empAdmin = await prisma.employee.upsert({
    where: { employeeCode: 'EMP001' },
    update: {},
    create: {
      employeeCode: 'EMP001',
      firstName: 'Nguyễn Văn',
      lastName: 'An',
      fullName: 'Nguyễn Văn An',
      email: 'admin@hrm.com',
      phone: '0912345678',
      gender: 'MALE',
      dateOfBirth: new Date('1988-05-15'),
      address: 'Quận Cầu Giấy, Hà Nội',
      departmentId: deptIT.id,
      positionId: posTechLead.id,
      status: 'ACTIVE',
      joinDate: new Date('2021-01-01'),
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@hrm.com' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'admin@hrm.com',
      passwordHash: hashedPassword,
      roleId: roleSuperAdmin.id,
      employeeId: empAdmin.id,
      isActive: true,
    },
  });

  // 6.2. HR Manager
  const empHR = await prisma.employee.upsert({
    where: { employeeCode: 'EMP002' },
    update: {},
    create: {
      employeeCode: 'EMP002',
      firstName: 'Trần Thị',
      lastName: 'Bích',
      fullName: 'Trần Thị Bích',
      email: 'hr.manager@hrm.com',
      phone: '0987654321',
      gender: 'FEMALE',
      dateOfBirth: new Date('1992-08-20'),
      address: 'Quận Đống Đa, Hà Nội',
      departmentId: deptHR.id,
      positionId: posHRLead.id,
      status: 'ACTIVE',
      joinDate: new Date('2022-03-15'),
    },
  });

  await prisma.user.upsert({
    where: { email: 'hr.manager@hrm.com' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'hr.manager@hrm.com',
      passwordHash: hashedPassword,
      roleId: roleHRManager.id,
      employeeId: empHR.id,
      isActive: true,
    },
  });

  // 6.3. Accountant
  const empAccountant = await prisma.employee.upsert({
    where: { employeeCode: 'EMP003' },
    update: {},
    create: {
      employeeCode: 'EMP003',
      firstName: 'Lê Hoàng',
      lastName: 'Cường',
      fullName: 'Lê Hoàng Cường',
      email: 'accountant@hrm.com',
      phone: '0933221100',
      gender: 'MALE',
      dateOfBirth: new Date('1990-11-10'),
      address: 'Quận Thanh Xuân, Hà Nội',
      departmentId: deptFinance.id,
      positionId: posChiefAccountant.id,
      status: 'ACTIVE',
      joinDate: new Date('2022-06-01'),
    },
  });

  await prisma.user.upsert({
    where: { email: 'accountant@hrm.com' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'accountant@hrm.com',
      passwordHash: hashedPassword,
      roleId: roleAccountant.id,
      employeeId: empAccountant.id,
      isActive: true,
    },
  });

  // 6.4. Department Manager (IT Lead)
  const empDeptManager = await prisma.employee.upsert({
    where: { employeeCode: 'EMP004' },
    update: {},
    create: {
      employeeCode: 'EMP004',
      firstName: 'Phạm Minh',
      lastName: 'Đức',
      fullName: 'Phạm Minh Đức',
      email: 'dept.manager@hrm.com',
      phone: '0944556677',
      gender: 'MALE',
      dateOfBirth: new Date('1989-02-28'),
      address: 'Quận Nam Từ Liêm, Hà Nội',
      departmentId: deptIT.id,
      positionId: posTechLead.id,
      status: 'ACTIVE',
      joinDate: new Date('2022-01-15'),
    },
  });

  await prisma.user.upsert({
    where: { email: 'dept.manager@hrm.com' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'dept.manager@hrm.com',
      passwordHash: hashedPassword,
      roleId: roleDeptManager.id,
      employeeId: empDeptManager.id,
      isActive: true,
    },
  });

  // 6.5. Regular Employee
  const empRegular = await prisma.employee.upsert({
    where: { employeeCode: 'EMP005' },
    update: {},
    create: {
      employeeCode: 'EMP005',
      firstName: 'Vũ Thu',
      lastName: 'Hương',
      fullName: 'Vũ Thu Hương',
      email: 'employee@hrm.com',
      phone: '0977889900',
      gender: 'FEMALE',
      dateOfBirth: new Date('1996-09-12'),
      address: 'Quận Ba Đình, Hà Nội',
      departmentId: deptIT.id,
      positionId: posSeniorDev.id,
      managerId: empDeptManager.id,
      status: 'ACTIVE',
      joinDate: new Date('2023-04-01'),
    },
  });

  await prisma.user.upsert({
    where: { email: 'employee@hrm.com' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'employee@hrm.com',
      passwordHash: hashedPassword,
      roleId: roleEmployee.id,
      employeeId: empRegular.id,
      isActive: true,
    },
  });

  // Gán Trưởng phòng cho các phòng ban
  await prisma.department.update({
    where: { id: deptIT.id },
    data: { managerId: empDeptManager.id },
  });
  await prisma.department.update({
    where: { id: deptHR.id },
    data: { managerId: empHR.id },
  });
  await prisma.department.update({
    where: { id: deptFinance.id },
    data: { managerId: empAccountant.id },
  });

  // 7. Tạo hợp đồng lao động mẫu
  const allEmployees = [empAdmin, empHR, empAccountant, empDeptManager, empRegular];
  const salaries = [35000000, 28000000, 25000000, 32000000, 22000000];

  for (let i = 0; i < allEmployees.length; i++) {
    const emp = allEmployees[i];
    await prisma.employmentContract.upsert({
      where: { contractNumber: `HDLD-${emp.employeeCode}` },
      update: {},
      create: {
        contractNumber: `HDLD-${emp.employeeCode}`,
        employeeId: emp.id,
        contractType: 'DEFINITE_1Y',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        baseSalary: salaries[i],
        status: 'ACTIVE',
        notes: 'Hợp đồng lao động chính thức 12 tháng ký năm 2026',
      },
    });

    // Cấu trúc lương
    await prisma.employeeSalaryStructure.upsert({
      where: { employeeId: emp.id },
      update: {},
      create: {
        employeeId: emp.id,
        baseSalary: salaries[i],
        lunchAllowance: 730000,
        transportAllowance: 500000,
        phoneAllowance: 300000,
        otherAllowances: 1000000,
        insuranceSalary: salaries[i] * 0.7, // Mức đóng BHXH
        dependentsCount: i === 0 ? 1 : 0,
      },
    });

    // Hạn mức nghỉ phép
    await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: emp.id,
          leaveTypeId: leaveAnnual.id,
          year: 2026,
        },
      },
      update: {},
      create: {
        employeeId: emp.id,
        leaveTypeId: leaveAnnual.id,
        year: 2026,
        entitledDays: 12.0,
        usedDays: 1.0,
        pendingDays: 0.0,
        remainingDays: 11.0,
      },
    });
  }

  // 8. Tạo dữ liệu chấm công mẫu cho tháng hiện tại
  const today = new Date();
  today.setHours(8, 25, 0, 0);

  for (const emp of allEmployees) {
    const checkIn = new Date(today);
    const checkOut = new Date(today);
    checkOut.setHours(17, 35, 0, 0);

    const workDate = new Date(today);
    workDate.setHours(0, 0, 0, 0);

    await prisma.attendanceRecord.upsert({
      where: {
        employeeId_workDate: {
          employeeId: emp.id,
          workDate: workDate,
        },
      },
      update: {},
      create: {
        employeeId: emp.id,
        shiftId: shiftStandard.id,
        workDate: workDate,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        workHours: 8.0,
        otHours: 0.0,
        lateMinutes: 0,
        earlyMinutes: 0,
        status: 'NORMAL',
        notes: 'Chấm công đúng giờ',
      },
    });
  }

  // 9. Tạo tài sản mẫu
  await prisma.asset.upsert({
    where: { code: 'AST-LAP-001' },
    update: {},
    create: {
      code: 'AST-LAP-001',
      name: 'MacBook Pro 16 inch M3 Pro',
      category: 'LAPTOP',
      serialNumber: 'C02G41KSMD6R',
      purchaseDate: new Date('2024-01-10'),
      cost: 55000000,
      status: 'ASSIGNED',
    },
  });

  await prisma.asset.upsert({
    where: { code: 'AST-LAP-002' },
    update: {},
    create: {
      code: 'AST-LAP-002',
      name: 'Dell XPS 15 9530 i9 32GB',
      category: 'LAPTOP',
      serialNumber: 'DLXPS-887412',
      purchaseDate: new Date('2024-03-15'),
      cost: 42000000,
      status: 'AVAILABLE',
    },
  });

  // 10. Cấu hình hệ thống (System Settings)
  const settings = [
    { key: 'COMPANY_NAME', value: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ HR TECH VIỆT NAM', category: 'GENERAL', description: 'Tên pháp nhân công ty' },
    { key: 'COMPANY_TAX_CODE', value: '0109988776', category: 'GENERAL', description: 'Mã số thuế doanh nghiệp' },
    { key: 'STANDARD_WORK_HOURS', value: '8', category: 'ATTENDANCE', description: 'Số giờ làm việc tiêu chuẩn 1 ngày' },
    { key: 'LATE_GRACE_PERIOD_MINUTES', value: '15', category: 'ATTENDANCE', description: 'Số phút cho phép đi muộn không bị tính phạt' },
    { key: 'TAX_PERSONAL_DEDUCTION', value: '11000000', category: 'PAYROLL', description: 'Mức giảm trừ gia cảnh bản thân (VND)' },
    { key: 'TAX_DEPENDENT_DEDUCTION', value: '4400000', category: 'PAYROLL', description: 'Mức giảm trừ mỗi người phụ thuộc (VND)' },
    { key: 'INSURANCE_RATE_SOCIAL', value: '0.08', category: 'PAYROLL', description: 'Tỷ lệ BHXH người lao động đóng (8%)' },
    { key: 'INSURANCE_RATE_HEALTH', value: '0.015', category: 'PAYROLL', description: 'Tỷ lệ BHYT người lao động đóng (1.5%)' },
    { key: 'INSURANCE_RATE_UNEMPLOYMENT', value: '0.01', category: 'PAYROLL', description: 'Tỷ lệ BHTN người lao động đóng (1%)' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('✅ Đã khởi tạo thành công dữ liệu mẫu cho hệ thống HRM!');
  console.log('📋 Danh sách tài khoản thử nghiệm (Mật khẩu: Password@123):');
  console.log('   1. Super Admin: admin@hrm.com');
  console.log('   2. HR Manager: hr.manager@hrm.com');
  console.log('   3. Accountant: accountant@hrm.com');
  console.log('   4. Dept Manager: dept.manager@hrm.com');
  console.log('   5. Employee: employee@hrm.com');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
