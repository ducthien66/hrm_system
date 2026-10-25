import { prisma } from '../config/prisma.js';

export class SystemService {
  static async getAuditLogs(params: {
    page?: number;
    limit?: number;
    entityType?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 15));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.entityType) where.entityType = params.entityType;

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, employee: { select: { fullName: true } } },
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

  static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  static async markNotificationRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async getSettings() {
    return prisma.systemSetting.findMany({ orderBy: { category: 'asc' } });
  }

  static async updateSetting(key: string, value: string) {
    return prisma.systemSetting.update({
      where: { key },
      data: { value },
    });
  }
}
