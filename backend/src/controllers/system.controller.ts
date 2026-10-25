import { Response, NextFunction } from 'express';
import { SystemService } from '../services/system.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class SystemController {
  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
      const entityType = req.query.entityType as string;

      const result = await SystemService.getAuditLogs({ page, limit, entityType });
      return sendSuccess(res, 'Lấy nhật ký hoạt động thành công', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SystemService.getNotifications(req.user!.userId);
      return sendSuccess(res, 'Lấy thông báo thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await SystemService.markNotificationRead(req.params.id, req.user!.userId);
      return sendSuccess(res, 'Đã đánh dấu thông báo đã đọc');
    } catch (error) {
      next(error);
    }
  }

  static async getSettings(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SystemService.getSettings();
      return sendSuccess(res, 'Lấy cấu hình hệ thống thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      const result = await SystemService.updateSetting(key, value);
      return sendSuccess(res, 'Cập nhật cấu hình thành công', result);
    } catch (error) {
      next(error);
    }
  }
}
