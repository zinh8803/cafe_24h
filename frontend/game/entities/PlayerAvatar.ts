import * as Phaser from 'phaser';
import { computeAvatarBobOffset, type BobAnimationState } from '../animations/CharacterAnimator';
import { AVATAR_PRESETS, MOOD_OPTIONS, OUTFIT_PRESETS } from '../assets/cafeCatalog';
import { gameEventBus, type PlayerNetState } from '../systems/EventBus';

export class PlayerAvatar {
  public readonly container: Phaser.GameObjects.Container;
  private readonly bodyContainer: Phaser.GameObjects.Container;
  private readonly bodyGraphic: Phaser.GameObjects.Graphics;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly typingBadge: Phaser.GameObjects.Text;
  private readonly drinkText: Phaser.GameObjects.Text;
  private readonly bubbleContainer: Phaser.GameObjects.Container;
  private readonly bubbleBg: Phaser.GameObjects.Graphics;
  private readonly bubbleText: Phaser.GameObjects.Text;

  public state: PlayerNetState;
  public targetX: number;
  public targetY: number;
  private readonly isSelf: boolean;
  private readonly scene: Phaser.Scene;
  private readonly animState: BobAnimationState = {
    phase: Math.random() * Math.PI * 2,
    isMoving: false,
    isSitting: false,
  };
  private bubbleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(scene: Phaser.Scene, state: PlayerNetState, isSelf: boolean) {
    this.scene = scene;
    this.state = { ...state };
    this.isSelf = isSelf;
    this.targetX = state.x;
    this.targetY = state.y;

    this.container = scene.add.container(state.x, state.y);
    this.container.setDepth(3000 + Math.round(state.y));

    // Shadow on floor - multi-layered soft ambient contact shadow
    const shadowOuter = scene.add.ellipse(0, 18, 40, 16, 0x090706, 0.22);
    const shadowInner = scene.add.ellipse(0, 18, 28, 10, 0x090706, 0.38);
    this.container.add([shadowOuter, shadowInner]);

    // Animated character body sub-container
    this.bodyContainer = scene.add.container(0, 0);
    this.bodyGraphic = scene.add.graphics();
    this.bodyContainer.add(this.bodyGraphic);

    // Interactive click zone on character so players can click each other to interact!
    const hitArea = scene.add
      .zone(0, -10, 44, 58)
      .setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const sceneAny = this.scene as any;
      if (sceneAny?.isAiming?.() || pointer.rightButtonDown()) {
        pointer.event.stopPropagation();
        sceneAny.handleAimThrow?.(pointer.worldX, pointer.worldY);
        return;
      }
      pointer.event.stopPropagation();
      gameEventBus.emit('client:selectPlayer', { userId: this.state.userId });
    });
    this.bodyContainer.add(hitArea);

    // Held drink icon next to hand
    this.drinkText = scene.add
      .text(16, -2, state.drinkIcon || '', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '17px',
      })
      .setOrigin(0.5);
    this.bodyContainer.add(this.drinkText);
    this.container.add(this.bodyContainer);

    // Name & Mood label below character
    this.nameText = scene.add
      .text(0, 30, this.formatNameLabel(), {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '12px',
        fontStyle: isSelf ? '700' : '600',
        color: isSelf ? '#fde68a' : '#f8f5f0',
        backgroundColor: isSelf ? 'rgba(34, 24, 18, 0.85)' : 'rgba(22, 18, 16, 0.72)',
        padding: { left: 7, right: 7, top: 3, bottom: 3 },
      })
      .setOrigin(0.5);
    this.container.add(this.nameText);

    // Live Typing Indicator Badge
    this.typingBadge = scene.add
      .text(0, -48, '💬 đang gõ...', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '11px',
        fontStyle: '600',
        color: '#fde68a',
        backgroundColor: 'rgba(28, 20, 14, 0.88)',
        padding: { left: 7, right: 7, top: 3, bottom: 3 },
      })
      .setOrigin(0.5)
      .setVisible(Boolean(state.isTyping));
    this.container.add(this.typingBadge);

    // Overhead Chat Bubble Container
    this.bubbleContainer = scene.add.container(0, -56);
    this.bubbleBg = scene.add.graphics();
    this.bubbleText = scene.add
      .text(0, 0, '', {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '12px',
        fontStyle: '600',
        color: '#261c15',
        wordWrap: { width: 185, useAdvancedWrap: true },
        align: 'center',
      })
      .setOrigin(0.5);
    this.bubbleContainer.add([this.bubbleBg, this.bubbleText]);
    this.bubbleContainer.setVisible(false);
    this.container.add(this.bubbleContainer);

    this.redrawCharacter();

    if (state.statusBubble) {
      this.showChatBubble(state.statusBubble, 18000);
    }
  }

  private formatNameLabel(): string {
    const moodObj = MOOD_OPTIONS.find((m) => m.id === this.state.mood) || MOOD_OPTIONS[4];
    const studyTag = this.state.isStudying ? ' 📚' : '';
    const npcTag = this.state.isNpc ? ' [NPC]' : '';
    return `${moodObj.emoji} ${this.state.nickname}${studyTag}${npcTag}`;
  }

  public setTyping(isTyping: boolean) {
    this.state.isTyping = isTyping;
    this.typingBadge.setVisible(isTyping && !this.bubbleContainer.visible);
  }

  public redrawCharacter() {
    const preset =
      AVATAR_PRESETS.find((a) => a.id === this.state.avatarId) || AVATAR_PRESETS[0];
    const outfit =
      OUTFIT_PRESETS.find((o) => o.id === this.state.outfitId) || OUTFIT_PRESETS[0];

    const g = this.bodyGraphic;
    g.clear();

    // Study mode peaceful halo aura - soft ethereal glow
    if (this.state.isStudying) {
      g.fillStyle(0x38bdf8, 0.08);
      g.fillEllipse(0, -12, 46, 56);
      g.lineStyle(2, 0x38bdf8, 0.75);
      g.strokeEllipse(0, -12, 44, 54);
      g.lineStyle(1, 0xbae6fd, 0.5);
      g.strokeEllipse(0, -12, 40, 50);
    }

    // Self selection ring on floor with amber glow
    if (this.isSelf) {
      g.lineStyle(2.5, 0xf59e0b, 0.85);
      g.strokeEllipse(0, 18, 42, 18);
      g.fillStyle(0xfef08a, 0.12);
      g.fillEllipse(0, 18, 40, 16);
    }

    // Legs / sitting posture
    g.fillStyle(0x221a16, 1);
    if (this.state.seatId) {
      const legOffsetX =
        this.state.direction === 'left' ? -8 : this.state.direction === 'right' ? 8 : 0;
      g.fillRoundedRect(-8 + legOffsetX, 8, 7, 9, 3);
      g.fillRoundedRect(1 + legOffsetX, 8, 7, 9, 3);
    } else {
      g.fillRoundedRect(-8, 8, 6, 11, 3);
      g.fillRoundedRect(2, 8, 6, 11, 3);
    }

    // Torso / Cozy knit sweater
    g.fillStyle(outfit.primaryColor, 1);
    g.fillRoundedRect(-12, -8, 24, 19, 7);

    // Knit texture lines across sweater
    g.lineStyle(1, outfit.accentColor, 0.35);
    g.lineBetween(-10, -3, 10, -3);
    g.lineBetween(-10, 2, 10, 2);
    g.lineBetween(-9, 7, 9, 7);

    // Collar / Scarf accent
    g.fillStyle(outfit.accentColor, 1);
    g.fillRoundedRect(-8, -9, 16, 6, 2.5);

    // Head
    g.fillStyle(preset.skinColor, 1);
    g.fillCircle(0, -20, 12.5);

    // Blush cheeks
    g.fillStyle(0xf4978e, 0.5);
    g.fillCircle(-6.5, -18, 2.6);
    g.fillCircle(6.5, -18, 2.6);

    // Eyes based on direction with tiny reflection glint
    g.fillStyle(0x221a17, 1);
    const eyeShiftX =
      this.state.direction === 'left' ? -2.5 : this.state.direction === 'right' ? 2.5 : 0;
    if (this.state.direction !== 'up') {
      if (this.state.mood === 'sleepy') {
        g.fillRect(-6 + eyeShiftX, -21, 4, 1.5);
        g.fillRect(2 + eyeShiftX, -21, 4, 1.5);
      } else {
        // Eye base
        g.fillCircle(-4.2 + eyeShiftX, -20.5, 1.8);
        g.fillCircle(4.2 + eyeShiftX, -20.5, 1.8);
        // Eye sparkle highlight
        g.fillStyle(0xffffff, 0.85);
        g.fillCircle(-3.8 + eyeShiftX, -21.2, 0.7);
        g.fillCircle(4.6 + eyeShiftX, -21.2, 0.7);
        g.fillStyle(0x221a17, 1);
      }
    }

    // Hair style variations with natural volume
    g.fillStyle(preset.hairColor, 1);
    g.fillRoundedRect(-12.5, -33.5, 25, 11, 6.5);

    if (preset.hairStyle === 'bun') {
      g.fillCircle(0, -36.5, 6.5);
      g.lineStyle(1.5, outfit.accentColor, 0.8); // Hair ribbon
      g.strokeCircle(0, -36.5, 6.5);
    } else if (preset.hairStyle === 'cat_ears') {
      g.fillTriangle(-11, -30, -4, -30, -9, -40);
      g.fillTriangle(4, -30, 11, -30, 9, -40);
      // Inner ear pink
      g.fillStyle(0xfbcfe8, 1);
      g.fillTriangle(-10, -31, -5, -31, -8.5, -38);
      g.fillTriangle(5, -31, 10, -31, 8.5, -38);
    } else if (preset.hairStyle === 'beanie') {
      g.fillStyle(outfit.primaryColor, 1);
      g.fillRoundedRect(-13.5, -35.5, 27, 11, 5.5);
      g.fillStyle(outfit.accentColor, 1);
      g.fillCircle(0, -38, 4.5); // Beanie pom-pom
    } else if (preset.hairStyle === 'bob') {
      g.fillRoundedRect(-13.5, -29, 5.5, 13.5, 3);
      g.fillRoundedRect(8, -29, 5.5, 13.5, 3);
    }

    this.drinkText.setText(this.state.drinkIcon || '');
    this.nameText.setText(this.formatNameLabel());
  }

  public showChatBubble(message: string, durationMs = 6500) {
    if (this.bubbleTimer) {
      clearTimeout(this.bubbleTimer);
    }

    this.typingBadge.setVisible(false);
    this.bubbleText.setText(message);
    const bounds = this.bubbleText.getBounds();
    const padX = 12;
    const padY = 8;
    const w = Math.max(48, bounds.width + padX * 2);
    const h = Math.max(26, bounds.height + padY * 2);

    this.bubbleBg.clear();
    this.bubbleBg.fillStyle(0xfffbeb, 0.96);
    this.bubbleBg.lineStyle(1.5, 0xd6bfa3, 1);
    this.bubbleBg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.bubbleBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

    // Little pointer triangle
    this.bubbleBg.fillTriangle(-5, h / 2 - 1, 5, h / 2 - 1, 0, h / 2 + 6);

    this.bubbleContainer.setY(-48 - h / 2);
    this.bubbleContainer.setVisible(true);
    this.bubbleContainer.setScale(0.85);
    this.scene.tweens.add({
      targets: this.bubbleContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: 'Back.easeOut',
    });

    this.bubbleTimer = setTimeout(() => {
      this.bubbleContainer.setVisible(false);
    }, durationMs);
  }

  public playFloatingEmote(emote: string) {
    const floatText = this.scene.add
      .text(this.container.x, this.container.y - 42, emote, {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '24px',
      })
      .setOrigin(0.5)
      .setDepth(9000);

    this.scene.tweens.add({
      targets: floatText,
      y: floatText.y - 44,
      alpha: 0,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 1350,
      ease: 'Cubic.easeOut',
      onComplete: () => floatText.destroy(),
    });
  }

  public playHitReaction(message = 'Đau quá!') {
    this.playFloatingEmote('💥');
    this.showChatBubble(message, 5000);

    this.bodyContainer.x = 0;
    this.scene.tweens.add({
      targets: this.bodyContainer,
      x: { from: -7, to: 7 },
      duration: 55,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.bodyContainer.x = 0;
      },
    });
  }

  public playDodgeReaction(message = 'Né đẹp! Hụt rồi nhé 😜') {
    this.playFloatingEmote('💨');
    this.showChatBubble(message, 5000);

    const dodgeDir = Math.random() < 0.5 ? -1 : 1;
    this.bodyContainer.x = 0;
    this.scene.tweens.add({
      targets: this.bodyContainer,
      x: dodgeDir * 24,
      duration: 150,
      yoyo: true,
      hold: 90,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.bodyContainer.x = 0;
      },
    });
  }

  public update(deltaMs: number) {
    const dx = this.targetX - this.container.x;
    const dy = this.targetY - this.container.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1.2) {
      const lerpFactor = Math.min(1, deltaMs * 0.015);
      this.container.x += dx * lerpFactor;
      this.container.y += dy * lerpFactor;
      this.animState.isMoving = true;
    } else {
      this.container.x = this.targetX;
      this.container.y = this.targetY;
      this.animState.isMoving = false;
    }

    this.animState.isSitting = Boolean(this.state.seatId);
    const bob = computeAvatarBobOffset(this.animState, deltaMs);
    this.bodyContainer.y = bob.offsetY;
    this.bodyContainer.rotation = bob.tiltRad;
    this.container.setDepth(3000 + Math.round(this.container.y));
  }

  public destroy() {
    if (this.bubbleTimer) {
      clearTimeout(this.bubbleTimer);
    }
    this.container.destroy();
  }
}
