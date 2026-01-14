import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating ADMIN permissions...');

  // Lấy role ADMIN
  const adminRole = await prisma.role_.findUnique({
    where: { name: 'ADMIN' },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      }
    }
  });

  if (!adminRole) {
    console.error('❌ ADMIN role not found!');
    return;
  }

  // Lấy tất cả permissions
  const allPermissions = await prisma.permission.findMany();
  
  console.log(`📊 Total permissions in database: ${allPermissions.length}`);
  console.log(`📊 Current ADMIN permissions: ${adminRole.rolePermissions.length}`);

  // Tìm permissions chưa có
  const existingPermissionIds = adminRole.rolePermissions.map(rp => rp.permissionId);
  const missingPermissions = allPermissions.filter(p => !existingPermissionIds.includes(p.id));

  if (missingPermissions.length === 0) {
    console.log('✅ ADMIN already has all permissions!');
    return;
  }

  console.log(`➕ Adding ${missingPermissions.length} missing permissions to ADMIN:`);
  missingPermissions.forEach(p => {
    console.log(`   - ${p.name}`);
  });

  // Thêm permissions còn thiếu
  for (const permission of missingPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    });
  }

  console.log('✅ ADMIN permissions updated successfully!');
  
  // Verify
  const updatedRole = await prisma.role_.findUnique({
    where: { name: 'ADMIN' },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      }
    }
  });

  console.log(`✅ ADMIN now has ${updatedRole?.rolePermissions.length} permissions`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
