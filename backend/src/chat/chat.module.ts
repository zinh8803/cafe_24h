import { Module } from '@nestjs/common';
import { ModerationModule } from '../moderation/moderation.module';
import { ChatService } from './chat.service';

@Module({
  imports: [ModerationModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}

