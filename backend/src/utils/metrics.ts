import client from 'prom-client';

// Khởi tạo Prometheus Registry
export const register = new client.Registry();

// Bật thu thập metrics mặc định của Node.js (CPU, Memory, GC, Event Loop)
client.collectDefaultMetrics({
  register,
  prefix: 'hrm_nodejs_',
});

// Metric đo thời gian phản hồi HTTP API (Histogram)
export const httpRequestDurationHistogram = new client.Histogram({
  name: 'hrm_http_request_duration_seconds',
  help: 'Thời gian phản hồi HTTP API tính bằng giây',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDurationHistogram);

// Metric đếm tổng số lượt request (Counter)
export const httpRequestsTotalCounter = new client.Counter({
  name: 'hrm_http_requests_total',
  help: 'Tổng số lượt HTTP request gửi tới hệ thống HRM',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotalCounter);

// Metric theo dõi số lượng người dùng đang hoạt động (Gauge)
export const activeSessionsGauge = new client.Gauge({
  name: 'hrm_active_sessions_total',
  help: 'Số phiên đăng nhập người dùng đang hoạt động',
});
register.registerMetric(activeSessionsGauge);
