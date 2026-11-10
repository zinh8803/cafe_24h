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
      isStudying: store.isStudying,
    };

    const baristaPlayer: PlayerNetState = {
      userId: 'npc_barista',
      nickname: 'Barista Minh ☕',
      avatarId: 'av_quiet_reader',
      outfitId: 'outfit_flannel',
      mood: 'coffee_lover',
      roomId: store.currentRoomId,
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

    return {
      selfUserId: store.userId,
      worldCycle: store.worldCycle,
      players: [selfPlayer, baristaPlayer],
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
          self.floor = payload.floor || store.currentFloor;
        }
        if (sharedSocket?.connected) {
          sharedSocket.emit('player:move', {
            ...payload,
            floor: payload.floor || store.currentFloor,
          });
        }
      });

      gameEventBus.on('client:floorChanged', ({ floor }) => {
        store.currentFloor = floor;
        const self = store.players.find((p) => p.userId === store.userId);
        if (self) {
          self.floor = floor;
        }
        if (floor === 'rooftop') {
          store.currentZone = 'Sân Thượng';
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

      gameEventBus.on('client:throwDirection', ({ targetX, targetY }) => {
        throwCupDirection(targetX, targetY);
      });

      gameEventBus.on('client:aimModeChanged', ({ isAiming }) => {
        store.isAimingThrow = isAiming;
      });

      gameEventBus.on('client:toggleAim', () => {
        store.toggleAimThrow();
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
        if (payload.floor) {
          p.floor = payload.floor;
        }
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

    socket.on('barista:order', (payload) => {
      gameEventBus.emit('scene:baristaOrder', payload);
    });

    socket.on('player:studyChanged', ({ userId, isStudying }) => {
      const p = store.players.find((item) => item.userId === userId);
      if (p) {
        p.isStudying = isStudying;
      }
      if (userId === store.userId) {
        store.isStudying = isStudying;
      }
      gameEventBus.emit('scene:playerStudyChanged', { userId, isStudying });
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

    socket.on('cup:thrown', (payload) => {
      gameEventBus.emit('scene:cupThrown', payload);

      setTimeout(() => {
        const reactionText = payload.dodged ? 'Né đẹp! Hụt rồi nhé 😜' : 'Đau quá!';
        if (!store.mutedUserIds.includes(payload.toUserId)) {
          store.chats.push({
            id: `cup_hit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId: payload.toUserId,
            nickname: payload.toNickname,
            content: reactionText,
            createdAt: new Date().toISOString(),
          });
          if (store.chats.length > 60) store.chats.shift();
        }

        if (payload.dodged) {
          if (payload.toUserId === store.userId) {
            store.showToast(
              `💨 Bạn vừa phản xạ né gọn chiếc ly ${payload.drinkIcon} từ ${payload.fromNickname}!`,
            );
          } else {
            store.showToast(
              `💨 ${payload.toNickname} vừa né gọn chiếc ly ${payload.drinkIcon} của ${payload.fromNickname}!`,
            );
          }
        } else if (payload.toUserId === store.userId) {
          store.showToast(
            `💥 ${payload.fromNickname} vừa ném ly ${payload.drinkIcon} trúng bạn: "Đau quá!"`,
          );
        } else {
          store.showToast(
            `🎯 ${payload.fromNickname} vừa ném ly ${payload.drinkIcon} trúng ${payload.toNickname}: "Đau quá!"`,
          );
        }
      }, 520);
    });

    socket.on('cup:thrownDirection', (payload) => {
      gameEventBus.emit('scene:cupThrownDirection', payload);

      setTimeout(() => {
        if (payload.hitUserId) {
          const reactionText = payload.dodged ? 'Né đẹp! Hụt rồi nhé 😜' : 'Đau quá!';
          if (!store.mutedUserIds.includes(payload.hitUserId)) {
            store.chats.push({
              id: `cup_dir_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              userId: payload.hitUserId,
              nickname: payload.hitNickname,
              content: reactionText,
              createdAt: new Date().toISOString(),
            });
            if (store.chats.length > 60) store.chats.shift();
          }

          if (payload.dodged) {
            if (payload.hitUserId === store.userId) {
              store.showToast(
                `💨 Bạn vừa phản xạ né gọn chiếc ly ${payload.drinkIcon} từ ${payload.fromNickname}!`,
              );
            } else {
              store.showToast(
                `💨 ${payload.hitNickname} vừa né gọn chiếc ly ${payload.drinkIcon} của ${payload.fromNickname}!`,
              );
            }
          } else if (payload.hitUserId === store.userId) {
            store.showToast(
              `💥 ${payload.fromNickname} vừa ném ly ${payload.drinkIcon} trúng bạn: "Đau quá!"`,
            );
          } else {
            store.showToast(
              `🎯 ${payload.fromNickname} vừa ném ly ${payload.drinkIcon} trúng ${payload.hitNickname}: "Đau quá!"`,
            );
          }
        } else {
          if (payload.fromUserId === store.userId) {
            store.showToast(`🎯 Bạn vừa ném chiếc ly ${payload.drinkIcon} về phía sàn vỡ toang!`);
          } else {
            store.showToast(
              `🎯 ${payload.fromNickname} vừa ném chiếc ly ${payload.drinkIcon} rơi xuống sàn vỡ toang!`,
            );
          }
        }
      }, 500);
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
      const self = store.players.find((p) => p.userId === store.userId);
      gameEventBus.emit('scene:baristaOrder', {
        orderId: `ord_${Date.now()}`,
        userId: store.userId,
        userNickname: store.nickname,
        targetX: self?.x ?? 580,
        targetY: self?.y ?? 650,
        seatId: self?.seatId ?? null,
        drinkId: drink.id,
        drinkIcon: drink.icon,
        drinkName: drink.name,
      });
      gameEventBus.emit('scene:playerDrank', {
        userId: store.userId,
        drinkId: drink.id,
        drinkIcon: drink.icon,
        drinkName: drink.name,
      });
    }
    store.showToast(`Đã gọi ${drink.icon} ${drink.name}! Barista sẽ pha chế và giao tới bàn ☕`);
  }

  function setStudyMode(isStudying: boolean) {
    store.isStudying = isStudying;
    const self = store.players.find((p) => p.userId === store.userId);
    if (self) {
      self.isStudying = isStudying;
    }
    if (sharedSocket?.connected) {
      sharedSocket.emit('player:study', { isStudying });
    } else {
      gameEventBus.emit('scene:playerStudyChanged', {
        userId: store.userId,
        isStudying,
      });
    }
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

  function throwStraightForward() {
    const self = store.players.find((p) => p.userId === store.userId);
    const startX = self?.x || 580;
    const startY = self?.y || 650;
    const dir = self?.direction || 'up';

    let targetX = startX;
    let targetY = startY;
    const throwDist = 280;

    if (dir === 'up') targetY -= throwDist;
    else if (dir === 'down') targetY += throwDist;
    else if (dir === 'left') targetX -= throwDist;
    else if (dir === 'right') targetX += throwDist;

    store.toggleAimThrow(false);
    throwCupDirection(targetX, targetY);
  }

  function throwCupDirection(targetX: number, targetY: number) {
    if (sharedSocket?.connected) {
      sharedSocket.emit('cup:throwDirection', { targetX, targetY });
    } else {
      const self = store.players.find((p) => p.userId === store.userId);
      const startX = self?.x || 580;
      const startY = self?.y || 650;
      let tx = targetX;
      let ty = targetY;
      const dx = tx - startX;
      const dy = ty - startY;
      const dist = Math.hypot(dx, dy);
      if (dist < 10) return;

      const maxRange = 600;
      if (dist > maxRange) {
        tx = startX + (dx / dist) * maxRange;
        ty = startY + (dy / dist) * maxRange;
      }

      let bestHit: any = null;
      for (const p of store.players) {
        if (p.userId === store.userId) continue;
        if (p.isStudying) continue; // Immune to flying cups while studying!
        const l2 = (tx - startX) * (tx - startX) + (ty - startY) * (ty - startY);
        let t = ((p.x - startX) * (tx - startX) + (p.y - startY) * (ty - startY)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = startX + t * (tx - startX);
        const projY = startY + t * (ty - startY);
        const d = Math.hypot(p.x - projX, p.y - projY);

        if (t > 0.04 && t <= 1.0 && d <= 38) {
          if (!bestHit || t < bestHit.t) {
            bestHit = { player: p, t };
          }
        }
      }

      const drink = store.currentDrinkConfig;
      const dodged = Math.random() < 0.4;
      const payload = {
        fromUserId: store.userId,
        fromNickname: store.nickname,
        startX,
        startY,
        targetX: bestHit ? bestHit.player.x : Math.round(tx),
        targetY: bestHit ? bestHit.player.y : Math.round(ty),
        hitUserId: bestHit ? bestHit.player.userId : null,
        hitNickname: bestHit ? bestHit.player.nickname : null,
        dodged: bestHit ? dodged : false,
        drinkIcon: drink.icon,
        drinkName: drink.name,
      };

      gameEventBus.emit('scene:cupThrownDirection', payload);

      setTimeout(() => {
        if (payload.hitUserId) {
          store.chats.push({
            id: `cup_dir_${Date.now()}`,
            userId: payload.hitUserId,
            nickname: payload.hitNickname!,
            content: dodged ? 'Né đẹp! Hụt rồi nhé 😜' : 'Đau quá!',
            createdAt: new Date().toISOString(),
          });
          if (dodged) {
            store.showToast(`💨 ${payload.hitNickname} vừa né gọn chiếc ly ${drink.icon}!`);
          } else {
            store.showToast(`🎯 Bạn vừa ném ly ${drink.icon} trúng ${payload.hitNickname}: "Đau quá!"`);
          }
        } else {
          store.showToast(`🎯 Chiếc ly ${drink.icon} rơi trúng sàn vỡ toang!`);
        }
      }, 500);
    }
  }

  function throwCup(targetUserId: string) {
    if (!targetUserId || targetUserId === store.userId) return;
    const target = store.players.find((p) => p.userId === targetUserId);
    if (target?.isStudying) {
      store.showToast(`${target.nickname} đang tập trung học bài 📚, không thể ném ly!`);
      return;
    }
    if (sharedSocket?.connected) {
      sharedSocket.emit('cup:throw', { targetUserId });
    } else {
      if (!target) return;
      const drink = store.currentDrinkConfig;
      const dodged = Math.random() < 0.4;
      const payload = {
        fromUserId: store.userId,
        fromNickname: store.nickname,
        toUserId: target.userId,
        toNickname: target.nickname,
        drinkIcon: drink.icon,
        drinkName: drink.name,
        dodged,
      };
      gameEventBus.emit('scene:cupThrown', payload);
      setTimeout(() => {
        store.chats.push({
          id: `cup_hit_${Date.now()}`,
          userId: target.userId,
          nickname: target.nickname,
          content: dodged ? 'Né đẹp! Hụt rồi nhé 😜' : 'Đau quá!',
          createdAt: new Date().toISOString(),
        });
        if (dodged) {
          store.showToast(
            `💨 ${target.nickname} vừa né gọn chiếc ly ${drink.icon} của ${store.nickname}!`,
          );
        } else {
          store.showToast(
            `🎯 ${store.nickname} vừa ném ly ${drink.icon} trúng ${target.nickname}: "Đau quá!"`,
          );
        }
      }, 520);
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
    setStudyMode,
    updateProfileAndMood,
    setWorldCycle,
    triggerCoffeeTogether,
    acceptCoffeeInvite,
    encouragePlayer,
    throwCup,
    throwCupDirection,
    throwStraightForward,
    sitWithPlayer,
    capturePolaroidSnapshot,
    fetchAnonymousMessages,
    postAnonymousMessage,
    reactAnonymousMessage,
  };
}
