export type WorldCycle = 'morning' | 'rainy' | 'sunset' | 'midnight';

export interface SeatConfig {
  id: string;
  zone: 'Main Hall' | 'Window Seats' | 'Coffee Bar' | 'Quiet Corner' | 'Garden' | 'Sân Thượng';
  tableId: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
}

export interface AvatarPreset {
  id: string;
  name: string;
  skinColor: number;
  hairColor: number;
  hairStyle: 'bob' | 'parted' | 'bun' | 'curly' | 'beanie' | 'cat_ears';
}

export interface OutfitPreset {
  id: string;
  name: string;
  primaryColor: number;
  accentColor: number;
  cssColor: string;
}

export interface MoodConfig {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

export interface DrinkConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'preset_01', name: 'Mây (Tóc Bob)', skinColor: 0xfce2c4, hairColor: 0x2c221e, hairStyle: 'bob' },
  { id: 'preset_02', name: 'An (Tóc Búi)', skinColor: 0xf7d6b5, hairColor: 0x5c3a21, hairStyle: 'bun' },
  { id: 'preset_03', name: 'Khói (Tai Mèo)', skinColor: 0xfbe5cc, hairColor: 0x3b2f2f, hairStyle: 'cat_ears' },
  { id: 'preset_04', name: 'Nam (Rẽ Ngôi)', skinColor: 0xefc39a, hairColor: 0x1f242d, hairStyle: 'parted' },
  { id: 'preset_05', name: 'Đông (Mũ Len)', skinColor: 0xf8d9b8, hairColor: 0x6e473b, hairStyle: 'beanie' },
  { id: 'preset_06', name: 'Hạ (Tóc Xoăn)', skinColor: 0xe6b58c, hairColor: 0x432818, hairStyle: 'curly' },
];

export const OUTFIT_PRESETS: OutfitPreset[] = [
  { id: 'latte', name: 'Áo Len Latte', primaryColor: 0xd4a373, accentColor: 0xfaedcd, cssColor: '#d4a373' },
  { id: 'matcha', name: 'Cardigan Matcha', primaryColor: 0x6b9080, accentColor: 0xeaf4f4, cssColor: '#6b9080' },
  { id: 'midnight', name: 'Hoodie Đêm Mưa', primaryColor: 0x3d5a80, accentColor: 0x98c1d9, cssColor: '#3d5a80' },
  { id: 'berry', name: 'Sweater Đào Hồng', primaryColor: 0xe07a5f, accentColor: 0xf4f1de, cssColor: '#e07a5f' },
  { id: 'espresso', name: 'Tạp Dề Barista', primaryColor: 0x4a3427, accentColor: 0xe6ccb2, cssColor: '#4a3427' },
  { id: 'lavender', name: 'Áo Khoác Tím Khói', primaryColor: 0x8e7dbe, accentColor: 0xf2e9e4, cssColor: '#8e7dbe' },
];

export const MOOD_OPTIONS: MoodConfig[] = [
  { id: 'happy', emoji: '😊', label: 'Vui vẻ', color: '#facc15' },
  { id: 'sleepy', emoji: '😴', label: 'Buồn ngủ', color: '#93c5fd' },
  { id: 'sad', emoji: '😔', label: 'Hơi buồn', color: '#94a3b8' },
  { id: 'loved', emoji: '🥰', label: 'Hạnh phúc', color: '#f472b6' },
  { id: 'peaceful', emoji: '😌', label: 'Bình yên', color: '#6ee7b7' },
  { id: 'listening', emoji: '🥲', label: 'Cần người lắng nghe', color: '#c084fc' },
];

