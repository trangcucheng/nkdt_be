import { IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupportCategory } from '@prisma/client';

export class CreateSupportContentDto {
  @ApiProperty({
    description: 'Tiêu đề nội dung hỗ trợ',
    example: '5 cách quản lý stress hiệu quả',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Nội dung chi tiết',
    example: 'Stress là phản ứng tự nhiên của cơ thể khi đối mặt với thách thức...',
  })
  @IsString()
  @MaxLength(50000)
  content: string;

  @ApiProperty({
    description: 'Danh mục nội dung',
    enum: SupportCategory,
    example: SupportCategory.EMOTION_MANAGEMENT,
  })
  @IsEnum(SupportCategory)
  category: SupportCategory;
}