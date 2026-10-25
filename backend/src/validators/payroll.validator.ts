import { z } from 'zod';

export const createPayrollPeriodSchema = z.object({
  name: z.string().min(3, 'Tên kỳ tính lương không được để trống'),
  month: z.number().int().min(1).max(12, 'Tháng không hợp lệ (1-12)'),
  year: z.number().int().min(2020, 'Năm không hợp lệ'),
  startDate: z.string().min(1, 'Ngày bắt đầu kỳ công không được để trống'),
  endDate: z.string().min(1, 'Ngày kết thúc kỳ công không được để trống'),
});

export const updateSalaryStructureSchema = z.object({
  baseSalary: z.number().nonnegative('Lương cơ bản không được âm'),
  lunchAllowance: z.number().nonnegative().default(730000),
  transportAllowance: z.number().nonnegative().default(500000),
  phoneAllowance: z.number().nonnegative().default(300000),
  otherAllowances: z.number().nonnegative().default(0),
  insuranceSalary: z.number().nonnegative('Lương đóng bảo hiểm không được âm'),
  dependentsCount: z.number().int().nonnegative().default(0),
});
