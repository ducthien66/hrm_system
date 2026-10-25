import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../config/prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & {
    id: string;
    departmentId?: string | null;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Chưa đăng nhập hoặc token không hợp lệ', [], 401);
    }

    const token = authHeader.split(' ')[1];
    let payload: JwtPayload;

    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', [], 401);
      }
      return sendError(res, 'Mã xác thực không hợp lệ', [], 401);
    }

    // Kiểm tra trạng thái tài khoản trong DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: true,
        employee: true,
      },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'Tài khoản đã bị khóa hoặc không tồn tại', [], 403);
    }

    req.user = {
      ...payload,
      id: user.id,
      roleCode: user.role.code,
      employeeId: user.employeeId,
      departmentId: user.employee?.departmentId,
    };

    next();
  } catch (error) {
    return sendError(res, 'Lỗi hệ thống xác thực người dùng', [], 500);
  }
}
