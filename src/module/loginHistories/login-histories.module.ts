import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoginHistoriesController } from './login-histories.controller';
import { LoginHistoryService } from './login-histories.service';

@Module({
  controllers: [LoginHistoriesController],
  providers: [LoginHistoryService, PrismaService],
})
export class LoginHistoryModule {}
