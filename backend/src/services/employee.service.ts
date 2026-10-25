import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';

export class EmployeeService {
  static async getEmployees(params: {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    positionId?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (params.departmentId) {
      where.departmentId = params.departmentId;
    }

    if (params.positionId) {
      where.positionId = params.positionId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { employeeCode: { contains: q } },
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          department: true,
          position: true,
          manager: {
            select: { id: true, fullName: true, employeeCode: true },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        manager: {
          select: { id: true, fullName: true, employeeCode: true, email: true },
        },
        contracts: {
          orderBy: { createdAt: 'desc' },
        },
        salaryStructure: true,
        leaveBalances: {
          include: { leaveType: true },
        },
      },
    });

    if (!employee || employee.deletedAt) {
      throw new AppError('Không tìm thấy thông tin nhân viên', 404);
    }

    return employee;
  }

  static async createEmployee(data: any, authorUserId?: string) {
    // Kiểm tra trùng lặp email
    const existing = await prisma.employee.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new AppError('Email công việc đã được sử dụng bởi nhân viên khác', 409);
    }

    // Tự sinh mã nhân viên EMPxxx
    const count = await prisma.employee.count();
    const employeeCode = `EMP${String(count + 1).padStart(3, '0')}`;
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

    const employee = await prisma.$transaction(async (tx) => {
      const newEmp = await tx.employee.create({
        data: {
          employeeCode,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          fullName,
          email: data.email.trim().toLowerCase(),
          phone: data.phone,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          address: data.address,
          departmentId: data.departmentId || null,
          positionId: data.positionId || null,
          managerId: data.managerId || null,
          joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
          status: data.status || 'ACTIVE',
          avatarUrl: data.avatarUrl,
          emergencyContact: data.emergencyContact,
        },
        include: {
          department: true,
          position: true,
        },
      });

      // Tạo cấu trúc lương mặc định
      await tx.employeeSalaryStructure.create({
        data: {
          employeeId: newEmp.id,
          baseSalary: 10000000,
          lunchAllowance: 730000,
          transportAllowance: 500000,
          phoneAllowance: 300000,
          otherAllowances: 0,
          insuranceSalary: 7000000,
          dependentsCount: 0,
        },
      });

      // Khởi tạo hạn mức phép năm hiện tại (12 ngày)
      const annualLeaveType = await tx.leaveType.findUnique({
        where: { code: 'ANNUAL' },
      });

      if (annualLeaveType) {
        await tx.leaveBalance.create({
          data: {
            employeeId: newEmp.id,
            leaveTypeId: annualLeaveType.id,
            year: new Date().getFullYear(),
            entitledDays: 12.0,
            usedDays: 0.0,
            pendingDays: 0.0,
            remainingDays: 12.0,
          },
        });
      }

      // Ghi Audit log
      if (authorUserId) {
        await tx.auditLog.create({
          data: {
            userId: authorUserId,
            action: 'CREATE',
            entityType: 'EMPLOYEE',
            entityId: newEmp.id,
            newValues: JSON.stringify(newEmp),
          },
        });
      }

      return newEmp;
    });

    return employee;
  }

  static async updateEmployee(id: string, data: any, authorUserId?: string) {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new AppError('Nhân viên không tồn tại', 404);
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.employee.findUnique({ where: { email: data.email } });
      if (emailTaken) {
        throw new AppError('Email đã được sử dụng bởi nhân viên khác', 409);
      }
    }

    const fullName =
      data.firstName || data.lastName
        ? `${data.firstName || existing.firstName} ${data.lastName || existing.lastName}`.trim()
        : existing.fullName;

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.employee.update({
        where: { id },
        data: {
          ...data,
          fullName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
        },
        include: {
          department: true,
          position: true,
        },
      });

      if (authorUserId) {
        await tx.auditLog.create({
          data: {
            userId: authorUserId,
            action: 'UPDATE',
            entityType: 'EMPLOYEE',
            entityId: id,
            oldValues: JSON.stringify(existing),
            newValues: JSON.stringify(res),
          },
        });
      }

      return res;
    });

    return updated;
  }

  static async archiveEmployee(id: string, authorUserId?: string) {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Không tìm thấy nhân viên', 404);
    }

    // Soft delete & set status RESIGNED
    const archived = await prisma.employee.update({
      where: { id },
      data: {
        status: 'RESIGNED',
        deletedAt: new Date(),
      },
    });

    // Vô hiệu hóa tài khoản liên kết (nếu có)
    await prisma.user.updateMany({
      where: { employeeId: id },
      data: { isActive: false },
    });

    if (authorUserId) {
      await prisma.auditLog.create({
        data: {
          userId: authorUserId,
          action: 'DELETE',
          entityType: 'EMPLOYEE',
          entityId: id,
          oldValues: JSON.stringify(existing),
        },
      });
    }

    return archived;
  }
}
