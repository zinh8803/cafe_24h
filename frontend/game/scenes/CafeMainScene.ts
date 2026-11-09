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
  private joystickVec = { vx: 0, vy: 0 };
  private lastMoveEmitAt = 0;
  private lastZone = 'Entrance';

  private windowSkyGraphic!: Phaser.GameObjects.Graphics;
  private rainGraphic!: Phaser.GameObjects.Graphics;
  private lampGlowGroup!: Phaser.GameObjects.Group;
  private ambientOverlay!: Phaser.GameObjects.Rectangle;
  private neonSignText!: Phaser.GameObjects.Text;
  private rainDrops: RainDrop[] = [];
  private unsubscribers: Array<() => void> = [];

  // Furniture obstacle rectangles for collision checks
  private readonly obstacles: Array<{ x: number; y: number; w: number; h: number }> = [
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
  ];

  constructor() {
    super({ key: 'CafeMainScene' });
  }

  create() {
    this.drawCafeArchitecture();
    this.createInteractiveProps();
    this.createSeats();
    this.createLightingAndWeather();
    this.setupControls();
    this.bindNetworkEvents();

    gameEventBus.emit('client:ready', {});
  }

  private drawCafeArchitecture() {
    const g = this.add.graphics();

    // 1. Base outer frame
    g.fillStyle(0x161210, 1);
    g.fillRect(0, 0, 1200, 780);

    // 2. Main Wooden Floor (Warm Oak Plank texture)
    g.fillStyle(0x4a3525, 1);
    g.fillRoundedRect(52, 100, 1096, 635, 14);

    // Subtle floor plank lines
    g.lineStyle(1, 0x3d2b1e, 0.55);
    for (let y = 130; y < 730; y += 32) {
      g.lineBetween(56, y, 1144, y);
    }

    // 3. Zone: Window Seats (Left side carpet & window sill)
    g.fillStyle(0x583e2b, 1);
    g.fillRoundedRect(75, 145, 235, 470, 10);

    // 4. Zone: Quiet Corner (Top right study rug)
    g.fillStyle(0x3a4f41, 0.65);
    g.fillRoundedRect(835, 135, 285, 285, 12);
    g.lineStyle(2, 0x6b9080, 0.45);
    g.strokeRoundedRect(835, 135, 285, 285, 12);

    // 5. Zone: Garden Terrace (Bottom right stone patio)
    g.fillStyle(0x28362c, 1);
    g.fillRoundedRect(835, 450, 295, 265, 12);
    g.lineStyle(2, 0x52796f, 0.6);
    g.strokeRoundedRect(835, 450, 295, 265, 12);

    // Garden stepping stones & greenery hedges
    g.fillStyle(0x354f52, 0.75);
    for (let gx = 860; gx < 1100; gx += 60) {
      for (let gy = 475; gy < 695; gy += 60) {
        g.fillRoundedRect(gx, gy, 44, 44, 8);
      }
    }
    // Garden perimeter bushes
    g.fillStyle(0x2d6a4f, 1);
    for (let bx = 850; bx <= 1110; bx += 36) {
      g.fillCircle(bx, 455, 14);
      g.fillCircle(bx, 712, 14);
    }

    // 6. Top Back Wall (Brick & Wood Paneling)
    g.fillStyle(0x2d2018, 1);
    g.fillRect(52, 24, 1096, 86);
    g.lineStyle(3, 0x7f5539, 1);
    g.lineBetween(52, 110, 1148, 110);

    // 7. Zone: Coffee Bar Counter
    g.fillStyle(0x3b2618, 1);
    g.fillRoundedRect(400, 120, 345, 78, 10);
    g.fillStyle(0xd4a373, 1);
    g.fillRoundedRect(396, 116, 353, 18, 6);
    // Espresso machine & grinder on bar
    g.fillStyle(0x94a3b8, 1);
    g.fillRoundedRect(435, 100, 56, 32, 5);
    g.fillStyle(0xb45309, 1);
    g.fillRoundedRect(645, 102, 65, 28, 5); // Pastry glass box

    // 8. Quiet Corner Bookshelves on back wall
    g.fillStyle(0x3d2817, 1);
    g.fillRoundedRect(855, 32, 245, 72, 6);
    const bookColors = [0xe07a5f, 0x81b29a, 0xf2cc8f, 0x98c1d9, 0xd4a373];
    for (let bx = 868; bx < 1085; bx += 14) {
      g.fillStyle(bookColors[bx % bookColors.length], 0.9);
      g.fillRect(bx, 44, 9, 22);
      g.fillRect(bx, 74, 9, 22);
    }

    // 9. Entrance Welcome Mat (Bottom center)
    g.fillStyle(0x7f5539, 1);
    g.fillRoundedRect(515, 682, 130, 44, 8);
    g.lineStyle(2, 0xe6ccb2, 0.7);
    g.strokeRoundedRect(521, 687, 118, 34, 6);

    // 10. Draw all Tables across zones
    this.drawTables(g);

    // 11. Zone Labels (Subtle floor watermarks)
    const labelStyle = {
      fontFamily: '"Fraunces", Georgia, serif',
      fontSize: '13px',
      color: 'rgba(250, 237, 205, 0.38)',
      fontStyle: 'italic',
    };
    this.add.text(135, 122, 'Window Seats', labelStyle);
    this.add.text(535, 260, 'Main Hall', labelStyle);
    this.add.text(925, 116, 'Quiet Corner • Study Zone', labelStyle);
    this.add.text(930, 428, 'Garden Terrace', labelStyle);
    this.add
      .text(580, 704, 'ENTRANCE', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '11px',
        fontStyle: '700',
        color: '#faedcd',
      })
      .setOrigin(0.5);
  }

  private drawTables(g: Phaser.GameObjects.Graphics) {
    // Window Tables (3 rectangular warm oak tables with small lamp)
    const winYs = [215, 375, 535];
    for (const wy of winYs) {
      g.fillStyle(0x211712, 0.45);
      g.fillRoundedRect(172, wy - 26, 60, 64, 10);
      g.fillStyle(0x8c5a3c, 1);
      g.fillRoundedRect(175, wy - 30, 50, 60, 9);
      g.lineStyle(2, 0xb07d56, 1);
      g.strokeRoundedRect(175, wy - 30, 50, 60, 9);
      // Little table candle
      g.fillStyle(0xfef08a, 0.95);
      g.fillCircle(200, wy, 5);
    }

    // Main Hall Tables
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

    // Quiet Corner Study Desks
    const quietYs = [210, 345];
    for (const qy of quietYs) {
      g.fillStyle(0x6c584c, 1);
      g.fillRoundedRect(925, qy - 28, 62, 56, 8);
      // Small open book & study lamp on desk
      g.fillStyle(0xfaf0ca, 0.9);
      g.fillRect(942, qy - 8, 16, 12);
      g.fillStyle(0x80ed99, 0.9);
      g.fillCircle(972, qy - 12, 5);
    }

    // Garden Round Bistro Tables
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

  private createInteractiveProps() {
    // 1. Interactive Coffee Bar Menu Board
    const barZone = this.add
      .zone(570, 150, 330, 75)
      .setInteractive({ useHandCursor: true });
    barZone.on('pointerdown', () => {
      gameEventBus.emit('client:openDrinkMenu', {});
    });

    this.add
      .text(570, 48, '☕ COFFEE BAR • GỌI ĐỒ UỐNG', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '12px',
        fontStyle: '700',
        color: '#fde68a',
        backgroundColor: 'rgba(28, 20, 15, 0.85)',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5);

    // 2. Interactive Anonymous Message Board on the Wall (Section 4.2)
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0x6f4518, 1);
    boardBg.fillRoundedRect(250, 34, 130, 66, 6);
    boardBg.lineStyle(2, 0xd4a373, 1);
    boardBg.strokeRoundedRect(250, 34, 130, 66, 6);
    // Sticky notes on the board
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
    boardZone.on('pointerdown', () => {
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

    // 3. Neon 24h Café Sign on Back Wall
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
  }

  private createSeats() {
    for (const seat of CAFE_SEAT_MAP) {
      const cushion = this.add
        .circle(seat.x, seat.y, 15, 0xa9714b, 0.88)
        .setStrokeStyle(2, 0xfaedcd, 0.65)
        .setInteractive({ useHandCursor: true })
        .setDepth(seat.y - 15);

      cushion.on('pointerover', () => {
        cushion.setScale(1.15);
        cushion.setStrokeStyle(2.5, 0xfde68a, 1);
      });
      cushion.on('pointerout', () => {
        cushion.setScale(1);
        this.refreshSeatStyles();
      });
      cushion.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
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
    gameEventBus.emit('client:sit', { seatId: seat.id });
  }

  private createLightingAndWeather() {
    // Panoramic Left Window Glass (shows sky color + rain outside)
    this.windowSkyGraphic = this.add.graphics();

    // Rain overlay graphics (drawn in Window pane & Garden)
    this.rainGraphic = this.add.graphics().setDepth(8200);
    for (let i = 0; i < 65; i++) {
      this.rainDrops.push({
        x: Math.random() * 1200,
        y: Math.random() * 780,
        len: 10 + Math.random() * 10,
        speed: 260 + Math.random() * 180,
      });
    }

    // Warm Lamp Glow Halos over tables & bar
    this.lampGlowGroup = this.add.group();
    const glowSpots = [
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
    ];
    for (const spot of glowSpots) {
      const halo = this.add
        .circle(spot.x, spot.y, spot.r, 0xfbbf24, 0.14)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(8000);
      this.lampGlowGroup.add(halo);
    }

    // Full-map Day/Night ambient tint overlay
    this.ambientOverlay = this.add
      .rectangle(600, 390, 1200, 780, 0x0f172a, 0.35)
      .setDepth(8100);

    this.applyWorldCycle('midnight');
  }

  private applyWorldCycle(cycle: WorldCycle) {
    this.currentCycle = cycle;
    const cfg = WORLD_CYCLES[cycle] || WORLD_CYCLES.midnight;

    // Redraw left window panes with current sky color
    this.windowSkyGraphic.clear();
    this.windowSkyGraphic.fillStyle(cfg.windowSkyColor, 0.85);
    this.windowSkyGraphic.fillRoundedRect(54, 150, 18, 130, 4);
    this.windowSkyGraphic.fillRoundedRect(54, 310, 18, 130, 4);
    this.windowSkyGraphic.fillRoundedRect(54, 470, 18, 130, 4);

    this.ambientOverlay.setFillStyle(cfg.ambientTint, cfg.ambientAlpha);

    for (const child of this.lampGlowGroup.getChildren()) {
      const circle = child as Phaser.GameObjects.Arc;
      circle.setAlpha(cfg.lampGlowAlpha * 0.25);
    }

    if (this.neonSignText) {
      this.neonSignText.setColor(cfg.hasNeon ? '#38bdf8' : '#f59e0b');
    }
  }

  private setupControls() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      // Do not capture SPACE or keys when user is typing in an <input>
      this.input.keyboard.disableGlobalCapture();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
      };
    }

    // Click on floor to walk
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.worldY < 118) return;
      this.walkTarget = {
        x: Phaser.Math.Clamp(pointer.worldX, 75, 1125),
        y: Phaser.Math.Clamp(pointer.worldY, 128, 720),
      };
    });
  }

  private bindNetworkEvents() {
    this.unsubscribers.push(
      gameEventBus.on('scene:syncRoom', (payload) => {
        this.selfUserId = payload.selfUserId;
        this.occupiedSeats = { ...payload.occupiedSeats };
        this.applyWorldCycle(payload.worldCycle);

        // Clear removed avatars
        const incomingIds = new Set(payload.players.map((p) => p.userId));
        for (const [uid, avatar] of this.avatars.entries()) {
          if (!incomingIds.has(uid)) {
            avatar.destroy();
            this.avatars.delete(uid);
          }
        }

        // Upsert all avatars in room
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
        }
        av.state.seatId = payload.seatId;
        av.state.direction = payload.direction;
        av.targetX = payload.x;
        av.targetY = payload.y;
        av.container.x = payload.x;
        av.container.y = payload.y;
        av.redrawCharacter();
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
        if (av) {
          av.playFloatingEmote(`🥂${drinkIcon}`);
        }
        if (targetUserId) {
          this.avatars.get(targetUserId)?.playFloatingEmote(`🥂${drinkIcon}`);
        }
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
        });
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
  }

  private isTypingInDomInput(): boolean {
    if (typeof document === 'undefined') return false;
    const tag = document.activeElement?.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  private isBlockedByObstacle(nx: number, ny: number): boolean {
    for (const obs of this.obstacles) {
      if (nx >= obs.x - 14 && nx <= obs.x + obs.w + 14 && ny >= obs.y - 10 && ny <= obs.y + obs.h + 10) {
        return true;
      }
    }
    return false;
  }

  private detectZone(x: number, y: number): string {
    if (x < 310) return 'Window Seats';
    if (y < 245 && x >= 380 && x <= 760) return 'Coffee Bar';
    if (x > 825 && y < 430) return 'Quiet Corner';
    if (x > 825 && y >= 430) return 'Garden';
    if (y > 635) return 'Entrance';
    return 'Main Hall';
  }

  override update(_time: number, delta: number) {
    this.updateSelfMovement(delta);
    for (const avatar of this.avatars.values()) {
      avatar.update(delta);
    }
    this.updateRainAnimation(delta);
  }

  private updateSelfMovement(delta: number) {
    const selfAvatar = this.avatars.get(this.selfUserId);
    if (!selfAvatar) return;

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
    } else if (this.walkTarget) {
      const dx = this.walkTarget.x - selfAvatar.targetX;
      const dy = this.walkTarget.y - selfAvatar.targetY;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) {
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
    const candidateY = Phaser.Math.Clamp(selfAvatar.targetY + stepY, 128, 720);

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

    const zone = this.detectZone(selfAvatar.targetX, selfAvatar.targetY);
    if (zone !== this.lastZone) {
      this.lastZone = zone;
      gameEventBus.emit('client:zoneChanged', { zone });
    }

    // Throttle network updates to ~14Hz (every 70ms) as specified in Section 5.3
    const now = performance.now();
    if (now - this.lastMoveEmitAt >= 70) {
      this.lastMoveEmitAt = now;
      gameEventBus.emit('client:move', {
        x: Math.round(selfAvatar.targetX),
        y: Math.round(selfAvatar.targetY),
        direction,
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
        drop.y = 110;
        drop.x = Math.random() * 1200;
      }
      // Render rain outside the left window panes & in the outdoor Garden zone
      const inLeftWindow = drop.x >= 50 && drop.x <= 95 && drop.y >= 145 && drop.y <= 605;
      const inGarden = drop.x >= 835 && drop.x <= 1130 && drop.y >= 450 && drop.y <= 715;
      if (inLeftWindow || inGarden) {
        this.rainGraphic.lineBetween(drop.x, drop.y, drop.x - 3, drop.y + drop.len);
      }
    }
  }

  shutdown() {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}
