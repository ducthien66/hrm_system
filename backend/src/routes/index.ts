import { Router } from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import { departmentRouter, positionRouter } from './department.routes.js';
import contractRoutes from './contract.routes.js';
import attendanceRoutes from './attendance.routes.js';
import leaveRoutes from './leave.routes.js';
import payrollRoutes from './payroll.routes.js';
import recruitmentRoutes from './recruitment.routes.js';
import assetRoutes from './asset.routes.js';
import reportRoutes from './report.routes.js';
import systemRoutes from './system.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/employees', employeeRoutes);
apiRouter.use('/departments', departmentRouter);
apiRouter.use('/positions', positionRouter);
apiRouter.use('/contracts', contractRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/leave', leaveRoutes);
apiRouter.use('/payroll', payrollRoutes);
apiRouter.use('/recruitment', recruitmentRoutes);
apiRouter.use('/assets', assetRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/system', systemRoutes);

export default apiRouter;
