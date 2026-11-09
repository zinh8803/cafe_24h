import { Injectable } from '@nestjs/common';
import { ModerationService } from '../moderation/moderation.service';

export interface AnonymousNote {
  id: string;
  userId: string;
  content: string;
  tag: string;
  reactions: {
    heart: number;
    coffee: number;
    sparkle: number;
  };
  createdAt: string;
}

@Injectable()
export class MessageService {
  private readonly notes: AnonymousNote[] = [
    {
      id: 'note_01',
      userId: 'system_seed',
      content: 'Nếu hôm nay bạn mệt, hãy nghỉ ngơi một chút. Không cần phải giỏi mọi thứ mỗi ngày.',
      tag: 'Lời nhắn lúc 23:45',
      reactions: { heart: 24, coffee: 12, sparkle: 9 },
      createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
    {
      id: 'note_02',
      userId: 'system_seed',
      content: 'Chúc người đang đọc dòng này thi tốt hoặc hoàn thành deadline thật nhẹ nhàng nhé ☕✨',
      tag: 'Từ Bàn Cửa Sổ #2',
      reactions: { heart: 19, coffee: 15, sparkle: 7 },
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: 'note_03',
      userId: 'system_seed',
      content: 'Ngồi nghe tiếng mưa ngoài cửa sổ với một ly Matcha Latte ấm thực sự làm mình thấy bình yên hơn rất nhiều.',
      tag: 'Từ Góc Yên Tĩnh',
      reactions: { heart: 31, coffee: 8, sparkle: 14 },
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ];

  constructor(private readonly moderationService: ModerationService) {}

  getRecentNotes(): AnonymousNote[] {
    return this.notes.slice(0, 30);
  }

  createNote(payload: { userId?: string; content: string; tag?: string }): AnonymousNote {
    const cleanContent = this.moderationService.sanitizeContent(payload.content, 240);
    const cleanTag = this.moderationService.sanitizeContent(
      payload.tag || 'Khách ghé quán ẩn danh',
      40,
    );

    const note: AnonymousNote = {
      id: `note_${Math.random().toString(36).slice(2, 10)}`,
      userId: payload.userId || 'guest',
      content:
        cleanContent || 'Gửi một chút bình yên đến những ai đang thức khuya tại 24h Café.',
      tag: cleanTag,
      reactions: { heart: 1, coffee: 0, sparkle: 0 },
      createdAt: new Date().toISOString(),
    };

    this.notes.unshift(note);
    if (this.notes.length > 60) {
      this.notes.pop();
    }
    return note;
  }

  reactToNote(noteId: string, type: 'heart' | 'coffee' | 'sparkle'): AnonymousNote | undefined {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return undefined;
    if (type in note.reactions) {
      note.reactions[type] += 1;
    }
    return note;
  }
}

