import { io, type Socket } from 'socket.io-client';
import {
  CAFE_SEAT_MAP,
  DRINK_MENU,
  type WorldCycle,
} from '@game/assets/cafeCatalog';
import { gameEventBus, type PlayerNetState } from '@game/systems/EventBus';
import { useCafeStore } from '~/stores/useCafeStore';

let sharedSocket: Socket | null = null;
let sceneBridgeInitialized = false;

export function useCafeSocket() {
  const store = useCafeStore();
  const config = useRuntimeConfig();

  function buildLocalFallbackSnapshot(): {
    selfUserId: string;
    worldCycle: WorldCycle;
    players: PlayerNetState[];
    occupiedSeats: Record<string, string>;
  } {
    const selfPlayer: PlayerNetState = {
      userId: store.userId,
      nickname: store.nickname,
      avatarId: store.avatarId,
      outfitId: store.outfitId,
      mood: store.mood,
      roomId: store.currentRoomId,
      x: 580,
      y: 650,
      direction: 'up',
      seatId: null,
      drinkId: DRINK_MENU[0].id,
      drinkIcon: DRINK_MENU[0].icon,
      drinkName: DRINK_MENU[0].name,
    };

    return {
      selfUserId: store.userId,
      worldCycle: store.worldCycle,
      players: [selfPlayer],
      occupiedSeats: {},
    };
  }

  function syncLocalFallbackToScene() {
    const snap = buildLocalFallbackSnapshot();
    store.players = snap.players;
    store.occupiedSeats = snap.occupiedSeats;
    gameEventBus.emit('scene:syncRoom', snap);
  }

  function connectSocket(targetRoomId?: string) {
    if (typeof window === 'undefined') return;
    store.loadSavedGuestProfile();

    if (!sceneBridgeInitialized) {
      sceneBridgeInitialized = true;

      gameEventBus.on('client:ready', () => {
        if (sharedSocket?.connected) {
          emitJoin(store.currentRoomId);
        } else {
          syncLocalFallbackToScene();
        }
      });

      gameEventBus.on('client:move', (payload) => {
        const self = store.players.find((p) => p.userId === store.userId);
        if (self) {
          self.x = payload.x;
          self.y = payload.y;
          self.direction = payload.direction;
          self.seatId = null;
        }
        if (sharedSocket?.connected) {
          sharedSocket.emit('player:move', payload);
        }
      });

      gameEventBus.on('client:sit', ({ seatId }) => {
        if (sharedSocket?.connected) {
          sharedSocket.emit('player:sit', { seatId });
        } else {
          const seat = CAFE_SEAT_MAP.find((s) => s.id === seatId);
          if (!seat) return;
          if (store.occupiedSeats[seatId] && store.occupiedSeats[seatId] !== store.userId) {
            store.showToast('Ghế này đã có người ngồi rồi ☕');
            return;
          }
          gameEventBus.emit('scene:playerSat', {
            userId: store.userId,
            seatId: seat.id,
            x: seat.x,
            y: seat.y,
            direction: seat.direction,
          });
        }
      });

      gameEventBus.on('client:selectPlayer', ({ userId }) => {
        if (userId === store.userId) {
          store.showCustomizerModal = true;
        } else {
          store.selectedPlayerId = userId;
        }
      });

      gameEventBus.on('client:openMessageBoard', () => {
        fetchAnonymousMessages();
        store.showAnonymousBoardModal = true;
      });

      gameEventBus.on('client:openDrinkMenu', () => {
        store.showDrinkModal = true;
      });

      gameEventBus.on('client:snapshotReady', ({ dataUrl }) => {
        store.polaroidDataUrl = dataUrl;
        store.showPolaroidModal = true;
      });

      gameEventBus.on('client:zoneChanged', ({ zone }) => {
        store.currentZone = zone;
      });
    }

    if (sharedSocket) {
      if (targetRoomId) {
        emitJoin(targetRoomId);
      }
      return;
    }

    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const resolvedWsUrl = String(config.public.wsUrl || '').trim()
      ? String(config.public.wsUrl).trim()
      : isLocalhost
        ? 'http://localhost:3001'
        : window.location.origin;

    const socket = io(resolvedWsUrl, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      timeout: 5000,
    });
    sharedSocket = socket;

    socket.on('connect', () => {
      store.connected = true;
      emitJoin(targetRoomId || store.currentRoomId);
      fetchAnonymousMessages();
    });

    socket.on('disconnect', () => {
      store.connected = false;
    });

    socket.on('connect_error', () => {
      store.connected = false;
      syncLocalFallbackToScene();
    });

    socket.on('rooms:updated', ({ roomsList }) => {
      if (Array.isArray(roomsList)) {
        store.roomsList = roomsList;
      }
    });

    socket.on('room:state', (payload) => {
      store.userId = payload.selfUserId;
      store.currentRoomId = payload.roomId;
      store.currentRoomName = payload.roomName;
      store.worldCycle = payload.worldCycle;
      if (payload.dailyQuote) store.dailyQuote = payload.dailyQuote;
      store.players = payload.players || [];
      store.occupiedSeats = payload.occupiedSeats || {};
      if (Array.isArray(payload.recentChats)) {
        store.chats = payload.recentChats;
      }
      if (Array.isArray(payload.roomsList)) {
        store.roomsList = payload.roomsList;
      }

      gameEventBus.emit('scene:syncRoom', {
        selfUserId: payload.selfUserId,
        worldCycle: payload.worldCycle,
        players: store.players,
        occupiedSeats: store.occupiedSeats,
      });
    });

    socket.on('player:joined', ({ player }) => {
      const idx = store.players.findIndex((p) => p.userId === player.userId);
      if (idx >= 0) store.players[idx] = player;
      else store.players.push(player);
      if (!player.isNpc) {
        store.showToast(`👋 ${player.nickname} vừa bước vào quán!`);
      }
      gameEventBus.emit('scene:playerJoined', { player });
    });

    socket.on('player:left', ({ userId, freedSeatId }) => {
      if (store.selectedPlayerId === userId) {
        store.selectedPlayerId = '';
      }
      store.players = store.players.filter((p) => p.userId !== userId);
      if (freedSeatId) {
        delete store.occupiedSeats[freedSeatId];
      }
      gameEventBus.emit('scene:playerLeft', { userId, freedSeatId });
    });

    socket.on('player:moved', (payload) => {
      if (payload.freedSeatId) {
        delete store.occupiedSeats[payload.freedSeatId];
      }
      const p = store.players.find((item) => item.userId === payload.userId);
      if (p) {
        p.x = payload.x;
        p.y = payload.y;
        p.direction = payload.direction;
        p.seatId = null;
      }
      gameEventBus.emit('scene:playerMoved', payload);
    });

    socket.on('player:sat', (payload) => {
      if (payload.freedSeatId) {
        delete store.occupiedSeats[payload.freedSeatId];
      }
      store.occupiedSeats[payload.seatId] = payload.userId;
      const p = store.players.find((item) => item.userId === payload.userId);
      if (p) {
        p.seatId = payload.seatId;
        p.x = payload.x;
        p.y = payload.y;
        p.direction = payload.direction;
      }
      gameEventBus.emit('scene:playerSat', payload);
    });

    socket.on('player:emoted', (payload) => {
      gameEventBus.emit('scene:playerEmoted', payload);
    });

    socket.on('player:drank', (payload) => {
      const p = store.players.find((item) => item.userId === payload.userId);
      if (p) {
        p.drinkId = payload.drinkId;
        p.drinkIcon = payload.drinkIcon;
        p.drinkName = payload.drinkName;
      }
      gameEventBus.emit('scene:playerDrank', payload);
    });

    socket.on('player:updated', (payload) => {
      const target = store.players.find((p) => p.userId === payload.userId);
      if (target) {
        target.mood = payload.mood;
        target.nickname = payload.nickname;
        target.avatarId = payload.avatarId;
        target.outfitId = payload.outfitId;
      }
      gameEventBus.emit('scene:playerUpdated', payload);
    });

    socket.on('player:typing', (payload) => {
      const target = store.players.find((p) => p.userId === payload.userId);
      if (target) {
        target.isTyping = payload.isTyping;
      }
      gameEventBus.emit('scene:playerTyping', payload);
    });

    socket.on('mood:encouraged', (payload) => {
      if (payload.toUserId === store.userId) {
        store.showToast(
          `${payload.emoji} ${payload.fromNickname} vừa gửi lời động viên ấm áp tới bạn!`,
        );
      } else {
        store.showToast(
          `${payload.emoji} ${payload.fromNickname} vừa động viên ${payload.toNickname}!`,
        );
      }
    });

    socket.on('coffee:invited', (payload) => {
      store.pendingCoffeeInvite = payload;
    });

    socket.on('coffee:cheered', (payload) => {
      if (payload.targetNickname) {
        store.showToast(
          `🥂 ${payload.fromNickname} & ${payload.targetNickname} vừa cùng cụng ly ${payload.drinkName} ${payload.drinkIcon}!`,
        );
      } else {
        store.showToast(
          `🥂 ${payload.fromNickname} vừa nâng ly ${payload.drinkName} ${payload.drinkIcon} cùng mọi người trong quán!`,
        );
      }
      gameEventBus.emit('scene:cheers', payload);
    });

    socket.on('chat:new', (msg) => {
      if (store.mutedUserIds.includes(msg.userId)) return;
      store.chats.push(msg);
      if (store.chats.length > 60) store.chats.shift();
      gameEventBus.emit('scene:chatBubble', {
        userId: msg.userId,
        nickname: msg.nickname,
        content: msg.content,
      });
    });

    socket.on('board:newNote', ({ note }) => {
      if (!note) return;
      const exists = store.anonymousMessages.some((m) => m.id === note.id);
      if (!exists) {
        store.anonymousMessages.unshift(note);
        store.showToast('📌 Vừa có một lời nhắn ẩn danh mới được ghim lên bảng!');
      }
    });

    socket.on('board:noteReacted', ({ note }) => {
      if (!note) return;
      const idx = store.anonymousMessages.findIndex((m) => m.id === note.id);
      if (idx >= 0) {
        store.anonymousMessages[idx] = note;
      }
    });

    socket.on('world:cycle', ({ cycle }) => {
      store.worldCycle = cycle;
      gameEventBus.emit('scene:worldCycle', { cycle });
    });

    socket.on('game:notice', ({ message }) => {
      store.showToast(message);
    });
  }

  function emitJoin(roomId?: string) {
    if (!sharedSocket?.connected) return;
    sharedSocket.emit('player:join', {
      roomId: roomId || store.currentRoomId,
      guestId: store.guestId,
      sessionId: store.sessionId,
      nickname: store.nickname,
      avatarId: store.avatarId,
      outfitId: store.outfitId,
      mood: store.mood,
    });
  }

  function switchRoom(roomId: string) {
    store.currentRoomId = roomId;
    store.selectedPlayerId = '';
    const found = store.roomsList.find((r) => r.id === roomId);
    if (found) store.currentRoomName = found.name;
    if (sharedSocket?.connected) {
      emitJoin(roomId);
    } else {
      syncLocalFallbackToScene();
    }
  }

  function setTypingStatus(isTyping: boolean) {
    if (sharedSocket?.connected) {
      sharedSocket.emit('chat:typing', { isTyping });
    }
  }

  function sendChatMessage(content: string) {
    const clean = content.trim().slice(0, 120);
    if (!clean) return;

    if (sharedSocket?.connected) {
      sharedSocket.emit('chat:send', { content: clean });
    } else {
      const localMsg = {
        id: `local_${Date.now()}`,
        userId: store.userId,
        nickname: store.nickname,
        content: clean,
        createdAt: new Date().toISOString(),
      };
      store.chats.push(localMsg);
      gameEventBus.emit('scene:chatBubble', {
        userId: store.userId,
        nickname: store.nickname,
        content: clean,
      });
    }
  }

  function sendEmote(emote: string) {
    if (sharedSocket?.connected) {
      sharedSocket.emit('player:emote', { emote });
    } else {
      gameEventBus.emit('scene:playerEmoted', {
        userId: store.userId,
        emote,
      });
    }
  }

  function orderDrink(drinkId: string) {
    store.currentDrinkId = drinkId;
    const drink = DRINK_MENU.find((d) => d.id === drinkId) || DRINK_MENU[0];
    if (sharedSocket?.connected) {
      sharedSocket.emit('player:drink', { drinkId: drink.id });
    } else {
      gameEventBus.emit('scene:playerDrank', {
        userId: store.userId,
        drinkId: drink.id,
        drinkIcon: drink.icon,
        drinkName: drink.name,
      });
    }
    store.showToast(`Đã gọi ${drink.icon} ${drink.name}`);
  }

  function updateProfileAndMood(payload: {
    nickname: string;
    avatarId: string;
    outfitId: string;
    mood: string;
  }) {
    store.nickname = payload.nickname.trim().slice(0, 24) || 'Khách Ghé Quán';
    store.avatarId = payload.avatarId;
    store.outfitId = payload.outfitId;
    store.mood = payload.mood;
    store.saveGuestProfile();

    if (sharedSocket?.connected) {
      sharedSocket.emit('player:mood', {
        nickname: store.nickname,
        avatarId: store.avatarId,
        outfitId: store.outfitId,
        mood: store.mood,
      });
    } else {
      gameEventBus.emit('scene:playerUpdated', {
        userId: store.userId,
        nickname: store.nickname,
        avatarId: store.avatarId,
        outfitId: store.outfitId,
        mood: store.mood,
      });
    }
  }

  function setWorldCycle(cycle: WorldCycle) {
    store.worldCycle = cycle;
    if (sharedSocket?.connected) {
      sharedSocket.emit('world:setCycle', { cycle });
    } else {
      gameEventBus.emit('scene:worldCycle', { cycle });
    }
  }

  function triggerCoffeeTogether(targetUserId?: string) {
    const drink = store.currentDrinkConfig;
    if (sharedSocket?.connected) {
      sharedSocket.emit('coffee:invite', {
        targetUserId: targetUserId || undefined,
        drinkId: drink.id,
      });
    } else {
      store.showToast(
        `Bạn vừa nâng ly ${drink.icon} ${drink.name} chúc mọi người một ngày bình yên!`,
      );
      gameEventBus.emit('scene:cheers', {
        fromUserId: store.userId,
        fromNickname: store.nickname,
        targetUserId: targetUserId || null,
        drinkIcon: drink.icon,
        drinkName: drink.name,
      });
    }
  }

  function acceptCoffeeInvite() {
    if (!store.pendingCoffeeInvite) return;
    const invite = store.pendingCoffeeInvite;
    store.pendingCoffeeInvite = null;
    store.currentDrinkId = invite.drinkId || store.currentDrinkId;

    if (sharedSocket?.connected) {
      sharedSocket.emit('coffee:accept', invite);
    }
  }

  function encouragePlayer(targetUserId: string, emoji = '❤️') {
    if (sharedSocket?.connected) {
      sharedSocket.emit('mood:encourage', { targetUserId, emoji });
    } else {
      gameEventBus.emit('scene:playerEmoted', { userId: targetUserId, emote: emoji });
    }
  }

  function sitWithPlayer(targetUserId: string) {
    if (sharedSocket?.connected) {
      sharedSocket.emit('player:sitWith', { targetUserId });
    } else {
      const target = store.players.find((p) => p.userId === targetUserId);
      if (target?.seatId) {
        const currentSeat = CAFE_SEAT_MAP.find((s) => s.id === target.seatId);
        const opposite = CAFE_SEAT_MAP.find(
          (s) => s.tableId === currentSeat?.tableId && s.id !== currentSeat?.id,
        );
        if (opposite) {
          gameEventBus.emit('scene:playerSat', {
            userId: store.userId,
            seatId: opposite.id,
            x: opposite.x,
            y: opposite.y,
            direction: opposite.direction,
          });
        }
      }
    }
  }

  function capturePolaroidSnapshot() {
    gameEventBus.emit('scene:requestSnapshot', {
      quote: store.dailyQuote,
      moodLabel: `${store.currentMoodConfig.emoji} ${store.currentMoodConfig.label}`,
      nickname: store.nickname,
    });
  }

  async function fetchAnonymousMessages() {
    try {
      const res = await $fetch<{ messages: any[] }>(`${config.public.apiBase}/messages`);
      if (Array.isArray(res?.messages)) {
        store.anonymousMessages = res.messages;
      }
    } catch {
      // Keep default seeded messages when offline
    }
  }

  async function postAnonymousMessage(content: string, tag: string) {
    const clean = content.trim();
    if (!clean) return;
    if (sharedSocket?.connected) {
      sharedSocket.emit('board:post', {
        content: clean,
        tag: tag || `Từ ${store.currentZone}`,
      });
      return;
    }
    try {
      const res = await $fetch<{ message: any }>(`${config.public.apiBase}/messages`, {
        method: 'POST',
        body: {
          userId: store.userId,
          content: clean,
          tag: tag || `Từ ${store.currentZone}`,
        },
      });
      if (res?.message) {
        store.anonymousMessages.unshift(res.message);
        store.showToast('Đã ghim lời nhắn ẩn danh lên bảng thông điệp 📌');
      }
    } catch {
      store.anonymousMessages.unshift({
        id: `local_${Date.now()}`,
        userId: store.userId,
        content: clean,
        tag: tag || `Từ ${store.currentZone}`,
        reactions: { heart: 1, coffee: 0, sparkle: 0 },
        createdAt: new Date().toISOString(),
      });
      store.showToast('Đã ghim lời nhắn ẩn danh lên bảng thông điệp 📌');
    }
  }

  async function reactAnonymousMessage(noteId: string, type: 'heart' | 'coffee' | 'sparkle') {
    if (sharedSocket?.connected) {
      sharedSocket.emit('board:react', { noteId, type });
      return;
    }
    const target = store.anonymousMessages.find((m) => m.id === noteId);
    if (target) {
      target.reactions[type] += 1;
    }
  }

  return {
    connectSocket,
    switchRoom,
    setTypingStatus,
    sendChatMessage,
    sendEmote,
    orderDrink,
    updateProfileAndMood,
    setWorldCycle,
    triggerCoffeeTogether,
    acceptCoffeeInvite,
    encouragePlayer,
    sitWithPlayer,
    capturePolaroidSnapshot,
    fetchAnonymousMessages,
    postAnonymousMessage,
    reactAnonymousMessage,
  };
}
