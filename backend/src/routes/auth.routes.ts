import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/me', authenticateToken, AuthController.getMe);
router.post('/change-password', authenticateToken, validate(changePasswordSchema), AuthController.changePassword);

export default router;
