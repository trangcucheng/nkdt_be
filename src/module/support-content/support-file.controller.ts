import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { SupportFileService } from './support-file.service';
import { CreateSupportFileDto } from './dto/create-support-file.dto';
import { UpdateSupportFileDto } from './dto/update-support-file.dto';
import { GetSupportFileQueryDto } from './dto/get-support-file-query.dto';
import { CustomAuthGuard } from '../../guard/custom-auth.guard';
import { Permissions } from '../../decorator/permissions.decorator';
import { Public } from '../../decorator/public.decorator';

@ApiTags('Support Files - File hỗ trợ tinh thần')
@ApiBearerAuth()
@UseGuards(CustomAuthGuard)
@Controller('support-files')
export class SupportFileController {
  constructor(private readonly supportFileService: SupportFileService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload file hỗ trợ mới',
    description: 'Upload file PDF hoặc Word cho nội dung hỗ trợ tinh thần (chỉ admin)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File và thông tin metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File PDF hoặc Word'
        },
        title: {
          type: 'string',
          description: 'Tiêu đề file'
        },
        description: {
          type: 'string',
          description: 'Mô tả file'
        },
        category: {
          type: 'string',
          enum: ['EMOTION_MANAGEMENT', 'ADAPTATION_SKILLS', 'MOTIVATION', 'STUDY_TIPS', 'WORK_SKILLS', 'HEALTH_WELLNESS'],
          description: 'Danh mục'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Upload file thành công',
  })
  @Permissions('CREATE_SUPPORT_CONTENT')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.includes('pdf') && 
          !file.mimetype.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') &&
          !file.mimetype.includes('application/msword')) {
        return callback(new BadRequestException('Chỉ hỗ trợ file PDF và Word'), false);
      }
      callback(null, true);
    },
  }))
  async uploadFile(
    @Request() req,
    @Body() createSupportFileDto: CreateSupportFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload');
    }

    return this.supportFileService.create(req.user.id, createSupportFileDto, file);
  }

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Lấy danh sách file (cho user)',
    description: 'Lấy danh sách file hỗ trợ đang active cho user thường xem'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách file thành công',
  })
  findAllForUsers(@Query() query: GetSupportFileQueryDto) {
    return this.supportFileService.findAllForUsers(query);
  }

  @Get('admin')
  @ApiOperation({
    summary: 'Lấy tất cả file (cho admin)',
    description: 'Lấy danh sách tất cả file bao gồm cả inactive'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách file thành công',
  })
  @Permissions('VIEW_SUPPORT_CONTENT', 'CREATE_SUPPORT_CONTENT')
  findAllForAdmin(@Query() query: GetSupportFileQueryDto) {
    return this.supportFileService.findAllForAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Thống kê file',
    description: 'Lấy thống kê tổng quan về file hỗ trợ tinh thần'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
  })
  @Permissions('VIEW_SUPPORT_CONTENT', 'CREATE_SUPPORT_CONTENT')
  getStatistics() {
    return this.supportFileService.getStatistics();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết file',
    description: 'Lấy chi tiết thông tin file hỗ trợ'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết file thành công',
  })
  findOne(@Param('id') id: string) {
    return this.supportFileService.findOne(id);
  }

  @Public()
  @Get('download/:id')
  @ApiOperation({
    summary: 'Download file',
    description: 'Download file hỗ trợ và tăng counter'
  })
  @ApiResponse({
    status: 200,
    description: 'Download file thành công',
  })
  async downloadFile(@Param('id') id: string, @Res({ passthrough: true }) res: Response, @Query('view') view?: string) {
    const fileInfo = await this.supportFileService.downloadFile(id);
    
    const file = createReadStream(fileInfo.filePath);
    
    // Encode filename for Content-Disposition header (support Vietnamese characters)
    const encodedFileName = encodeURIComponent(fileInfo.fileName);
    
    // If view=true, set headers for inline viewing (for PDF viewer)
    if (view === 'true' && (fileInfo.fileType.includes('pdf') || fileInfo.fileType.includes('word') || fileInfo.fileType.includes('document'))) {
      res.set({
        'Content-Type': fileInfo.fileType,
        'Content-Disposition': `inline; filename*=UTF-8''${encodedFileName}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      });
    } else {
      res.set({
        'Content-Type': fileInfo.fileType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
      });
    }

    return new StreamableFile(file);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin file',
    description: 'Cập nhật metadata của file hỗ trợ (chỉ admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật file thành công',
  })
  @Permissions('UPDATE_SUPPORT_CONTENT')
  update(@Param('id') id: string, @Body() updateSupportFileDto: UpdateSupportFileDto) {
    return this.supportFileService.update(id, updateSupportFileDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa file',
    description: 'Xóa file hỗ trợ (chỉ admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa file thành công',
  })
  @Permissions('DELETE_SUPPORT_CONTENT')
  remove(@Param('id') id: string) {
    return this.supportFileService.remove(id);
  }
}
