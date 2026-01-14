// ===============================================
// SCRIPT TẠO USER TEST VÀ HASH PASSWORD
// ===============================================
// Chạy: node create-test-users.js

const bcrypt = require('bcrypt');

// Danh sách user cần tạo
const testUsers = [
  {
    email: 'client@test.com',
    password: 'Test@123456',
    firstName: 'Nguyễn Văn',
    lastName: 'Client',
    role: 'CLIENT',
    phoneNumber: '0901234567'
  },
  {
    email: 'admin@test.com',
    password: 'Test@123456',
    firstName: 'Trần Thị',
    lastName: 'Admin',
    role: 'ADMIN',
    phoneNumber: '0902345678'
  },
  {
    email: 'superadmin@test.com',
    password: 'Test@123456',
    firstName: 'Lê Văn',
    lastName: 'SuperAdmin',
    role: 'SUPER_ADMIN',
    phoneNumber: '0903456789'
  }
];

// Hàm hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Hàm main
async function createTestUsers() {
  console.log('🔐 ĐANG TẠO TEST USERS...\n');
  console.log('=' . repeat(60));

  for (const user of testUsers) {
    const hashedPassword = await hashPassword(user.password);
    
    console.log(`\n📋 User: ${user.email}`);
    console.log('─'.repeat(60));
    console.log(`   Role: ${user.role}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Password (plaintext): ${user.password}`);
    console.log(`   Password (hashed): ${hashedPassword}`);
    
    // SQL Insert statement
    console.log('\n   📝 SQL INSERT:');
    console.log(`
INSERT INTO \`User\` (
  \`id\`,
  \`email\`,
  \`password\`,
  \`firstName\`,
  \`lastName\`,
  \`phoneNumber\`,
  \`unitId\`,
  \`blocked\`,
  \`createdAt\`,
  \`updatedAt\`
) VALUES (
  UUID(),
  '${user.email}',
  '${hashedPassword}',
  '${user.firstName}',
  '${user.lastName}',
  '${user.phoneNumber}',
  1,
  false,
  NOW(),
  NOW()
);
    `);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ HOÀN TẤT! Copy các SQL statement ở trên và chạy trong MySQL');
  console.log('=' . repeat(60));
  
  console.log('\n📋 THÔNG TIN ĐĂNG NHẬP:');
  console.log('─'.repeat(60));
  testUsers.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.role}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
  });
  
  console.log('\n🚀 Test bằng cách:');
  console.log('   1. Chạy các SQL INSERT ở trên');
  console.log('   2. Mở http://localhost:3001/login');
  console.log('   3. Đăng nhập với email và password tương ứng');
  console.log('');
}

// Chạy
createTestUsers().catch(console.error);
