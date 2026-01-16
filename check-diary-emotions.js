// Script để kiểm tra phân bố cảm xúc trong diary
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDiaryEmotions() {
  try {
    // Đếm theo emotion status
    const emotionStats = await prisma.diary.groupBy({
      by: ['emotionStatus', 'privacyLevel'],
      _count: {
        emotionStatus: true
      }
    });

    console.log('\n📊 Thống kê cảm xúc trong diary:\n');
    
    emotionStats.forEach(stat => {
      console.log(`Cảm xúc: ${stat.emotionStatus.padEnd(12)} | Privacy: ${stat.privacyLevel.padEnd(20)} | Số lượng: ${stat._count.emotionStatus}`);
    });

    // Tổng số diary chia sẻ
    const sharedCount = await prisma.diary.count({
      where: {
        privacyLevel: {
          in: ['ANONYMOUS_SHARE', 'STATISTICS_ONLY']
        }
      }
    });

    console.log(`\n✅ Tổng số diary đã chia sẻ (ANONYMOUS_SHARE + STATISTICS_ONLY): ${sharedCount}`);

    // Chi tiết theo emotion cho diary chia sẻ
    const sharedByEmotion = await prisma.diary.groupBy({
      by: ['emotionStatus'],
      where: {
        privacyLevel: {
          in: ['ANONYMOUS_SHARE', 'STATISTICS_ONLY']
        }
      },
      _count: {
        emotionStatus: true
      }
    });

    console.log('\n📈 Phân bố cảm xúc trong diary chia sẻ:\n');
    sharedByEmotion.forEach(stat => {
      console.log(`  ${stat.emotionStatus}: ${stat._count.emotionStatus} diary`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDiaryEmotions();
