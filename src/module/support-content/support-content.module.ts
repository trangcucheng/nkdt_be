import { Module } from '@nestjs/common';
import { SupportContentService } from './support-content.service';
import { SupportContentController } from './support-content.controller';
import { SupportFileService } from './support-file.service';
import { SupportFileController } from './support-file.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SupportContentController, SupportFileController],
  providers: [SupportContentService, SupportFileService, PrismaService],
  exports: [SupportContentService, SupportFileService],
})
export class SupportContentModule {}
