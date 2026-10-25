import { Response, NextFunction } from 'express';
import { PayrollService } from '../services/payroll.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class PayrollController {
  static async getPeriods(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PayrollService.getPeriods();
      return sendSuccess(res, 'Lấy danh sách kỳ lương thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async createPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PayrollService.createPeriod(req.body);
      return sendSuccess(res, 'Tạo kỳ tính lương thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async calculatePayroll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { periodId } = req.body;
      if (!periodId) {
        return sendError(res, 'Vui lòng chọn kỳ tính lương', [], 400);
      }
      const result = await PayrollService.calculatePayroll(periodId, req.user?.userId);
      return sendSuccess(res, 'Tính toán bảng lương hoàn tất', result);
    } catch (error) {
      next(error);
    }
  }

  static async lockPayrollRun(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PayrollService.lockPayrollRun(req.params.id, req.user?.userId);
      return sendSuccess(res, 'Đã khóa bảng lương thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async getMyPayslips(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        return sendError(res, 'Tài khoản chưa liên kết với hồ sơ nhân viên', [], 400);
      }
      const result = await PayrollService.getMyPayslips(req.user.employeeId);
      return sendSuccess(res, 'Lấy danh sách phiếu lương cá nhân thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async getPayslipById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PayrollService.getPayslipById(req.params.id);
      return sendSuccess(res, 'Lấy chi tiết phiếu lương thành công', result);
    } catch (error) {
      next(error);
    }
  }
}
