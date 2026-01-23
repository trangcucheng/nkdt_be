import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDTO {
  @ApiProperty({
    description: 'First name of the user',
    example: 'Đức',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Nguyễn Việt',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'vietducqb113@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Password of the user (only provide if changing password)',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '0912345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Unit ID of the user',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  unitId?: number;

  @ApiProperty({
    description: 'Blocked status of the user',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  blocked?: boolean;
}
