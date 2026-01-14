import { PartialType } from '@nestjs/swagger';
import { CreateIdeologicalWorkNoteDto } from './create-ideological-work-note.dto';

export class UpdateIdeologicalWorkNoteDto extends PartialType(CreateIdeologicalWorkNoteDto) {}