import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticateToken);

router.get('/', EmployeeController.getEmployees);
router.get('/:id', EmployeeController.getEmployeeById);

// Các thao tác thêm, sửa, lưu trữ chỉ dành cho Super Admin và HR Manager
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  validate(createEmployeeSchema),
  EmployeeController.createEmployee
);

router.patch(
  '/:id',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  validate(updateEmployeeSchema),
  EmployeeController.updateEmployee
);

router.post(
  '/:id/archive',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  EmployeeController.archiveEmployee
);

export default router;
