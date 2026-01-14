import { Module } from '@nestjs/common';
import { EmotionAnalyticsService } from './emotion-analytics.service';
import { EmotionAnalyticsController } from './emotion-analytics.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [EmotionAnalyticsController],
  providers: [EmotionAnalyticsService, PrismaService],
  exports: [EmotionAnalyticsService],
})
export class EmotionAnalyticsModule {}