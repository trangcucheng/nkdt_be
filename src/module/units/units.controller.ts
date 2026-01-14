import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Query,
  BadRequestException,
  Delete,
  Put,
  NotFoundException,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Prisma, Unit } from '@prisma/client';
import { UnitsService } from './units.service';
import { GetAllUnitsDTO } from './dto/pagination.dto';
import { CreateUnitDTO } from './dto/create-unit.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { Permissions } from 'src/decorator/permissions.decorator';
import { UpdateUnitDTO } from './dto/update-unit.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorator/public.decorator';

@ApiBearerAuth('access-token') // Use the name defined in main.ts
@Controller('units')
export class UnitsController {
  constructor(private unitService: UnitsService) {}

  @Get('/list-all-unit')
  @Permissions('VIEW_UNIT')
  async getAllUnits(@Query() query: GetAllUnitsDTO): Promise<Unit[]> {
    const { page = '1', pageSize = '10', orderBy } = query;

    // Xử lý orderBy string (vd: 'createdAt:desc')
    let orderByObj: Prisma.UserOrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        createdAt: orderBy === 'createdAt:desc' ? 'desc' : 'asc',
      };
    }

    return this.unitService.getAllUnits({
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: orderByObj as any,
    });
  }

  @Get('/list-tree-unit')
  @Permissions('VIEW_UNIT')
  async getTreeUnits(@Query() query: GetAllUnitsDTO): Promise<any[]> {
    const { page = '1', pageSize = '10', orderBy } = query;

    let orderByObj: Prisma.UnitOrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        createdAt: orderBy === 'createdAt:desc' ? 'desc' : 'asc',
      };
    }

    return this.unitService.getTreeUnits({
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: orderByObj,
    });
  }

  @Post('/create-unit')
  @Permissions('CREATE_UNIT') // Assuming you have a permission for creating units
  async createUnit(@Body() createUnitDTO: CreateUnitDTO): Promise<Unit> {
    return this.unitService.createUnit(createUnitDTO);
  }

  @Put('/update-unit')
  @Permissions('UPDATE_UNIT')
  async updateUnit(@Body() updateUnitDTO: UpdateUnitDTO, @Request() req: any) {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestException('Unit ID is required');
    }
    return this.unitService.updateUnit({
      where: { id: Number(id) },
      data: updateUnitDTO,
    });
  }

  @Delete('/delete-unit')
  @Permissions('DELETE_UNIT')
  async deleteUnit(@Request() req: any, @Query('unitId') unitId: number) {
    if (!unitId) {
      throw new BadRequestException('User ID is required');
    }
    try {
      await this.unitService.deleteUnit({ id: unitId });
      return {
        status: 'success',
        statusCode: 200,
        message: `Unit with id ${unitId} deleted successfully`,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException({
          status: 'error',
          statusCode: 404,
          message: `Unit with id ${unitId} not found`,
        });
      }
      throw error;
    }
  }

  @Delete('/delete-all-units')
  @Permissions('DELETE_ALL_UNITS')
  async deleteAllUnitsAndResetId(
    @Request() req: any,
  ): Promise<{ status: string }> {
    try {
      await this.unitService.deleteAllUnitsAndResetId();
      return { status: 'success' };
    } catch (error) {
      throw new BadRequestException(
        `Error deleting all units: ${error.message}`,
      );
    }
  }

  @Get('/detail-unit')
  async getUnitById(@Query('unitId') unitId: number): Promise<Unit | null> {
    if (!unitId) {
      throw new BadRequestException('Unit ID is required');
    }
    const unit = await this.unitService.getUnitById(unitId);
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  @Post('/import-from-excel')
  // @Permissions('IMPORT_UNIT')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ status: string; results: any[] }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    try {
      const results = await this.unitService.importFromExcel(file.buffer);
      return { status: 'success', results };
    } catch (error) {
      throw new BadRequestException(
        `Error importing from Excel: ${error.message}`,
      );
    }
  }
}
