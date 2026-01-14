import { PartialType } from '@nestjs/swagger';
import { CreateSupportContentDto } from './create-support-content.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSupportContentDto extends PartialType(CreateSupportContentDto) {
  @ApiPropertyOptional({
    description: 'Trạng thái kích hoạt',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}