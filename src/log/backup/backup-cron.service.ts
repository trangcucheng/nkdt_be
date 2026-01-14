import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from 'src/backup/backup.service';

@Injectable()
export class BackupCronService {
  constructor(private readonly backupService: BackupService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    console.log('🔄 Running scheduled database backup...');
    await this.backupService.backupDatabase();
  }
}
