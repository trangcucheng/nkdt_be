const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🗑️  Force cleaning database...\n');

  // 1. Xóa tất cả SupportFile trước (để không bị FK constraint)
  const deletedFiles = await prisma.supportFile.deleteMany({});
  console.log(`✅ Deleted ${deletedFiles.count} SupportFile records`);

  // 2. Xóa tất cả SupportContent
  const deletedContent = await prisma.supportContent.deleteMany({});
  console.log(`✅ Deleted ${deletedContent.count} SupportContent records`);

  // 3. Xóa tất cả Diary và related records
  await prisma.diaryComment.deleteMany({});
  await prisma.diaryReaction.deleteMany({});
  await prisma.diary.deleteMany({});
  console.log('✅ Deleted all Diary records');

  // 4. Xóa tất cả EmotionAlert
  await prisma.emotionAlert.deleteMany({});
  console.log('✅ Deleted all EmotionAlert records');

  // 5. Xóa tất cả IdeologicalWorkNote
  await prisma.ideologicalWorkNote.deleteMany({});
  console.log('✅ Deleted all IdeologicalWorkNote records');

  // 6. Xóa LoginHistory
  await prisma.loginHistory.deleteMany({});
  console.log('✅ Deleted all LoginHistory records');

  // 7. Giờ mới xóa UserRole
  const deletedUserRoles = await prisma.userRole.deleteMany({});
  console.log(`✅ Deleted ${deletedUserRoles.count} UserRole records`);

  // 8. Cuối cùng xóa User
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`✅ Deleted ${deletedUsers.count} User records`);

  console.log('\n🎉 Database cleaned! Now run: npx prisma db seed\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
