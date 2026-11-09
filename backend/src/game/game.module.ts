import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ChatModule } from '../chat/chat.module';
import { ItemModule } from '../item/item.module';
import { MessageModule } from '../message/message.module';
import { MoodModule } from '../mood/mood.module';
import { PlayerModule } from '../player/player.module';
import { RoomModule } from '../room/room.module';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [
    RoomModule,
    PlayerModule,
    ChatModule,
    ItemModule,
    MoodModule,
    AnalyticsModule,
    MessageModule,
  ],
  providers: [GameGateway, GameService],
  exports: [GameService],
})
export class GameModule {}
