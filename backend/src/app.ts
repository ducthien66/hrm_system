import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { sendSuccess, sendError } from './utils/response.js';

export const app = express();

// 1. CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, Postman) hoặc match config
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// 2. Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Rate Limiting (Bảo vệ chống DoS / Brute-force)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Tối đa 1000 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút',
    errors: [],
  },
});
app.use('/api', apiLimiter);

// 4. Healthcheck Endpoint
app.get('/api/health', (_req, res) => {
  return sendSuccess(res, 'Hệ thống HRM Backend API đang hoạt động ổn định', {
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    timezone: 'Asia/Ho_Chi_Minh',
  });
});

// 5. RESTful API Endpoints v1
app.use('/api/v1', apiRouter);

// 6. 404 Handler
app.use((_req, res) => {
  return sendError(res, 'Endpoint API không tồn tại hoặc đã bị thay đổi', [], 404);
});

// 7. Global Error Handler
app.use(errorHandler);
