import * as Phaser from 'phaser';
import {
  CAFE_SEAT_MAP,
  WORLD_CYCLES,
  type SeatConfig,
  type WorldCycle,
} from '../assets/cafeCatalog';
import { PlayerAvatar } from '../entities/PlayerAvatar';
import { gameEventBus, type PlayerNetState } from '../systems/EventBus';
import { composePolaroidCard } from '../systems/PolaroidExporter';

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

interface TwinkleStar {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  phase: number;
}

interface DustParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  r: number;
  speed: number;
  phase: number;
  alpha: number;
}

interface ShootingStar {
  x: number;
  y: number;
  len: number;
  speedX: number;
  speedY: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface BaristaOrder {
  orderId: string;
  userId: string;
  userNickname: string;
  targetX: number;
  targetY: number;
  seatId: string | null;
  drinkId: string;
  drinkIcon: string;
  drinkName: string;
}

export class CafeMainScene extends Phaser.Scene {
  private readonly avatars = new Map<string, PlayerAvatar>();
  private readonly seatGraphics = new Map<string, Phaser.GameObjects.Arc>();
  private occupiedSeats: Record<string, string> = {};
  private selfUserId = '';
  private currentCycle: WorldCycle = 'midnight';

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private walkTarget: { x: number; y: number } | null = null;
  private pendingSitSeat: SeatConfig | null = null;
  private baristaOrderQueue: BaristaOrder[] = [];
  private isBaristaBusy = false;
  private joystickVec = { vx: 0, vy: 0 };
  private lastMoveEmitAt = 0;
  private lastZone = 'Entrance';
  private currentFloor: 'ground' | 'rooftop' = 'ground';

  private windowSkyGraphic!: Phaser.GameObjects.Graphics;
  private rooftopSkyGraphic!: Phaser.GameObjects.Graphics;
  private rooftopCityGraphic!: Phaser.GameObjects.Graphics;
  private fairyLightsGraphic!: Phaser.GameObjects.Graphics;
  private rainGraphic!: Phaser.GameObjects.Graphics;
  private starsGraphic!: Phaser.GameObjects.Graphics;
  private dustGraphic!: Phaser.GameObjects.Graphics;
  private lampGlowGroup!: Phaser.GameObjects.Group;
  private ambientOverlay!: Phaser.GameObjects.Rectangle;
  private neonSignText!: Phaser.GameObjects.Text;
  private rainDrops: RainDrop[] = [];
  private twinkleStars: TwinkleStar[] = [];
  private dustParticles: DustParticle[] = [];
  private activeShootingStars: ShootingStar[] = [];
  private shootingStarTimer = 0;
  private unsubscribers: Array<() => void> = [];

  private isAimingThrow = false;
  private aimGuideGraphics!: Phaser.GameObjects.Graphics;
  private aimReticleText!: Phaser.GameObjects.Text;

  // Collision rectangles for furniture across both Ground Floor and Rooftop
  private readonly obstacles: Array<{ x: number; y: number; w: number; h: number }> = [
    // --- TẦNG 1 (GROUND FLOOR) ---
    // Coffee Bar counter
    { x: 400, y: 120, w: 345, h: 78 },
    // Window tables
    { x: 175, y: 185, w: 50, h: 60 },
    { x: 175, y: 345, w: 50, h: 60 },
    { x: 175, y: 505, w: 50, h: 60 },
    // Main Hall tables
    { x: 458, y: 360, w: 56, h: 60 },
    { x: 668, y: 360, w: 56, h: 60 },
    { x: 458, y: 505, w: 56, h: 60 },
    // Quiet Corner tables
    { x: 925, y: 180, w: 62, h: 56 },
    { x: 925, y: 315, w: 62, h: 56 },
    // Garden tables
    { x: 922, y: 502, w: 56, h: 56 },
    { x: 922, y: 627, w: 56, h: 56 },

    // --- SÂN THƯỢNG (ROOFTOP: y < 0) ---
    // Glass Railing top barrier
    { x: 50, y: -535, w: 1100, h: 25 },
    // Skyline Bar Table
    { x: 510, y: -455, w: 160, h: 42 },
    // Moonlight Lounge Table
    { x: 910, y: -335, w: 60, h: 52 },
    // Starry Bistro Table 1
    { x: 510, y: -225, w: 60, h: 52 },
    // Quiet Canopy Table 2
    { x: 910, y: -155, w: 60, h: 52 },
    // Rooftop Mini Bar Counter
    { x: 270, y: -370, w: 110, h: 58 },
  ];

  constructor() {
    super({ key: 'CafeMainScene' });
  }

  create() {
    // 2-Floor Continuous Map: Rooftop (y: -780..0) + Ground Floor (y: 0..780)
    this.cameras.main.setBounds(0, -780, 1200, 1560);
    this.cameras.main.fadeIn(420, 16, 18, 27);

    this.drawCafeArchitecture();
    this.createInteractiveProps();
    this.createSeats();
    this.createLightingAndWeather();

    this.aimGuideGraphics = this.add.graphics().setDepth(9100);
    this.aimReticleText = this.add
      .text(0, 0, '🎯', { fontSize: '20px' })
      .setOrigin(0.5)
      .setDepth(9101)
      .setVisible(false);

    this.setupControls();
    this.getOrCreateBaristaAvatar();
    this.bindNetworkEvents();

    gameEventBus.emit('client:ready', {});
  }

