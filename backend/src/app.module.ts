import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { ItemModule } from './item/item.module';
import { MessageModule } from './message/message.module';
import { ModerationModule } from './moderation/moderation.module';
import { MoodModule } from './mood/mood.module';
import { PlayerModule } from './player/player.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    AuthModule,
    PlayerModule,
    RoomModule,
    GameModule,
    ChatModule,
    MoodModule,
    MessageModule,
    ItemModule,
    ModerationModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

