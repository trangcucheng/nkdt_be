const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAndReseed() {
  try {
    // Xóa tất cả user cũ
    await prisma.userRole.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✓ Đã xóa tất cả users và userRoles');
    console.log('Bây giờ hãy chạy: npx prisma db seed');
  } catch (error) {
    console.error('Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndReseed();
