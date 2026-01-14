import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CronCleanLoginHistoryService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async handleCron() {
    const deleted = await this.prisma.loginHistory.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180), // 180 days
        },
      },
    });
    console.log(`Deleted ${deleted.count} old login history records`);
  }
}
