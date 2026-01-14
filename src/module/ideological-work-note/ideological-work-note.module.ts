import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IdeologicalWorkNoteController } from './ideological-work-note.controller';
import { IdeologicalWorkNoteService } from './ideological-work-note.service';

@Module({
  controllers: [IdeologicalWorkNoteController],
  providers: [IdeologicalWorkNoteService, PrismaService],
  exports: [IdeologicalWorkNoteService],
})
export class IdeologicalWorkNoteModule {}