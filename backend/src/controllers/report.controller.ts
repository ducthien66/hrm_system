import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ReportController {
  static async getDashboardMetrics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ReportService.getDashboardMetrics();
      return sendSuccess(res, 'Lấy dữ liệu Dashboard thành công', result);
    } catch (error) {
      next(error);
    }
  }
}
