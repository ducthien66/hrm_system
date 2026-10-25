import { z } from 'zod';

export const createContractSchema = z.object({
  contractNumber: z.string().min(3, 'Mã số hợp đồng không được để trống'),
  employeeId: z.string().min(1, 'Vui lòng chọn nhân viên'),
  contractType: z.enum(['PROBATION', 'DEFINITE_1Y', 'DEFINITE_3Y', 'INDEFINITE']),
  startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
  endDate: z.string().optional().nullable(),
  baseSalary: z.number().positive('Mức lương cơ bản phải lớn hơn 0'),
  notes: z.string().optional().nullable(),
});

export const updateContractSchema = createContractSchema.partial();
