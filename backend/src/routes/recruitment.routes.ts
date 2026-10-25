import { Router } from 'express';
import { RecruitmentController } from '../controllers/recruitment.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticateToken);

router.get('/jobs', RecruitmentController.getJobs);
router.post('/jobs', requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER), RecruitmentController.createJob);

router.get('/candidates', RecruitmentController.getCandidates);
router.post('/candidates', RecruitmentController.createCandidate);
router.patch(
  '/candidates/:id/status',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  RecruitmentController.updateCandidateStatus
);
router.post(
  '/candidates/:id/convert-to-employee',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER),
  RecruitmentController.convertToEmployee
);

export default router;
