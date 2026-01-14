import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateIdeologicalWorkNoteDto {
  @ApiProperty({
    description: 'Tiêu đề ghi chú công tác tư tưởng',
    example: 'Triển khai hoạt động tham quan học tập quý I/2026',
  })
  @IsString()
  @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
  title: string;

  @ApiProperty({
    description: 'Nội dung chi tiết ghi chú',
    example: 'Tổ chức chuyến tham quan học tập tại bảo tàng lịch sử để nâng cao ý thức...',
  })
  @IsString()
  @MaxLength(10000, { message: 'Nội dung không được vượt quá 10,000 ký tự' })
  content: string;

  @ApiProperty({
    description: 'Các hoạt động đã triển khai',
    example: 'Tổ chức buổi nói chuyện chuyên đề, phát tài liệu tuyên truyền, thăm hỏi cán bộ...',
  })
  @IsString()
  @MaxLength(5000, { message: 'Mô tả hoạt động không được vượt quá 5,000 ký tự' })
  activities: string;

  @ApiPropertyOptional({
    description: 'Đánh giá hiệu quả',
    example: 'Cán bộ, học viên tích cực tham gia. Tỷ lệ hài lòng đạt 85%...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Đánh giá hiệu quả không được vượt quá 3,000 ký tự' })
  effectEvaluation?: string;

  @ApiPropertyOptional({
    description: 'Đối tượng hướng đến',
    example: 'Cán bộ, học viên khóa 45',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetAudience?: string;

  @ApiPropertyOptional({
    description: 'Thời kỳ thực hiện',
    example: 'Quý I/2026',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  period?: string;

  @ApiPropertyOptional({
    description: 'ID đơn vị (nếu không có sẽ lấy theo đơn vị của manager)',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  unitId?: number;
}