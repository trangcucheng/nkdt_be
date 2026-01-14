import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty({
    description: 'The old password of the user',
    example: 'oldPassword123',
  })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: 'newPassword123',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
