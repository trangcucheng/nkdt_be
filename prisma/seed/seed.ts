import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Tạo Unit trước (vì User có foreign key tới Unit)
  console.log('🏢 Creating Units...');
  
  const mainUnit = await prisma.unit.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      code: 'DV001',
      name: 'Đơn vị Test',
      description: 'Đơn vị dùng để test hệ thống',
      status: 'Active',
    },
  });

  await prisma.unit.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      code: 'DV002',
      name: 'Phòng Hành Chính',
      description: 'Phòng hành chính tổng hợp',
      status: 'Active',
      parentId: 1,
    },
  });

  await prisma.unit.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      code: 'DV003',
      name: 'Phòng Đào Tạo',
      description: 'Phòng đào tạo và phát triển',
      status: 'Active',
      parentId: 1,
    },
  });

  console.log('✅ Units seeded.');

  // 2️⃣ Load permissions from JSON file
  // Đọc từ thư mục gốc của project thay vì __dirname để tránh lỗi khi build
  const permissionsPath = path.join(process.cwd(), 'prisma', 'seed', 'permissions.json');
  const permissionsData = await fs.readFile(permissionsPath, 'utf-8');
  const permissions = JSON.parse(permissionsData);

  // Upsert permissions
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        name: perm.name,
        description: perm.description,
      },
    });
  }

  console.log('✅ Seeding permissions complete.');

  // Tạo role Admin và gán toàn bộ permission
  const allPermissions = await prisma.permission.findMany();

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with all permissions',
      rolePermissions: {
        create: allPermissions.map((p) => ({
          permission: { connect: { id: p.id } },
        })),
      },
    },
  });

  console.log('✅ Seeding Admin role complete.');

  // Tạo role USER mặc định không gán permission
  await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Default user role with no permissions',
    },
  });

  console.log('✅ Seeding User role complete.');

  // 🔥 Tạo user ADMIN mặc định
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin'; // Production: Lấy từ process.env.ADMIN_PASSWORD

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      phoneNumber: '0900000001',
      unitId: 1,
      userRoles: {
        create: [
          {
            role: {
              connect: { id: adminRole.id },
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Admin user seeded. Email: ${adminEmail} / Password: ${adminPassword}`);

  // 🔥 Tạo user CLIENT để test
  const clientEmail = 'user@gmail.com';
  const clientPassword = 'user123';

  const hashedClientPassword = await bcrypt.hash(clientPassword, 10);

  const userRole = await prisma.role.findUnique({
    where: { name: 'USER' },
  });

  if (!userRole) {
    throw new Error('USER role not found. Please seed roles first.');
  }

  const clientUser = await prisma.user.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      email: clientEmail,
      password: hashedClientPassword,
      firstName: 'Nguyễn Văn',
      lastName: 'A',
      phoneNumber: '0911111111',
      unitId: 1,
      userRoles: {
        create: [
          {
            role: {
              connect: { id: userRole.id },
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Client user seeded. Email: ${clientEmail} / Password: ${clientPassword}`);

  // 🔥 Tạo đơn vị mẫu
  await prisma.unit.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      code: 'DV001',
      name: 'Đơn vị Test',
      description: 'Đơn vị dùng để test hệ thống',
      status: 'Active',
    },
  });

  console.log('✅ Unit seeded.');

  // 🔥 Tạo nhật ký mẫu cho client user
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check nếu đã có diary cho ngày hôm nay chưa
  const existingTodayDiary = await prisma.diary.findFirst({
    where: {
      userId: clientUser.id,
      date: today,
    },
  });

  if (!existingTodayDiary) {
    await prisma.diary.create({
      data: {
        userId: clientUser.id,
        content: 'Hôm nay là một ngày tuyệt vời! Tôi đã học được nhiều điều mới về công nghệ và cảm thấy rất hạnh phúc.',
        emotionStatus: 'HAPPY',
        privacyLevel: 'PRIVATE',
        hashtags: ['học_tập', 'hạnh_phúc', 'công_nghệ'],
        date: today,
      },
    });
  }

  // Check nếu đã có diary cho ngày hôm qua chưa
  const existingYesterdayDiary = await prisma.diary.findFirst({
    where: {
      userId: clientUser.id,
      date: yesterday,
    },
  });

  if (!existingYesterdayDiary) {
    await prisma.diary.create({
      data: {
        userId: clientUser.id,
        content: 'Hôm qua hơi mệt mỏi nhưng vẫn hoàn thành tốt công việc. Cần nghỉ ngơi nhiều hơn.',
        emotionStatus: 'TIRED',
        privacyLevel: 'STATISTICS_ONLY',
        hashtags: ['công_việc', 'sức_khỏe'],
        date: yesterday,
      },
    });
  }

  console.log('✅ Sample diaries seeded.');

  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEEDING COMPLETED!');
  console.log('='.repeat(60));
  console.log('\n📋 THÔNG TIN ĐĂNG NHẬP:\n');
  console.log('1️⃣  ADMIN:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role: ADMIN\n`);
  console.log('2️⃣  CLIENT (User thường):');
  console.log(`   Email: ${clientEmail}`);
  console.log(`   Password: ${clientPassword}`);
  console.log(`   Role: USER\n`);
  console.log('='.repeat(60));
  console.log('🚀 Bây giờ bạn có thể login tại: http://localhost:3001/login');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
