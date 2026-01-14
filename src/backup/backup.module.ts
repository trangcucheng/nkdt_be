import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { BackupCronService } from 'src/log/backup/backup-cron.service';

@Module({
  providers: [BackupService, BackupCronService],
  controllers: [BackupController],
})
export class BackupModule {}
