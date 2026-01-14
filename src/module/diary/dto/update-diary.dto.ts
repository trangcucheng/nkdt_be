import { IsString, IsEnum, IsArray, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmotionStatus, PrivacyLevel } from '@prisma/client';

export class UpdateDiaryDto {
  @ApiPropertyOptional({
    description: 'Nội dung nhật ký',
    example: 'Nội dung đã được cập nhật...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000, { message: 'Nội dung nhật ký không được vượt quá 10,000 ký tự' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái cảm xúc',
    enum: EmotionStatus,
    example: EmotionStatus.HAPPY,
  })
  @IsOptional()
  @IsEnum(EmotionStatus, { message: 'Trạng thái cảm xúc không hợp lệ' })
  emotionStatus?: EmotionStatus;

  @ApiPropertyOptional({
    description: 'Mức độ riêng tư',
    enum: PrivacyLevel,
    example: PrivacyLevel.ANONYMOUS_SHARE,
  })
  @IsOptional()
  @IsEnum(PrivacyLevel, { message: 'Mức độ riêng tư không hợp lệ' })
  privacyLevel?: PrivacyLevel;

  @ApiPropertyOptional({
    description: 'Danh sách hashtag/chủ đề',
    example: ['học_tập', 'cải_thiện', 'động_lực'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}