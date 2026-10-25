import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticateToken);

router.get('/', AssetController.getAssets);
router.post('/', requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER), AssetController.createAsset);
router.post(
  '/:id/assign',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  AssetController.assignAsset
);
router.post(
  '/:id/return',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  AssetController.returnAsset
);

export default router;
