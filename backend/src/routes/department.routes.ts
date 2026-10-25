import { Router } from 'express';
import { DepartmentController, PositionController } from '../controllers/department.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator.js';
import { ROLES } from '../constants/index.js';

export const departmentRouter = Router();

departmentRouter.use(authenticateToken);
departmentRouter.get('/', DepartmentController.getDepartments);
departmentRouter.get('/:id', DepartmentController.getDepartmentById);
departmentRouter.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  validate(createDepartmentSchema),
  DepartmentController.createDepartment
);
departmentRouter.patch(
  '/:id',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  validate(updateDepartmentSchema),
  DepartmentController.updateDepartment
);
departmentRouter.post(
  '/:id/deactivate',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  DepartmentController.deactivateDepartment
);

export const positionRouter = Router();

positionRouter.use(authenticateToken);
positionRouter.get('/', PositionController.getPositions);
positionRouter.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  PositionController.createPosition
);
positionRouter.patch(
  '/:id',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  PositionController.updatePosition
);
