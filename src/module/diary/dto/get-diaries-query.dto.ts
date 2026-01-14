import { IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EmotionStatus, PrivacyLevel } from '@prisma/client';

export class GetDiariesQueryDto {
  @ApiPropertyOptional({
    description: 'Số trang',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi trên mỗi trang',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái cảm xúc',
    enum: EmotionStatus,
  })
  @IsOptional()
  @IsEnum(EmotionStatus)
  emotionStatus?: EmotionStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo mức độ riêng tư',
    enum: PrivacyLevel,
  })
  @IsOptional()
  @IsEnum(PrivacyLevel)
  privacyLevel?: PrivacyLevel;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu (ISO string)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc (ISO string)',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}