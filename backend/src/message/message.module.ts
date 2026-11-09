import { Module } from '@nestjs/common';
import { ModerationModule } from '../moderation/moderation.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [ModerationModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}

