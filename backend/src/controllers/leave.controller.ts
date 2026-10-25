import { Response, NextFunction } from 'express';
import { LeaveService } from '../services/leave.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class LeaveController {
  static async getLeaveTypes(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await LeaveService.getLeaveTypes();
      return sendSuccess(res, 'Lấy danh mục loại nghỉ phép thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async getLeaveBalances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const targetEmpId = (req.query.employeeId as string) || req.user?.employeeId;
      if (!targetEmpId) {
        return sendError(res, 'Vui lòng cung cấp mã nhân viên', [], 400);
      }
      const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
      const result = await LeaveService.getLeaveBalances(targetEmpId, year);
      return sendSuccess(res, 'Lấy số dư ngày phép thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async getLeaveRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string;
      const employeeId = req.query.employeeId as string;
      const departmentId = req.query.departmentId as string;

      const result = await LeaveService.getLeaveRequests({
        page,
        limit,
        status,
        employeeId,
        departmentId,
      });

      return sendSuccess(res, 'Lấy danh sách đơn nghỉ phép thành công', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createLeaveRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        return sendError(res, 'Tài khoản chưa được liên kết với nhân viên', [], 400);
      }
      const result = await LeaveService.createLeaveRequest(req.user.employeeId, req.body);
      return sendSuccess(res, 'Gửi đơn xin nghỉ phép thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async reviewLeaveRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        return sendError(res, 'Chưa xác thực thông tin người duyệt', [], 400);
      }
      const { status, rejectionReason } = req.body;
      const result = await LeaveService.reviewLeaveRequest(
        req.params.id,
        status,
        req.user.employeeId,
        rejectionReason
      );
      return sendSuccess(
        res,
        status === 'APPROVED' ? 'Phê duyệt đơn nghỉ phép thành công' : 'Từ chối đơn nghỉ phép thành công',
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
