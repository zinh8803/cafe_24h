import { defineStore } from 'pinia';
import {
  AVATAR_PRESETS,
  DRINK_MENU,
  MOOD_OPTIONS,
  OUTFIT_PRESETS,
  type WorldCycle,
} from '@game/assets/cafeCatalog';
import type { PlayerNetState } from '@game/systems/EventBus';

export interface ChatEntry {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: string;
}

export interface AnonymousMessageItem {
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

export interface RoomSummary {
  id: string;
  name: string;
  roomType: string;
  onlineCount: number;
  capacity: number;
}

export interface PendingCoffeeInvite {
  fromUserId: string;
  fromNickname: string;
  drinkId: string;
  drinkIcon: string;
  drinkName: string;
}

export const useCafeStore = defineStore('cafe', {
  state: () => ({
    // Player identity (Guest session + per-tab sessionId for multi-tab testing)
    guestId: '',
    sessionId: '',
    userId: 'usr_local',
    nickname: 'Khách Ghé Quán',
    avatarId: AVATAR_PRESETS[0].id,
    outfitId: OUTFIT_PRESETS[0].id,
    mood: MOOD_OPTIONS[4].id,
    currentDrinkId: DRINK_MENU[0].id,

    // Room & World state
    connected: false,
    currentRoomId: 'cafe:main:001',
    currentRoomName: 'Main Hall #001',
    currentFloor: 'ground' as 'ground' | 'rooftop',
    currentZone: 'Entrance',
    worldCycle: 'midnight' as WorldCycle,
    dailyQuote:
      'Có những ngày chỉ muốn ngồi yên trong một quán cà phê cùng những người xa lạ.',
    roomsList: [
      { id: 'cafe:main:001', name: 'Main Hall #001', roomType: 'main', onlineCount: 3, capacity: 25 },
      { id: 'cafe:quiet:001', name: 'Quiet Corner #001', roomType: 'quiet', onlineCount: 2, capacity: 25 },
      { id: 'cafe:garden:001', name: 'Garden #001', roomType: 'garden', onlineCount: 2, capacity: 25 },
    ] as RoomSummary[],
    players: [] as PlayerNetState[],
    occupiedSeats: {} as Record<string, string>,
    chats: [] as ChatEntry[],
    anonymousMessages: [
      {
        id: 'note_01',
        userId: 'seed',
        content:
          'Nếu hôm nay bạn mệt, hãy nghỉ ngơi một chút. Không cần phải giỏi mọi thứ mỗi ngày.',
        tag: 'Lời nhắn lúc 23:45',
        reactions: { heart: 24, coffee: 12, sparkle: 9 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'note_02',
        userId: 'seed',
        content:
          'Chúc người đang đọc dòng này thi tốt hoặc hoàn thành deadline thật nhẹ nhàng nhé ☕✨',
        tag: 'Từ Bàn Cửa Sổ #2',
        reactions: { heart: 19, coffee: 15, sparkle: 7 },
        createdAt: new Date().toISOString(),
      },
    ] as AnonymousMessageItem[],

    // Realtime Multi-User Interaction States
    showOnlineDrawer: true,
    selectedPlayerId: '' as string,
    pendingCoffeeInvite: null as PendingCoffeeInvite | null,

    // UI Modals & Toast
    showCustomizerModal: false,
    showDrinkModal: false,
    showAnonymousBoardModal: false,
    showPolaroidModal: false,
    polaroidDataUrl: '',
    toastMessage: '',
    mutedUserIds: [] as string[],
    isAimingThrow: false,
    isStudying: false,
  }),

  getters: {
    currentMoodConfig(state) {
      return MOOD_OPTIONS.find((m) => m.id === state.mood) || MOOD_OPTIONS[4];
    },
    currentDrinkConfig(state) {
      return DRINK_MENU.find((d) => d.id === state.currentDrinkId) || DRINK_MENU[0];
    },
    visibleChats(state) {
      return state.chats
        .filter((c) => !state.mutedUserIds.includes(c.userId))
        .slice()
        .reverse();
    },
    selectedPlayer(state): PlayerNetState | undefined {
      if (!state.selectedPlayerId) return undefined;
      return state.players.find((p) => p.userId === state.selectedPlayerId);
    },
    humanPlayersCount(state): number {
      return state.players.filter((p) => !p.isNpc).length;
    },
  },

  actions: {
    loadSavedGuestProfile() {
      if (typeof window === 'undefined') return;
      try {
        // Per-tab sessionId ensures opening 2+ tabs on the same browser creates distinct live users!
        let tabSession = sessionStorage.getItem('cafe24h_tab_session_id');
        const isNewTabSession = !tabSession;
        if (!tabSession) {
          tabSession = `tab_${Math.random().toString(36).slice(2, 10)}`;
          sessionStorage.setItem('cafe24h_tab_session_id', tabSession);
        }
        this.sessionId = tabSession;

        const raw = localStorage.getItem('cafe24h_guest_profile');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.guestId) this.guestId = parsed.guestId;
          if (parsed.nickname) this.nickname = parsed.nickname;
          if (parsed.avatarId) this.avatarId = parsed.avatarId;
          if (parsed.outfitId) this.outfitId = parsed.outfitId;
          if (parsed.mood) this.mood = parsed.mood;
        } else {
          this.guestId = `guest_${Math.random().toString(36).slice(2, 10)}`;
          const shortCode = tabSession.slice(-3).toUpperCase();
          this.nickname = `Khách #${shortCode}`;
          this.avatarId =
            AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)].id;
          this.outfitId =
            OUTFIT_PRESETS[Math.floor(Math.random() * OUTFIT_PRESETS.length)].id;
          this.saveGuestProfile();
        }

        // If user opened a new tab with the generic default name, give this tab a distinct look/tag
        if (isNewTabSession && this.nickname === 'Khách Ghé Quán') {
          const shortCode = tabSession.slice(-3).toUpperCase();
          this.nickname = `Khách #${shortCode}`;
        }
      } catch {
        this.guestId = `guest_${Math.random().toString(36).slice(2, 10)}`;
        this.sessionId = this.guestId;
      }
    },

    saveGuestProfile() {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(
          'cafe24h_guest_profile',
          JSON.stringify({
            guestId: this.guestId,
            nickname: this.nickname,
            avatarId: this.avatarId,
            outfitId: this.outfitId,
            mood: this.mood,
          }),
        );
      } catch {
        // Ignore storage quota errors
      }
    },

    showToast(msg: string) {
      this.toastMessage = msg;
      setTimeout(() => {
        if (this.toastMessage === msg) {
          this.toastMessage = '';
        }
      }, 4200);
    },

    toggleMuteUser(userId: string) {
      if (this.mutedUserIds.includes(userId)) {
        this.mutedUserIds = this.mutedUserIds.filter((id) => id !== userId);
      } else {
        this.mutedUserIds.push(userId);
      }
    },

    toggleAimThrow(val?: boolean) {
      this.isAimingThrow = typeof val === 'boolean' ? val : !this.isAimingThrow;
      gameEventBus.emit('scene:aimMode', { isAiming: this.isAimingThrow });
      if (this.isAimingThrow) {
        this.showToast('🎯 Chế độ nhắm: Click chuột vào vị trí bất kỳ để ném (hoặc Click chuột phải để ném nhanh!)');
      }
    },
  },
});
