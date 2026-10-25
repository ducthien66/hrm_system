import { Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service.js';
import { PositionService } from '../services/position.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class DepartmentController {
  static async getDepartments(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentService.getDepartments();
      return sendSuccess(res, 'Lấy danh sách phòng ban thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async getDepartmentById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentService.getDepartmentById(req.params.id);
      return sendSuccess(res, 'Lấy chi tiết phòng ban thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentService.createDepartment(req.body, req.user?.userId);
      return sendSuccess(res, 'Tạo phòng ban thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentService.updateDepartment(req.params.id, req.body, req.user?.userId);
      return sendSuccess(res, 'Cập nhật phòng ban thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentService.deactivateDepartment(req.params.id, req.user?.userId);
      return sendSuccess(res, 'Ngừng hoạt động phòng ban thành công', result);
    } catch (error) {
      next(error);
    }
  }
}

export class PositionController {
  static async getPositions(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PositionService.getPositions();
      return sendSuccess(res, 'Lấy danh sách chức vụ thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async createPosition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PositionService.createPosition(req.body);
      return sendSuccess(res, 'Tạo chức vụ thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updatePosition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PositionService.updatePosition(req.params.id, req.body);
      return sendSuccess(res, 'Cập nhật chức vụ thành công', result);
    } catch (error) {
      next(error);
    }
  }
}
