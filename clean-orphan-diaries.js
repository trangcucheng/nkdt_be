const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanOrphanDiaries() {
  try {
    console.log('🔍 Checking for orphan diaries (userId = null)...');
    
    // Count orphan diaries
    const count = await prisma.diary.count({
      where: {
        userId: null
      }
    });
    
    console.log(`Found ${count} orphan diaries`);
    
    if (count > 0) {
      console.log('🗑️ Deleting orphan diaries...');
      
      // Delete orphan diaries
      const result = await prisma.diary.deleteMany({
        where: {
          userId: null
        }
      });
      
      console.log(`✅ Deleted ${result.count} orphan diaries`);
    } else {
      console.log('✅ No orphan diaries found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanOrphanDiaries();
