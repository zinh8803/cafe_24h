import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WorldCycle } from '../common/cafe-world.config';
import { MessageService } from '../message/message.service';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly messageService: MessageService,
  ) {}

  handleConnection(_client: Socket) {
    // Wait for explicit player:join
  }

  handleDisconnect(client: Socket) {
    const left = this.gameService.leaveCurrentRoom(client.id);
    if (left) {
      this.server.to(left.roomId).emit('player:left', {
        userId: left.userId,
        nickname: left.nickname,
        freedSeatId: left.freedSeatId,
      });
      this.broadcastRoomsSummary();
    }
  }

  private broadcastRoomsSummary() {
    this.server.emit('rooms:updated', {
      roomsList: this.gameService.getRoomsSummary(),
    });
  }

  @SubscribeMessage('player:join')
  handlePlayerJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      guestId?: string;
      sessionId?: string;
      nickname?: string;
      avatarId?: string;
      outfitId?: string;
      mood?: string;
    },
  ) {
    const { room, player, previousRoomId } = this.gameService.joinRoom(client.id, payload || {});

    if (previousRoomId) {
      client.leave(previousRoomId);
      this.server.to(previousRoomId).emit('player:left', {
        userId: player.userId,
        nickname: player.nickname,
        freedSeatId: null,
      });
    }

    client.join(room.id);

    // Send full snapshot to joining client
    client.emit('room:state', {
      selfUserId: player.userId,
      ...this.gameService.buildRoomStateSnapshot(room),
    });

    // Notify everyone else in the room in realtime
    client.to(room.id).emit('player:joined', { player });
    this.broadcastRoomsSummary();
  }

  @SubscribeMessage('player:leave')
  handlePlayerLeave(@ConnectedSocket() client: Socket) {
    const left = this.gameService.leaveCurrentRoom(client.id);
    if (left) {
      client.leave(left.roomId);
      this.server.to(left.roomId).emit('player:left', {
        userId: left.userId,
        nickname: left.nickname,
        freedSeatId: left.freedSeatId,
      });
      this.broadcastRoomsSummary();
    }
  }

  @SubscribeMessage('player:move')
  handlePlayerMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { x: number; y: number; direction?: 'up' | 'down' | 'left' | 'right' },
  ) {
    const moved = this.gameService.movePlayer(client.id, payload);
    if (!moved) return;

    this.server.to(moved.roomId).emit('player:moved', {
      userId: moved.player.userId,
      x: moved.player.x,
      y: moved.player.y,
      direction: moved.player.direction,
      seatId: null,
      freedSeatId: moved.freedSeatId,
    });
  }

  @SubscribeMessage('player:sit')
  handlePlayerSit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { seatId: string },
  ) {
    const res = this.gameService.sitAtSeat(client.id, payload?.seatId);
    if (!res.ok || !res.player || !res.roomId) {
      client.emit('game:notice', { message: res.reason || 'Không thể ngồi ghế này' });
      return;
    }

    this.server.to(res.roomId).emit('player:sat', {
      userId: res.player.userId,
      seatId: res.player.seatId,
      x: res.player.x,
      y: res.player.y,
      direction: res.player.direction,
      freedSeatId: res.freedSeatId || null,
    });
  }

  @SubscribeMessage('player:sitWith')
  handlePlayerSitWith(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string },
  ) {
    const res = this.gameService.sitWithPlayer(client.id, payload?.targetUserId);
    if (!res.ok || !res.player || !res.roomId) {
      client.emit('game:notice', { message: res.reason || 'Không tìm thấy bàn trống cạnh người này' });
      return;
    }

    if (res.mode === 'sat' && res.player.seatId) {
      this.server.to(res.roomId).emit('player:sat', {
        userId: res.player.userId,
        seatId: res.player.seatId,
        x: res.player.x,
        y: res.player.y,
        direction: res.player.direction,
        freedSeatId: res.freedSeatId || null,
      });
    } else {
      this.server.to(res.roomId).emit('player:moved', {
        userId: res.player.userId,
        x: res.player.x,
        y: res.player.y,
        direction: res.player.direction,
        seatId: null,
        freedSeatId: res.freedSeatId || null,
      });
    }
  }

  @SubscribeMessage('player:stand')
  handlePlayerStand(@ConnectedSocket() client: Socket) {
    const res = this.gameService.standUp(client.id);
    if (!res) return;

    this.server.to(res.roomId).emit('player:moved', {
      userId: res.player.userId,
      x: res.player.x,
      y: res.player.y,
      direction: res.player.direction,
      seatId: null,
      freedSeatId: res.freedSeatId,
    });
  }

  @SubscribeMessage('player:emote')
  handlePlayerEmote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { emote: string },
  ) {
    const ctx = this.gameService.getPlayerContext(client.id);
    if (!ctx) return;
    const allowed = ['👋', '☕', '❤️', '😂', '✨', '🎵', '🌸', '💤', '🥂'];
    const emote = allowed.includes(payload?.emote) ? payload.emote : '☕';

    this.server.to(ctx.room.id).emit('player:emoted', {
      userId: ctx.player.userId,
      emote,
    });
  }

  @SubscribeMessage('player:drink')
  handlePlayerDrink(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { drinkId: string },
  ) {
    const res = this.gameService.orderDrink(client.id, payload?.drinkId);
    if (!res) return;

    this.server.to(res.roomId).emit('player:drank', {
      userId: res.player.userId,
      drinkId: res.player.drinkId,
      drinkIcon: res.player.drinkIcon,
      drinkName: res.player.drinkName,
    });
  }

  @SubscribeMessage('player:mood')
  handlePlayerMood(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { mood?: string; nickname?: string; avatarId?: string; outfitId?: string },
  ) {
    const res = this.gameService.updateMoodOrProfile(client.id, payload || {});
    if (!res) return;

    this.server.to(res.roomId).emit('player:updated', {
      userId: res.player.userId,
      mood: res.player.mood,
      nickname: res.player.nickname,
      avatarId: res.player.avatarId,
      outfitId: res.player.outfitId,
    });
  }

  @SubscribeMessage('mood:encourage')
  handleMoodEncourage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string; emoji?: string },
  ) {
    const ctx = this.gameService.getPlayerContext(client.id);
    if (!ctx || !payload?.targetUserId) return;

    const target = this.gameService.findPlayerInRoomByUserId(ctx.room.id, payload.targetUserId);
    if (!target) return;

    const emoji = payload.emoji || '❤️';
    this.server.to(ctx.room.id).emit('player:emoted', {
      userId: ctx.player.userId,
      emote: emoji,
    });
    this.server.to(ctx.room.id).emit('player:emoted', {
      userId: target.userId,
      emote: emoji,
    });

    this.server.to(ctx.room.id).emit('mood:encouraged', {
      fromUserId: ctx.player.userId,
      fromNickname: ctx.player.nickname,
      toUserId: target.userId,
      toNickname: target.nickname,
      emoji,
    });
  }

  @SubscribeMessage('coffee:invite')
  handleCoffeeInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId?: string; drinkId?: string },
  ) {
    const ctx = this.gameService.getPlayerContext(client.id);
    if (!ctx) return;

    const drinkId = payload?.drinkId || ctx.player.drinkId || 'drink_iced_milk_coffee';
    const drinkIcon = ctx.player.drinkIcon || '☕';
    const drinkName = ctx.player.drinkName || 'Cà Phê Sữa Đá';

    if (payload?.targetUserId) {
      const target = this.gameService.findPlayerInRoomByUserId(ctx.room.id, payload.targetUserId);
      if (target) {
        this.server.to(target.socketId).emit('coffee:invited', {
          fromUserId: ctx.player.userId,
          fromNickname: ctx.player.nickname,
          drinkId,
          drinkIcon,
          drinkName,
        });
        client.emit('game:notice', {
          message: `Đã gửi lời mời uống ${drinkName} ${drinkIcon} tới ${target.nickname}!`,
        });
        return;
      }
    }

    // Room-wide cheers
    this.server.to(ctx.room.id).emit('coffee:cheered', {
      fromUserId: ctx.player.userId,
      fromNickname: ctx.player.nickname,
      targetUserId: null,
      targetNickname: null,
      drinkIcon,
      drinkName,
    });
  }

  @SubscribeMessage('coffee:accept')
  handleCoffeeAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      fromUserId: string;
      fromNickname: string;
      drinkId?: string;
      drinkIcon?: string;
      drinkName?: string;
    },
  ) {
    const ctx = this.gameService.getPlayerContext(client.id);
    if (!ctx) return;

    const drinkId = payload?.drinkId || 'drink_iced_milk_coffee';
    const updatedAcceptor = this.gameService.setPlayerDrinkByUserId(
      ctx.room.id,
      ctx.player.userId,
      drinkId,
    );
    const updatedSender = this.gameService.setPlayerDrinkByUserId(
      ctx.room.id,
      payload?.fromUserId,
      drinkId,
    );

    if (updatedAcceptor) {
      this.server.to(ctx.room.id).emit('player:drank', {
        userId: updatedAcceptor.userId,
        drinkId: updatedAcceptor.drinkId,
        drinkIcon: updatedAcceptor.drinkIcon,
        drinkName: updatedAcceptor.drinkName,
      });
    }
    if (updatedSender) {
      this.server.to(ctx.room.id).emit('player:drank', {
        userId: updatedSender.userId,
        drinkId: updatedSender.drinkId,
        drinkIcon: updatedSender.drinkIcon,
        drinkName: updatedSender.drinkName,
      });
    }

    this.server.to(ctx.room.id).emit('coffee:cheered', {
      fromUserId: payload?.fromUserId,
      fromNickname: payload?.fromNickname,
      targetUserId: ctx.player.userId,
      targetNickname: ctx.player.nickname,
      drinkIcon: payload?.drinkIcon || '☕',
      drinkName: payload?.drinkName || 'Cà Phê Sữa Đá',
    });
  }

  @SubscribeMessage('cup:throw')
  handleCupThrow(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string },
  ) {
    const ctx = this.gameService.getPlayerContext(client.id);
    if (!ctx || !payload?.targetUserId) return;

    const target = this.gameService.findPlayerInRoomByUserId(ctx.room.id, payload.targetUserId);
    if (!target || target.userId === ctx.player.userId) return;

    const drinkIcon = ctx.player.drinkIcon || '☕';
    const drinkName = ctx.player.drinkName || 'Cà Phê Sữa Đá';
    const dodged = Math.random() < 0.4;

    this.server.to(ctx.room.id).emit('cup:thrown', {
      fromUserId: ctx.player.userId,
      fromNickname: ctx.player.nickname,
      toUserId: target.userId,
      toNickname: target.nickname,
      drinkIcon,
      drinkName,
      dodged,
    });
  }

  @SubscribeMessage('cup:throwDirection')
  handleCupThrowDirection(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetX: number; targetY: number },
  ) {
    const ctx = this.gameService.getPlayerContext(client.id);
    if (!ctx) return;

    const fromPlayer = ctx.player;
    const startX = fromPlayer.x;
    const startY = fromPlayer.y;
    let targetX = Number(payload?.targetX);
    let targetY = Number(payload?.targetY);

    if (isNaN(targetX) || isNaN(targetY)) return;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) return;

    // Limit maximum throw range to 600px
    const maxRange = 600;
    if (dist > maxRange) {
      targetX = startX + (dx / dist) * maxRange;
      targetY = startY + (dy / dist) * maxRange;
    }

    // Check collision along the throw ray
    let bestHit: { player: any; t: number; dist: number } | null = null;
    const hitRadius = 38;

    for (const otherPlayer of ctx.room.players.values()) {
      if (otherPlayer.userId === fromPlayer.userId) continue;

      const seg = this.distToSegment(
        otherPlayer.x,
        otherPlayer.y,
        startX,
        startY,
        targetX,
        targetY,
      );

      if (seg.t > 0.04 && seg.t <= 1.0 && seg.dist <= hitRadius) {
        if (!bestHit || seg.t < bestHit.t) {
          bestHit = { player: otherPlayer, t: seg.t, dist: seg.dist };
        }
      }
    }

    const drinkIcon = fromPlayer.drinkIcon || '☕';
    const drinkName = fromPlayer.drinkName || 'Cà Phê Sữa Đá';

    if (bestHit) {
      const target = bestHit.player;
      const dodged = Math.random() < 0.4;
      this.server.to(ctx.room.id).emit('cup:thrownDirection', {
        fromUserId: fromPlayer.userId,
        fromNickname: fromPlayer.nickname,
        startX,
        startY,
        targetX: target.x,
        targetY: target.y,
        hitUserId: target.userId,
        hitNickname: target.nickname,
        dodged,
        drinkIcon,
        drinkName,
      });
      this.server.to(ctx.room.id).emit('cup:thrown', {
        fromUserId: fromPlayer.userId,
        fromNickname: fromPlayer.nickname,
        toUserId: target.userId,
        toNickname: target.nickname,
        drinkIcon,
        drinkName,
        dodged,
      });
    } else {
      this.server.to(ctx.room.id).emit('cup:thrownDirection', {
        fromUserId: fromPlayer.userId,
        fromNickname: fromPlayer.nickname,
        startX,
        startY,
        targetX: Math.round(targetX),
        targetY: Math.round(targetY),
        hitUserId: null,
        hitNickname: null,
        dodged: false,
        drinkIcon,
        drinkName,
      });
    }
  }

  private distToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): { dist: number; t: number } {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) {
      return { dist: Math.hypot(px - x1, py - y1), t: 0 };
    }
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return { dist: Math.hypot(px - projX, py - projY), t };
  }

  @SubscribeMessage('chat:typing')
  handleChatTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { isTyping: boolean },
  ) {
    const res = this.gameService.setTyping(client.id, Boolean(payload?.isTyping));
    if (!res) return;
    client.to(res.roomId).emit('player:typing', {
      userId: res.userId,
      isTyping: res.isTyping,
    });
  }

  @SubscribeMessage('chat:send')
  handleChatSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { content: string },
  ) {
    const res = this.gameService.handleChat(client.id, payload?.content || '');
    if (!res) return;
    if (res.rateLimited) {
      client.emit('game:notice', {
        message: 'Bạn nhắn hơi nhanh rồi, nhấp một ngụm cà phê nhé ☕',
      });
      return;
    }

    this.server.to(res.roomId).emit('chat:new', res.message);
  }

  @SubscribeMessage('board:post')
  handleBoardPost(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { content: string; tag?: string },
  ) {
    const ctx = this.gameService.getPlayerContext(client.id);
    const note = this.messageService.createNote({
      userId: ctx?.player.userId || 'guest',
      content: payload?.content || '',
      tag: payload?.tag || 'Khách ghé quán ẩn danh',
    });
    this.server.emit('board:newNote', { note });
  }

  @SubscribeMessage('board:react')
  handleBoardReact(
    @MessageBody() payload: { noteId: string; type: 'heart' | 'coffee' | 'sparkle' },
  ) {
    const updated = this.messageService.reactToNote(payload?.noteId, payload?.type || 'heart');
    if (updated) {
      this.server.emit('board:noteReacted', { note: updated });
    }
  }

  @SubscribeMessage('world:setCycle')
  handleWorldSetCycle(@MessageBody() payload: { cycle: WorldCycle }) {
    const valid: WorldCycle[] = ['morning', 'rainy', 'sunset', 'midnight'];
    if (!valid.includes(payload?.cycle)) return;
    const cycle = this.gameService.setWorldCycle(payload.cycle);
    this.server.emit('world:cycle', { cycle });
  }
}
