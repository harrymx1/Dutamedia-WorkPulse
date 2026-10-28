import { Module } from '@nestjs/common';
import { ManagerNoteController } from './controllers/manager-note.controller.js';
import { ManagerNoteService } from './services/manager-note.service.js';

@Module({
  controllers: [ManagerNoteController],
  providers: [ManagerNoteService],
  exports: [ManagerNoteService],
})
export class ManagerNoteModule {}
