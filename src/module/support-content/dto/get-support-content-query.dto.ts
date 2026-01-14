import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SupportCategory } from '@prisma/client';

export class GetSupportContentQueryDto {
  @ApiPropertyOptional({
    description: 'Danh mục nội dung',
    enum: SupportCategory,
  })
  @IsOptional()
  @IsEnum(SupportCategory)
  category?: SupportCategory;

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
}