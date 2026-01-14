import { Controller, Get, Query, Request, Res } from '@nestjs/common';
import { LoginHistoryService } from './login-histories.service';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiBearerAuth('access-token') // Use the name defined in main.ts
@Controller('login-histories')
export class LoginHistoriesController {
  constructor(private loginHistoryService: LoginHistoryService) {}

  // ✅ Get history of current logged-in user
  @Get('/me-login-histories')
  async getMyLoginHistory(@Request() req: any) {
    const userId = req.user.id;
    return this.loginHistoryService.getLoginHistoryByUser(userId);
  }

  // ✅ Admin get all login histories
  @Get('/all-login-histories')
  @ApiOperation({ summary: 'Get all login histories' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'device', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'List of login histories' })
  async getAllLoginHistories(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('userId') userId?: string,
    @Query('device') device?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange =
      startDate && endDate
        ? { start: new Date(startDate), end: new Date(endDate) }
        : undefined;

    return this.loginHistoryService.getAllLoginHistories(
      parseInt(page) || 1,
      parseInt(pageSize) || 10,
      userId,
      device,
      dateRange,
    );
  }

  @Get('/export-login-histories-excel')
  async exportLoginHistory(@Res() res: Response) {
    return this.loginHistoryService.exportLoginHistory(res);
  }
}
