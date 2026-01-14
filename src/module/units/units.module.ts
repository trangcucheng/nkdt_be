import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UnitsController],
  providers: [PrismaService, UnitsService],
  exports: [UnitsService], // Exporting UnitsService for use in other modules
})
export class UnitsModule {}
