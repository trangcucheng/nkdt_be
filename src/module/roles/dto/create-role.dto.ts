import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateRoleDTO {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Admin',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Administrator with full access',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of permission IDs associated with the role',
    type: [String],
    example: ['permission1', 'permission2'],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  permissionIds: string[];
}
