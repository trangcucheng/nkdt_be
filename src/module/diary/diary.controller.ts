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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { GetDiariesQueryDto } from './dto/get-diaries-query.dto';
import { CreateDiaryReactionDto } from './dto/create-diary-reaction.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { DiaryResponseDto, PaginatedDiariesResponseDto } from './dto/diary-response.dto';
import { CustomAuthGuard } from '../../guard/custom-auth.guard';
import { Public } from 'src/decorator/public.decorator';

@ApiTags('Diary - Nhật ký cá nhân')
@ApiBearerAuth()
@UseGuards(CustomAuthGuard)
@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Tạo nhật ký mới',
    description: 'Tạo nhật ký mới cho user hiện tại. Mỗi user chỉ có thể có 1 nhật ký cho mỗi ngày.'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhật ký thành công',
    type: DiaryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Đã có nhật ký cho ngày này',
  })
  create(@Request() req, @Body() createDiaryDto: CreateDiaryDto) {
    return this.diaryService.create(req.user.id, createDiaryDto);
  }

  @Get('my-diaries')
  @ApiOperation({
    summary: 'Lấy danh sách nhật ký của tôi',
    description: 'Lấy danh sách nhật ký cá nhân với phân trang và bộ lọc'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nhật ký thành công',
    type: PaginatedDiariesResponseDto,
  })
  findMyDiaries(@Request() req, @Query() query: GetDiariesQueryDto) {
    return this.diaryService.findUserDiaries(req.user.id, query);
  }

  @Get('anonymous-shared')
  @ApiOperation({
    summary: 'Lấy nhật ký chia sẻ ẩn danh',
    description: 'Lấy danh sách nhật ký được chia sẻ ẩn danh cho "Không gian sẻ chia"'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nhật ký ẩn danh thành công',
    type: PaginatedDiariesResponseDto,
  })
  findAnonymousSharedDiaries(@Query() query: GetDiariesQueryDto) {
    return this.diaryService.findAnonymousSharedDiaries(query);
  }

  @Get('my-emotion-stats')
  @ApiOperation({
    summary: 'Thống kê cảm xúc cá nhân',
    description: 'Lấy thống kê cảm xúc cá nhân theo thời gian'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Ngày bắt đầu (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Ngày kết thúc (ISO string)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê cảm xúc thành công',
  })
  getMyEmotionStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.diaryService.getPersonalEmotionStats(req.user.id, startDate, endDate);
  }

  @Get('emotion-timeline')
  @ApiOperation({
    summary: 'Lấy timeline cảm xúc',
    description: 'Lấy danh sách nhật ký theo timeline với thông tin cảm xúc, hỗ trợ lọc'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  @ApiQuery({ name: 'emotionStatus', required: false, type: String, description: 'Lọc theo cảm xúc' })
  @ApiResponse({
    status: 200,
    description: 'Lấy timeline thành công',
  })
  getEmotionTimeline(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('emotionStatus') emotionStatus?: string,
  ) {
    return this.diaryService.getEmotionTimeline(req.user.id, startDate, endDate, emotionStatus);
  }

  @Public()
  @Get('guided-prompt')
  @ApiOperation({
    summary: 'Lấy câu hỏi gợi mở cho nhật ký dẫn dắt',
    description: 'Lấy câu hỏi gợi mở cho ngày hôm nay hoặc ngẫu nhiên'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: ['daily', 'random'], 
    description: 'Loại câu hỏi: daily (cố định theo ngày) hoặc random (ngẫu nhiên)',
    example: 'daily'
  })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    enum: ['reflection', 'gratitude', 'growth', 'emotion', 'challenge'], 
    description: 'Lọc theo danh mục câu hỏi'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy câu hỏi gợi mở thành công',
  })
  getGuidedPrompt(
    @Query('type') type?: 'daily' | 'random',
    @Query('category') category?: string,
  ) {
    return this.diaryService.getGuidedPrompt(type, category);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết nhật ký',
    description: 'Lấy chi tiết một nhật ký theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID của nhật ký' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết nhật ký thành công',
    type: DiaryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy nhật ký',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập nhật ký này',
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.diaryService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật nhật ký',
    description: 'Cập nhật nhật ký của chính mình'
  })
  @ApiParam({ name: 'id', description: 'ID của nhật ký' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật nhật ký thành công',
    type: DiaryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy nhật ký',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền chỉnh sửa nhật ký này',
  })
  update(@Param('id') id: string, @Request() req, @Body() updateDiaryDto: UpdateDiaryDto) {
    return this.diaryService.update(id, req.user.id, updateDiaryDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa nhật ký',
    description: 'Xóa nhật ký của chính mình'
  })
  @ApiParam({ name: 'id', description: 'ID của nhật ký' })
  @ApiResponse({
    status: 200,
    description: 'Xóa nhật ký thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy nhật ký',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xóa nhật ký này',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.diaryService.remove(id, req.user.id);
  }

  @Get(':id/reactions')
  @ApiOperation({
    summary: 'Lấy danh sách phản ứng của nhật ký',
    description: 'Lấy tất cả phản ứng cho một nhật ký'
  })
  @ApiParam({ name: 'id', description: 'ID của nhật ký' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phản ứng thành công',
  })
  getReactions(@Param('id') id: string) {
    return this.diaryService.getReactions(id);
  }

  @Post(':id/reactions')
  @ApiOperation({
    summary: 'Thêm phản ứng cho nhật ký',
    description: 'Thêm phản ứng cảm xúc cho nhật ký được chia sẻ ẩn danh'
  })
  @ApiParam({ name: 'id', description: 'ID của nhật ký' })
  @ApiResponse({
    status: 201,
    description: 'Thêm phản ứng thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy nhật ký',
  })
  @ApiResponse({
    status: 403,
    description: 'Không thể phản ứng với nhật ký này',
  })
  addReaction(
    @Param('id') id: string,
    @Request() req,
    @Body() createReactionDto: CreateDiaryReactionDto,
  ) {
    return this.diaryService.addReaction(id, req.user.id, createReactionDto);
  }

  @Delete(':id/reactions')
  @ApiOperation({
    summary: 'Xóa phản ứng',
    description: 'Xóa phản ứng cảm xúc đã thêm cho nhật ký'
  })
  @ApiParam({ name: 'id', description: 'ID của nhật ký' })
  @ApiResponse({
    status: 200,
    description: 'Xóa phản ứng thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy phản ứng',
  })
  removeReaction(@Param('id') id: string, @Request() req) {
    return this.diaryService.removeReaction(id, req.user.id);
  }

  // ========== COMMENT ENDPOINTS ==========

  @Get(':id/comments')
  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách bình luận',
    description: 'Lấy tất cả bình luận của một nhật ký'
  })
  @ApiParam({ name: 'id', description: 'ID của nhật ký' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bình luận thành công',
  })
  getComments(@Param('id') id: string) {
    return this.diaryService.getComments(id);
  }

  @Post(':id/comments')
  @ApiOperation({
    summary: 'Thêm bình luận',
    description: 'Thêm bình luận cho nhật ký được chia sẻ ẩn danh'
  })
  @ApiParam({ name: 'id', description: 'ID của nhật ký' })
  @ApiResponse({
    status: 201,
    description: 'Thêm bình luận thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy nhật ký',
  })
  addComment(
    @Param('id') id: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.diaryService.addComment(id, req.user.id, createCommentDto);
  }

  @Patch('comments/:commentId')
  @ApiOperation({
    summary: 'Cập nhật bình luận',
    description: 'Cập nhật nội dung bình luận của chính mình'
  })
  @ApiParam({ name: 'commentId', description: 'ID của bình luận' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bình luận thành công',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền cập nhật bình luận này',
  })
  updateComment(
    @Param('commentId') commentId: string,
    @Request() req,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.diaryService.updateComment(commentId, req.user.id, updateCommentDto);
  }

  @Delete('comments/:commentId')
  @ApiOperation({
    summary: 'Xóa bình luận',
    description: 'Xóa bình luận của chính mình hoặc admin có thể xóa bất kỳ bình luận nào'
  })
  @ApiParam({ name: 'commentId', description: 'ID của bình luận' })
  @ApiResponse({
    status: 200,
    description: 'Xóa bình luận thành công',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xóa bình luận này',
  })
  deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.diaryService.deleteComment(commentId, req.user.id, req.user.roles || []);
  }

  // ==================== ADMIN APIs ====================
  
  @Get('admin/anonymous-by-unit')
  @ApiOperation({
    summary: '[Admin] Xem nhật ký ẩn danh theo đơn vị',
    description: 'Admin xem nội dung nhật ký ẩn danh được nhóm theo đơn vị để nắm tâm lý chung, không hiển thị thông tin người viết'
  })
  @ApiQuery({ name: 'unitId', required: false, description: 'Lọc theo đơn vị cụ thể' })
  @ApiQuery({ name: 'emotionStatus', required: false, description: 'Lọc theo cảm xúc: VERY_BAD, BAD, NEUTRAL, GOOD, VERY_GOOD' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang (mặc định 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi/trang (mặc định 20)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nhật ký ẩn danh theo đơn vị thành công',
  })
  getAnonymousDiariesByUnit(@Query() query, @Request() req) {
    // Chỉ admin mới có quyền xem
    const isAdmin = req.user.roles?.includes('ADMIN');
    if (!isAdmin) {
      throw new Error('Only admin can access this endpoint');
    }
    return this.diaryService.getAnonymousDiariesByUnit(query);
  }
}
