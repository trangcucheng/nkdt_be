import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class LoginHistoryService {
  constructor(private prisma: PrismaService) {}

  async getLoginHistoryByUser(userId: string) {
    return this.prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllLoginHistories(
    page: number = 1,
    pageSize: number = 10,
    userId?: string,
    device?: string,
    dateRange?: { start: Date; end: Date },
  ) {
    const where: any = {};

    if (userId) where.userId = userId;
    if (device) where.device = device;
    if (dateRange)
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };

    const [data, total] = await Promise.all([
      this.prisma.loginHistory.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.loginHistory.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async exportLoginHistory(res: Response) {
    const histories = await this.prisma.loginHistory.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Login History');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'User Email', key: 'email', width: 30 },
      { header: 'IP Address', key: 'ipAddress', width: 20 },
      { header: 'Device', key: 'device', width: 15 },
      { header: 'Location', key: 'location', width: 25 },
      { header: 'Login Time', key: 'createdAt', width: 25 },
    ];

    histories.forEach((h) => {
      worksheet.addRow({
        id: h.id,
        email: h.user.email,
        ipAddress: h.ipAddress,
        device: h.device,
        location: h.location,
        createdAt: h.createdAt.toISOString(),
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=login-history.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
