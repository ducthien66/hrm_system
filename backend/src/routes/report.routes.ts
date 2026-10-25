import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/dashboard', ReportController.getDashboardMetrics);

export default router;
