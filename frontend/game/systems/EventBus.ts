import type { WorldCycle } from '../assets/cafeCatalog';

export interface PlayerNetState {
  socketId?: string;
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
  isNpc?: boolean;
  statusBubble?: string;
}

type EventMap = {
  // Store -> Phaser Scene
  'scene:syncRoom': {
    selfUserId: string;
    worldCycle: WorldCycle;
    players: PlayerNetState[];
    occupiedSeats: Record<string, string>;
  };
  'scene:playerJoined': { player: PlayerNetState };
  'scene:playerLeft': { userId: string; freedSeatId: string | null };
  'scene:playerMoved': {
    userId: string;
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right';
    seatId: string | null;
    freedSeatId?: string | null;
  };
  'scene:playerSat': {
    userId: string;
    seatId: string;
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right';
    freedSeatId?: string | null;
  };
  'scene:playerEmoted': { userId: string; emote: string };
  'scene:playerDrank': {
    userId: string;
    drinkId: string;
    drinkIcon: string;
    drinkName: string;
  };
  'scene:playerUpdated': {
    userId: string;
    mood: string;
    nickname: string;
    avatarId: string;
    outfitId: string;
  };
  'scene:playerTyping': {
    userId: string;
    isTyping: boolean;
  };
  'scene:chatBubble': { userId: string; nickname: string; content: string };
  'scene:worldCycle': { cycle: WorldCycle };
  'scene:cheers': {
    fromUserId: string;
    fromNickname: string;
    targetUserId?: string | null;
    drinkIcon: string;
    drinkName: string;
  };
  'scene:joystickInput': { vx: number; vy: number };
  'scene:requestSnapshot': { quote: string; moodLabel: string; nickname: string };

  // Phaser Scene -> Store / UI
  'client:ready': Record<string, never>;
  'client:move': { x: number; y: number; direction: 'up' | 'down' | 'left' | 'right' };
  'client:sit': { seatId: string };
  'client:stand': Record<string, never>;
  'client:selectPlayer': { userId: string };
  'client:openMessageBoard': Record<string, never>;
  'client:openDrinkMenu': Record<string, never>;
  'client:snapshotReady': { dataUrl: string };
  'client:zoneChanged': { zone: string };
};

class TypedEventBus {
  private listeners = new Map<keyof EventMap, Set<(payload: any) => void>>();

  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    for (const fn of handlers) {
      fn(payload);
    }
  }
}

export const gameEventBus = new TypedEventBus();
