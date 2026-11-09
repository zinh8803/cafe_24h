import { Injectable } from '@nestjs/common';
import {
  CAFE_SEATS,
  DAILY_QUOTES,
  MAP_BOUNDS,
  SeatDefinition,
  WorldCycle,
} from '../common/cafe-world.config';

export interface ActivePlayerState {
  socketId: string;
  userId: string;
  nickname: string;
  avatarId: string;
  outfitId: string;
  mood: string;
  roomId: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  seatId: string | null;
  drinkId: string | null;
  drinkIcon: string | null;
  drinkName: string | null;
  isTyping?: boolean;
  lastMoveAt: number;
}

export interface RoomInstance {
  id: string;
  name: string;
  roomType: 'main' | 'quiet' | 'garden';
  capacity: number;
  players: Map<string, ActivePlayerState>; // key = socketId
  occupiedSeats: Map<string, string>; // seatId -> userId
}

@Injectable()
export class RoomService {
  private readonly rooms = new Map<string, RoomInstance>();
  private worldCycle: WorldCycle = this.computeClockCycle();

  constructor() {
    this.initDefaultRooms();
  }

  private computeClockCycle(): WorldCycle {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 16) return 'rainy';
    if (hour >= 16 && hour < 19) return 'sunset';
    return 'midnight';
  }

  private initDefaultRooms() {
    const defaults: Array<{ id: string; name: string; roomType: 'main' | 'quiet' | 'garden' }> = [
      { id: 'cafe:main:001', name: 'Main Hall #001', roomType: 'main' },
      { id: 'cafe:quiet:001', name: 'Quiet Corner #001', roomType: 'quiet' },
      { id: 'cafe:garden:001', name: 'Garden #001', roomType: 'garden' },
    ];

    for (const def of defaults) {
      const room: RoomInstance = {
        id: def.id,
        name: def.name,
        roomType: def.roomType,
        capacity: 25,
        players: new Map(),
        occupiedSeats: new Map(),
      };
      this.rooms.set(def.id, room);
    }
  }

  getWorldCycle(): WorldCycle {
    return this.worldCycle;
  }

  setWorldCycle(cycle: WorldCycle): WorldCycle {
    this.worldCycle = cycle;
    return this.worldCycle;
  }

  getDailyQuote(): string {
    const dayIndex = new Date().getDate() % DAILY_QUOTES.length;
    return DAILY_QUOTES[dayIndex];
  }

  listRoomsSummary() {
    return Array.from(this.rooms.values()).map((r) => ({
      id: r.id,
      name: r.name,
      roomType: r.roomType,
      onlineCount: r.players.size,
      capacity: r.capacity,
    }));
  }

  getAllRooms(): RoomInstance[] {
    return Array.from(this.rooms.values());
  }

  resolveAvailableRoom(requestedRoomId?: string): RoomInstance {
    if (requestedRoomId && this.rooms.has(requestedRoomId)) {
      const target = this.rooms.get(requestedRoomId)!;
      if (target.players.size < target.capacity) {
        return target;
      }
    }

    for (const room of this.rooms.values()) {
      if (room.players.size < room.capacity) {
        return room;
      }
    }

    const nextIdx = String(this.rooms.size + 1).padStart(3, '0');
    const newId = `cafe:main:${nextIdx}`;
    const newRoom: RoomInstance = {
      id: newId,
      name: `Main Hall #${nextIdx}`,
      roomType: 'main',
      capacity: 25,
      players: new Map(),
      occupiedSeats: new Map(),
    };
    this.rooms.set(newId, newRoom);
    return newRoom;
  }

  getRoom(roomId: string): RoomInstance | undefined {
    return this.rooms.get(roomId);
  }

  getSeatDefinition(seatId: string): SeatDefinition | undefined {
    return CAFE_SEATS.find((s) => s.id === seatId);
  }

  findOppositeSeatAtSameTable(seatId: string, room: RoomInstance): SeatDefinition | undefined {
    const current = this.getSeatDefinition(seatId);
    if (!current) return undefined;
    return CAFE_SEATS.find(
      (s) =>
        s.tableId === current.tableId &&
        s.id !== current.id &&
        !room.occupiedSeats.has(s.id),
    );
  }

  clampPosition(x: number, y: number): { x: number; y: number } {
    const safeX = Math.max(
      70,
      Math.min(MAP_BOUNDS.width - 70, Math.round(Number(x) || MAP_BOUNDS.spawnX)),
    );
    const safeY = Math.max(
      120,
      Math.min(MAP_BOUNDS.height - 55, Math.round(Number(y) || MAP_BOUNDS.spawnY)),
    );
    return { x: safeX, y: safeY };
  }
}
