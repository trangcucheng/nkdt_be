import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { PermissionsGuard } from '../../guard/permissions.guard';
import { Permissions } from '../../decorator/permissions.decorator';
import { IdeologicalWorkNoteService } from './ideological-work-note.service';
import { CreateIdeologicalWorkNoteDto } from './dto/create-ideological-work-note.dto';
import { UpdateIdeologicalWorkNoteDto } from './dto/update-ideological-work-note.dto';
import { GetIdeologicalWorkNotesQueryDto } from './dto/get-ideological-work-notes-query.dto';
import { IdeologicalWorkNoteResponseDto } from './dto/ideological-work-note-response.dto';

@ApiTags('Ideological Work Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ideological-work-notes')
export class IdeologicalWorkNoteController {
  constructor(
    private readonly ideologicalWorkNoteService: IdeologicalWorkNoteService,
  ) {}

  @Post()
  @Permissions('CREATE_IDEOLOGICAL_WORK_NOTE')
  @ApiOperation({ 
    summary: 'Tạo ghi chú công tác tư tưởng mới',
    description: 'Tạo mới một ghi chú công tác tư tưởng. Chỉ manager trở lên mới có thể tạo ghi chú.' 
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo ghi chú thành công',
    type: IdeologicalWorkNoteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền tạo ghi chú công tác tư tưởng',
  })
  async create(
    @Request() req: any,
    @Body() createDto: CreateIdeologicalWorkNoteDto,
  ): Promise<IdeologicalWorkNoteResponseDto> {
    return await this.ideologicalWorkNoteService.create(req.user.id, createDto) as any;
  }

  @Get()
  @Permissions('VIEW_IDEOLOGICAL_WORK_NOTES')
  @ApiOperation({ 
    summary: 'Lấy danh sách ghi chú công tác tư tưởng',
    description: 'Lấy danh sách ghi chú công tác tư tưởng với phân quyền theo role. Manager chỉ xem của đơn vị mình quản lý.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    type: [IdeologicalWorkNoteResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang (mặc định: 10, tối đa: 100)' })
  @ApiQuery({ name: 'unitId', required: false, type: Number, description: 'Lọc theo đơn vị' })
  @ApiQuery({ name: 'startDate', required: false, type: String, format: 'date', description: 'Ngày bắt đầu lọc' })
  @ApiQuery({ name: 'endDate', required: false, type: String, format: 'date', description: 'Ngày kết thúc lọc' })
  async findAll(
    @Request() req: any,
    @Query() query: GetIdeologicalWorkNotesQueryDto,
  ) {
    return await this.ideologicalWorkNoteService.findAll(req.user.id, query);
  }

  @Get('statistics')
  @Permissions('VIEW_IDEOLOGICAL_WORK_NOTES')
  @ApiOperation({ 
    summary: 'Thống kê ghi chú công tác tư tưởng',
    description: 'Lấy thống kê tổng quan về ghi chú công tác tư tưởng theo quyền của user' 
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
    schema: {
      type: 'object',
      properties: {
        totalCount: { type: 'number', description: 'Tổng số ghi chú' },
        recentCount: { type: 'number', description: 'Số ghi chú trong 30 ngày gần đây' },
        unitStats: {
          type: 'array',
          description: 'Thống kê theo đơn vị',
          items: {
            type: 'object',
            properties: {
              unitId: { type: 'number' },
              _count: {
                type: 'object',
                properties: {
                  unitId: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getStatistics(@Request() req: any) {
    return await this.ideologicalWorkNoteService.getStatistics(req.user.id);
  }

  @Get(':id')
  @Permissions('VIEW_IDEOLOGICAL_WORK_NOTES')
  @ApiOperation({ 
    summary: 'Lấy chi tiết ghi chú công tác tư tưởng',
    description: 'Lấy thông tin chi tiết của một ghi chú công tác tư tưởng' 
  })
  @ApiParam({ name: 'id', description: 'ID của ghi chú', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết thành công',
    type: IdeologicalWorkNoteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy ghi chú',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xem ghi chú này',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<IdeologicalWorkNoteResponseDto> {
    return await this.ideologicalWorkNoteService.findOne(id, req.user.id) as any;
  }

  @Patch(':id')
  @Permissions('UPDATE_IDEOLOGICAL_WORK_NOTE')
  @ApiOperation({ 
    summary: 'Cập nhật ghi chú công tác tư tưởng',
    description: 'Cập nhật thông tin của một ghi chú công tác tư tưởng. Chỉ tác giả hoặc super admin mới có thể cập nhật.' 
  })
  @ApiParam({ name: 'id', description: 'ID của ghi chú', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: IdeologicalWorkNoteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy ghi chú',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền cập nhật ghi chú này',
  })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: UpdateIdeologicalWorkNoteDto,
  ): Promise<IdeologicalWorkNoteResponseDto> {
    return await this.ideologicalWorkNoteService.update(id, req.user.id, updateDto) as any;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('DELETE_IDEOLOGICAL_WORK_NOTE')
  @ApiOperation({ 
    summary: 'Xóa ghi chú công tác tư tưởng',
    description: 'Xóa một ghi chú công tác tư tưởng. Chỉ tác giả hoặc super admin mới có thể xóa.' 
  })
  @ApiParam({ name: 'id', description: 'ID của ghi chú', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy ghi chú',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xóa ghi chú này',
  })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.ideologicalWorkNoteService.remove(id, req.user.id);
  }

  // API riêng cho Admin/Super Admin
  @Get('admin/all-units')
  @Permissions('VIEW_ALL_UNITS_ANALYTICS')
  @ApiOperation({ 
    summary: '[Admin] Xem tất cả ghi chú công tác của các đơn vị',
    description: 'API dành riêng cho admin để xem tất cả ghi chú công tác của tất cả đơn vị' 
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    type: [IdeologicalWorkNoteResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unitId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'endDate', required: false, type: String, format: 'date' })
  async getAllUnitsWorkNotes(
    @Request() req: any,
    @Query() query: GetIdeologicalWorkNotesQueryDto,
  ) {
    return await this.ideologicalWorkNoteService.findAll(req.user.id, query);
  }

  @Get('admin/statistics/overview')
  @Permissions('VIEW_ALL_UNITS_ANALYTICS')
  @ApiOperation({ 
    summary: '[Admin] Thống kê tổng quan toàn hệ thống',
    description: 'API dành riêng cho admin để xem thống kê tổng quan về ghi chú công tác của toàn hệ thống' 
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
    schema: {
      type: 'object',
      properties: {
        totalCount: { type: 'number' },
        recentCount: { type: 'number' },
        unitStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              unitId: { type: 'number' },
              _count: {
                type: 'object',
                properties: {
                  unitId: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getSystemStatistics(@Request() req: any) {
    return await this.ideologicalWorkNoteService.getStatistics(req.user.id);
  }
}