import {
  IsBoolean,
  IsEmail,
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
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Blocked status of the user',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  blocked?: boolean;
}
