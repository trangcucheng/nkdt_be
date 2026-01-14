import { Module } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [BlacklistService, PrismaService],
  exports: [BlacklistService],
})
export class BlacklistModule {}
