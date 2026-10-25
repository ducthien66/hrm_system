import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';

export class DepartmentService {
  static async getDepartments() {
    const departments = await prisma.department.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { employees: { where: { deletedAt: null } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Lấy thông tin trưởng phòng
    const managerIds = departments.map((d) => d.managerId).filter(Boolean) as string[];
    const managers = await prisma.employee.findMany({
      where: { id: { in: managerIds } },
      select: { id: true, fullName: true, employeeCode: true, email: true },
    });
    const managerMap = new Map(managers.map((m) => [m.id, m]));

    return departments.map((d) => ({
      ...d,
      headcount: d._count.employees,
      manager: d.managerId ? managerMap.get(d.managerId) || null : null,
    }));
  }

  static async getDepartmentById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        employees: {
          where: { deletedAt: null },
          include: { position: true },
        },
        positions: true,
      },
    });

    if (!department || department.deletedAt) {
      throw new AppError('Không tìm thấy thông tin phòng ban', 404);
    }

    return department;
  }

  static async createDepartment(data: any, authorUserId?: string) {
    const existing = await prisma.department.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new AppError('Mã phòng ban đã tồn tại', 409);
    }

    const dept = await prisma.department.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        description: data.description,
        managerId: data.managerId || null,
        parentId: data.parentId || null,
      },
    });

    if (authorUserId) {
      await prisma.auditLog.create({
        data: {
          userId: authorUserId,
          action: 'CREATE',
          entityType: 'DEPARTMENT',
          entityId: dept.id,
          newValues: JSON.stringify(dept),
        },
      });
    }

    return dept;
  }

  static async updateDepartment(id: string, data: any, authorUserId?: string) {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Phòng ban không tồn tại', 404);
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        description: data.description,
        managerId: data.managerId !== undefined ? data.managerId : existing.managerId,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      },
    });

    if (authorUserId) {
      await prisma.auditLog.create({
        data: {
          userId: authorUserId,
          action: 'UPDATE',
          entityType: 'DEPARTMENT',
          entityId: id,
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(updated),
        },
      });
    }

    return updated;
  }

  static async deactivateDepartment(id: string, authorUserId?: string) {
    const activeEmployeesCount = await prisma.employee.count({
      where: { departmentId: id, deletedAt: null },
    });

    if (activeEmployeesCount > 0) {
      throw new AppError(
        `Không thể ngừng hoạt động phòng ban này vì đang có ${activeEmployeesCount} nhân viên trực thuộc. Vui lòng điều chuyển nhân sự trước.`,
        400
      );
    }

    return DepartmentService.updateDepartment(id, { isActive: false }, authorUserId);
  }
}
