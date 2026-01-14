import { IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetIdeologicalWorkNotesQueryDto {
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
    description: 'ID đơn vị để lọc',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  unitId?: number;

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