import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRoleDTO {
  @ApiProperty({
    description: 'The id of the user to assign the role to',
    example: '655709546810450560000000',
    required: true,
    type: 'string',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The id of the role to assign to the user',
    example: '655709546810450560000000',
    required: true,
    type: 'string',
  })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}
