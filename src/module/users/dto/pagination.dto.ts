import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsOptional, IsNumberString, IsEnum } from 'class-validator';

export class GetAllUsersDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsNumberString()
  pageSize?: string;

  @ApiPropertyOptional({ type: String, enum: ['asc', 'desc'] })
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({ type: String, enum: Role })
  @IsOptional()
  role?: Role;
}
