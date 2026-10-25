import { Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AttendanceController {
  static async checkIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        return sendError(res, 'Tài khoản chưa được liên kết với hồ sơ nhân viên', [], 400);
      }
      const result = await AttendanceService.checkIn(req.user.employeeId);
      return sendSuccess(res, 'Check-in thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async checkOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        return sendError(res, 'Tài khoản chưa được liên kết với hồ sơ nhân viên', [], 400);
      }
      const result = await AttendanceService.checkOut(req.user.employeeId);
      return sendSuccess(res, 'Check-out thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const workDate = req.query.workDate as string;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const departmentId = req.query.departmentId as string;
      const employeeId = req.query.employeeId as string;

      const result = await AttendanceService.getAttendanceList({
        workDate,
        month,
        year,
        departmentId,
        employeeId,
      });

      return sendSuccess(res, 'Lấy danh sách chấm công thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async getMyAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        return sendError(res, 'Tài khoản chưa liên kết với nhân viên', [], 400);
      }

      const today = new Date();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : today.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : today.getFullYear();

      const result = await AttendanceService.getMyAttendance(req.user.employeeId, month, year);
      return sendSuccess(res, 'Lấy lịch sử chấm công cá nhân thành công', result);
    } catch (error) {
      next(error);
    }
  }
}
