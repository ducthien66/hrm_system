import { Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AssetController {
  static async getAssets(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AssetService.getAssets();
      return sendSuccess(res, 'Lấy danh mục tài sản thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async createAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AssetService.createAsset(req.body);
      return sendSuccess(res, 'Thêm tài sản mới thành công', result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async assignAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { employeeId, conditionOnAssign } = req.body;
      const result = await AssetService.assignAsset(req.params.id, employeeId, conditionOnAssign);
      return sendSuccess(res, 'Cấp phát tài sản thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async returnAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { conditionOnReturn } = req.body;
      const result = await AssetService.returnAsset(req.params.id, conditionOnReturn);
      return sendSuccess(res, 'Thu hồi tài sản thành công', result);
    } catch (error) {
      next(error);
    }
  }
}
