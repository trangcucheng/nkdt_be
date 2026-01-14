import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RolesController],
  providers: [PrismaService, RolesService],
  exports: [RolesService], // Exporting RolesService for use in other modules
})
export class RolesModule {}
