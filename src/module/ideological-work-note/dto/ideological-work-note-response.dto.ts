import { ApiProperty } from '@nestjs/swagger';

export class IdeologicalWorkNoteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  activities: string;

  @ApiProperty({ required: false })
  effectEvaluation?: string;

  @ApiProperty({ required: false })
  targetAudience?: string;

  @ApiProperty({ required: false })
  period?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  manager?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };

  @ApiProperty({ required: false })
  unit?: {
    id: number;
    code: string;
    name: string;
  };
}

export class PaginatedIdeologicalWorkNotesResponseDto {
  @ApiProperty({ type: [IdeologicalWorkNoteResponseDto] })
  data: IdeologicalWorkNoteResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}