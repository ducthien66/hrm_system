import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { sendError } from '../utils/response.js';
import { ROLES } from '../constants/index.js';

/**
 * Kiểm tra người dùng có một trong các vai trò được phép hay không
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Chưa xác thực người dùng', [], 401);
    }

    // Super Admin luôn có quyền truy cập toàn bộ
    if (req.user.roleCode === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      return sendError(
        res,
        'Bạn không có quyền thực hiện thao tác này (Yêu cầu vai trò: ' + allowedRoles.join(', ') + ')',
        [],
        403
      );
    }

    next();
  };
}

/**
 * Cho phép chính người dùng thao tác trên hồ sơ của mình HOẶC người có vai trò quản lý
 */
export function requireSelfOrRoles(employeeIdParamName: string, ...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Chưa xác thực người dùng', [], 401);
    }

    if (req.user.roleCode === ROLES.SUPER_ADMIN || roles.includes(req.user.roleCode)) {
      return next();
    }

    const targetEmployeeId = req.params[employeeIdParamName];
    if (req.user.employeeId && req.user.employeeId === targetEmployeeId) {
      return next();
    }

    return sendError(res, 'Bạn chỉ được phép xem hoặc chỉnh sửa dữ liệu của chính mình', [], 403);
  };
}
