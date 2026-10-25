import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { sendSuccess, sendError } from './utils/response.js';
import { register } from './utils/metrics.js';
import { metricsMiddleware } from './middlewares/metrics.middleware.js';

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

// 2. Metrics Middleware (Thu thập metrics cho Prometheus & Grafana)
app.use(metricsMiddleware);

// 3. Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Rate Limiting (Bảo vệ chống DoS / Brute-force)
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

// 5. Prometheus Scrape Endpoint cho Grafana
app.get('/metrics', async (_req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// 6. Healthcheck Endpoint
app.get('/api/health', (_req, res) => {
  return sendSuccess(res, 'Hệ thống HRM Backend API đang hoạt động ổn định', {
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    timezone: 'Asia/Ho_Chi_Minh',
  });
});

// 7. RESTful API Endpoints v1
app.use('/api/v1', apiRouter);

// 8. 404 Handler
app.use((_req, res) => {
  return sendError(res, 'Endpoint API không tồn tại hoặc đã bị thay đổi', [], 404);
});

// 9. Global Error Handler
app.use(errorHandler);
