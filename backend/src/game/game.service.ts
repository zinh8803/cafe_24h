import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { ChatService } from '../chat/chat.service';
import { CAFE_ITEMS, CAFE_SEATS, MAP_BOUNDS, WorldCycle } from '../common/cafe-world.config';
import { ItemService } from '../item/item.service';
import { MoodService } from '../mood/mood.service';
import { PlayerService } from '../player/player.service';
import { ActivePlayerState, RoomInstance, RoomService } from '../room/room.service';

@Injectable()
export class GameService {
  private readonly socketToRoom = new Map<string, string>();

  constructor(
    private readonly roomService: RoomService,
    private readonly playerService: PlayerService,
    private readonly chatService: ChatService,
    private readonly itemService: ItemService,
    private readonly moodService: MoodService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  joinRoom(
    socketId: string,
    payload: {
      roomId?: string;
      guestId?: string;
      sessionId?: string;
      nickname?: string;
      avatarId?: string;
      outfitId?: string;
      mood?: string;
    },
  ): { room: RoomInstance; player: ActivePlayerState; previousRoomId?: string } {
    const previousRoomId = this.leaveCurrentRoom(socketId)?.roomId;

    // Scope guest profile per tab/session so multiple tabs in the same browser
    // each appear as distinct live players in the room!
    const uniqueGuestKey =
      payload.sessionId?.trim() || `${payload.guestId || 'guest'}_${socketId.slice(0, 6)}`;
    const profile = this.playerService.upsertGuestProfile({
      ...payload,
      guestId: uniqueGuestKey,
    });
    const room = this.roomService.resolveAvailableRoom(payload.roomId);

    const jitterX = Math.floor(Math.random() * 90) - 45;
    const jitterY = Math.floor(Math.random() * 36) - 18;

    const player: ActivePlayerState = {
      socketId,
      userId: profile.id,
      nickname: profile.nickname,
      avatarId: profile.avatarId,
      outfitId: profile.outfitId,
      mood: this.moodService.normalizeMood(profile.mood).id,
      roomId: room.id,
      x: MAP_BOUNDS.spawnX + jitterX,
      y: MAP_BOUNDS.spawnY + jitterY,
      direction: 'up',
      seatId: null,
      drinkId: 'drink_iced_milk_coffee',
      drinkIcon: '☕',
      drinkName: 'Cà Phê Sữa Đá',
      isTyping: false,
      lastMoveAt: Date.now(),
    };

    room.players.set(socketId, player);
    this.socketToRoom.set(socketId, room.id);
    this.analyticsService.incrementVisit();

    return { room, player, previousRoomId };
  }

  leaveCurrentRoom(socketId: string): {
    roomId: string;
    userId: string;
    nickname: string;
    freedSeatId: string | null;
  } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.roomService.getRoom(roomId);
    this.socketToRoom.delete(socketId);
    if (!room) return null;

    const player = room.players.get(socketId);
    if (!player) return null;

    let freedSeatId: string | null = null;
    if (player.seatId && room.occupiedSeats.get(player.seatId) === player.userId) {
      room.occupiedSeats.delete(player.seatId);
      freedSeatId = player.seatId;
    }

    room.players.delete(socketId);
    return { roomId, userId: player.userId, nickname: player.nickname, freedSeatId };
  }

  movePlayer(
    socketId: string,
    payload: { x: number; y: number; direction?: 'up' | 'down' | 'left' | 'right' },
  ): { roomId: string; player: ActivePlayerState; freedSeatId: string | null } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    const room = this.roomService.getRoom(roomId);
    if (!room) return null;
    const player = room.players.get(socketId);
    if (!player) return null;

    const now = Date.now();
    if (now - player.lastMoveAt < 30) {
      return null;
    }

    const clamped = this.roomService.clampPosition(payload.x, payload.y);
    const dx = clamped.x - player.x;
    const dy = clamped.y - player.y;
    const dist = Math.hypot(dx, dy);

    const maxStep = 160;
    if (dist > maxStep) {
      const ratio = maxStep / dist;
      player.x = Math.round(player.x + dx * ratio);
      player.y = Math.round(player.y + dy * ratio);
    } else {
      player.x = clamped.x;
      player.y = clamped.y;
    }

