import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SignsService } from './signs.service';
import { SignsController } from './signs.controller';

@Module({
  providers: [SignsService, PrismaService],
  controllers: [SignsController],
})
export class SignsModule {}
