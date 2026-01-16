// Script để kiểm tra quyền của user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserPermissions(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
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

    if (!user) {
      console.log('❌ User không tồn tại');
      return;
    }

    console.log('\n👤 User Info:');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);

    console.log('\n🔐 Roles:');
    const allPermissions = new Set();
    
    user.roles.forEach(ur => {
      console.log(`- ${ur.role.name} (${ur.role.description})`);
      
      ur.role.rolePermissions.forEach(rp => {
        allPermissions.add(rp.permission.name);
      });
    });

    console.log('\n✅ All Permissions:');
    Array.from(allPermissions).sort().forEach(perm => {
      console.log(`- ${perm}`);
    });

    // Kiểm tra quyền UPDATE_UNIT
    const hasUpdateUnit = allPermissions.has('UPDATE_UNIT');
    console.log(`\n${hasUpdateUnit ? '✅' : '❌'} UPDATE_UNIT: ${hasUpdateUnit ? 'CÓ' : 'KHÔNG CÓ'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Lấy userId từ command line argument
const userId = parseInt(process.argv[2]);

if (!userId) {
  console.log('Usage: node check-user-permissions.js <userId>');
  console.log('Example: node check-user-permissions.js 1');
  process.exit(1);
}

checkUserPermissions(userId);
