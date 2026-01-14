import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { 
  EmotionOverviewDto, 
  UnitEmotionStatsDto, 
  HashtagTrendDto 
} from './dto/dashboard-response.dto';
import { CustomAuthGuard } from '../../guard/custom-auth.guard';
import { Permissions } from '../../decorator/permissions.decorator';

@ApiTags('Dashboard - Bảng tổng quan cho Admin')
@ApiBearerAuth()
@UseGuards(CustomAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('emotion-overview')
  @ApiOperation({
    summary: 'Tổng quan cảm xúc',
    description: 'Lấy thống kê tổng quan cảm xúc cho admin/manager'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy tổng quan cảm xúc thành công',
    type: EmotionOverviewDto,
  })
  @Permissions('VIEW_UNIT_EMOTION_DASHBOARD', 'VIEW_ALL_UNITS_ANALYTICS')
  getEmotionOverview(@Request() req, @Query() query: DashboardQueryDto): Promise<EmotionOverviewDto> {
    return this.dashboardService.getEmotionOverview(req.user.id, query);
  }

  @Get('unit-emotion-stats')
  @ApiOperation({
    summary: 'Thống kê cảm xúc theo đơn vị',
    description: 'Lấy thống kê cảm xúc chi tiết theo từng đơn vị'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê đơn vị thành công',
    type: [UnitEmotionStatsDto],
  })
  @Permissions('VIEW_UNIT_EMOTION_DASHBOARD', 'VIEW_ALL_UNITS_ANALYTICS')
  getUnitEmotionStats(@Request() req, @Query() query: DashboardQueryDto): Promise<UnitEmotionStatsDto[]> {
    return this.dashboardService.getUnitEmotionStats(req.user.id, query);
  }

  @Get('hashtag-trends')
  @ApiOperation({
    summary: 'Xu hướng chủ đề quan tâm',
    description: 'Lấy các hashtag/chủ đề được quan tâm nhiều nhất'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy xu hướng hashtag thành công',
    type: [HashtagTrendDto],
  })
  @Permissions('VIEW_HASHTAG_TRENDS', 'VIEW_ALL_UNITS_ANALYTICS')
  getHashtagTrends(@Request() req, @Query() query: DashboardQueryDto): Promise<HashtagTrendDto[]> {
    return this.dashboardService.getHashtagTrends(req.user.id, query);
  }

  @Get('emotion-trend')
  @ApiOperation({
    summary: 'Xu hướng cảm xúc theo thời gian',
    description: 'Lấy biểu đồ xu hướng cảm xúc theo ngày'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy xu hướng cảm xúc thành công',
  })
  @Permissions('VIEW_UNIT_EMOTION_DASHBOARD', 'VIEW_ALL_UNITS_ANALYTICS')
  getEmotionTrend(@Request() req, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getEmotionTrend(req.user.id, query);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Danh sách người dùng',
    description: 'Lấy danh sách tất cả người dùng trong hệ thống'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người dùng thành công',
  })
  @Permissions('VIEW_ALL_USERS', 'VIEW_ALL_UNITS_ANALYTICS')
  getUsersList(@Request() req, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getUsersList(req.user.id, query);
  }

  @Get('units')
  @ApiOperation({
    summary: 'Danh sách đơn vị',
    description: 'Lấy danh sách tất cả đơn vị trong hệ thống'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách đơn vị thành công',
  })
  @Permissions('VIEW_ALL_UNITS', 'VIEW_ALL_UNITS_ANALYTICS')
  getUnitsList(@Request() req, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getUnitsList(req.user.id, query);
  }

  @Get('emotion-alerts')
  @ApiOperation({
    summary: 'Cảnh báo xu hướng tiêu cực',
    description: 'Lấy danh sách cảnh báo về xu hướng cảm xúc tiêu cực'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy cảnh báo cảm xúc thành công',
  })
  @Permissions('VIEW_EMOTION_ALERTS', 'VIEW_ALL_UNITS_ANALYTICS')
  getEmotionAlerts(@Request() req, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getEmotionAlerts(req.user.id, query);
  }
}