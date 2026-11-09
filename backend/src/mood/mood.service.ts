import { Injectable } from '@nestjs/common';

export interface MoodDefinition {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

export const MOOD_LIST: MoodDefinition[] = [
  { id: 'happy', emoji: '😊', label: 'Vui vẻ', color: '#facc15' },
  { id: 'sleepy', emoji: '😴', label: 'Buồn ngủ', color: '#93c5fd' },
  { id: 'sad', emoji: '😔', label: 'Hơi buồn', color: '#94a3b8' },
  { id: 'loved', emoji: '🥰', label: 'Hạnh phúc', color: '#f472b6' },
  { id: 'peaceful', emoji: '😌', label: 'Bình yên', color: '#6ee7b7' },
  { id: 'listening', emoji: '🥲', label: 'Cần người lắng nghe', color: '#c084fc' },
];

@Injectable()
export class MoodService {
  getAllMoods(): MoodDefinition[] {
    return MOOD_LIST;
  }

  normalizeMood(moodId?: string): MoodDefinition {
    return MOOD_LIST.find((m) => m.id === moodId) || MOOD_LIST[4];
  }
}

