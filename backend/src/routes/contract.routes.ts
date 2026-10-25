import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createContractSchema, updateContractSchema } from '../validators/contract.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticateToken);

router.get('/expiring', ContractController.getExpiringContracts);
router.get('/', ContractController.getContracts);
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  validate(createContractSchema),
  ContractController.createContract
);
router.patch(
  '/:id',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  validate(updateContractSchema),
  ContractController.updateContract
);

export default router;
