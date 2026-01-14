import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateUnitDTO {
  @ApiProperty({
    description: 'Unique code for the unit',
    example: 'UNIT001',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Name of the unit',
    example: 'Sales Department',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the unit',
    example: 'Responsible for sales and customer relations',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Status of the unit',
    example: 'Active',
    required: false,
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'], {
    message: 'Status must be Active or Inactive',
  })
  status?: string;

  @ApiProperty({
    description: 'Parent unit ID for hierarchical structure',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  parentId?: number; // id đổi sang int nên parentId cũng là number
}
