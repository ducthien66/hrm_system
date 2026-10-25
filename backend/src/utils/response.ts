import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  meta?: ApiResponse['meta'],
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

export function sendError(
  res: Response,
  message: string,
  errors: any[] = [],
  statusCode = 400
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

export class AppError extends Error {
  statusCode: number;
  errors: any[];

  constructor(message: string, statusCode = 400, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
