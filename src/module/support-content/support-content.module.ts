import { Module } from '@nestjs/common';
import { SupportContentService } from './support-content.service';
import { SupportContentController } from './support-content.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SupportContentController],
  providers: [SupportContentService, PrismaService],
  exports: [SupportContentService],
})
export class SupportContentModule {}