import { 
  Controller, 
  Get, 
  Res, 
  Query, 
  UseGuards,
  Request
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExportService } from './exports.service';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { PermissionsGuard } from '../../guard/permissions.guard';
import { Permissions } from '../../decorator/permissions.decorator';

@ApiTags('Exports - Xuất báo cáo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('exports')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('users/excel')
  @Permissions('EXPORT_EMOTION_REPORTS')
  @ApiOperation({
    summary: 'Xuất danh sách users ra Excel',
    description: 'Xuất danh sách tất cả users ra file Excel'
  })
  @ApiResponse({
    status: 200,
    description: 'Xuất file Excel thành công'
  })
  async exportUsersExcel(@Res() res: Response, @Request() req: any) {
    const result = await this.exportService.exportUsersExcel(req.user.id);
    return res.download(result.file, result.filename);
  }

  @Get('emotion-report')
  @Permissions('EXPORT_EMOTION_REPORTS')
  @ApiOperation({
    summary: 'Xuất báo cáo cảm xúc',
    description: 'Xuất báo cáo thống kê cảm xúc theo thời gian và đơn vị'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  @ApiQuery({ name: 'unitId', required: false, description: 'ID đơn vị' })
  async exportEmotionReport(
    @Res() res: Response,
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('unitId') unitId?: string
  ) {
    const result = await this.exportService.exportEmotionReport(
      req.user.id,
      { 
        startDate, 
        endDate, 
        unitId: unitId ? parseInt(unitId) : undefined 
      }
    );
    return res.download(result.file, result.filename);
  }

  @Get('alerts-summary')
  @Permissions('VIEW_ALL_UNITS_ANALYTICS')
  @ApiOperation({
    summary: 'Xuất tổng hợp cảnh báo',
    description: 'Xuất báo cáo tổng hợp tất cả cảnh báo cảm xúc'
  })
  @ApiQuery({ name: 'months', required: false, description: 'Số tháng gần đây (mặc định: 3)' })
  async exportAlertsSummary(
    @Res() res: Response,
    @Request() req: any,
    @Query('months') months: string = '3'
  ) {
    const result = await this.exportService.exportAlertsSummary(
      req.user.id,
      { months: parseInt(months) }
    );
    return res.download(result.file, result.filename);
  }
}
