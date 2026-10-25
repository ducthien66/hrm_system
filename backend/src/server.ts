import { app } from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/prisma.js';

async function bootstrap() {
  await connectDatabase();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 HRM Server đang lắng nghe tại cổng http://localhost:${config.port}`);
    console.log(`🔗 API Base: http://localhost:${config.port}/api/v1`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('Lỗi khởi động HRM Server:', err);
  process.exit(1);
});
