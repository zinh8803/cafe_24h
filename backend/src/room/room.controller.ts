import { Body, Controller, Get, Post } from '@nestjs/common';
import { CAFE_SEATS, WorldCycle } from '../common/cafe-world.config';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  getRooms() {
    return {
      worldCycle: this.roomService.getWorldCycle(),
      dailyQuote: this.roomService.getDailyQuote(),
      rooms: this.roomService.listRoomsSummary(),
      seats: CAFE_SEATS,
    };
  }

  @Post('cycle')
  updateCycle(@Body() body: { cycle: WorldCycle }) {
    const valid: WorldCycle[] = ['morning', 'rainy', 'sunset', 'midnight'];
    const next = valid.includes(body.cycle) ? body.cycle : 'midnight';
    return { worldCycle: this.roomService.setWorldCycle(next) };
  }
}

