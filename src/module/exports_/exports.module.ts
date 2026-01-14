import { Module } from '@nestjs/common';
import { ExportService } from './exports.service';
import { ExportController } from './exports.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ExportService, PrismaService],
  controllers: [ExportController],
})
export class ExportsModule {}
