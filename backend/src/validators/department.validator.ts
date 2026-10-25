import { z } from 'zod';

export const createDepartmentSchema = z.object({
  code: z.string().min(2, 'Mã phòng ban phải có ít nhất 2 ký tự').toUpperCase(),
  name: z.string().min(2, 'Tên phòng ban phải có ít nhất 2 ký tự'),
  description: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
