import { Body, Controller, Patch } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Patch('profile')
  updateProfile(
    @Body()
    body: {
      guestId?: string;
      nickname?: string;
      avatarId?: string;
      outfitId?: string;
      mood?: string;
    },
  ) {
    const profile = this.playerService.upsertGuestProfile(body);
    return { user: profile };
  }
}

