import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';

export class AttendanceService {
  static async checkIn(employeeId: string) {
    const today = new Date();
    const workDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Tìm ca làm việc chuẩn
    const shift = await prisma.workShift.findFirst({ where: { isActive: true } });
    const shiftStartTime = shift?.startTime || '08:30';
    const [startH, startM] = shiftStartTime.split(':').map(Number);
    const expectedStart = new Date(workDate);
    expectedStart.setHours(startH, startM, 0, 0);

    // Tính số phút đi muộn (Grace period 15 phút)
    let lateMinutes = 0;
    let status = 'NORMAL';
    if (today.getTime() > expectedStart.getTime() + 15 * 60 * 1000) {
      lateMinutes = Math.floor((today.getTime() - expectedStart.getTime()) / (1000 * 60));
      status = 'LATE';
    }

    // Kiểm tra bản ghi hôm nay
    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate,
        },
      },
    });

    if (existing && existing.checkInTime) {
      throw new AppError('Bạn đã thực hiện check-in hôm nay rồi', 400);
    }

    if (existing) {
      return prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: {
          checkInTime: today,
          lateMinutes,
          status,
          shiftId: shift?.id,
        },
      });
    }

    return prisma.attendanceRecord.create({
      data: {
        employeeId,
        shiftId: shift?.id,
        workDate,
        checkInTime: today,
        lateMinutes,
        status,
      },
    });
  }

  static async checkOut(employeeId: string) {
    const today = new Date();
    const workDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate,
        },
      },
      include: { shift: true },
    });

    if (!existing || !existing.checkInTime) {
      throw new AppError('Chưa có thông tin check-in hợp lệ hôm nay. Không thể check-out.', 400);
    }

    const checkInTime = new Date(existing.checkInTime);
    const shiftEndTime = existing.shift?.endTime || '17:30';
    const [endH, endM] = shiftEndTime.split(':').map(Number);
    const expectedEnd = new Date(workDate);
    expectedEnd.setHours(endH, endM, 0, 0);

    // Tính thời gian làm việc thực tế (trừ 1h nghỉ trưa nếu làm > 4h)
    let totalMinutes = Math.max(0, Math.floor((today.getTime() - checkInTime.getTime()) / (1000 * 60)));
    if (totalMinutes > 240) {
      totalMinutes -= (existing.shift?.breakMinutes || 60);
    }
    const workHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Tính về sớm hoặc làm thêm (OT)
    let earlyMinutes = 0;
    let otHours = 0;

    if (today.getTime() < expectedEnd.getTime()) {
      earlyMinutes = Math.floor((expectedEnd.getTime() - today.getTime()) / (1000 * 60));
    } else if (today.getTime() > expectedEnd.getTime() + 60 * 60 * 1000) {
      // OT nếu làm sau giờ tan ca > 60 phút
      otHours = Math.round(((today.getTime() - expectedEnd.getTime()) / (1000 * 60 * 60)) * 10) / 10;
    }

    let status = existing.status;
    if (earlyMinutes > 15) {
      status = 'EARLY';
    }

    return prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkOutTime: today,
        workHours,
        earlyMinutes,
        otHours,
        status,
      },
    });
  }

  static async getAttendanceList(params: {
    workDate?: string;
    month?: number;
    year?: number;
    departmentId?: string;
    employeeId?: string;
  }) {
    const where: any = {};

    if (params.employeeId) {
      where.employeeId = params.employeeId;
    }

    if (params.workDate) {
      const d = new Date(params.workDate);
      where.workDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    } else if (params.month && params.year) {
      const start = new Date(params.year, params.month - 1, 1);
      const end = new Date(params.year, params.month, 0, 23, 59, 59);
      where.workDate = { gte: start, lte: end };
    }

    if (params.departmentId) {
      where.employee = { departmentId: params.departmentId };
    }

    return prisma.attendanceRecord.findMany({
      where,
      include: {
        employee: {
          select: { id: true, fullName: true, employeeCode: true, department: true, position: true },
        },
        shift: true,
      },
      orderBy: { workDate: 'desc' },
    });
  }

  static async getMyAttendance(employeeId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        workDate: { gte: start, lte: end },
      },
      include: { shift: true },
      orderBy: { workDate: 'asc' },
    });
  }
}
