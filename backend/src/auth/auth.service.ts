import { Injectable } from '@nestjs/common';
import { PlayerProfile, PlayerService } from '../player/player.service';

@Injectable()
export class AuthService {
  constructor(private readonly playerService: PlayerService) {}

  authenticateGuest(payload: {
    guestId?: string;
    nickname?: string;
    avatarId?: string;
    outfitId?: string;
    mood?: string;
  }): { user: PlayerProfile } {
    const user = this.playerService.upsertGuestProfile(payload);
    return { user };
  }
}

