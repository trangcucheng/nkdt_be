// Script để kiểm tra users có roles hay không
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsersRoles() {
  try {
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`\n📊 Tổng số users: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username || 'N/A'}`);
      console.log(`   Blocked: ${user.blocked ? '🔒 YES' : '✅ NO'}`);
      
      if (user.userRoles.length === 0) {
        console.log(`   ❌ KHÔNG CÓ ROLE NAO!`);
      } else {
        console.log(`   Roles: ${user.userRoles.map(ur => ur.role.name).join(', ')}`);
        
        const allPermissions = new Set();
        user.userRoles.forEach(ur => {
          ur.role.rolePermissions.forEach(rp => {
            allPermissions.add(rp.permission.name);
          });
        });
        console.log(`   Permissions: ${allPermissions.size} quyền`);
      }
      console.log('');
    });

    // Kiểm tra users không có role
    const usersWithoutRoles = users.filter(u => u.userRoles.length === 0);
    if (usersWithoutRoles.length > 0) {
      console.log('\n⚠️ WARNING: Có users không có role:');
      usersWithoutRoles.forEach(u => {
        console.log(`  - ID ${u.id}: ${u.email}`);
      });
    } else {
      console.log('\n✅ Tất cả users đều có role');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsersRoles();
