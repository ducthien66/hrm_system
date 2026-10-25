import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';

export class ContractService {
  static async getContracts(params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;

    const [total, items] = await Promise.all([
      prisma.employmentContract.count({ where }),
      prisma.employmentContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: { id: true, fullName: true, employeeCode: true, department: true, position: true },
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

  static async getExpiringContracts(daysThreshold = 30) {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);

    return prisma.employmentContract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: thresholdDate,
        },
      },
      include: {
        employee: {
          select: { id: true, fullName: true, employeeCode: true, email: true, department: true },
        },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  static async createContract(data: any, authorUserId?: string) {
    const existing = await prisma.employmentContract.findUnique({
      where: { contractNumber: data.contractNumber },
    });
    if (existing) {
      throw new AppError('Số hợp đồng đã tồn tại trong hệ thống', 409);
    }

    const contract = await prisma.employmentContract.create({
      data: {
        contractNumber: data.contractNumber.trim(),
        employeeId: data.employeeId,
        contractType: data.contractType,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        baseSalary: data.baseSalary,
        notes: data.notes,
        status: 'ACTIVE',
      },
      include: {
        employee: true,
      },
    });

    if (authorUserId) {
      await prisma.auditLog.create({
        data: {
          userId: authorUserId,
          action: 'CREATE',
          entityType: 'CONTRACT',
          entityId: contract.id,
          newValues: JSON.stringify(contract),
        },
      });
    }

    return contract;
  }

  static async updateContract(id: string, data: any, authorUserId?: string) {
    const existing = await prisma.employmentContract.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Hợp đồng không tồn tại', 404);
    }

    const updated = await prisma.employmentContract.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    if (authorUserId) {
      await prisma.auditLog.create({
        data: {
          userId: authorUserId,
          action: 'UPDATE',
          entityType: 'CONTRACT',
          entityId: id,
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(updated),
        },
      });
    }

    return updated;
  }
}
