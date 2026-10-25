import { Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class EmployeeController {
  static async getEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const departmentId = req.query.departmentId as string;
      const positionId = req.query.positionId as string;
      const status = req.query.status as string;

      const result = await EmployeeService.getEmployees({
        page,
        limit,
        search,
        departmentId,
        positionId,
        status,
      });

      return sendSuccess(res, 'Lấy danh sách nhân viên thành công', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEmployeeById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await EmployeeService.getEmployeeById(req.params.id);
      return sendSuccess(res, 'Lấy chi tiết nhân viên thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await EmployeeService.createEmployee(req.body, req.user?.userId);
      return sendSuccess(res, 'Tạo hồ sơ nhân viên thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await EmployeeService.updateEmployee(req.params.id, req.body, req.user?.userId);
      return sendSuccess(res, 'Cập nhật hồ sơ nhân viên thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async archiveEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await EmployeeService.archiveEmployee(req.params.id, req.user?.userId);
      return sendSuccess(res, 'Đã chuyển nhân viên sang trạng thái thôi việc', result);
    } catch (error) {
      next(error);
    }
  }
}
