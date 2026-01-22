const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignAdminRole() {
  try {
    // Tìm role ADMIN
    const adminRole = await prisma.role.findFirst({
      where: { name: 'ADMIN' }
    });

    if (!adminRole) {
      console.log('❌ Role ADMIN không tồn tại. Cần chạy seed trước.');
      return;
    }

    // Tìm user admin
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@gmail.com' }
    });

    if (!adminUser) {
      console.log('❌ User admin@gmail.com không tồn tại.');
      return;
    }

    // Kiểm tra xem đã có role chưa
    const existing = await prisma.userRole.findFirst({
      where: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    if (existing) {
      console.log('✓ User đã có role ADMIN rồi.');
      return;
    }

    // Gán role ADMIN cho user
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    console.log('✓ Đã gán role ADMIN cho user admin@gmail.com');
  } catch (error) {
    console.error('Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

assignAdminRole();
