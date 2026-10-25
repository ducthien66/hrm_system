import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';

export class PositionService {
  static async getPositions() {
    return prisma.position.findMany({
      include: {
        department: true,
        _count: {
          select: { employees: { where: { deletedAt: null } } },
        },
      },
      orderBy: { gradeLevel: 'desc' },
    });
  }

  static async createPosition(data: any) {
    const existing = await prisma.position.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new AppError('Mã chức vụ đã tồn tại', 409);
    }

    return prisma.position.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        gradeLevel: data.gradeLevel || 1,
        description: data.description,
        departmentId: data.departmentId || null,
      },
    });
  }

  static async updatePosition(id: string, data: any) {
    return prisma.position.update({
      where: { id },
      data,
    });
  }
}
