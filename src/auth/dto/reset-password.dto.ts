import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'newPassword123',
  })
  @IsNotEmpty()
  newPassword: string;
}