    if (payload.direction && ['up', 'down', 'left', 'right'].includes(payload.direction)) {
      player.direction = payload.direction;
    }

    let freedSeatId: string | null = null;
    if (player.seatId) {
      if (room.occupiedSeats.get(player.seatId) === player.userId) {
        room.occupiedSeats.delete(player.seatId);
      }
      freedSeatId = player.seatId;
      player.seatId = null;
    }

    player.lastMoveAt = now;
    return { roomId, player, freedSeatId };
  }

  sitAtSeat(
    socketId: string,
    seatId: string,
  ): {
    ok: boolean;
    reason?: string;
    roomId?: string;
    player?: ActivePlayerState;
    freedSeatId?: string | null;
  } {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return { ok: false, reason: 'Chưa vào phòng' };
    const room = this.roomService.getRoom(roomId);
    if (!room) return { ok: false, reason: 'Phòng không tồn tại' };
    const player = room.players.get(socketId);
    if (!player) return { ok: false, reason: 'Không tìm thấy nhân vật' };

    const seat = this.roomService.getSeatDefinition(seatId);
    if (!seat) return { ok: false, reason: 'Ghế không hợp lệ' };

    const occupiedBy = room.occupiedSeats.get(seatId);
    if (occupiedBy && occupiedBy !== player.userId) {
      return { ok: false, reason: 'Ghế này đã có người ngồi rồi ☕' };
    }

    let freedSeatId: string | null = null;
    if (player.seatId && room.occupiedSeats.get(player.seatId) === player.userId) {
      room.occupiedSeats.delete(player.seatId);
      freedSeatId = player.seatId;
    }

    room.occupiedSeats.set(seat.id, player.userId);
    player.seatId = seat.id;
    player.x = seat.x;
    player.y = seat.y;
    player.direction = seat.direction;

    return { ok: true, roomId, player, freedSeatId };
  }

  sitWithPlayer(
    socketId: string,
    targetUserId: string,
  ): {
    ok: boolean;
    reason?: string;
    roomId?: string;
    player?: ActivePlayerState;
    freedSeatId?: string | null;
    mode?: 'sat' | 'walked';
  } {
    const ctx = this.getPlayerContext(socketId);
    if (!ctx) return { ok: false, reason: 'Chưa kết nối vào phòng' };

    const target = Array.from(ctx.room.players.values()).find((p) => p.userId === targetUserId);
    if (!target) return { ok: false, reason: 'Người chơi này đã rời phòng' };

    // If target is sitting at a table, try to sit at the opposite chair of that same table!
    if (target.seatId) {
      const oppositeSeat = this.roomService.findOppositeSeatAtSameTable(target.seatId, ctx.room);
      if (oppositeSeat) {
        const sat = this.sitAtSeat(socketId, oppositeSeat.id);
        return { ...sat, mode: 'sat' };
      }
    }

    // Otherwise move next to target player
    let freedSeatId: string | null = null;
    if (ctx.player.seatId) {
      if (ctx.room.occupiedSeats.get(ctx.player.seatId) === ctx.player.userId) {
        ctx.room.occupiedSeats.delete(ctx.player.seatId);
      }
      freedSeatId = ctx.player.seatId;
      ctx.player.seatId = null;
    }

    const clamped = this.roomService.clampPosition(target.x + 48, target.y + 8);
    ctx.player.x = clamped.x;
    ctx.player.y = clamped.y;
    ctx.player.direction = 'left';

    return {
      ok: true,
      roomId: ctx.room.id,
      player: ctx.player,
      freedSeatId,
      mode: 'walked',
    };
  }

  standUp(
    socketId: string,
  ): { roomId: string; player: ActivePlayerState; freedSeatId: string | null } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    const room = this.roomService.getRoom(roomId);
    if (!room) return null;
    const player = room.players.get(socketId);
    if (!player) return null;

    let freedSeatId: string | null = null;
    if (player.seatId) {
      if (room.occupiedSeats.get(player.seatId) === player.userId) {
        room.occupiedSeats.delete(player.seatId);
      }
      freedSeatId = player.seatId;
      player.seatId = null;
      player.y = Math.min(MAP_BOUNDS.height - 60, player.y + 24);
    }
    return { roomId, player, freedSeatId };
  }

  orderDrink(
    socketId: string,
    drinkId: string,
  ): { roomId: string; player: ActivePlayerState } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    const room = this.roomService.getRoom(roomId);
    if (!room) return null;
    const player = room.players.get(socketId);
    if (!player) return null;

    const drink = this.itemService.getDrinkById(drinkId);
    if (!drink) return null;

    player.drinkId = drink.id;
    player.drinkIcon = drink.icon;
    player.drinkName = drink.name;
    this.analyticsService.incrementDrink();

    return { roomId, player };
  }

  setPlayerDrinkByUserId(roomId: string, userId: string, drinkId: string): ActivePlayerState | null {
    const room = this.roomService.getRoom(roomId);
    if (!room) return null;
    const drink = this.itemService.getDrinkById(drinkId) || CAFE_ITEMS[0];
    for (const p of room.players.values()) {
      if (p.userId === userId) {
        p.drinkId = drink.id;
        p.drinkIcon = drink.icon;
        p.drinkName = drink.name;
        return p;
      }
    }
    return null;
  }

  setTyping(
    socketId: string,
    isTyping: boolean,
  ): { roomId: string; userId: string; isTyping: boolean } | null {
    const ctx = this.getPlayerContext(socketId);
    if (!ctx) return null;
    ctx.player.isTyping = Boolean(isTyping);
    return {
      roomId: ctx.room.id,
      userId: ctx.player.userId,
      isTyping: ctx.player.isTyping,
    };
  }

  updateMoodOrProfile(
    socketId: string,
    payload: { mood?: string; nickname?: string; avatarId?: string; outfitId?: string },
  ): { roomId: string; player: ActivePlayerState } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    const room = this.roomService.getRoom(roomId);
    if (!room) return null;
    const player = room.players.get(socketId);
    if (!player) return null;

    if (payload.mood) {
      player.mood = this.moodService.normalizeMood(payload.mood).id;
    }
    if (payload.nickname) {
      player.nickname = payload.nickname.trim().slice(0, 24) || player.nickname;
    }
    if (payload.avatarId) {
      player.avatarId = payload.avatarId;
    }
    if (payload.outfitId) {
      player.outfitId = payload.outfitId;
    }
    return { roomId, player };
  }

  handleChat(socketId: string, content: string) {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    const room = this.roomService.getRoom(roomId);
    if (!room) return null;
    const player = room.players.get(socketId);
    if (!player) return null;

    if (!this.chatService.canSendMessage(player.userId)) {
      return { rateLimited: true, roomId };
    }

    player.isTyping = false;
    const message = this.chatService.appendMessage({
      roomId,
      userId: player.userId,
      nickname: player.nickname,
      content,
    });
    if (!message) return null;
    return { rateLimited: false, roomId, message };
  }

  findPlayerInRoomByUserId(roomId: string, targetUserId: string): ActivePlayerState | undefined {
    const room = this.roomService.getRoom(roomId);
    if (!room) return undefined;
    for (const p of room.players.values()) {
      if (p.userId === targetUserId) return p;
    }
    return undefined;
  }

  getPlayerContext(socketId: string): { room: RoomInstance; player: ActivePlayerState } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    const room = this.roomService.getRoom(roomId);
    if (!room) return null;
    const player = room.players.get(socketId);
    if (!player) return null;
    return { room, player };
  }

  buildRoomStateSnapshot(room: RoomInstance) {
    return {
      roomId: room.id,
      roomName: room.name,
      roomType: room.roomType,
      worldCycle: this.roomService.getWorldCycle(),
      dailyQuote: this.roomService.getDailyQuote(),
      players: Array.from(room.players.values()),
      occupiedSeats: Object.fromEntries(room.occupiedSeats.entries()),
      recentChats: this.chatService.getRecentMessages(room.id),
      roomsList: this.roomService.listRoomsSummary(),
    };
  }

  getRoomsSummary() {
    return this.roomService.listRoomsSummary();
  }

  setWorldCycle(cycle: WorldCycle): WorldCycle {
    return this.roomService.setWorldCycle(cycle);
  }
}
