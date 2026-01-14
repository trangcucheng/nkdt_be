import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({
    description: 'Email of the user',
    example: 'vietducqb113@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({
    description: 'Password of the user',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
