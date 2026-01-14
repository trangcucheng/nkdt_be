import { ApiProperty } from '@nestjs/swagger';
import { EmotionStatus, PrivacyLevel, ReactionType } from '@prisma/client';

export class DiaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: EmotionStatus })
  emotionStatus: EmotionStatus;

  @ApiProperty({ enum: PrivacyLevel })
  privacyLevel: PrivacyLevel;

  @ApiProperty({ type: [String] })
  hashtags: string[];

  @ApiProperty()
  date: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };

  @ApiProperty({ required: false })
  reactions?: DiaryReactionDto[];
}

export class DiaryReactionDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ReactionType })
  reactionType: ReactionType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

export class PaginatedDiariesResponseDto {
  @ApiProperty({ type: [DiaryResponseDto] })
  data: DiaryResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}