export const DRINK_MENU: DrinkConfig[] = [
  {
    id: 'drink_iced_milk_coffee',
    name: 'Cà Phê Sữa Đá',
    icon: '☕',
    color: '#c68b59',
    description: 'Đậm đà hương vị Sài Gòn lúc sáng sớm hay đêm muộn.',
  },
  {
    id: 'drink_matcha_latte',
    name: 'Matcha Latte Kem Cheese',
    icon: '🍵',
    color: '#7fb069',
    description: 'Vị trà xanh Uji dịu nhẹ cho những giờ học tập tĩnh lặng.',
  },
  {
    id: 'drink_peach_tea',
    name: 'Trà Đào Cam Sả',
    icon: '🍹',
    color: '#f4a261',
    description: 'Thanh mát, thơm dịu hương sả và lát đào giòn.',
  },
  {
    id: 'drink_boba_milk_tea',
    name: 'Trà Sữa Trân Châu Đường Đen',
    icon: '🧋',
    color: '#d4a373',
    description: 'Ngọt ngào chữa lành mọi chiếc bụng đói lúc nửa đêm.',
  },
  {
    id: 'drink_hot_cocoa',
    name: 'Cacao Nóng Marshmallow',
    icon: '🍫',
    color: '#8d5b4c',
    description: 'Lựa chọn hoàn hảo khi ngoài khung cửa sổ đang mưa rả rích.',
  },
  {
    id: 'drink_chamomile',
    name: 'Trà Hoa Cúc Mật Ong',
    icon: '🌼',
    color: '#e9c46a',
    description: 'Dịu tâm trí trước khi kết thúc một ngày dài.',
  },
];

export const WORLD_CYCLES: Record<
  WorldCycle,
  {
    label: string;
    subtitle: string;
    icon: string;
    ambientTint: number;
    ambientAlpha: number;
    windowSkyColor: number;
    lampGlowAlpha: number;
    hasRain: boolean;
    hasNeon: boolean;
  }
> = {
  morning: {
    label: 'Morning Café',
    subtitle: 'Ánh nắng sớm, nhạc acoustic nhẹ',
    icon: '☀️',
    ambientTint: 0xfff3d1,
    ambientAlpha: 0.08,
    windowSkyColor: 0x8ecae6,
    lampGlowAlpha: 0.18,
    hasRain: false,
    hasNeon: false,
  },
  rainy: {
    label: 'Rainy Afternoon',
    subtitle: 'Mưa ngoài cửa sổ, ánh sáng dịu',
    icon: '🌧️',
    ambientTint: 0x2b4162,
    ambientAlpha: 0.26,
    windowSkyColor: 0x334e68,
    lampGlowAlpha: 0.52,
    hasRain: true,
    hasNeon: false,
  },
  sunset: {
    label: 'Sunset Café',
    subtitle: 'Ánh hoàng hôn ấm áp',
    icon: '🌇',
    ambientTint: 0xe07a5f,
    ambientAlpha: 0.22,
    windowSkyColor: 0xf28482,
    lampGlowAlpha: 0.48,
    hasRain: false,
    hasNeon: false,
  },
  midnight: {
    label: 'Midnight Café',
    subtitle: 'Đèn neon, trăng sao, nhạc chill 2h sáng',
    icon: '🌙',
    ambientTint: 0x0f172a,
    ambientAlpha: 0.42,
    windowSkyColor: 0x0b132b,
    lampGlowAlpha: 0.78,
    hasRain: true,
    hasNeon: true,
  },
};

