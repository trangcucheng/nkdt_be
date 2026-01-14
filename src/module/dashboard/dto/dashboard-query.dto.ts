import { IsOptional, IsInt, Min, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EmotionStatus } from '@prisma/client';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'ID đơn vị (nếu không có sẽ lấy tất cả đơn vị con)',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  unitId?: number;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu thống kê (ISO string)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc thống kê (ISO string)',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Số ngày gần đây để thống kê (mặc định 30 ngày)',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  days?: number = 30;
}