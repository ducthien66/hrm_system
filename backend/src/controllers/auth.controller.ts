import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.socket.remoteAddress;
      const result = await AuthService.login(email, password, ip);
      return sendSuccess(res, 'Đăng nhập thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);
      return sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.getMe(req.user!.userId);
      return sendSuccess(res, 'Lấy thông tin tài khoản thành công', result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response) {
    return sendSuccess(res, 'Đăng xuất thành công');
  }
}
