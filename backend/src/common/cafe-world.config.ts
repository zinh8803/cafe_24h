export type WorldCycle = 'morning' | 'rainy' | 'sunset' | 'midnight';

export interface SeatDefinition {
  id: string;
  zone: 'Main Hall' | 'Window Seats' | 'Coffee Bar' | 'Quiet Corner' | 'Garden';
  tableId: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
}

export interface CafeItemDefinition {
  id: string;
  name: string;
  itemType: 'drink' | 'outfit' | 'decor';
  icon: string;
  color: string;
  price: number;
  description: string;
}

export const MAP_BOUNDS = {
  width: 1200,
  height: 780,
  spawnX: 580,
  spawnY: 660,
};

export const CAFE_SEATS: SeatDefinition[] = [
  // Window Seats (Left side overlooking street/rain)
  { id: 'win_1a', zone: 'Window Seats', tableId: 'tbl_win_1', x: 145, y: 215, direction: 'right' },
  { id: 'win_1b', zone: 'Window Seats', tableId: 'tbl_win_1', x: 255, y: 215, direction: 'left' },
  { id: 'win_2a', zone: 'Window Seats', tableId: 'tbl_win_2', x: 145, y: 375, direction: 'right' },
  { id: 'win_2b', zone: 'Window Seats', tableId: 'tbl_win_2', x: 255, y: 375, direction: 'left' },
  { id: 'win_3a', zone: 'Window Seats', tableId: 'tbl_win_3', x: 145, y: 535, direction: 'right' },
  { id: 'win_3b', zone: 'Window Seats', tableId: 'tbl_win_3', x: 255, y: 535, direction: 'left' },

  // Coffee Bar Stools (Top center)
  { id: 'bar_1', zone: 'Coffee Bar', tableId: 'tbl_bar', x: 450, y: 235, direction: 'up' },
  { id: 'bar_2', zone: 'Coffee Bar', tableId: 'tbl_bar', x: 530, y: 235, direction: 'up' },
  { id: 'bar_3', zone: 'Coffee Bar', tableId: 'tbl_bar', x: 610, y: 235, direction: 'up' },
  { id: 'bar_4', zone: 'Coffee Bar', tableId: 'tbl_bar', x: 690, y: 235, direction: 'up' },

  // Main Hall Tables (Center)
  { id: 'main_1a', zone: 'Main Hall', tableId: 'tbl_main_1', x: 430, y: 390, direction: 'right' },
  { id: 'main_1b', zone: 'Main Hall', tableId: 'tbl_main_1', x: 540, y: 390, direction: 'left' },
  { id: 'main_2a', zone: 'Main Hall', tableId: 'tbl_main_2', x: 640, y: 390, direction: 'right' },
  { id: 'main_2b', zone: 'Main Hall', tableId: 'tbl_main_2', x: 750, y: 390, direction: 'left' },
  { id: 'main_3a', zone: 'Main Hall', tableId: 'tbl_main_3', x: 430, y: 535, direction: 'right' },
  { id: 'main_3b', zone: 'Main Hall', tableId: 'tbl_main_3', x: 540, y: 535, direction: 'left' },

  // Quiet Corner (Top right study area with bookshelves)
  { id: 'quiet_1a', zone: 'Quiet Corner', tableId: 'tbl_quiet_1', x: 895, y: 210, direction: 'right' },
  { id: 'quiet_1b', zone: 'Quiet Corner', tableId: 'tbl_quiet_1', x: 1015, y: 210, direction: 'left' },
  { id: 'quiet_2a', zone: 'Quiet Corner', tableId: 'tbl_quiet_2', x: 895, y: 345, direction: 'right' },
  { id: 'quiet_2b', zone: 'Quiet Corner', tableId: 'tbl_quiet_2', x: 1015, y: 345, direction: 'left' },

  // Garden Terrace (Bottom right outdoor area)
  { id: 'garden_1a', zone: 'Garden', tableId: 'tbl_garden_1', x: 890, y: 530, direction: 'right' },
  { id: 'garden_1b', zone: 'Garden', tableId: 'tbl_garden_1', x: 1010, y: 530, direction: 'left' },
  { id: 'garden_2a', zone: 'Garden', tableId: 'tbl_garden_2', x: 890, y: 655, direction: 'right' },
  { id: 'garden_2b', zone: 'Garden', tableId: 'tbl_garden_2', x: 1010, y: 655, direction: 'left' },
];

export const CAFE_ITEMS: CafeItemDefinition[] = [
  {
    id: 'drink_iced_milk_coffee',
    name: 'Cà Phê Sữa Đá',
    itemType: 'drink',
    icon: '☕',
    color: '#c68b59',
    price: 0,
    description: 'Đậm đà hương vị Sài Gòn lúc sáng sớm hay đêm muộn.',
  },
  {
    id: 'drink_matcha_latte',
    name: 'Matcha Latte Kem Cheese',
    itemType: 'drink',
    icon: '🍵',
    color: '#7fb069',
    price: 0,
    description: 'Vị trà xanh Uji dịu nhẹ cho những giờ học tập tĩnh lặng.',
  },
  {
    id: 'drink_peach_tea',
    name: 'Trà Đào Cam Sả',
    itemType: 'drink',
    icon: '🍹',
    color: '#f4a261',
    price: 0,
    description: 'Thanh mát, thơm dịu hương sả và lát đào giòn.',
  },
  {
    id: 'drink_boba_milk_tea',
    name: 'Trà Sữa Trân Châu Đường Đen',
    itemType: 'drink',
    icon: '🧋',
    color: '#d4a373',
    price: 0,
    description: 'Ngọt ngào chữa lành mọi chiếc bụng đói lúc nửa đêm.',
  },
  {
    id: 'drink_hot_cocoa',
    name: 'Cacao Nóng Marshmallow',
    itemType: 'drink',
    icon: '🍫',
    color: '#8d5b4c',
    price: 0,
    description: 'Lựa chọn hoàn hảo khi ngoài khung cửa sổ đang mưa rả rích.',
  },
  {
    id: 'drink_chamomile',
    name: 'Trà Hoa Cúc Mật Ong',
    itemType: 'drink',
    icon: '🌼',
    color: '#e9c46a',
    price: 0,
    description: 'Dịu tâm trí trước khi kết thúc một ngày dài.',
  },
];

export const DAILY_QUOTES: string[] = [
  'Có những ngày chỉ muốn ngồi yên trong một quán cà phê cùng những người xa lạ.',
  'Nếu hôm nay bạn mệt, hãy nghỉ ngơi một chút. Không cần phải giỏi mọi thứ mỗi ngày.',
  'Ở đây không ai hỏi bạn đã làm được gì, chỉ hỏi bạn muốn uống trà đào hay cà phê.',
  'Đêm muộn nhất cũng sẽ dịu lại bên một tách cacao nóng và tiếng mưa ngoài hiên.',
  'Chậm lại một nhịp không có nghĩa là bạn đang tụt lại phía sau.',
];

