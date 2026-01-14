import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { SupportContentService } from './support-content.service';
import { CreateSupportContentDto } from './dto/create-support-content.dto';
import { UpdateSupportContentDto } from './dto/update-support-content.dto';
import { GetSupportContentQueryDto } from './dto/get-support-content-query.dto';
import { CustomAuthGuard } from '../../guard/custom-auth.guard';
import { Permissions } from '../../decorator/permissions.decorator';
import { Public } from '../../decorator/public.decorator';

@ApiTags('Support Content - Nội dung hỗ trợ tinh thần')
@ApiBearerAuth()
@UseGuards(CustomAuthGuard)
@Controller('support-content')
export class SupportContentController {
  constructor(private readonly supportContentService: SupportContentService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo nội dung hỗ trợ mới',
    description: 'Tạo nội dung hỗ trợ tinh thần mới (chỉ admin)'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nội dung thành công',
  })
  @Permissions('CREATE_SUPPORT_CONTENT')
  create(@Request() req, @Body() createSupportContentDto: CreateSupportContentDto) {
    return this.supportContentService.create(req.user.id, createSupportContentDto);
  }

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Lấy nội dung hỗ trợ (cho user)',
    description: 'Lấy danh sách nội dung hỗ trợ đang active cho user thường đọc'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nội dung thành công',
  })
  findAllForUsers(@Query() query: GetSupportContentQueryDto) {
    return this.supportContentService.findAllForUsers(query);
  }

  @Get('admin')
  @ApiOperation({
    summary: 'Lấy tất cả nội dung hỗ trợ (cho admin)',
    description: 'Lấy danh sách tất cả nội dung hỗ trợ bao gồm cả inactive'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nội dung thành công',
  })
  @Permissions('VIEW_SUPPORT_CONTENT', 'CREATE_SUPPORT_CONTENT')
  findAllForAdmin(@Query() query: GetSupportContentQueryDto) {
    return this.supportContentService.findAllForAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Thống kê nội dung hỗ trợ',
    description: 'Lấy thống kê tổng quan về nội dung hỗ trợ tinh thần'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
  })
  @Permissions('VIEW_SUPPORT_CONTENT', 'CREATE_SUPPORT_CONTENT')
  getStatistics() {
    return this.supportContentService.getStatistics();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết nội dung hỗ trợ',
    description: 'Lấy chi tiết một nội dung hỗ trợ và tăng view count'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết nội dung thành công',
  })
  findOne(@Param('id') id: string, @Request() req) {
    // Check if user has admin permissions (if authenticated)
    const userPermissions = req.user?.permissions || [];
    const isAdmin = userPermissions.includes('CREATE_SUPPORT_CONTENT');
    
    return this.supportContentService.findOne(id, !isAdmin);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật nội dung hỗ trợ',
    description: 'Cập nhật nội dung hỗ trợ (chỉ creator hoặc admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật nội dung thành công',
  })
  @Permissions('UPDATE_SUPPORT_CONTENT')
  update(
    @Param('id') id: string, 
    @Request() req, 
    @Body() updateSupportContentDto: UpdateSupportContentDto
  ) {
    const userPermissions = req.user.permissions || [];
    const isAdmin = userPermissions.includes('CREATE_SUPPORT_CONTENT');
    
    return this.supportContentService.update(id, req.user.id, updateSupportContentDto, isAdmin);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa nội dung hỗ trợ',
    description: 'Xóa nội dung hỗ trợ (chỉ creator hoặc admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa nội dung thành công',
  })
  @Permissions('DELETE_SUPPORT_CONTENT')
  remove(@Param('id') id: string, @Request() req) {
    const userPermissions = req.user.permissions || [];
    const isAdmin = userPermissions.includes('CREATE_SUPPORT_CONTENT');
    
    return this.supportContentService.remove(id, req.user.id, isAdmin);
  }
}