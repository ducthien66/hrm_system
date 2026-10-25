import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';

export class LeaveService {
  static async getLeaveTypes() {
    return prisma.leaveType.findMany({ orderBy: { daysPerYear: 'desc' } });
  }

  static async getLeaveBalances(employeeId: string, year = new Date().getFullYear()) {
    return prisma.leaveBalance.findMany({
      where: { employeeId, year },
      include: { leaveType: true },
    });
  }

  static async getLeaveRequests(params: {
    employeeId?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;
    if (params.departmentId) {
      where.employee = { departmentId: params.departmentId };
    }

    const [total, items] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: { id: true, fullName: true, employeeCode: true, department: true },
          },
          leaveType: true,
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

  static async createLeaveRequest(employeeId: string, data: any) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      throw new AppError('Ngày kết thúc không thể trước ngày bắt đầu', 400);
    }

    // Kiểm tra số dư phép
    const currentYear = startDate.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId: data.leaveTypeId,
          year: currentYear,
        },
      },
    });

    if (balance && balance.remainingDays < data.totalDays) {
      throw new AppError(
        `Số ngày phép khả dụng không đủ (Còn ${balance.remainingDays} ngày, yêu cầu ${data.totalDays} ngày)`,
        400
      );
    }

    // Kiểm tra trùng lặp ngày nghỉ đã được gửi hoặc duyệt
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });

    if (overlapping) {
      throw new AppError('Bạn đã có đơn xin nghỉ phép trong khoảng thời gian này rồi', 400);
    }

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId: data.leaveTypeId,
        startDate,
        endDate,
        totalDays: data.totalDays,
        reason: data.reason.trim(),
        status: 'PENDING',
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    return request;
  }

  static async reviewLeaveRequest(
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    approverId: string,
    rejectionReason?: string
  ) {
    const request = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: { employee: true, leaveType: true },
    });

    if (!request) {
      throw new AppError('Đơn xin nghỉ phép không tồn tại', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError(`Đơn này đã được xử lý trước đó (Trạng thái: ${request.status})`, 400);
    }

    // Không cho phép tự duyệt đơn của chính mình
    if (request.employeeId === approverId) {
      throw new AppError('Bạn không được phép tự phê duyệt đơn xin nghỉ phép của chính mình', 403);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (status === 'APPROVED') {
        const year = request.startDate.getFullYear();
        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: request.employeeId,
              leaveTypeId: request.leaveTypeId,
              year,
            },
          },
        });

        if (balance) {
          if (balance.remainingDays < request.totalDays) {
            throw new AppError('Số dư ngày phép của nhân viên không đủ để phê duyệt', 400);
          }

          const newRemaining = balance.remainingDays - request.totalDays;
          const newUsed = balance.usedDays + request.totalDays;

          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              usedDays: newUsed,
              remainingDays: newRemaining,
            },
          });

          await tx.leaveBalanceHistory.create({
            data: {
              leaveBalanceId: balance.id,
              actionType: 'DEDUCT',
              days: request.totalDays,
              balanceAfter: newRemaining,
              notes: `Duyệt đơn nghỉ phép ${request.id}`,
            },
          });
        }
      }

      const res = await tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status,
          approverId,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
      });

      // Tạo thông báo cho nhân viên
      const user = await tx.user.findFirst({ where: { employeeId: request.employeeId } });
      if (user) {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: status === 'APPROVED' ? 'Đơn nghỉ phép đã được duyệt' : 'Đơn nghỉ phép bị từ chối',
            message:
              status === 'APPROVED'
                ? `Đơn nghỉ phép (${request.leaveType.name}) từ ${request.startDate.toLocaleDateString('vi-VN')} đã được phê duyệt.`
                : `Đơn nghỉ phép của bạn bị từ chối. Lý do: ${rejectionReason || 'Không có lý do cụ thể'}`,
            type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
          },
        });
      }

      return res;
    });

    return updated;
  }
}
