import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PrismaService } from 'src/prisma.service';
import { PermissionsController } from './permissions.controller';

@Module({
  controllers: [PermissionsController],
  providers: [PrismaService, PermissionsService],
  exports: [PermissionsService], // Exporting RolesService for use in other modules
})
export class PermissionsModule {}
