import { Body, Controller, Post, Query } from '@nestjs/common';
import { BackupService } from './backup.service';
import { Public } from 'src/decorator/public.decorator';
import { ApiBody, ApiProperty, ApiQuery } from '@nestjs/swagger';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Public()
  @Post('/manual')
  async manualBackup() {
    return this.backupService.backupDatabase();
  }

  @Public()
  @Post('/restore')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        backupFileName: { type: 'string' },
      },
      required: ['backupFileName'],
    },
  })
  async restoreDatabase(@Body('backupFileName') backupFileName: string) {
    return this.backupService.restoreDatabase(backupFileName);
  }
}
