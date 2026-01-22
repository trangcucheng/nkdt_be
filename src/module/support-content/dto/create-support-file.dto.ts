import { IsString, IsEnum, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupportCategory } from '@prisma/client';

export class CreateSupportFileDto {
  @ApiProperty({
    description: 'Tiêu đề file hỗ trợ',
    example: 'Hướng dẫn quản lý stress hiệu quả',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về file',
    example: 'Tài liệu hướng dẫn các kỹ thuật quản lý stress cho cán bộ...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Danh mục nội dung',
    enum: SupportCategory,
    example: SupportCategory.EMOTION_MANAGEMENT,
  })
  @IsEnum(SupportCategory)
  category: SupportCategory;
}