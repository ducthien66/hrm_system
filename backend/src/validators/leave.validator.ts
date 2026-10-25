import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, 'Vui lòng chọn loại nghỉ phép'),
  startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
  endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
  totalDays: z.number().positive('Số ngày nghỉ phải lớn hơn 0'),
  reason: z.string().min(5, 'Lý do nghỉ phép phải có ít nhất 5 ký tự'),
});

export const reviewLeaveRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional().nullable(),
});