  private drawCafeArchitecture() {
    const g = this.add.graphics().setDepth(-5000);

    // ==========================================
    // 1. TẦNG 2 - SÂN THƯỢNG (ROOFTOP: y: -780..0)
    // ==========================================
    // Base outer frame for rooftop
    g.fillStyle(0x1e293b, 1);
    g.fillRect(0, -780, 1200, 780);

    // Rooftop Outdoor Teak Decking (y: -510..-20)
    g.fillStyle(0x422d20, 1);
    g.fillRoundedRect(52, -510, 1096, 490, 14);

    // Wood plank decking horizontal lines
    g.lineStyle(1, 0x332218, 0.65);
    for (let y = -485; y < -20; y += 28) {
      g.lineBetween(56, y, 1144, y);
    }

    // Moonlight Lounge outdoor woven rug (Top right)
    g.fillStyle(0x2d3a33, 0.7);
    g.fillRoundedRect(820, -410, 310, 160, 14);
    g.lineStyle(2, 0x52796f, 0.5);
    g.strokeRoundedRect(820, -410, 310, 160, 14);

    // Perimeter Glass Railing with LED glow strip
    g.fillStyle(0x38bdf8, 0.12);
    g.fillRect(52, -520, 1096, 20);
    g.lineStyle(2, 0x93c5fd, 0.55);
    g.strokeRect(52, -520, 1096, 20);

    // Railing Glass Posts & Warm Oak Handrail
    g.fillStyle(0xd4a373, 1);
    g.fillRect(50, -524, 1100, 6);
    for (let rx = 52; rx <= 1148; rx += 72) {
      g.fillStyle(0x64748b, 0.9);
      g.fillRect(rx, -522, 4, 18);
    }

    // Planter Boxes & Greenery along railing
    const flowerColors = [0xf43f5e, 0xa855f7, 0xfbbf24, 0x38bdf8];
    for (let px = 80; px < 1120; px += 115) {
      if (px > 560 && px < 700) continue; // Space for Telescope
      g.fillStyle(0x3b2416, 1);
      g.fillRoundedRect(px - 28, -514, 56, 14, 4);
      g.fillStyle(0x2d6a4f, 1);
      g.fillCircle(px - 14, -516, 9);
      g.fillCircle(px, -518, 10);
      g.fillCircle(px + 14, -516, 9);
      g.fillStyle(flowerColors[px % flowerColors.length], 1);
      g.fillCircle(px - 12, -518, 3);
      g.fillCircle(px, -520, 3);
      g.fillCircle(px + 12, -518, 3);
    }

    // Rooftop Mini Bar Counter (x: 270..380, y: -370..-310)
    g.fillStyle(0x2f1f14, 1);
    g.fillRoundedRect(270, -370, 110, 60, 8);
    g.fillStyle(0xd4a373, 1);
    g.fillRoundedRect(266, -374, 118, 14, 5);
    g.fillStyle(0x94a3b8, 1);
    g.fillRoundedRect(280, -384, 32, 20, 4);
    g.fillStyle(0x38bdf8, 0.9);
    g.fillCircle(335, -378, 6);
    g.fillStyle(0xf59e0b, 0.9);
    g.fillCircle(355, -378, 6);

    // Rooftop Tables
    this.drawRooftopTables(g);

    // ==========================================
    // 2. CẦU THANG KẾT NỐI (x: 760..845, y: -25..110)
    // ==========================================
    g.fillStyle(0x1a120c, 1);
    g.fillRect(760, -25, 85, 135);
    g.lineStyle(2, 0x8c5a3c, 1);
    g.strokeRect(760, -25, 85, 135);

    // Continuous wooden steps linking Ground Floor & Rooftop
    for (let sy = -20; sy <= 100; sy += 12) {
      g.fillStyle(0x5c3a21, 1);
      g.fillRect(764, sy, 77, 10);
      // Warm LED strip on step edge
      g.fillStyle(0xfde68a, 0.8);
      g.fillRect(764, sy, 77, 2);
    }
    // Handrails on both sides of staircase
    g.lineStyle(3, 0xd4a373, 1);
    g.lineBetween(763, -25, 763, 110);
    g.lineBetween(842, -25, 842, 110);

    // ==========================================
    // 3. TẦNG 1 - GROUND FLOOR: JAPANESE KISSATEN (y: 0..780)
    // ==========================================
    // Base outer frame for ground floor
    g.fillStyle(0x4a3221, 1);
    g.fillRect(0, 0, 1200, 780);

    // Main Wooden Floor (Light Hinoki & Oak Plank - Ghibli Cozy Wood)
    g.fillStyle(0xa67c52, 1);
    g.fillRoundedRect(52, 100, 1096, 635, 14);

    // Light wooden floor plank lines
    g.lineStyle(1, 0x8c6239, 0.45);
    for (let y = 130; y < 730; y += 32) {
      g.lineBetween(56, y, 1144, y);
    }

    // Zone: Window Seats - Woven Linen Runner (Vải lanh màu be yến mạch)
    g.fillStyle(0xd5bdaf, 0.85);
    g.fillRoundedRect(75, 145, 235, 470, 10);
    g.lineStyle(2, 0xb79ced, 0.3);

    // Shoji Lattice Window accents on left wall
    for (let sy = 160; sy <= 560; sy += 140) {
      g.fillStyle(0xfefae0, 0.7);
      g.fillRect(56, sy, 14, 100);
      g.lineStyle(1, 0x5c3d2e, 0.8);
      g.strokeRect(56, sy, 14, 100);
      g.lineBetween(56, sy + 33, 70, sy + 33);
      g.lineBetween(56, sy + 66, 70, sy + 66);
    }

    // Zone: Quiet Corner - Traditional Japanese Tatami Mat (Chiếu cói Tatami)
    g.fillStyle(0x9ca777, 0.95);
    g.fillRoundedRect(835, 135, 285, 285, 12);
    // Tatami dark indigo borders
    g.lineStyle(3, 0x3d5a40, 1);
    g.strokeRoundedRect(835, 135, 285, 285, 12);
    g.lineBetween(835, 277, 1120, 277);
    g.lineBetween(977, 135, 977, 420);

    // Zone: Garden Terrace - Japanese Zen Stone & Bamboo Patio (Vườn thiền sỏi đá)
    g.fillStyle(0xe9ecef, 0.95);
    g.fillRoundedRect(835, 450, 295, 265, 12);
    g.lineStyle(2, 0xced4da, 0.8);
    g.strokeRoundedRect(835, 450, 295, 265, 12);

    // Zen Sand Rake wave lines
    g.lineStyle(1, 0xb8c0c8, 0.5);
    for (let zy = 465; zy < 705; zy += 18) {
      g.lineBetween(845, zy, 1120, zy);
    }

    // Natural stepping river stones
    g.fillStyle(0x495057, 0.85);
    for (let gx = 865; gx < 1100; gx += 60) {
      for (let gy = 480; gy < 695; gy += 60) {
        g.fillCircle(gx + 15, gy + 15, 16);
      }
    }
    // Bonsai & Bamboo Greenery
    g.fillStyle(0x2d6a4f, 1);
    for (let bx = 850; bx <= 1110; bx += 36) {
      g.fillCircle(bx, 455, 15);
      g.fillCircle(bx, 712, 15);
    }
    // Miniature Stone Lantern (Toro)
    g.fillStyle(0x6c757d, 1);
    g.fillRoundedRect(1070, 470, 24, 28, 4);
    g.fillStyle(0xfde047, 0.9);
    g.fillCircle(1082, 484, 5); // Warm Lantern light

    // Top Back Wall - Warm Cedar Wood
    g.fillStyle(0x3e271a, 1);
    g.fillRect(52, 24, 1096, 86);
    g.lineStyle(3, 0x6f4518, 1);
    g.lineBetween(52, 110, 760, 110);
    g.lineBetween(845, 110, 1148, 110);

    // Japanese Noren Curtain (Rèm Noren vải lanh xanh trà trên quầy bar)
    const norenColors = [0x283618, 0x3a5a40, 0x283618, 0x3a5a40];
    for (let ni = 0; ni < 4; ni++) {
      g.fillStyle(norenColors[ni], 0.95);
      g.fillRoundedRect(440 + ni * 60, 36, 52, 54, 4);
    }

    // Japanese Kissaten Bar Counter - Hinoki Light Wood & Brass
    g.fillStyle(0x5c3d2e, 1);
    g.fillRoundedRect(398, 120, 350, 80, 10);
    // Hinoki light solid wood top
    g.fillStyle(0xd4a373, 1);
    g.fillRoundedRect(394, 114, 358, 22, 6);
    g.lineStyle(2, 0xbc6c25, 0.9);
    g.strokeRoundedRect(394, 114, 358, 22, 6);

    // Vintage Siphon Coffee Maker & Kyusu Tea Pot (Phin Siphon thủy tinh & ấm trà)
    g.fillStyle(0x38bdf8, 0.6); // Siphon Glass bulb
    g.fillCircle(450, 108, 9);
    g.fillCircle(450, 90, 7);
    g.lineStyle(2, 0xd4a373, 1);
    g.lineBetween(450, 97, 450, 118);
    // Japanese Kyusu Green Teapot
    g.fillStyle(0x3a5a40, 1);
    g.fillCircle(485, 106, 8);
    g.fillStyle(0xbc6c25, 1);
    g.fillRect(491, 104, 8, 3); // Wooden handle

    // Glass Pastry Case - Japanese Caramel Pudding & Matcha Roll Cake
    g.fillStyle(0x38bdf8, 0.16);
    g.fillRoundedRect(635, 96, 75, 34, 5);
    g.lineStyle(1.5, 0x7dd3fc, 0.6);
    g.strokeRoundedRect(635, 96, 75, 34, 5);
    // Pudding with caramel cap & Matcha Cake
    g.fillStyle(0xfde047, 0.95);
    g.fillCircle(652, 114, 6); // Custard pudding
    g.fillStyle(0x78350f, 0.95);
    g.fillCircle(652, 110, 4); // Caramel sauce
    g.fillStyle(0x4d7c0f, 0.95);
    g.fillCircle(674, 114, 5.5); // Matcha Roll cake
    g.fillStyle(0xf43f5e, 0.95);
    g.fillCircle(692, 114, 4); // Strawberry Daifuku

    // Bookshelves on back wall
    g.fillStyle(0x3d2817, 1);
    g.fillRoundedRect(855, 32, 245, 72, 6);
    const bookColors = [0xe07a5f, 0x81b29a, 0xf2cc8f, 0x98c1d9, 0xd4a373];
    for (let bx = 868; bx < 1085; bx += 14) {
      g.fillStyle(bookColors[bx % bookColors.length], 0.9);
      g.fillRect(bx, 44, 9, 22);
      g.fillRect(bx, 74, 9, 22);
    }

    // Entrance Welcome Mat
    g.fillStyle(0x7f5539, 1);
    g.fillRoundedRect(515, 682, 130, 44, 8);
    g.lineStyle(2, 0xe6ccb2, 0.7);
    g.strokeRoundedRect(521, 687, 118, 34, 6);

    // Draw Ground Floor Tables
    this.drawGroundTables(g);

    // Watermark Zone Labels - High Contrast Japanese Kissaten Style
    const groundLabelStyle = {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#120803',
      backgroundColor: '#fdfbf7',
      padding: { left: 8, right: 8, top: 3, bottom: 3 },
      fontStyle: 'bold',
    };

    const rooftopLabelStyle = {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#120803',
      backgroundColor: '#fdfbf7',
      padding: { left: 8, right: 8, top: 3, bottom: 3 },
      fontStyle: 'bold',
    };

    // Tầng 1
    this.add.text(135, 122, 'Bàn Cửa Sổ • Window Seats', groundLabelStyle);
    this.add.text(535, 260, 'Sảnh Chung • Main Hall', groundLabelStyle);
    this.add.text(925, 116, 'Khu Yên Tĩnh • Quiet Zone', groundLabelStyle);
    this.add.text(930, 428, 'Vườn Thư Giãn • Zen Garden', groundLabelStyle);
    this.add
      .text(580, 704, 'LỐI VÀO • ENTRANCE', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '11px',
        fontStyle: '800',
        color: '#ffffff',
        backgroundColor: '#1b4332',
        padding: { left: 8, right: 8, top: 3, bottom: 3 },
      })
      .setOrigin(0.5);

    // Sân Thượng Labels
    this.add.text(540, -490, 'Sân Thượng • Skyline Panorama View', rooftopLabelStyle);
    this.add.text(880, -390, 'Khu Ngắm Trăng • Moonlight Lounge', rooftopLabelStyle);
    this.add.text(540, -280, 'Bàn Đôi Sân Thượng • Starry Bistro', rooftopLabelStyle);
  }

