import { Injectable } from '@nestjs/common';

export interface PlayerProfile {
  id: string;
  guestId: string;
  nickname: string;
  avatarId: string;
  outfitId: string;
  mood: string;
  createdAt: string;
}

@Injectable()
export class PlayerService {
  private readonly playersByGuestId = new Map<string, PlayerProfile>();
  private readonly playersById = new Map<string, PlayerProfile>();

  upsertGuestProfile(payload: {
    guestId?: string;
    nickname?: string;
    avatarId?: string;
    outfitId?: string;
    mood?: string;
  }): PlayerProfile {
    const cleanGuestId =
      payload.guestId?.trim() || `guest_${Math.random().toString(36).slice(2, 10)}`;
    const existing = this.playersByGuestId.get(cleanGuestId);

    const nickname = (payload.nickname || existing?.nickname || 'Khách Quen 24h')
      .trim()
      .slice(0, 24);
    const avatarId = payload.avatarId || existing?.avatarId || 'preset_01';
    const outfitId = payload.outfitId || existing?.outfitId || 'latte';
    const mood = payload.mood || existing?.mood || 'peaceful';

    if (existing) {
      existing.nickname = nickname || existing.nickname;
      existing.avatarId = avatarId;
      existing.outfitId = outfitId;
      existing.mood = mood;
      return existing;
    }

    const created: PlayerProfile = {
      id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      guestId: cleanGuestId,
      nickname,
      avatarId,
      outfitId,
      mood,
      createdAt: new Date().toISOString(),
    };
    this.playersByGuestId.set(cleanGuestId, created);
    this.playersById.set(created.id, created);
    return created;
  }

  getById(userId: string): PlayerProfile | undefined {
    return this.playersById.get(userId);
  }
}

