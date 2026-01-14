import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BackupService {
  async backupDatabase() {
    const backupFile = `backup_${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}.sql`;

    const backupDir = path.join(__dirname, 'backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true }); // tạo cả thư mục cha nếu chưa có
    }

    const backupPath = path.join(
      backupDir,
      `backup_${new Date().toISOString().replace(/:/g, '-')}.sql`,
    );

    // 🔧 Command pg_dump (sửa thông tin DB của bạn)
    const command = `pg_dump -h localhost -p 5432 -U postgres -d pmql_dt -F c -b -v -f ${backupPath}`;

    return new Promise((resolve, reject) => {
      exec(
        command,
        { env: { ...process.env, PG_PASSWORD: '1' } },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Backup error: ${stderr}`);
            reject(error);
          } else {
            console.log(`Backup created at ${backupPath}`);
            resolve({ status: 'success', file: backupFile });
          }
        },
      );
    });
  }

  async restoreDatabase(backupFileName: string) {
    try {
      if (!backupFileName) {
        throw new Error('Backup file name is required.');
      }
      const backupDir = path.resolve(__dirname, 'backups');
      const backupPath = path.join(backupDir, backupFileName);

      console.log('[Restore] Backup directory:', backupDir);
      console.log('[Restore] Backup file path:', backupPath);

      // 🔍 Kiểm tra file tồn tại
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // 🔧 Command pg_restore
      const command = `pg_restore -h localhost -p 5432 -U postgres -d pmql_dt --clean --no-owner --verbose "${backupPath}"`;

      console.log('[Restore] Running command:', command);

      return new Promise((resolve, reject) => {
        exec(
          command,
          { env: { ...process.env, PGPASSWORD: '1' } }, // ✅ PGPASSWORD đúng tên biến env
          (error, stdout, stderr) => {
            if (error) {
              console.error('[Restore] Error:', stderr || error.message);
              reject({ status: 'error', message: stderr || error.message });
            } else {
              console.log('[Restore] Success:', stdout);
              resolve({ status: 'success', file: backupFileName });
            }
          },
        );
      });
    } catch (err) {
      console.error('[Restore] Exception:', err.message);
      return { status: 'error', message: err.message };
    }
  }
}
