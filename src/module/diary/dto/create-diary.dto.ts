import { IsString, IsEnum, IsArray, IsOptional, IsDateString, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmotionStatus, PrivacyLevel } from '@prisma/client';

export class CreateDiaryDto {
  @ApiProperty({
    description: 'Nội dung nhật ký',
    example: 'Hôm nay là một ngày thật tuyệt vời. Tôi đã học được nhiều điều mới và cảm thấy rất hạnh phúc.',
  })
  @IsString()
  @MaxLength(10000, { message: 'Nội dung nhật ký không được vượt quá 10,000 ký tự' })
  content: string;

  @ApiProperty({
    description: 'Trạng thái cảm xúc',
    enum: EmotionStatus,
    example: EmotionStatus.HAPPY,
  })
  @IsEnum(EmotionStatus, { message: 'Trạng thái cảm xúc không hợp lệ' })
  emotionStatus: EmotionStatus;

  @ApiPropertyOptional({
    description: 'Mức độ riêng tư',
    enum: PrivacyLevel,
    example: PrivacyLevel.PRIVATE,
    default: PrivacyLevel.PRIVATE,
  })
  @IsOptional()
  @IsEnum(PrivacyLevel, { message: 'Mức độ riêng tư không hợp lệ' })
  privacyLevel?: PrivacyLevel;

  @ApiPropertyOptional({
    description: 'Danh sách hashtag/chủ đề',
    example: ['học_tập', 'hạnh_phúc', 'phát_triển_bản_thân'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'Ngày của nhật ký (ISO string), mặc định là hôm nay',
    example: '2026-01-06',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Nhật ký dẫn dắt (theo câu hỏi gợi mở) hay tự do',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isGuided?: boolean;

  @ApiPropertyOptional({
    description: 'Câu hỏi gợi mở (nếu là nhật ký dẫn dắt)',
    example: 'Hôm nay điều gì khiến bạn suy nghĩ nhiều nhất?',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Câu hỏi gợi mở không được vượt quá 500 ký tự' })
  guidedPrompt?: string;

  @ApiPropertyOptional({
    description: 'Nhật ký viết nhanh 60 giây',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isQuickWrite?: boolean;
}