  private drawGroundTables(g: Phaser.GameObjects.Graphics) {
    // Window Tables (3 tables)
    const winYs = [215, 375, 535];
    for (const wy of winYs) {
      g.fillStyle(0x211712, 0.45);
      g.fillRoundedRect(172, wy - 26, 60, 64, 10);
      g.fillStyle(0x8c5a3c, 1);
      g.fillRoundedRect(175, wy - 30, 50, 60, 9);
      g.lineStyle(2, 0xb07d56, 1);
      g.strokeRoundedRect(175, wy - 30, 50, 60, 9);
      g.fillStyle(0xfef08a, 0.95);
      g.fillCircle(200, wy, 5);
    }

    // Main Hall Tables (3 tables)
    const mainTables = [
      { x: 485, y: 390 },
      { x: 695, y: 390 },
      { x: 485, y: 535 },
    ];
    for (const mt of mainTables) {
      g.fillStyle(0x1f1610, 0.45);
      g.fillRoundedRect(mt.x - 28, mt.y - 26, 60, 64, 12);
      g.fillStyle(0x7f4f24, 1);
      g.fillRoundedRect(mt.x - 28, mt.y - 30, 56, 60, 12);
      g.lineStyle(2, 0xa67c52, 1);
      g.strokeRoundedRect(mt.x - 28, mt.y - 30, 56, 60, 12);
      g.fillStyle(0xfde68a, 0.9);
      g.fillCircle(mt.x, mt.y, 5);
    }

    // Quiet Corner Study Desks (2 desks)
    const quietYs = [210, 345];
    for (const qy of quietYs) {
      g.fillStyle(0x6c584c, 1);
      g.fillRoundedRect(925, qy - 28, 62, 56, 8);
      g.fillStyle(0xfaf0ca, 0.9);
      g.fillRect(942, qy - 8, 16, 12);
      g.fillStyle(0x80ed99, 0.9);
      g.fillCircle(972, qy - 12, 5);
    }

    // Garden Round Bistro Tables (2 tables)
    const gardenYs = [530, 655];
    for (const gy of gardenYs) {
      g.fillStyle(0x141f18, 0.5);
      g.fillCircle(950, gy + 4, 30);
      g.fillStyle(0xd8f3dc, 0.9);
      g.fillCircle(950, gy, 28);
      g.lineStyle(2, 0x74c69d, 1);
      g.strokeCircle(950, gy, 28);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(950, gy, 5);
    }
  }

  private drawRooftopTables(g: Phaser.GameObjects.Graphics) {
    // 1. Skyline Bar Counter (x: 510..670, y: -455..-415)
    g.fillStyle(0x20150e, 0.5);
    g.fillRoundedRect(518, -452, 144, 40, 8);
    g.fillStyle(0x7f4f24, 1);
    g.fillRoundedRect(520, -455, 140, 36, 8);
    g.lineStyle(2, 0xa67c52, 1);
    g.strokeRoundedRect(520, -455, 140, 36, 8);
    g.fillStyle(0xfde68a, 0.95);
    g.fillCircle(550, -437, 5);
    g.fillCircle(630, -437, 5);

    // 2. Moonlight Lounge Round Table (x: 930, y: -340)
    g.fillStyle(0x1b130e, 0.45);
    g.fillCircle(930, -336, 28);
    g.fillStyle(0x8c5a3c, 1);
    g.fillCircle(930, -340, 26);
    g.lineStyle(2, 0xb07d56, 1);
    g.strokeCircle(930, -340, 26);
    g.fillStyle(0xfde68a, 0.95);
    g.fillCircle(930, -340, 5);

    // 3. Starry Bistro Table 1 (x: 530, y: -230)
    g.fillStyle(0x19211a, 0.5);
    g.fillCircle(530, -226, 30);
    g.fillStyle(0xd8f3dc, 0.9);
    g.fillCircle(530, -230, 28);
    g.lineStyle(2, 0x52b788, 1);
    g.strokeCircle(530, -230, 28);
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(530, -230, 5);
    g.fillStyle(0x74c69d, 0.85);
    g.fillCircle(530, -230, 9); // Center umbrella post

    // 4. Quiet Canopy Table 2 (x: 930, y: -160)
    g.fillStyle(0x19211a, 0.5);
    g.fillCircle(930, -156, 30);
    g.fillStyle(0xd8f3dc, 0.9);
    g.fillCircle(930, -160, 28);
    g.lineStyle(2, 0x52b788, 1);
    g.strokeCircle(930, -160, 28);
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(930, -160, 5);
    g.fillStyle(0x74c69d, 0.85);
    g.fillCircle(930, -160, 9);
  }

