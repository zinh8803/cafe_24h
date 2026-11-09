import { Injectable } from '@nestjs/common';
import { ModerationService } from '../moderation/moderation.service';

export interface ChatMessageRecord {
  id: string;
  roomId: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: string;
}

@Injectable()
export class ChatService {
  private readonly roomMessages = new Map<string, ChatMessageRecord[]>();
  private readonly lastSentAtByUser = new Map<string, number>();

  constructor(private readonly moderationService: ModerationService) {}

  canSendMessage(userId: string, cooldownMs = 1100): boolean {
    const now = Date.now();
    const last = this.lastSentAtAt(userId);
    if (now - last < cooldownMs) {
      return false;
    }
    this.lastSentAtByUser.set(userId, now);
    return true;
  }

  private lastSentAtAt(userId: string): number {
    return this.lastSentAtByUser.get(userId) || 0;
  }

  appendMessage(payload: {
    roomId: string;
    userId: string;
    nickname: string;
    content: string;
  }): ChatMessageRecord | null {
    const sanitized = this.moderationService.sanitizeContent(payload.content, 120);
    if (!sanitized) return null;

    const record: ChatMessageRecord = {
      id: `msg_${Math.random().toString(36).slice(2, 10)}`,
      roomId: payload.roomId,
      userId: payload.userId,
      nickname: payload.nickname,
      content: sanitized,
      createdAt: new Date().toISOString(),
    };

    const list = this.roomMessages.get(payload.roomId) || [];
    list.push(record);
    if (list.length > 40) {
      list.shift();
    }
    this.roomMessages.set(payload.roomId, list);
    return record;
  }

  getRecentMessages(roomId: string): ChatMessageRecord[] {
    return this.roomMessages.get(roomId) || [];
  }
}

