import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/response.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('🔥 [Unhandled Error]:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.errors, err.statusCode);
  }

  // Prisma Client Known Request Errors
  if (err.code === 'P2002') {
    const fields = (err.meta?.target as string[]) || [];
    return sendError(
      res,
      `Dữ liệu đã tồn tại trong hệ thống (${fields.join(', ')})`,
      [],
      409
    );
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Bản ghi yêu cầu không tồn tại trong hệ thống', [], 404);
  }

  // Generic fallback
  return sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Đã xảy ra lỗi nội bộ trên hệ thống'
      : err.message || 'Lỗi máy chủ',
    [],
    500
  );
}