  private createInteractiveProps() {
    // 1. Coffee Bar Menu Board (Ground Floor)
    const barZone = this.add
      .zone(570, 150, 330, 75)
      .setInteractive({ useHandCursor: true });
    barZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isAimingThrow || pointer.rightButtonDown()) {
        pointer.event.stopPropagation();
        this.handleAimThrow(pointer.worldX, pointer.worldY);
        return;
      }
      gameEventBus.emit('client:openDrinkMenu', {});
    });

    this.add
      .text(570, 48, '☕ QUẦY PHA CHẾ • COFFEE BAR (GỌI NƯỚC)', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '11.5px',
        fontStyle: '800',
        color: '#ffffff',
        backgroundColor: '#1b4332',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5);

    // 2. Anonymous Message Board (Ground Floor Wall)
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0x6f4518, 1);
    boardBg.fillRoundedRect(250, 34, 130, 66, 6);
    boardBg.lineStyle(2, 0xd4a373, 1);
    boardBg.strokeRoundedRect(250, 34, 130, 66, 6);
    boardBg.fillStyle(0xfef08a, 1);
    boardBg.fillRect(262, 44, 22, 20);
    boardBg.fillStyle(0xfbcfe8, 1);
    boardBg.fillRect(292, 48, 22, 20);
    boardBg.fillStyle(0xbfdbfe, 1);
    boardBg.fillRect(322, 43, 22, 20);
    boardBg.fillStyle(0xbbf7d0, 1);
    boardBg.fillRect(278, 70, 24, 18);

    const boardZone = this.add
      .zone(315, 67, 140, 72)
      .setInteractive({ useHandCursor: true });
    boardZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isAimingThrow || pointer.rightButtonDown()) {
        pointer.event.stopPropagation();
        this.handleAimThrow(pointer.worldX, pointer.worldY);
        return;
      }
      gameEventBus.emit('client:openMessageBoard', {});
    });

    this.add
      .text(315, 102, '📌 Bảng Lời Nhắn Ẩn Danh', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '11px',
        fontStyle: '700',
        color: '#fef08a',
        backgroundColor: 'rgba(28, 20, 15, 0.82)',
        padding: { left: 7, right: 7, top: 3, bottom: 3 },
      })
      .setOrigin(0.5);

    // 3. Neon 24h Café Sign
    this.neonSignText = this.add
      .text(145, 58, '24h Café', {
        fontFamily: '"Fraunces", Georgia, serif',
        fontSize: '24px',
        fontStyle: '700',
        color: '#f59e0b',
        stroke: '#78350f',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // 4. Biển chỉ dẫn Cầu Thang Tầng 1: Lên Sân Thượng
    const stairGroundZone = this.add
      .zone(802, 125, 90, 40)
      .setInteractive({ useHandCursor: true });
    stairGroundZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isAimingThrow || pointer.rightButtonDown()) return;
      pointer.event.stopPropagation();
      this.walkTarget = { x: 802, y: -60 };
    });

    this.add
      .text(802, 125, '🪜 LÊN SÂN THƯỢNG ⬆', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '11px',
        fontStyle: '700',
        color: '#fef08a',
        backgroundColor: 'rgba(28, 20, 15, 0.92)',
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setOrigin(0.5);

    // 5. Biển chỉ dẫn Cầu Thang Sân Thượng: Xuống Tầng 1
    const stairRoofZone = this.add
      .zone(802, -40, 90, 40)
      .setInteractive({ useHandCursor: true });
    stairRoofZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isAimingThrow || pointer.rightButtonDown()) return;
      pointer.event.stopPropagation();
      this.walkTarget = { x: 802, y: 140 };
    });

    this.add
      .text(802, -40, '🪜 XUỐNG TẦNG 1 ⬇', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '11px',
        fontStyle: '700',
        color: '#fef08a',
        backgroundColor: 'rgba(28, 20, 15, 0.92)',
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setOrigin(0.5);

    // 6. Kính Viễn Vọng Ngắm Sao 🔭 trên Sân Thượng (x: 630, y: -520)
    const teleG = this.add.graphics();
    teleG.lineStyle(3, 0x475569, 1);
    teleG.lineBetween(630, -520, 618, -498);
    teleG.lineBetween(630, -520, 642, -498);
    teleG.lineBetween(630, -520, 630, -496);
    teleG.lineStyle(6, 0xd4a373, 1);
    teleG.lineBetween(622, -514, 642, -536);
    teleG.fillStyle(0x38bdf8, 1);
    teleG.fillCircle(644, -538, 3);

    const teleZone = this.add
      .zone(630, -520, 60, 50)
      .setInteractive({ useHandCursor: true });
    teleZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isAimingThrow || pointer.rightButtonDown()) return;
      pointer.event.stopPropagation();
      const selfAv = this.avatars.get(this.selfUserId);
      if (selfAv) {
        selfAv.playFloatingEmote('🔭✨');
        selfAv.showChatBubble('🔭 Đang ngắm ngàn vì sao & bầu trời đêm...', 3500);
      }
      gameEventBus.emit('client:emote', { emote: '🔭✨' });
    });

    this.add
      .text(630, -548, '🔭 Kính Viễn Vọng Ngắm Sao', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '10px',
        fontStyle: '700',
        color: '#bae6fd',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        padding: { left: 6, right: 6, top: 3, bottom: 3 },
      })
      .setOrigin(0.5);

    // 7. Mini Bar trên Sân Thượng (x: 325, y: -340)
    const roofBarZone = this.add
      .zone(325, -340, 120, 60)
      .setInteractive({ useHandCursor: true });
    roofBarZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isAimingThrow || pointer.rightButtonDown()) return;
      pointer.event.stopPropagation();
      gameEventBus.emit('client:openDrinkMenu', {});
    });

    this.add
      .text(325, -395, '☕ TRÀ & CÀ PHÊ SÂN THƯỢNG', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '10px',
        fontStyle: '700',
        color: '#fef08a',
        backgroundColor: 'rgba(28, 20, 15, 0.88)',
        padding: { left: 6, right: 6, top: 3, bottom: 3 },
      })
      .setOrigin(0.5);
  }

  private createSeats() {
    for (const seat of CAFE_SEAT_MAP) {
      const cushion = this.add
        .circle(seat.x, seat.y, 15, 0xa9714b, 0.88)
        .setStrokeStyle(2, 0xfaedcd, 0.65)
        .setInteractive({ useHandCursor: true })
        .setDepth(3000 + seat.y - 15);

      cushion.on('pointerover', () => {
        cushion.setScale(1.15);
        cushion.setStrokeStyle(2.5, 0xfde68a, 1);
      });
      cushion.on('pointerout', () => {
        cushion.setScale(1);
        this.refreshSeatStyles();
      });
      cushion.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (this.isAimingThrow || pointer.rightButtonDown()) {
          pointer.event.stopPropagation();
          this.handleAimThrow(pointer.worldX, pointer.worldY);
          return;
        }
        pointer.event.stopPropagation();
        this.handleSeatClick(seat);
      });

      this.seatGraphics.set(seat.id, cushion);
    }
  }

  private refreshSeatStyles() {
    for (const [seatId, circle] of this.seatGraphics.entries()) {
      const occupant = this.occupiedSeats[seatId];
      if (occupant) {
        circle.setFillStyle(0x64748b, 0.55);
        circle.setStrokeStyle(1.5, 0x94a3b8, 0.45);
      } else {
        circle.setFillStyle(0xb07d56, 0.9);
        circle.setStrokeStyle(2, 0xfaedcd, 0.65);
      }
    }
  }

  private handleSeatClick(seat: SeatConfig) {
    const occupant = this.occupiedSeats[seat.id];
    if (occupant && occupant !== this.selfUserId) {
      return;
    }
    const selfAv = this.avatars.get(this.selfUserId);
    if (!selfAv) {
      gameEventBus.emit('client:sit', { seatId: seat.id });
      return;
    }

    const dist = Math.hypot(seat.x - selfAv.targetX, seat.y - selfAv.targetY);
    if (dist <= 16) {
      gameEventBus.emit('client:sit', { seatId: seat.id });
    } else {
      this.pendingSitSeat = seat;
      this.walkTarget = { x: seat.x, y: seat.y };
    }
  }

  private createLightingAndWeather() {
    // Window Sky (Tầng 1)
    this.windowSkyGraphic = this.add.graphics().setDepth(-4990);

    // Rooftop Sky & Skyline (Tầng 2: y: -780..-520)
    this.rooftopSkyGraphic = this.add.graphics().setDepth(-4990);
    this.rooftopCityGraphic = this.add.graphics().setDepth(-4980);
    this.fairyLightsGraphic = this.add.graphics().setDepth(8050);

    // Rain overlay graphics
    this.rainGraphic = this.add.graphics().setDepth(8200);
    for (let i = 0; i < 110; i++) {
      this.rainDrops.push({
        x: Math.random() * 1200,
        y: -780 + Math.random() * 1560,
        len: 11 + Math.random() * 11,
        speed: 270 + Math.random() * 180,
      });
    }

    // Stars on Rooftop sky (-4985 depth)
    this.starsGraphic = this.add.graphics().setDepth(-4985);
    this.twinkleStars = [];
    for (let i = 0; i < 75; i++) {
      this.twinkleStars.push({
        x: 60 + Math.random() * 1080,
        y: -755 + Math.random() * 230,
        r: 0.8 + Math.random() * 1.8,
        alpha: 0.3 + Math.random() * 0.7,
        speed: 1.2 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Atmospheric Lo-fi Floating Dust Motes (depth 8080)
    this.dustGraphic = this.add.graphics().setDepth(8080);
    this.dustParticles = [];
    for (let i = 0; i < 45; i++) {
      const bx = 80 + Math.random() * 1040;
      const by = -500 + Math.random() * 1200;
      this.dustParticles.push({
        x: bx,
        y: by,
        baseX: bx,
        baseY: by,
        r: 1 + Math.random() * 1.5,
        speed: 10 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.45,
      });
    }

    // Warm Lamp Glow Halos over tables
    this.lampGlowGroup = this.add.group();
    const glowSpots = [
      // Tầng 1
      { x: 200, y: 215, r: 72 },
      { x: 200, y: 375, r: 72 },
      { x: 200, y: 535, r: 72 },
      { x: 570, y: 175, r: 120 },
      { x: 485, y: 390, r: 82 },
      { x: 695, y: 390, r: 82 },
      { x: 485, y: 535, r: 82 },
      { x: 955, y: 210, r: 75 },
      { x: 955, y: 345, r: 75 },
      { x: 950, y: 530, r: 70 },
      { x: 950, y: 655, r: 70 },
      // Sân Thượng
      { x: 325, y: -340, r: 80 },
      { x: 550, y: -437, r: 75 },
      { x: 630, y: -437, r: 75 },
      { x: 930, y: -340, r: 80 },
      { x: 530, y: -230, r: 75 },
      { x: 930, y: -160, r: 75 },
    ];
    for (const spot of glowSpots) {
      const halo = this.add
        .circle(spot.x, spot.y, spot.r, 0xfbbf24, 0.15)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(8000);
      this.lampGlowGroup.add(halo);
    }

    // Full-world ambient tint overlay
    this.ambientOverlay = this.add
      .rectangle(600, 0, 1200, 1560, 0x0f172a, 0.35)
      .setDepth(8100);

    this.applyWorldCycle('midnight');
  }

  private applyWorldCycle(cycle: WorldCycle) {
    this.currentCycle = cycle;
    const cfg = WORLD_CYCLES[cycle] || WORLD_CYCLES.midnight;

    // 1. Redraw Tầng 1 window panes
    this.windowSkyGraphic.clear();
    this.windowSkyGraphic.fillStyle(cfg.windowSkyColor, 0.85);
    this.windowSkyGraphic.fillRoundedRect(54, 150, 18, 130, 4);
    this.windowSkyGraphic.fillRoundedRect(54, 310, 18, 130, 4);
    this.windowSkyGraphic.fillRoundedRect(54, 470, 18, 130, 4);

    // 2. Redraw Sân Thượng Sky & Cityline
    this.drawRooftopSky(cycle);

    // 3. Ambient overlay
    this.ambientOverlay.setFillStyle(cfg.ambientTint, cfg.ambientAlpha);

    for (const child of this.lampGlowGroup.getChildren()) {
      const circle = child as Phaser.GameObjects.Arc;
      circle.setAlpha(cfg.lampGlowAlpha * 0.25);
    }

    if (this.neonSignText) {
      this.neonSignText.setColor(cfg.hasNeon ? '#38bdf8' : '#f59e0b');
    }
  }

  private drawRooftopSky(cycle: WorldCycle) {
    const gSky = this.rooftopSkyGraphic;
    gSky.clear();

    // Sky Gradient
    if (cycle === 'midnight') {
      gSky.fillGradientStyle(0x060913, 0x060913, 0x172554, 0x1e1b4b, 1);
    } else if (cycle === 'morning') {
      gSky.fillGradientStyle(0x38bdf8, 0x60a5fa, 0x93c5fd, 0xbae6fd, 1);
    } else if (cycle === 'rainy') {
      gSky.fillGradientStyle(0x1e293b, 0x334155, 0x475569, 0x64748b, 1);
    } else {
      // Sunset
      gSky.fillGradientStyle(0x431407, 0x7c2d12, 0xd97706, 0xfde68a, 1);
    }
    gSky.fillRect(52, -764, 1096, 250);

    // Crescent Moon / Sun
    if (cycle === 'midnight') {
      gSky.fillStyle(0xfef08a, 0.95);
      gSky.fillCircle(1020, -680, 24);
      gSky.fillStyle(0x0a1020, 1);
      gSky.fillCircle(1030, -686, 21);
      gSky.fillStyle(0xfde68a, 0.12);
      gSky.fillCircle(1020, -680, 48);
    } else if (cycle === 'sunset' || cycle === 'morning') {
      gSky.fillStyle(0xfef08a, 0.9);
      gSky.fillCircle(320, -620, 28);
      gSky.fillStyle(0xf97316, 0.25);
      gSky.fillCircle(320, -620, 60);
    }

    // City Skyline Silhouettes
    const gCity = this.rooftopCityGraphic;
    gCity.clear();

    const buildings = [
      { x: 60, w: 45, h: 90 },
      { x: 110, w: 65, h: 140 },
      { x: 180, w: 55, h: 110 },
      { x: 240, w: 75, h: 165 },
      { x: 320, w: 50, h: 125 },
      { x: 375, w: 70, h: 150 },
      { x: 450, w: 60, h: 100 },
      { x: 515, w: 80, h: 175 },
      { x: 600, w: 55, h: 130 },
      { x: 660, w: 70, h: 115 },
      { x: 735, w: 85, h: 160 },
      { x: 825, w: 60, h: 135 },
      { x: 890, w: 75, h: 120 },
      { x: 970, w: 55, h: 145 },
      { x: 1030, w: 80, h: 110 },
    ];

    for (const b of buildings) {
      const bY = -514 - b.h;
      gCity.fillStyle(cycle === 'midnight' ? 0x0f172a : 0x1e293b, 0.95);
      gCity.fillRect(b.x, bY, b.w, b.h);

      if (b.h > 140) {
        gCity.lineStyle(2, 0x475569, 1);
        gCity.lineBetween(b.x + b.w / 2, bY, b.x + b.w / 2, bY - 18);
        gCity.fillStyle(0xef4444, 0.9);
        gCity.fillCircle(b.x + b.w / 2, bY - 18, 2.5);
      }

      if (cycle === 'midnight' || cycle === 'sunset') {
        const windowColor = cycle === 'midnight' ? 0xfef08a : 0xfde68a;
        for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 12) {
          for (let wy = bY + 12; wy < -524; wy += 15) {
            if ((wx * 7 + wy * 13) % 5 === 0) continue;
            gCity.fillStyle(windowColor, 0.7);
            gCity.fillRect(wx, wy, 5, 7);
          }
        }
      }
    }

    // Fairy Lights hanging across the Rooftop
    const gFairy = this.fairyLightsGraphic;
    gFairy.clear();
    const posts = [70, 240, 420, 600, 780, 960, 1130];
    gFairy.lineStyle(1.5, 0x334155, 0.85);

    for (let i = 0; i < posts.length - 1; i++) {
      const p1 = posts[i];
      const p2 = posts[i + 1];
      const midX = (p1 + p2) / 2;
      const sagY = -542;

      gFairy.beginPath();
      gFairy.moveTo(p1, -565);
      (gFairy as any).quadraticBezierTo?.(midX, sagY, p2, -565);
      gFairy.strokePath();

      for (let step = 0; step <= 5; step++) {
        const t = step / 5;
        const bx = Phaser.Math.Linear(p1, p2, t);
        const by = Phaser.Math.Linear(-565, -565, t) + Math.sin(t * Math.PI) * (sagY - -565);
        gFairy.fillStyle(0xfde68a, 0.95);
        gFairy.fillCircle(bx, by, 3.5);
        gFairy.fillStyle(0xfbbf24, 0.35);
        gFairy.fillCircle(bx, by, 7.5);
      }
    }
  }

  private setupControls() {
    if (this.input.mouse) {
      this.input.mouse.disableContextMenu();
    }

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.disableGlobalCapture();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
      };

      this.input.keyboard.on('keydown-F', () => {
        if (this.isTypingInDomInput()) return;
        gameEventBus.emit('client:toggleAim', {});
      });

      this.input.keyboard.on('keydown-ESC', () => {
        if (this.isAimingThrow) {
          this.isAimingThrow = false;
          this.aimGuideGraphics.clear();
          this.aimReticleText.setVisible(false);
          gameEventBus.emit('client:aimModeChanged', { isAiming: false });
        }
      });
    }

    // Click on floor to walk or throw cup
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() || this.isAimingThrow) {
        this.handleAimThrow(pointer.worldX, pointer.worldY);
        return;
      }

      this.pendingSitSeat = null;
      const targetX = Phaser.Math.Clamp(pointer.worldX, 75, 1125);
      let targetY = pointer.worldY;

      // Allow clicking on staircase or respective floor
      if (targetX >= 760 && targetX <= 845) {
        targetY = Phaser.Math.Clamp(targetY, -500, 720);
      } else if (targetY < 0) {
        targetY = Phaser.Math.Clamp(targetY, -500, -35);
      } else {
        targetY = Phaser.Math.Clamp(targetY, 128, 720);
      }

      this.walkTarget = { x: targetX, y: targetY };
    });
  }

  public isAiming(): boolean {
    return this.isAimingThrow;
  }

  public handleAimThrow(targetX: number, targetY: number) {
    const clampedX = Phaser.Math.Clamp(targetX, 60, 1140);
    const clampedY = Phaser.Math.Clamp(targetY, -510, 730);
    this.isAimingThrow = false;
    this.aimGuideGraphics.clear();
    this.aimReticleText.setVisible(false);
    gameEventBus.emit('client:aimModeChanged', { isAiming: false });
    gameEventBus.emit('client:throwDirection', { targetX: clampedX, targetY: clampedY });
  }

  private bindNetworkEvents() {
    this.unsubscribers.push(
      gameEventBus.on('scene:syncRoom', (payload) => {
        this.selfUserId = payload.selfUserId;
        this.occupiedSeats = { ...payload.occupiedSeats };
        this.applyWorldCycle(payload.worldCycle);

        const incomingIds = new Set(payload.players.map((p) => p.userId));
        for (const [uid, avatar] of this.avatars.entries()) {
          if (!incomingIds.has(uid)) {
            avatar.destroy();
            this.avatars.delete(uid);
          }
        }

        for (const p of payload.players) {
          this.upsertAvatar(p);
        }
        this.refreshSeatStyles();
      }),

      gameEventBus.on('scene:playerJoined', ({ player }) => {
        this.upsertAvatar(player);
      }),

      gameEventBus.on('scene:playerLeft', ({ userId, freedSeatId }) => {
        if (freedSeatId) {
          delete this.occupiedSeats[freedSeatId];
          this.refreshSeatStyles();
        }
        const av = this.avatars.get(userId);
        if (av) {
          av.destroy();
          this.avatars.delete(userId);
        }
      }),

      gameEventBus.on('scene:playerMoved', (payload) => {
        if (payload.freedSeatId) {
          delete this.occupiedSeats[payload.freedSeatId];
          this.refreshSeatStyles();
        }
        const av = this.avatars.get(payload.userId);
        if (!av) return;
        av.state.seatId = null;
        av.state.direction = payload.direction;
        if (payload.floor) {
          av.state.floor = payload.floor;
        }
        if (payload.userId !== this.selfUserId) {
          av.targetX = payload.x;
          av.targetY = payload.y;
        }
        av.redrawCharacter();
      }),

      gameEventBus.on('scene:playerSat', (payload) => {
        if (payload.freedSeatId) {
          delete this.occupiedSeats[payload.freedSeatId];
        }
        this.occupiedSeats[payload.seatId] = payload.userId;
        this.refreshSeatStyles();
        const av = this.avatars.get(payload.userId);
        if (!av) return;
        if (payload.userId === this.selfUserId) {
          this.walkTarget = null;
          this.pendingSitSeat = null;
          gameEventBus.emit('client:openDrinkMenu', {});
        }

        const dist = Math.hypot(payload.x - av.container.x, payload.y - av.container.y);
        if (dist > 12) {
          this.tweens.add({
            targets: av,
            targetX: payload.x,
            targetY: payload.y,
            duration: Math.min(320, Math.max(160, dist * 1.8)),
            ease: 'Sine.easeOut',
            onComplete: () => {
              av.state.seatId = payload.seatId;
              av.state.direction = payload.direction;
              av.targetX = payload.x;
              av.targetY = payload.y;
              av.container.x = payload.x;
              av.container.y = payload.y;
              av.redrawCharacter();
            },
          });
        } else {
          av.state.seatId = payload.seatId;
          av.state.direction = payload.direction;
          av.targetX = payload.x;
          av.targetY = payload.y;
          av.container.x = payload.x;
          av.container.y = payload.y;
          av.redrawCharacter();
        }
      }),

      gameEventBus.on('scene:baristaOrder', (order) => {
        this.baristaOrderQueue.push(order);
        if (!this.isBaristaBusy) {
          this.processNextBaristaOrder();
        }
      }),

      gameEventBus.on('scene:playerStudyChanged', ({ userId, isStudying }) => {
        const av = this.avatars.get(userId);
        if (av) {
          av.state.isStudying = isStudying;
          av.redrawCharacter();
          if (isStudying) {
            av.playFloatingEmote('📚');
          }
        }
      }),

      gameEventBus.on('scene:playerTyping', ({ userId, isTyping }) => {
        this.avatars.get(userId)?.setTyping(isTyping);
      }),

      gameEventBus.on('scene:playerEmoted', ({ userId, emote }) => {
        this.avatars.get(userId)?.playFloatingEmote(emote);
      }),

      gameEventBus.on('scene:playerDrank', ({ userId, drinkId, drinkIcon, drinkName }) => {
        const av = this.avatars.get(userId);
        if (!av) return;
        av.state.drinkId = drinkId;
        av.state.drinkIcon = drinkIcon;
        av.state.drinkName = drinkName;
        av.redrawCharacter();
        av.playFloatingEmote(drinkIcon || '☕');
      }),

      gameEventBus.on('scene:playerUpdated', (payload) => {
        const av = this.avatars.get(payload.userId);
        if (!av) return;
        av.state.mood = payload.mood;
        av.state.nickname = payload.nickname;
        av.state.avatarId = payload.avatarId;
        av.state.outfitId = payload.outfitId;
        av.redrawCharacter();
      }),

      gameEventBus.on('scene:chatBubble', ({ userId, content }) => {
        this.avatars.get(userId)?.showChatBubble(content);
      }),

      gameEventBus.on('scene:worldCycle', ({ cycle }) => {
        this.applyWorldCycle(cycle);
      }),

      gameEventBus.on('scene:cheers', ({ fromUserId, targetUserId, drinkIcon }) => {
        const av = this.avatars.get(fromUserId);
        if (av) av.playFloatingEmote(`🥂${drinkIcon}`);
        if (targetUserId) this.avatars.get(targetUserId)?.playFloatingEmote(`🥂${drinkIcon}`);
      }),

      gameEventBus.on('scene:cupThrown', ({ fromUserId, toUserId, drinkIcon, dodged }) => {
        this.animateCupThrow(fromUserId, toUserId, drinkIcon || '☕', Boolean(dodged));
      }),

      gameEventBus.on('scene:aimMode', ({ isAiming }) => {
        this.isAimingThrow = isAiming;
        if (!isAiming) {
          this.aimGuideGraphics.clear();
          this.aimReticleText.setVisible(false);
        }
      }),

      gameEventBus.on('scene:cupThrownDirection', (payload) => {
        this.animateDirectionalCupThrow(payload);
      }),

      gameEventBus.on('scene:joystickInput', ({ vx, vy }) => {
        this.joystickVec = { vx, vy };
      }),

      gameEventBus.on('scene:requestSnapshot', ({ quote, moodLabel, nickname }) => {
        this.game.renderer.snapshot(
          async (imageElement: HTMLImageElement | Phaser.Display.Color) => {
            if (imageElement instanceof HTMLImageElement) {
              const polaroidUrl = await composePolaroidCard({
                rawCanvasDataUrl: imageElement.src,
                quote,
                moodLabel,
                nickname,
              });
              gameEventBus.emit('client:snapshotReady', { dataUrl: polaroidUrl });
            }
          },
        );
      }),
    );
  }

  private upsertAvatar(state: PlayerNetState) {
    const existing = this.avatars.get(state.userId);
    if (existing) {
      existing.state = { ...state };
      existing.targetX = state.x;
      existing.targetY = state.y;
      existing.redrawCharacter();
      return;
    }

    const created = new PlayerAvatar(this, state, state.userId === this.selfUserId);
    this.avatars.set(state.userId, created);

    // Follow self avatar with camera
    if (state.userId === this.selfUserId) {
      this.cameras.main.startFollow(created.container, true, 0.08, 0.08);
    }
  }

  private animateCupThrow(
    fromUserId: string,
    toUserId: string,
    drinkIcon: string,
    dodged = false,
  ) {
    const fromAv = this.avatars.get(fromUserId);
    const toAv = this.avatars.get(toUserId);
    if (!fromAv || !toAv) return;

    const startX = fromAv.container.x;
    const startY = fromAv.container.y - 18;
    const dx = toAv.container.x - startX;
    const dy = toAv.container.y - startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      fromAv.state.direction = dx < 0 ? 'left' : 'right';
    } else {
      fromAv.state.direction = dy < 0 ? 'up' : 'down';
    }
    fromAv.redrawCharacter();

    const cupProjectile = this.add
      .text(startX, startY, drinkIcon, {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '24px',
      })
      .setOrigin(0.5)
      .setDepth(9200);

    let dodgeTriggered = false;
    const progress = { t: 0 };
    this.tweens.add({
      targets: progress,
      t: 1,
      duration: 520,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const t = progress.t;
        const endX = toAv.container.x + (dodged ? 26 : 0);
        const endY = toAv.container.y - 18 + (dodged ? 14 : 0);
        const curX = Phaser.Math.Linear(startX, endX, t);
        const arcOffset = Math.sin(t * Math.PI) * -68;
        const curY = Phaser.Math.Linear(startY, endY, t) + arcOffset;
        cupProjectile.setPosition(curX, curY);
        cupProjectile.setRotation(t * Math.PI * 4);

        if (dodged && !dodgeTriggered && t >= 0.72) {
          dodgeTriggered = true;
          toAv.playDodgeReaction('Né đẹp! Hụt rồi nhé 😜');
        }
      },
      onComplete: () => {
        if (dodged) {
          this.tweens.add({
            targets: cupProjectile,
            alpha: 0,
            scaleX: 0.6,
            scaleY: 0.6,
            duration: 220,
            onComplete: () => cupProjectile.destroy(),
          });
        } else {
          cupProjectile.destroy();
          toAv.playHitReaction('Đau quá!');
        }
      },
    });
  }

  private isTypingInDomInput(): boolean {
    if (typeof document === 'undefined') return false;
    const tag = document.activeElement?.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  private isBlockedByObstacle(nx: number, ny: number): boolean {
    // Staircase corridor is completely walkable (x: 760..845, y: -45..135)
    if (nx >= 760 && nx <= 845 && ny >= -45 && ny <= 135) {
      return false;
    }

    for (const obs of this.obstacles) {
      if (
        nx >= obs.x - 14 &&
        nx <= obs.x + obs.w + 14 &&
        ny >= obs.y - 10 &&
        ny <= obs.y + obs.h + 10
      ) {
        return true;
      }
    }
    return false;
  }

  private detectZone(x: number, y: number): string {
    // Staircase linking both floors
    if (x >= 760 && x <= 845 && y >= -40 && y <= 130) return 'Cầu Thang';

    // Sân Thượng
    if (y < 0) {
      if (y < -400) return 'Sân Thượng • Skyline';
      if (x > 800) return 'Sân Thượng • Moonlight Lounge';
      return 'Sân Thượng • Starry Bistro';
    }

    // Tầng 1
    if (x < 310) return 'Window Seats';
    if (y < 245 && x >= 380 && x <= 760) return 'Coffee Bar';
    if (x > 825 && y < 430) return 'Quiet Corner';
    if (x > 825 && y >= 430) return 'Garden';
    if (y > 635) return 'Entrance';
    return 'Main Hall';
  }

  override update(_time: number, delta: number) {
    this.updateSelfMovement(delta);
    this.updateAimGuide();
    for (const avatar of this.avatars.values()) {
      avatar.update(delta);
    }
    this.updateRainAnimation(delta);
    this.updateCosmicSky(_time, delta);
    this.updateDustParticles(_time, delta);
  }

  private updateCosmicSky(time: number, delta: number) {
    this.starsGraphic.clear();
    const isNight = this.currentCycle === 'midnight' || this.currentCycle === 'sunset';
    if (!isNight) return;

    // 1. Draw twinkling stars
    for (const star of this.twinkleStars) {
      const alphaVal =
        star.alpha * (0.35 + 0.65 * (Math.sin(time * 0.002 * star.speed + star.phase) ** 2));
      this.starsGraphic.fillStyle(0xfef08a, alphaVal);
      this.starsGraphic.fillCircle(star.x, star.y, star.r);
    }

    // 2. Spawn and update Shooting Stars
    this.shootingStarTimer += delta;
    if (this.currentCycle === 'midnight' && this.shootingStarTimer >= 7500) {
      this.shootingStarTimer = 0;
      if (Math.random() < 0.8 && this.activeShootingStars.length < 2) {
        this.activeShootingStars.push({
          x: 100 + Math.random() * 800,
          y: -750 + Math.random() * 80,
          len: 40 + Math.random() * 35,
          speedX: 350 + Math.random() * 200,
          speedY: 180 + Math.random() * 120,
          alpha: 1,
          life: 0,
          maxLife: 650 + Math.random() * 300,
        });
      }
    }

    // Render active shooting stars
    for (let i = this.activeShootingStars.length - 1; i >= 0; i--) {
      const ss = this.activeShootingStars[i];
      ss.life += delta;
      const progress = ss.life / ss.maxLife;
      if (progress >= 1) {
        this.activeShootingStars.splice(i, 1);
        continue;
      }
      ss.x += ss.speedX * (delta / 1000);
      ss.y += ss.speedY * (delta / 1000);
      const curAlpha = (1 - progress) * 0.95;

      this.starsGraphic.lineStyle(2, 0xe0f2fe, curAlpha);
      this.starsGraphic.lineBetween(
        ss.x,
        ss.y,
        ss.x - (ss.len * ss.speedX) / 400,
        ss.y - (ss.len * ss.speedY) / 400,
      );
      this.starsGraphic.fillStyle(0xffffff, curAlpha);
      this.starsGraphic.fillCircle(ss.x, ss.y, 2);
    }
  }

  private updateDustParticles(time: number, delta: number) {
    this.dustGraphic.clear();
    const cfg = WORLD_CYCLES[this.currentCycle] || WORLD_CYCLES.midnight;
    const globalAlphaMul = this.currentCycle === 'morning' ? 0.35 : 0.65;

    for (const p of this.dustParticles) {
      p.y -= p.speed * (delta / 1000);
      p.x = p.baseX + Math.sin(time * 0.0012 + p.phase) * 14;

      if (p.y < -520) {
        p.y = 730;
        p.baseY = 730;
      }

      const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 + p.phase);
      const a = p.alpha * pulse * globalAlphaMul;
      this.dustGraphic.fillStyle(0xfde68a, a);
      this.dustGraphic.fillCircle(p.x, p.y, p.r);
    }
  }

  private updateAimGuide() {
    if (!this.isAimingThrow) return;
    const selfAv = this.avatars.get(this.selfUserId);
    const ptr = this.input.activePointer;
    if (!selfAv || !ptr) return;

    const sx = selfAv.container.x;
    const sy = selfAv.container.y - 18;
    const tx = Phaser.Math.Clamp(ptr.worldX, 60, 1140);
    const ty = Phaser.Math.Clamp(ptr.worldY, -510, 730);

    const dx = tx - sx;
    const dy = ty - sy;
    if (Math.abs(dx) > Math.abs(dy)) {
      selfAv.state.direction = dx < 0 ? 'left' : 'right';
    } else {
      selfAv.state.direction = dy < 0 ? 'up' : 'down';
    }
    selfAv.redrawCharacter();

    this.aimGuideGraphics.clear();
    this.aimGuideGraphics.lineStyle(2, 0xf59e0b, 0.85);

    const steps = 16;
    for (let i = 0; i < steps; i += 2) {
      const x1 = Phaser.Math.Linear(sx, tx, i / steps);
      const y1 = Phaser.Math.Linear(sy, ty, i / steps);
      const x2 = Phaser.Math.Linear(sx, tx, (i + 1) / steps);
      const y2 = Phaser.Math.Linear(sy, ty, (i + 1) / steps);
      this.aimGuideGraphics.lineBetween(x1, y1, x2, y2);
    }

    this.aimGuideGraphics.lineStyle(2, 0xfef08a, 0.9);
    this.aimGuideGraphics.strokeCircle(tx, ty, 18);
    this.aimReticleText.setPosition(tx, ty).setVisible(true);
  }

  private animateDirectionalCupThrow(payload: {
    fromUserId: string;
    fromNickname: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    hitUserId: string | null;
    hitNickname: string | null;
    dodged: boolean;
    drinkIcon: string;
    drinkName: string;
  }) {
    const fromAv = this.avatars.get(payload.fromUserId);
    const startX = fromAv ? fromAv.container.x : payload.startX;
    const startY = fromAv ? fromAv.container.y - 18 : payload.startY;

    const endX = payload.targetX;
    const endY = payload.targetY;
    const dx = endX - startX;
    const dy = endY - startY;

    if (fromAv) {
      if (Math.abs(dx) > Math.abs(dy)) {
        fromAv.state.direction = dx < 0 ? 'left' : 'right';
      } else {
        fromAv.state.direction = dy < 0 ? 'up' : 'down';
      }
      fromAv.redrawCharacter();
      fromAv.playFloatingEmote('🎯');
    }

    const cupProjectile = this.add
      .text(startX, startY, payload.drinkIcon || '☕', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '24px',
      })
      .setOrigin(0.5)
      .setDepth(9200);

    const hitAv = payload.hitUserId ? this.avatars.get(payload.hitUserId) : null;
    let dodgeTriggered = false;
    const progress = { t: 0 };
    const flightDist = Math.hypot(dx, dy);
    const duration = Phaser.Math.Clamp(flightDist * 1.2, 380, 680);

    this.tweens.add({
      targets: progress,
      t: 1,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const t = progress.t;
        const curX = Phaser.Math.Linear(startX, endX, t);
        const arcHeight = Math.min(100, Math.max(35, flightDist * 0.22));
        const arcOffset = Math.sin(t * Math.PI) * -arcHeight;
        const curY = Phaser.Math.Linear(startY, endY, t) + arcOffset;

        cupProjectile.setPosition(curX, curY);
        cupProjectile.setRotation(t * Math.PI * 6);

        if (payload.dodged && hitAv && !dodgeTriggered && t >= 0.7) {
          dodgeTriggered = true;
          hitAv.playDodgeReaction('Né đẹp! Hụt rồi nhé 😜');
        }
      },
      onComplete: () => {
        cupProjectile.destroy();

        if (payload.hitUserId && hitAv) {
          if (payload.dodged) {
            this.createShatterSplash(endX + (dx >= 0 ? 25 : -25), endY);
          } else {
            hitAv.playHitReaction('Đau quá!');
          }
        } else {
          this.createShatterSplash(endX, endY);
        }
      },
    });
  }

  private createShatterSplash(x: number, y: number) {
    const splashText = this.add
      .text(x, y - 8, '💥💦', { fontSize: '18px' })
      .setOrigin(0.5)
      .setDepth(9150);

    const floorPuddle = this.add
      .ellipse(x, y + 4, 28, 12, 0x4a301c, 0.75)
      .setDepth(y - 5);

    this.tweens.add({
      targets: splashText,
      y: splashText.y - 18,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 700,
      onComplete: () => splashText.destroy(),
    });

    this.tweens.add({
      targets: floorPuddle,
      alpha: 0,
      delay: 2200,
      duration: 1200,
      onComplete: () => floorPuddle.destroy(),
    });
  }

  private updateSelfMovement(delta: number) {
    const selfAvatar = this.avatars.get(this.selfUserId);
    if (!selfAvatar) return;

    // Ensure camera is smoothly following player
    if (!this.cameras.main._follow) {
      this.cameras.main.startFollow(selfAvatar.container, true, 0.08, 0.08);
    }

    let vx = this.joystickVec.vx;
    let vy = this.joystickVec.vy;

    if (!this.isTypingInDomInput() && this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -1;
      else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = 1;

      if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -1;
      else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = 1;
    }

    if (vx !== 0 || vy !== 0) {
      this.walkTarget = null;
      this.pendingSitSeat = null;
    } else if (this.walkTarget) {
      const dx = this.walkTarget.x - selfAvatar.targetX;
      const dy = this.walkTarget.y - selfAvatar.targetY;
      const dist = Math.hypot(dx, dy);

      if (this.pendingSitSeat && dist < 14) {
        const seat = this.pendingSitSeat;
        this.walkTarget = null;
        this.pendingSitSeat = null;
        gameEventBus.emit('client:sit', { seatId: seat.id });
      } else if (dist < 6) {
        this.walkTarget = null;
      } else {
        vx = dx / dist;
        vy = dy / dist;
      }
    }

    if (vx === 0 && vy === 0) return;

    const len = Math.hypot(vx, vy) || 1;
    const speedPxPerSec = 175;
    const stepX = (vx / len) * speedPxPerSec * (delta / 1000);
    const stepY = (vy / len) * speedPxPerSec * (delta / 1000);

    const candidateX = Phaser.Math.Clamp(selfAvatar.targetX + stepX, 75, 1125);
    const isAtStairsCorridor = candidateX >= 760 && candidateX <= 845;

    let candidateY = selfAvatar.targetY + stepY;
    if (isAtStairsCorridor) {
      // Free vertical passage between Rooftop (y: -500) and Ground Floor (y: 720)
      candidateY = Phaser.Math.Clamp(candidateY, -500, 720);
    } else if (selfAvatar.targetY < 0) {
      // In Rooftop deck
      candidateY = Phaser.Math.Clamp(candidateY, -500, -30);
    } else {
      // In Ground floor
      candidateY = Phaser.Math.Clamp(candidateY, 128, 720);
    }

    if (!this.isBlockedByObstacle(candidateX, candidateY)) {
      selfAvatar.targetX = candidateX;
      selfAvatar.targetY = candidateY;
    } else if (!this.isBlockedByObstacle(candidateX, selfAvatar.targetY)) {
      selfAvatar.targetX = candidateX;
    } else if (!this.isBlockedByObstacle(selfAvatar.targetX, candidateY)) {
      selfAvatar.targetY = candidateY;
    }

    let direction: 'up' | 'down' | 'left' | 'right' = selfAvatar.state.direction;
    if (Math.abs(vx) > Math.abs(vy)) {
      direction = vx < 0 ? 'left' : 'right';
    } else {
      direction = vy < 0 ? 'up' : 'down';
    }

    if (selfAvatar.state.seatId) {
      delete this.occupiedSeats[selfAvatar.state.seatId];
      selfAvatar.state.seatId = null;
      this.refreshSeatStyles();
    }
    selfAvatar.state.direction = direction;
    selfAvatar.redrawCharacter();

    // Check Floor Change based on continuous position
    const newFloor: 'ground' | 'rooftop' = selfAvatar.targetY < 0 ? 'rooftop' : 'ground';
    if (newFloor !== this.currentFloor) {
      this.currentFloor = newFloor;
      gameEventBus.emit('client:floorChanged', { floor: newFloor });
    }

    const zone = this.detectZone(selfAvatar.targetX, selfAvatar.targetY);
    if (zone !== this.lastZone) {
      this.lastZone = zone;
      gameEventBus.emit('client:zoneChanged', { zone });
    }

    // Throttle network updates to ~14Hz (every 70ms)
    const now = performance.now();
    if (now - this.lastMoveEmitAt >= 70) {
      this.lastMoveEmitAt = now;
      gameEventBus.emit('client:move', {
        x: Math.round(selfAvatar.targetX),
        y: Math.round(selfAvatar.targetY),
        direction,
        floor: newFloor,
      });
    }
  }

  private updateRainAnimation(delta: number) {
    this.rainGraphic.clear();
    const cfg = WORLD_CYCLES[this.currentCycle] || WORLD_CYCLES.midnight;
    if (!cfg.hasRain) return;

    this.rainGraphic.lineStyle(1.5, 0x93c5fd, 0.42);
    for (const drop of this.rainDrops) {
      drop.y += drop.speed * (delta / 1000);
      drop.x -= 35 * (delta / 1000);
      if (drop.y > 740) {
        drop.y = -770;
        drop.x = Math.random() * 1200;
      }

      // Rain is visible:
      // 1. Outside on the open-air Rooftop (y < 0)
      // 2. Through the left window sill in Ground floor
      // 3. In the outdoor Garden patio in Ground floor
      const inRooftop = drop.y < 0 && drop.y >= -520;
      const inLeftWindow = drop.x >= 50 && drop.x <= 95 && drop.y >= 145 && drop.y <= 605;
      const inGarden = drop.x >= 835 && drop.x <= 1130 && drop.y >= 450 && drop.y <= 715;

      if (inRooftop || inLeftWindow || inGarden) {
        this.rainGraphic.lineBetween(drop.x, drop.y, drop.x - 3, drop.y + drop.len);
      }
    }
  }

  private getOrCreateBaristaAvatar(): PlayerAvatar {
    let barista = Array.from(this.avatars.values()).find(
      (a) => a.state.isNpc || a.state.userId.startsWith('npc_barista'),
    );
    if (!barista) {
      const state: PlayerNetState = {
        userId: 'npc_barista',
        nickname: 'Barista Minh ☕',
        avatarId: 'av_quiet_reader',
        outfitId: 'outfit_flannel',
        mood: 'coffee_lover',
        roomId: '',
        x: 570,
        y: 205,
        direction: 'down',
        seatId: null,
        drinkId: 'drink_iced_milk_coffee',
        drinkIcon: '☕',
        drinkName: 'Cà Phê Sữa Đá',
        isNpc: true,
        statusBubble: '☕ Đang trực quầy',
      };
      barista = new PlayerAvatar(this, state, false);
      this.avatars.set(state.userId, barista);
    }
    return barista;
  }

  private processNextBaristaOrder() {
    if (this.baristaOrderQueue.length === 0) {
      this.isBaristaBusy = false;
      const barista = this.getOrCreateBaristaAvatar();
      barista.state.direction = 'down';
      barista.state.drinkIcon = '☕';
      barista.redrawCharacter();
      return;
    }

    this.isBaristaBusy = true;
    const order = this.baristaOrderQueue.shift()!;
    const barista = this.getOrCreateBaristaAvatar();

    barista.targetX = 570;
    barista.targetY = 205;
    barista.container.x = 570;
    barista.container.y = 205;
    barista.state.direction = 'up';
    barista.state.drinkIcon = '';
    barista.redrawCharacter();
    barista.showChatBubble(`☕ Đang pha ${order.drinkName} cho ${order.userNickname}...`, 3200);
    barista.playFloatingEmote('☕💨');

    this.time.delayedCall(2400, () => {
      const customerAv = this.avatars.get(order.userId);
      let destX = order.targetX;
      let destY = order.targetY;
      if (customerAv) {
        destX = customerAv.targetX;
        destY = customerAv.targetY;
      }

      const isRooftopOrder = destY < 0;
      const offsetX = destX > 570 ? -36 : 36;
      const finalX = Phaser.Math.Clamp(destX + offsetX, 85, 1115);
      const finalY = destY;

      barista.state.drinkIcon = order.drinkIcon;
      barista.state.drinkName = order.drinkName;
      barista.redrawCharacter();

      if (isRooftopOrder) {
        barista.showChatBubble(`🪜 Đang mang ${order.drinkName} lên sân thượng...`, 3000);
      }

      // Waypoints routing: If customer is on the Rooftop, Barista must climb the stairs!
      const deliveryWaypoints: Array<{ x: number; y: number }> = isRooftopOrder
        ? [
            { x: 770, y: 205 }, // 1. Walk across to stairs base
            { x: 802, y: 125 }, // 2. Step onto Ground Floor staircase
            { x: 802, y: -35 }, // 3. Walk up the stairs to Rooftop
            { x: finalX, y: finalY }, // 4. Walk to customer table on Rooftop
          ]
        : [{ x: finalX, y: finalY }];

      this.moveBaristaAlongWaypoints(barista, deliveryWaypoints, () => {
        const dx = destX - finalX;
        barista.state.direction = dx < 0 ? 'left' : 'right';
        barista.redrawCharacter();

        barista.showChatBubble(
          `Gửi ${order.userNickname} ${order.drinkName} nhé! Chúc bạn ngon miệng ☕✨`,
          3500,
        );
        barista.playFloatingEmote(`✨${order.drinkIcon}`);

        if (customerAv) {
          customerAv.state.drinkId = order.drinkId;
          customerAv.state.drinkIcon = order.drinkIcon;
          customerAv.state.drinkName = order.drinkName;
          customerAv.redrawCharacter();
          customerAv.playFloatingEmote(order.drinkIcon);
        }

        this.time.delayedCall(1900, () => {
          // Return Waypoints: If on Rooftop, must walk down the stairs back to Ground Bar!
          const returnWaypoints: Array<{ x: number; y: number }> = isRooftopOrder
            ? [
                { x: 802, y: -35 }, // 1. Return to Rooftop stairs head
                { x: 802, y: 125 }, // 2. Walk down the stairs to Ground Floor
                { x: 770, y: 205 }, // 3. Step off stairs into hallway
                { x: 570, y: 205 }, // 4. Back to Coffee Bar counter
              ]
            : [{ x: 570, y: 205 }];

          this.moveBaristaAlongWaypoints(barista, returnWaypoints, () => {
            barista.targetX = 570;
            barista.targetY = 205;
            barista.container.x = 570;
            barista.container.y = 205;
            barista.state.direction = 'down';
            barista.state.drinkIcon = '☕';
            barista.redrawCharacter();

            this.time.delayedCall(400, () => {
              this.processNextBaristaOrder();
            });
          });
        });
      });
    });
  }

  private moveBaristaAlongWaypoints(
    barista: PlayerAvatar,
    points: Array<{ x: number; y: number }>,
    onComplete: () => void,
  ) {
    if (points.length === 0) {
      onComplete();
      return;
    }

    const nextPt = points[0];
    const rest = points.slice(1);
    const startX = barista.container.x;
    const startY = barista.container.y;
    const dist = Math.hypot(nextPt.x - startX, nextPt.y - startY);

    if (dist < 4) {
      barista.container.x = nextPt.x;
      barista.container.y = nextPt.y;
      barista.targetX = nextPt.x;
      barista.targetY = nextPt.y;
      this.moveBaristaAlongWaypoints(barista, rest, onComplete);
      return;
    }

    const dx = nextPt.x - startX;
    const dy = nextPt.y - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      barista.state.direction = dx < 0 ? 'left' : 'right';
    } else {
      barista.state.direction = dy < 0 ? 'up' : 'down';
    }
    barista.redrawCharacter();

    const speedPxPerSec = 140;
    const duration = Math.max(150, (dist / speedPxPerSec) * 1000);

    this.tweens.add({
      targets: barista,
      targetX: nextPt.x,
      targetY: nextPt.y,
      duration,
      ease: 'Linear',
      onUpdate: () => {
        const curDx = nextPt.x - barista.container.x;
        const curDy = nextPt.y - barista.container.y;
        if (Math.abs(curDx) > Math.abs(curDy)) {
          barista.state.direction = curDx < 0 ? 'left' : 'right';
        } else {
          barista.state.direction = curDy < 0 ? 'up' : 'down';
        }
      },
      onComplete: () => {
        barista.container.x = nextPt.x;
        barista.container.y = nextPt.y;
        barista.targetX = nextPt.x;
        barista.targetY = nextPt.y;
        this.moveBaristaAlongWaypoints(barista, rest, onComplete);
      },
    });
  }

  shutdown() {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}
