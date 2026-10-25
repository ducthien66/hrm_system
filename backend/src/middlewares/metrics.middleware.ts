import { Request, Response, NextFunction } from 'express';
import { httpRequestDurationHistogram, httpRequestsTotalCounter } from '../utils/metrics.js';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Bỏ qua thu thập metric chính nó để tránh loop rác
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    // Chuẩn hóa route path (thay các id param bằng :id để tránh cardinality nổ)
    const normalizedRoute = req.baseUrl + (req.route?.path || req.path);

    const labels = {
      method: req.method,
      route: normalizedRoute || req.path,
      status_code: res.statusCode.toString(),
    };

    httpRequestDurationHistogram.observe(labels, durationInSeconds);
    httpRequestsTotalCounter.inc(labels);
  });

  next();
}
