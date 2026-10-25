import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createLeaveRequestSchema, reviewLeaveRequestSchema } from '../validators/leave.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticateToken);

router.get('/types', LeaveController.getLeaveTypes);
router.get('/balances', LeaveController.getLeaveBalances);
router.get('/requests', LeaveController.getLeaveRequests);
router.post('/requests', validate(createLeaveRequestSchema), LeaveController.createLeaveRequest);
router.post(
  '/requests/:id/review',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.DEPT_MANAGER),
  validate(reviewLeaveRequestSchema),
  LeaveController.reviewLeaveRequest
);

export default router;
