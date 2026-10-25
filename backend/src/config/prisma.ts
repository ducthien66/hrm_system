import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Cơ sở dữ liệu đã kết nối thành công.');
  } catch (error) {
    console.error('❌ Lỗi kết nối cơ sở dữ liệu:', error);
    process.exit(1);
  }
}
