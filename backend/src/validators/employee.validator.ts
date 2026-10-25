import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Họ đệm không được để trống'),
  lastName: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email công việc không hợp lệ'),
  phone: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  joinDate: z.string().optional().nullable(),
  status: z.enum(['PROBATION', 'ACTIVE', 'RESIGNED', 'SUSPENDED']).default('ACTIVE'),
  avatarUrl: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
