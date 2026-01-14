-- =====================================================
-- SCRIPT TẠO USER TEST CHO KIỂM TRA PHÂN QUYỀN
-- =====================================================
-- Chạy script này trong MySQL để tạo user test
-- Hoặc sử dụng Prisma Studio: npx prisma studio

-- Lưu ý: Password đã được hash bằng bcrypt
-- Password gốc cho tất cả user: Test@123456

-- =====================================================
-- 1. TẠO USER CLIENT (Người dùng thường)
-- =====================================================

INSERT INTO `User` (
  `id`,
  `email`,
  `password`,
  `firstName`,
  `lastName`,
  `phoneNumber`,
  `unitId`,
  `blocked`,
  `createdAt`,
  `updatedAt`
) VALUES (
  'client-test-001',
  'client@test.com',
  '$2b$10$YourHashedPasswordHere',  -- Password: Test@123456
  'Nguyễn Văn',
  'Client',
  '0901234567',
  1,
  false,
  NOW(),
  NOW()
);

-- Gán role CLIENT
INSERT INTO `UserRole` (`id`, `userId`, `roleId`)
SELECT 
  UUID(),
  'client-test-001',
  `id`
FROM `Role_`
WHERE `name` = 'USER' OR `name` = 'CLIENT'
LIMIT 1;

-- =====================================================
-- 2. TẠO USER ADMIN (Cán bộ quản lý)
-- =====================================================

INSERT INTO `User` (
  `id`,
  `email`,
  `password`,
  `firstName`,
  `lastName`,
  `phoneNumber`,
  `unitId`,
  `blocked`,
  `createdAt`,
  `updatedAt`
) VALUES (
  'admin-test-001',
  'admin@test.com',
  '$2b$10$YourHashedPasswordHere',  -- Password: Test@123456
  'Trần Thị',
  'Admin',
  '0902345678',
  1,
  false,
  NOW(),
  NOW()
);

-- Gán role ADMIN
INSERT INTO `UserRole` (`id`, `userId`, `roleId`)
SELECT 
  UUID(),
  'admin-test-001',
  `id`
FROM `Role_`
WHERE `name` = 'ADMIN'
LIMIT 1;

-- =====================================================
-- 3. TẠO USER SUPER_ADMIN (Quản trị hệ thống)
-- =====================================================

INSERT INTO `User` (
  `id`,
  `email`,
  `password`,
  `firstName`,
  `lastName`,
  `phoneNumber`,
  `unitId`,
  `blocked`,
  `createdAt`,
  `updatedAt`
) VALUES (
  'superadmin-test-001',
  'superadmin@test.com',
  '$2b$10$YourHashedPasswordHere',  -- Password: Test@123456
  'Lê Văn',
  'SuperAdmin',
  '0903456789',
  1,
  false,
  NOW(),
  NOW()
);

-- Gán role SUPER_ADMIN
INSERT INTO `UserRole` (`id`, `userId`, `roleId`)
SELECT 
  UUID(),
  'superadmin-test-001',
  `id`
FROM `Role_`
WHERE `name` = 'SUPER_ADMIN'
LIMIT 1;

-- =====================================================
-- 4. TẠO ĐƠN VỊ MẪU (nếu chưa có)
-- =====================================================

INSERT IGNORE INTO `Unit` (
  `id`,
  `code`,
  `name`,
  `description`,
  `status`,
  `parentId`,
  `createdAt`,
  `updatedAt`
) VALUES 
(1, 'DV001', 'Đơn vị Test', 'Đơn vị dùng để test', 'Active', NULL, NOW(), NOW()),
(2, 'DV002', 'Phòng Hành Chính', 'Phòng hành chính tổng hợp', 'Active', 1, NOW(), NOW()),
(3, 'DV003', 'Phòng Đào Tạo', 'Phòng đào tạo và phát triển', 'Active', 1, NOW(), NOW());

-- =====================================================
-- 5. VERIFY DATA
-- =====================================================

-- Kiểm tra user vừa tạo
SELECT 
  u.id,
  u.email,
  u.firstName,
  u.lastName,
  r.name as role_name
FROM User u
LEFT JOIN UserRole ur ON u.id = ur.userId
LEFT JOIN Role_ r ON ur.roleId = r.id
WHERE u.email IN ('client@test.com', 'admin@test.com', 'superadmin@test.com');

-- =====================================================
-- 6. HASH PASSWORD (Chạy trong Node.js)
-- =====================================================

/*
// Chạy script này trong Node.js để tạo hash password
const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'Test@123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
}

hashPassword();

// Kết quả ví dụ:
// $2b$10$abc123xyz...
*/

-- =====================================================
-- 7. THÔNG TIN ĐĂNG NHẬP (Copy để test)
-- =====================================================

/*
==================================================
📋 DANH SÁCH TÀI KHOẢN TEST
==================================================

1️⃣ USER CLIENT (Người dùng thường)
   Email: client@test.com
   Password: Test@123456
   Role: CLIENT
   Quyền: Tạo/sửa/xóa nhật ký cá nhân

2️⃣ USER ADMIN (Cán bộ quản lý)
   Email: admin@test.com
   Password: Test@123456
   Role: ADMIN
   Quyền: Dashboard, Phân tích, Quản lý user

3️⃣ USER SUPER_ADMIN (Quản trị hệ thống)
   Email: superadmin@test.com
   Password: Test@123456
   Role: SUPER_ADMIN
   Quyền: Full quyền, quản lý hệ thống

==================================================
*/
