import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);
router.get('/my', AttendanceController.getMyAttendance);
router.get('/', AttendanceController.getAttendanceList);

export default router;
