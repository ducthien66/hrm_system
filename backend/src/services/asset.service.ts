import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';

export class AssetService {
  static async getAssets() {
    return prisma.asset.findMany({
      include: {
        assignments: {
          where: { returnedDate: null },
          include: {
            employee: {
              select: { id: true, fullName: true, employeeCode: true, department: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createAsset(data: any) {
    const existing = await prisma.asset.findUnique({
      where: { code: data.code },
    });
    if (existing) throw new AppError('Mã tài sản đã tồn tại', 409);

    return prisma.asset.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        category: data.category || 'OTHER',
        serialNumber: data.serialNumber,
        cost: data.cost,
        status: 'AVAILABLE',
        notes: data.notes,
      },
    });
  }

  static async assignAsset(assetId: string, employeeId: string, conditionOnAssign?: string) {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new AppError('Tài sản không tồn tại', 404);
    if (asset.status === 'ASSIGNED') throw new AppError('Tài sản này đang được cấp phát cho nhân viên khác', 400);

    return prisma.$transaction(async (tx) => {
      const assignment = await tx.assetAssignment.create({
        data: {
          assetId,
          employeeId,
          assignedDate: new Date(),
          conditionOnAssign: conditionOnAssign || 'Hoạt động tốt, nguyên tem bảo hành',
        },
      });

      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'ASSIGNED' },
      });

      return assignment;
    });
  }

  static async returnAsset(assetId: string, conditionOnReturn?: string) {
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: { assetId, returnedDate: null },
    });

    if (!activeAssignment) throw new AppError('Tài sản này chưa được cấp phát hoặc đã được thu hồi', 400);

    return prisma.$transaction(async (tx) => {
      await tx.assetAssignment.update({
        where: { id: activeAssignment.id },
        data: {
          returnedDate: new Date(),
          conditionOnReturn: conditionOnReturn || 'Đã thu hồi, tình trạng bình thường',
        },
      });

      return tx.asset.update({
        where: { id: assetId },
        data: { status: 'AVAILABLE' },
      });
    });
  }
}
