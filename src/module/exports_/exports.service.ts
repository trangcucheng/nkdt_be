import { Injectable, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Export users to Excel
   */
  async exportUsersExcel(userId: string) {
    await this.checkExportPermission(userId);

    const users = await this.prisma.user.findMany({
      select: {
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        unit: {
          select: { name: true, code: true }
        }
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách Users');

    worksheet.addRow(['Họ', 'Tên', 'Email', 'Đơn vị', 'Ngày tạo']);

    users.forEach(user => {
      worksheet.addRow([
        user.firstName || '',
        user.lastName || '',
        user.email,
        user.unit?.name || 'N/A',
        user.createdAt.toISOString().split('T')[0]
      ]);
    });

    worksheet.getRow(1).font = { bold: true };

    const filename = `users-${Date.now()}.xlsx`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, filename);

    await workbook.xlsx.writeFile(filePath);
    return { file: filePath, filename };
  }

  /**
   * Export emotion statistics
   */
  async exportEmotionReport(
    userId: string,
    options: { startDate?: string; endDate?: string; unitId?: number }
  ) {
    const { user, permissions } = await this.checkExportPermission(userId);
    const dateRange = this.getDateRange(options.startDate, options.endDate, 30);
    const allowedUnits = await this.getAllowedUnits(user, permissions);

    const where: any = {
      date: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    };

    if (options.unitId) {
      where.unitId = options.unitId;
    } else if (allowedUnits.length > 0) {
      where.unitId = { in: allowedUnits };
    }

    const emotionStats = await this.prisma.emotionStatistics.findMany({
      where,
      include: {
        unit: { select: { name: true, code: true } }
      },
      orderBy: { date: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo cảm xúc');

    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = `BÁO CÁO THỐNG KÊ CẢM XÚC (${dateRange.start.toISOString().split('T')[0]} - ${dateRange.end.toISOString().split('T')[0]})`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.addRow([]);
    worksheet.addRow(['Ngày', 'Đơn vị', 'Trạng thái cảm xúc', 'Số lượng', 'Ghi chú']);
    worksheet.getRow(3).font = { bold: true };

    emotionStats.forEach(stat => {
      worksheet.addRow([
        stat.date.toISOString().split('T')[0],
        stat.unit?.name || 'Tất cả đơn vị',
        stat.emotionStatus,
        stat.count,
        ''
      ]);
    });

    const filename = `emotion-report-${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await workbook.xlsx.writeFile(filePath);

    return { file: filePath, filename };
  }

  /**
   * Export alerts summary
   */
  async exportAlertsSummary(userId: string, options: { months: number }) {
    await this.checkExportPermission(userId, true);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - options.months);

    const alerts = await this.prisma.emotionAlert.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        unit: { select: { name: true, code: true } },
        resolver: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tổng hợp cảnh báo');

    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = `TỔNG HỢP CẢNH BÁO CẢM XÚC (${options.months} THÁNG GẦN ĐÂY)`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.addRow([]);
    worksheet.addRow(['Ngày tạo', 'Đơn vị', 'Mức độ', 'Tiêu đề', 'Trạng thái', 'Người xử lý', 'Ngày xử lý']);
    worksheet.getRow(3).font = { bold: true };

    alerts.forEach(alert => {
      worksheet.addRow([
        alert.createdAt.toISOString().split('T')[0],
        alert.unit?.name || 'N/A',
        alert.alertLevel,
        alert.title,
        alert.isResolved ? 'Đã xử lý' : 'Chưa xử lý',
        alert.resolver ? `${alert.resolver.firstName} ${alert.resolver.lastName}` : '',
        alert.resolvedAt ? alert.resolvedAt.toISOString().split('T')[0] : ''
      ]);
    });

    const filename = `alerts-summary-${options.months}months-${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await workbook.xlsx.writeFile(filePath);

    return { file: filePath, filename };
  }

  // Helper methods
  private async checkExportPermission(userId: string, requireAllUnits: boolean = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    const permissions = user?.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    ) || [];

    if (requireAllUnits && !permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      throw new ForbiddenException('Không có quyền export dữ liệu toàn hệ thống');
    }

    return { user, permissions };
  }

  private async getAllowedUnits(user: any, permissions: string[]): Promise<number[]> {
    if (permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      return [];
    }

    if (user?.unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: user.unitId },
        include: { children: true }
      });
      return unit ? [unit.id, ...unit.children.map(child => child.id)] : [user.unitId];
    }

    return [];
  }

  private getDateRange(startDate?: string, endDate?: string, days: number = 30) {
    let start: Date, end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - days);
    }

    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    return { start, end };
  }
}
