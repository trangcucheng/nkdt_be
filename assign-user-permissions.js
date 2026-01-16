// Script để gán permissions cơ bản cho role USER
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Danh sách permissions cơ bản mà user thường cần
const USER_PERMISSIONS = [
  'CREATE_DIARY',
  'VIEW_OWN_DIARY',
  'UPDATE_OWN_DIARY',
  'DELETE_OWN_DIARY',
  'VIEW_ANONYMOUS_DIARIES',
  'REACT_TO_DIARY',
  'VIEW_OWN_EMOTION_STATS',
  'VIEW_SUPPORT_CONTENT',
];

async function assignPermissionsToUserRole() {
  try {
    // 1. Tìm role USER
    const userRole = await prisma.role_.findUnique({
      where: { name: 'USER' },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!userRole) {
      console.error('❌ Không tìm thấy role USER');
      return;
    }

    console.log(`\n📋 Role: ${userRole.name}`);
    console.log(`Current permissions: ${userRole.rolePermissions.length}\n`);

    // 2. Lấy tất cả permissions trong hệ thống
    const allPermissions = await prisma.permission.findMany();
    const permissionMap = new Map(allPermissions.map(p => [p.name, p.id]));

    // 3. Lọc ra những permissions cần gán
    const permissionsToAssign = USER_PERMISSIONS.filter(permName => 
      permissionMap.has(permName)
    );

    console.log(`Will assign ${permissionsToAssign.length} permissions:\n`);
    permissionsToAssign.forEach(p => console.log(`  ✓ ${p}`));

    // 4. Xóa hết permissions cũ (nếu có)
    await prisma.rolePermission.deleteMany({
      where: { roleId: userRole.id }
    });

    // 5. Gán permissions mới
    const createData = permissionsToAssign.map(permName => ({
      roleId: userRole.id,
      permissionId: permissionMap.get(permName)
    }));

    await prisma.rolePermission.createMany({
      data: createData
    });

    console.log(`\n✅ Đã gán ${permissionsToAssign.length} permissions cho role USER`);

    // 6. Verify
    const updatedRole = await prisma.role_.findUnique({
      where: { name: 'USER' },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    console.log(`\n📊 Kết quả:`);
    console.log(`Role USER hiện có ${updatedRole.rolePermissions.length} permissions:`);
    updatedRole.rolePermissions.forEach(rp => {
      console.log(`  - ${rp.permission.name}: ${rp.permission.description}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignPermissionsToUserRole();
