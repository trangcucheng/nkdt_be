import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';

export class CreateDiaryReactionDto {
  @ApiProperty({
    description: 'Loại phản ứng cảm xúc',
    enum: ReactionType,
    example: ReactionType.EMPATHY,
  })
  @IsEnum(ReactionType, { message: 'Loại phản ứng không hợp lệ' })
  reactionType: ReactionType;
}