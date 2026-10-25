import { Response, NextFunction } from 'express';
import { ContractService } from '../services/contract.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ContractController {
  static async getContracts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const employeeId = req.query.employeeId as string;
      const status = req.query.status as string;

      const result = await ContractService.getContracts({ page, limit, employeeId, status });
      return sendSuccess(res, 'Lấy danh sách hợp đồng thành công', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpiringContracts(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ContractService.getExpiringContracts(30);
      return sendSuccess(res, 'Lấy danh sách hợp đồng sắp hết hạn thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async createContract(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ContractService.createContract(req.body, req.user?.userId);
      return sendSuccess(res, 'Tạo hợp đồng thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateContract(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ContractService.updateContract(req.params.id, req.body, req.user?.userId);
      return sendSuccess(res, 'Cập nhật hợp đồng thành công', result);
    } catch (error) {
      next(error);
    }
  }
}
