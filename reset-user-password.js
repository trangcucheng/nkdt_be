// Script để reset password cho user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
  try {
    // Tìm user
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${email}`);
      return;
    }

    console.log(`\n✅ Tìm thấy user:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log(`\n✅ Đã reset password thành công!`);
    console.log(`   Email: ${email}`);
    console.log(`   New Password: ${newPassword}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Lấy arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node reset-user-password.js <email> <password>');
  console.log('Example: node reset-user-password.js user@gmail.com user123');
  process.exit(1);
}

resetPassword(email, password);
