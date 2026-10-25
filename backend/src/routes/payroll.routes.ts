import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPayrollPeriodSchema } from '../validators/payroll.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticateToken);

router.get('/my-payslips', PayrollController.getMyPayslips);
router.get('/payslips/:id', PayrollController.getPayslipById);

// Quản lý kỳ lương & tính lương dành cho Super Admin và Accountant
router.get('/periods', requireRoles(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.HR_MANAGER), PayrollController.getPeriods);
router.post(
  '/periods',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT),
  validate(createPayrollPeriodSchema),
  PayrollController.createPeriod
);
router.post(
  '/calculate',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT),
  PayrollController.calculatePayroll
);
router.post(
  '/runs/:id/lock',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT),
  PayrollController.lockPayrollRun
);

export default router;