export const CAFE_SEAT_MAP: SeatConfig[] = [
  // Window Seats
  { id: 'win_1a', zone: 'Window Seats', tableId: 'tbl_win_1', x: 145, y: 215, direction: 'right' },
  { id: 'win_1b', zone: 'Window Seats', tableId: 'tbl_win_1', x: 255, y: 215, direction: 'left' },
  { id: 'win_2a', zone: 'Window Seats', tableId: 'tbl_win_2', x: 145, y: 375, direction: 'right' },
  { id: 'win_2b', zone: 'Window Seats', tableId: 'tbl_win_2', x: 255, y: 375, direction: 'left' },
  { id: 'win_3a', zone: 'Window Seats', tableId: 'tbl_win_3', x: 145, y: 535, direction: 'right' },
  { id: 'win_3b', zone: 'Window Seats', tableId: 'tbl_win_3', x: 255, y: 535, direction: 'left' },

  // Coffee Bar
  { id: 'bar_1', zone: 'Coffee Bar', tableId: 'tbl_bar', x: 450, y: 235, direction: 'up' },
  { id: 'bar_2', zone: 'Coffee Bar', tableId: 'tbl_bar', x: 530, y: 235, direction: 'up' },
  { id: 'bar_3', zone: 'Coffee Bar', tableId: 'tbl_bar', x: 610, y: 235, direction: 'up' },
  { id: 'bar_4', zone: 'Coffee Bar', tableId: 'tbl_bar', x: 690, y: 235, direction: 'up' },

  // Main Hall
  { id: 'main_1a', zone: 'Main Hall', tableId: 'tbl_main_1', x: 430, y: 390, direction: 'right' },
  { id: 'main_1b', zone: 'Main Hall', tableId: 'tbl_main_1', x: 540, y: 390, direction: 'left' },
  { id: 'main_2a', zone: 'Main Hall', tableId: 'tbl_main_2', x: 640, y: 390, direction: 'right' },
  { id: 'main_2b', zone: 'Main Hall', tableId: 'tbl_main_2', x: 750, y: 390, direction: 'left' },
  { id: 'main_3a', zone: 'Main Hall', tableId: 'tbl_main_3', x: 430, y: 535, direction: 'right' },
  { id: 'main_3b', zone: 'Main Hall', tableId: 'tbl_main_3', x: 540, y: 535, direction: 'left' },

  // Quiet Corner
  { id: 'quiet_1a', zone: 'Quiet Corner', tableId: 'tbl_quiet_1', x: 895, y: 210, direction: 'right' },
  { id: 'quiet_1b', zone: 'Quiet Corner', tableId: 'tbl_quiet_1', x: 1015, y: 210, direction: 'left' },
  { id: 'quiet_2a', zone: 'Quiet Corner', tableId: 'tbl_quiet_2', x: 895, y: 345, direction: 'right' },
  { id: 'quiet_2b', zone: 'Quiet Corner', tableId: 'tbl_quiet_2', x: 1015, y: 345, direction: 'left' },

  // Garden
  { id: 'garden_1a', zone: 'Garden', tableId: 'tbl_garden_1', x: 890, y: 530, direction: 'right' },
  { id: 'garden_1b', zone: 'Garden', tableId: 'tbl_garden_1', x: 1010, y: 530, direction: 'left' },
  { id: 'garden_2a', zone: 'Garden', tableId: 'tbl_garden_2', x: 890, y: 655, direction: 'right' },
  { id: 'garden_2b', zone: 'Garden', tableId: 'tbl_garden_2', x: 1010, y: 655, direction: 'left' },

  // Sân Thượng (Rooftop Open-Air Deck: toạ độ tầng trên y < 0)
  { id: 'roof_sky_1', zone: 'Sân Thượng', tableId: 'tbl_roof_sky', x: 530, y: -460, direction: 'up' },
  { id: 'roof_sky_2', zone: 'Sân Thượng', tableId: 'tbl_roof_sky', x: 650, y: -460, direction: 'up' },
  { id: 'roof_lounge_1a', zone: 'Sân Thượng', tableId: 'tbl_roof_lounge', x: 880, y: -340, direction: 'right' },
  { id: 'roof_lounge_1b', zone: 'Sân Thượng', tableId: 'tbl_roof_lounge', x: 980, y: -340, direction: 'left' },
  { id: 'roof_study_1a', zone: 'Sân Thượng', tableId: 'tbl_roof_study', x: 480, y: -230, direction: 'right' },
  { id: 'roof_study_1b', zone: 'Sân Thượng', tableId: 'tbl_roof_study', x: 580, y: -230, direction: 'left' },
  { id: 'roof_study_2a', zone: 'Sân Thượng', tableId: 'tbl_roof_study_2', x: 880, y: -160, direction: 'right' },
  { id: 'roof_study_2b', zone: 'Sân Thượng', tableId: 'tbl_roof_study_2', x: 980, y: -160, direction: 'left' },
];

export const CAFE_ROOFTOP_SEATS: SeatConfig[] = CAFE_SEAT_MAP.filter(
  (s) => s.zone === 'Sân Thượng',
);

