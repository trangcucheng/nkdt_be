const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 Checking database...\n');

  // Check Users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    }
  });
  console.log('👥 Users:', users.length);
  users.forEach(u => console.log(`  - ${u.email} (${u.firstName} ${u.lastName})`));

  // Check Roles
  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
    }
  });
  console.log('\n🔐 Roles:', roles.length);
  roles.forEach(r => console.log(`  - ${r.name} (${r.id})`));

  // Check UserRoles
  const userRoles = await prisma.userRole.findMany({
    include: {
      user: {
        select: { email: true }
      },
      role: {
        select: { name: true }
      }
    }
  });
  console.log('\n🔗 UserRoles:', userRoles.length);
  userRoles.forEach(ur => console.log(`  - ${ur.user.email} → ${ur.role.name}`));

  // Check admin user specifically
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });
  
  console.log('\n👨‍💼 Admin user detail:');
  if (adminUser) {
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  UserRoles count: ${adminUser.userRoles.length}`);
    adminUser.userRoles.forEach(ur => console.log(`    - Role: ${ur.role.name}`));
  } else {
    console.log('  ❌ Admin user not found!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
