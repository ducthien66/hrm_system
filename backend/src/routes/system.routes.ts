import { Router } from 'express';
import { SystemController } from '../controllers/system.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticateToken);

// Audit logs chỉ dành cho Super Admin
router.get('/audit-logs', requireRoles(ROLES.SUPER_ADMIN), SystemController.getAuditLogs);

// Notifications
router.get('/notifications', SystemController.getNotifications);
router.patch('/notifications/:id/read', SystemController.markNotificationRead);

// Settings
router.get('/settings', SystemController.getSettings);
router.patch('/settings', requireRoles(ROLES.SUPER_ADMIN), SystemController.updateSetting);

export default router;
