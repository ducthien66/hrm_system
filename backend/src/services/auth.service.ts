import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/response.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

export class AuthService {
  static async login(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản đã bị vô hiệu hóa hoặc ngừng hoạt động', 403);
    }

    // Kiểm tra khóa tài khoản do nhập sai nhiều lần
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      throw new AppError(
        `Tài khoản bị tạm khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${waitMinutes} phút.`,
        429
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const failedAttempts = user.failedAttempts + 1;
      let lockedUntil: Date | null = null;

      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Khóa 15 phút
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts,
          lockedUntil,
        },
      });

      if (lockedUntil) {
        throw new AppError('Bạn đã nhập sai 5 lần. Tài khoản tạm khóa trong 15 phút.', 429);
      }

      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    // Đăng nhập thành công -> Reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Ghi Audit log đăng nhập
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'AUTH',
        ipAddress: ipAddress || '127.0.0.1',
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleCode: user.role.code,
      employeeId: user.employeeId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Người dùng không tồn tại', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Mật khẩu hiện tại không chính xác', 400);
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHashedPassword },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Không tìm thấy thông tin tài khoản', 404);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
