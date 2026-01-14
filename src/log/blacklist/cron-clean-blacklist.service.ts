// cron-clean-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CronCleanBlacklistService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    await this.prisma.blacklist.deleteMany({
      where: { expiredAt: { lt: new Date() } },
    });
    console.log('Cleaned expired blacklisted tokens');
  }
}
