// Script để kiểm tra permissions của từng role
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRolePermissions() {
  try {
    const roles = await prisma.Role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    console.log(`\n📊 Tổng số roles: ${roles.length}\n`);

    roles.forEach((role, index) => {
      console.log(`${index + 1}. Role: ${role.name}`);
      console.log(`   Description: ${role.description || 'N/A'}`);
      console.log(`   Permissions: ${role.rolePermissions.length} quyền`);
      
      if (role.rolePermissions.length === 0) {
        console.log(`   ❌ KHÔNG CÓ PERMISSION NAO!`);
      } else {
        console.log(`   Danh sách permissions:`);
        role.rolePermissions.forEach(rp => {
          console.log(`     - ${rp.permission.name}: ${rp.permission.description}`);
        });
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolePermissions();
