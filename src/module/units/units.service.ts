import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Unit, User } from '@prisma/client';
import * as XLSX from 'xlsx';

export interface ImportResult {
  row: any;
  status: 'success' | 'failed';
  unitId?: number;
  reason?: string;
}

@Injectable()
export class UnitsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getAllUnits(
    params: {
      page?: number;
      pageSize?: number;
      where?: Prisma.UnitWhereInput;
      orderBy?: Prisma.UnitOrderByWithRelationInput;
    } = {},
  ): Promise<Unit[]> {
    const { page = 1, pageSize = 10, where, orderBy } = params;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    // findMany không hỗ trợ phân trang trực tiếp, nên ta sẽ sử dụng skip và take (tức là không dùng được page và pageSize)
    return await this.prisma.unit.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  // Hàm đệ quy để lấy tất cả các đơn vị con
  async getUnitWithChildrenRecursive(
    unitId: number,
    orderBy?: Prisma.UnitOrderByWithRelationInput,
  ): Promise<any> {
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) return null;

    const children = await this.prisma.unit.findMany({
      where: { parentId: unitId },
      orderBy,
    });

    const childrenWithSub = await Promise.all(
      children.map(
        async (child) =>
          await this.getUnitWithChildrenRecursive(child.id, orderBy),
      ),
    );

    return { ...unit, children: childrenWithSub };
  }

  async getTreeUnits(params: {
    page?: number;
    pageSize?: number;
    orderBy?: Prisma.UnitOrderByWithRelationInput;
  }): Promise<any[]> {
    const { page = 1, pageSize = 10, orderBy } = params;
    const skip = (page - 1) * pageSize;

    // Lấy các unit root
    const rootUnits = await this.prisma.unit.findMany({
      where: { parentId: null },
      skip,
      take: pageSize,
      orderBy,
    });

    // Lấy children recursive
    const tree = await Promise.all(
      rootUnits.map(
        async (unit) =>
          await this.getUnitWithChildrenRecursive(unit.id, orderBy),
      ),
    );

    return tree;
  }

  async createUnit(data: Prisma.UnitCreateInput): Promise<Unit> {
    return this.prisma.unit.create({
      data,
    });
  }

  async updateUnit(params: {
    where: Prisma.UnitWhereUniqueInput;
    data: Prisma.UnitUpdateInput;
  }): Promise<Unit> {
    const { where, data } = params;
    return this.prisma.unit.update({
      data,
      where,
    });
  }

  async deleteUnit(where: Prisma.UnitWhereUniqueInput): Promise<Unit> {
    return this.prisma.unit.delete({
      where,
    });
  }

  async deleteAllUnitsAndResetId(): Promise<{ status: string }> {
    try {
      // Dùng TRUNCATE để xóa sạch và reset id về 1
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "Unit" RESTART IDENTITY CASCADE;`,
      );

      return { status: 'success' };
    } catch (error) {
      console.error('Error deleting all units and resetting ID:', error);
      throw error;
    }
  }

  async getUnitById(id: number): Promise<Unit | null> {
    return this.prisma.unit.findUnique({
      where: { id },
    });
  }

  async importFromExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results: ImportResult[] = [];

    // Insert all units without ParentCode first
    for (const row of data) {
      if (!row.name || !row.code) {
        results.push({ row, status: 'failed', reason: 'Missing name or code' });
        continue;
      }

      if (!row.ParentCode) {
        try {
          const unit = await this.prisma.unit.create({
            data: {
              name: row.name || '',
              code: row.code || '',
              description: row.description || '',
              status: row.status || 'ACTIVE',
              parentId: row.parentId ? Number(row.parentId) : null,
            },
          });
          results.push({ row, status: 'success', unitId: unit.id });
        } catch (err) {
          results.push({ row, status: 'failed', reason: err.message });
        }
      }
    }

    // Insert units with ParentCode
    for (const row of data) {
      if (!row.ParentCode) continue;

      const parent = await this.prisma.unit.findUnique({
        where: { code: row.ParentCode },
      });

      if (!parent) {
        results.push({
          row,
          status: 'failed',
          reason: `Parent with code ${row.ParentCode} not found`,
        });
        continue;
      }

      try {
        const unit = await this.prisma.unit.create({
          data: {
            name: row.name,
            code: row.code,
            parentId: parent.id,
          },
        });
        results.push({ row, status: 'success', unitId: unit.id });
      } catch (err) {
        results.push({ row, status: 'failed', reason: err.message });
      }
    }

    return results;
  }
}
