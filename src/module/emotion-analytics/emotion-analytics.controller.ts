import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmotionAnalyticsService } from './emotion-analytics.service';
import { CustomAuthGuard } from '../../guard/custom-auth.guard';
import { Permissions } from '../../decorator/permissions.decorator';

@ApiTags('Emotion Analytics - Phân tích cảm xúc')
@ApiBearerAuth()
@UseGuards(CustomAuthGuard)
@Controller('emotion-analytics')
export class EmotionAnalyticsController {
  constructor(private readonly emotionAnalyticsService: EmotionAnalyticsService) {}

  @Post('generate-daily-stats')
  @ApiOperation({
    summary: 'Tạo thống kê cảm xúc hàng ngày',
    description: 'Tự động tạo thống kê cảm xúc cho ngày hôm qua (dùng cho cronjob)'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo thống kê thành công',
  })
  @Permissions('MANAGE_SYSTEM_SETTINGS')
  generateDailyStats() {
    return this.emotionAnalyticsService.generateDailyEmotionStatistics();
  }

  @Post('generate-hashtag-trends')
  @ApiOperation({
    summary: 'Tạo xu hướng hashtag hàng ngày',
    description: 'Tự động tạo thống kê hashtag cho ngày hôm qua (dùng cho cronjob)'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo xu hướng hashtag thành công',
  })
  @Permissions('MANAGE_SYSTEM_SETTINGS')
  generateHashtagTrends() {
    return this.emotionAnalyticsService.generateDailyHashtagTrends();
  }

  @Post('detect-alerts')
  @ApiOperation({
    summary: 'Phát hiện cảnh báo cảm xúc',
    description: 'Tự động phát hiện và tạo cảnh báo xu hướng tiêu cực (dùng cho cronjob)'
  })
  @ApiResponse({
    status: 201,
    description: 'Phát hiện cảnh báo thành công',
  })
  @Permissions('MANAGE_SYSTEM_SETTINGS')
  detectEmotionAlerts() {
    return this.emotionAnalyticsService.detectEmotionAlerts();
  }

  @Get('detailed-report')
  @ApiOperation({
    summary: 'Báo cáo phân tích cảm xúc chi tiết',
    description: 'Lấy báo cáo phân tích cảm xúc chi tiết theo đơn vị và thời gian'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy báo cáo thành công',
  })
  @Permissions('VIEW_EMOTION_ANALYTICS', 'VIEW_ALL_UNITS_ANALYTICS')
  getDetailedReport(
    @Query('unitId') unitId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.emotionAnalyticsService.getDetailedEmotionReport(
      unitId ? parseInt(unitId.toString()) : undefined,
      startDate,
      endDate
    );
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Lấy danh sách cảnh báo cảm xúc',
    description: 'Lấy danh sách cảnh báo cảm xúc theo đơn vị và trạng thái'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách cảnh báo thành công',
  })
  @Permissions('VIEW_EMOTION_ALERTS')
  getEmotionAlerts(
    @Request() req: any,
    @Query('unitId') unitId?: number,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.emotionAnalyticsService.getEmotionAlerts(
      req.user.id,
      unitId ? parseInt(unitId.toString()) : undefined,
      status,
      severity,
      parseInt(page.toString()),
      parseInt(limit.toString())
    );
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({
    summary: 'Giải quyết cảnh báo cảm xúc',
    description: 'Đánh dấu cảnh báo đã được giải quyết và ghi chú hành động'
  })
  @ApiResponse({
    status: 200,
    description: 'Giải quyết cảnh báo thành công',
  })
  @Permissions('RESOLVE_EMOTION_ALERTS')
  resolveEmotionAlert(
    @Param('id') alertId: string,
    @Request() req: any,
    @Body() resolveData: {
      resolutionNote?: string;
      actions?: string;
    }
  ) {
    return this.emotionAnalyticsService.resolveEmotionAlert(
      alertId,
      req.user.id,
      resolveData.resolutionNote,
      resolveData.actions
    );
  }
}