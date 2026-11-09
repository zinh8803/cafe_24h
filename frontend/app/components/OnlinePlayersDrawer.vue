<template>
  <aside class="multiplayer-layer">
    <!-- 1. Incoming Realtime Coffee Together Invitation Banner -->
    <transition name="slide-down">
      <div v-if="store.pendingCoffeeInvite" class="coffee-invite-banner">
        <div class="invite-text">
          <span class="invite-icon">{{ store.pendingCoffeeInvite.drinkIcon || '☕' }}</span>
          <div>
            <strong>{{ store.pendingCoffeeInvite.fromNickname }}</strong>
            mời bạn cùng thưởng thức
            <em>{{ store.pendingCoffeeInvite.drinkName }}</em>!
          </div>
        </div>
        <div class="invite-actions">
          <button type="button" class="accept-btn" @click="acceptCoffeeInvite">
            🥂 Đồng Ý Cụm Ly
          </button>
          <button
            type="button"
            class="decline-btn"
            @click="store.pendingCoffeeInvite = null"
          >
            Để sau
          </button>
        </div>
      </div>
    </transition>

    <!-- 2. Selected Player Direct Interaction Card (when clicking a character on map or list) -->
    <transition name="pop">
      <div v-if="selectedPlayer" class="selected-player-card">
        <div class="card-top">
          <div class="player-badge">
            <span class="mood-emoji">{{ getMoodEmoji(selectedPlayer.mood) }}</span>
            <div>
              <div class="p-name">
                {{ selectedPlayer.nickname }}
                <span v-if="selectedPlayer.isNpc" class="npc-tag">NPC</span>
              </div>
              <div class="p-sub">
                {{ getMoodLabel(selectedPlayer.mood) }}
                <span v-if="selectedPlayer.drinkName">
                  • {{ selectedPlayer.drinkIcon }} {{ selectedPlayer.drinkName }}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="close-mini"
            @click="store.selectedPlayerId = ''"
          >
            ✕
          </button>
        </div>

        <div class="interaction-buttons">
          <button
            type="button"
            class="interact-btn primary"
            @click="handleSitWith(selectedPlayer.userId)"
          >
            🪑 Ngồi Cùng Bàn
          </button>
          <button
            type="button"
            class="interact-btn"
            @click="handleInviteCoffee(selectedPlayer.userId)"
          >
            ☕ Mời Đồ Uống
          </button>
          <button
            type="button"
            class="interact-btn throw-btn"
            @click="handleThrowCup(selectedPlayer.userId)"
          >
            🎯 Ném Ly
          </button>
        </div>

        <div class="encourage-row">
          <span class="enc-label">Gửi động viên:</span>
          <button
            v-for="emo in ['👋', '❤️', '☕', '✨', '🌸']"
            :key="emo"
            type="button"
            class="enc-emoji-btn"
            @click="encouragePlayer(selectedPlayer.userId, emo)"
          >
            {{ emo }}
          </button>
        </div>
      </div>
    </transition>

    <!-- 3. Collapsible Live Online Players Sidebar -->
    <div class="online-drawer" :class="{ collapsed: !store.showOnlineDrawer }">
      <div class="drawer-header" @click="store.showOnlineDrawer = !store.showOnlineDrawer">
        <div class="header-title">
          <span class="live-pulse" :class="{ active: store.connected }" />
          <span>Khách Trong Phòng ({{ store.players.length }})</span>
        </div>
        <span class="toggle-arrow">{{ store.showOnlineDrawer ? '▾' : '▴' }}</span>
      </div>

      <div v-if="store.showOnlineDrawer" class="drawer-body">
        <!-- Players List -->
        <div class="players-scroll">
          <div
            v-for="p in store.players"
            :key="p.userId"
            class="player-row"
            :class="{
              self: p.userId === store.userId,
              selected: store.selectedPlayerId === p.userId,
            }"
            @click="onClickPlayerRow(p.userId)"
          >
            <span class="row-mood">{{ getMoodEmoji(p.mood) }}</span>
            <div class="row-info">
              <div class="row-name">
                {{ p.nickname }}
                <span v-if="p.userId === store.userId" class="you-badge">Bạn</span>
              </div>
              <div class="row-meta">
                <span v-if="p.isTyping" class="typing-text">💬 đang gõ...</span>
                <span v-else-if="p.seatId">🪑 Ghế {{ p.seatId }}</span>
                <span v-else>🚶 Đang dạo quán</span>
                <span v-if="p.drinkIcon"> • {{ p.drinkIcon }}</span>
              </div>
            </div>
            <div v-if="p.userId !== store.userId" class="row-actions">
              <button
                type="button"
                class="quick-wave-btn"
                title="Mời cà phê"
                @click.stop="handleInviteCoffee(p.userId)"
              >
                ☕
              </button>
              <button
                type="button"
                class="quick-wave-btn throw-mini"
                title="Ném ly qua người này"
                @click.stop="handleThrowCup(p.userId)"
              >
                🎯
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MOOD_OPTIONS } from '@game/assets/cafeCatalog';
import { useCafeSocket } from '~/composables/useCafeSocket';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const {
  triggerCoffeeTogether,
  acceptCoffeeInvite,
  encouragePlayer,
  throwCup,
  throwCupDirection,
  sitWithPlayer,
} = useCafeSocket();

const selectedPlayer = computed(() => store.selectedPlayer);

function getMoodEmoji(moodId: string): string {
  return MOOD_OPTIONS.find((m) => m.id === moodId)?.emoji || '😌';
}

function getMoodLabel(moodId: string): string {
  return MOOD_OPTIONS.find((m) => m.id === moodId)?.label || 'Bình yên';
}

function onClickPlayerRow(userId: string) {
  if (userId === store.userId) {
    store.showCustomizerModal = true;
  } else {
    store.selectedPlayerId = store.selectedPlayerId === userId ? '' : userId;
  }
}

function handleSitWith(targetUserId: string) {
  sitWithPlayer(targetUserId);
}

function handleInviteCoffee(targetUserId: string) {
  triggerCoffeeTogether(targetUserId);
}

function handleThrowCup(targetUserId: string) {
  const target = store.players.find((p) => p.userId === targetUserId);
  if (target) {
    throwCupDirection(target.x, target.y);
  } else {
    throwCup(targetUserId);
  }
}
</script>

<style scoped>
.multiplayer-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 35;
}

.coffee-invite-banner {
  position: absolute;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #2d1e14, #1f150e);
  border: 1.5px solid #fbbf24;
  border-radius: 18px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fffbeb;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.65);
  pointer-events: auto;
  max-width: 92vw;
  flex-wrap: wrap;
}

.invite-text {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
}

.invite-icon {
  font-size: 26px;
}

.invite-actions {
  display: flex;
  gap: 8px;
}

.accept-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #1c130e;
  border: none;
  border-radius: 999px;
  padding: 7px 14px;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
}

.decline-btn {
  background: transparent;
  color: #d6ccc2;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  cursor: pointer;
}

.selected-player-card {
  position: absolute;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  width: min(360px, 92vw);
  background: rgba(24, 17, 13, 0.95);
  border: 1px solid rgba(251, 191, 36, 0.48);
  border-radius: 18px;
  padding: 14px 16px;
  color: #f8f5f0;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.6);
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 11px;
}

.player-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mood-emoji {
  font-size: 26px;
  background: rgba(255, 255, 255, 0.06);
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.p-name {
  font-weight: 700;
  font-size: 14.5px;
  color: #fef3c7;
  display: flex;
  align-items: center;
  gap: 6px;
}

.npc-tag {
  font-size: 10px;
  background: rgba(212, 163, 115, 0.25);
  color: #fde68a;
  padding: 1px 6px;
  border-radius: 999px;
}

.p-sub {
  font-size: 12px;
  color: #cbb8a4;
  margin-top: 2px;
}

.close-mini {
  background: transparent;
  border: none;
  color: #a89f91;
  cursor: pointer;
  font-size: 14px;
}

.interaction-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.interact-btn {
  background: #2f2219;
  border: 1px solid rgba(212, 163, 115, 0.35);
  color: #faedcd;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.interact-btn.primary {
  background: #d4a373;
  color: #1c130e;
  border-color: #fbbf24;
}

.interact-btn.throw-btn {
  grid-column: span 2;
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(248, 113, 113, 0.45);
  color: #fecaca;
}

.interact-btn.throw-btn:hover {
  background: rgba(239, 68, 68, 0.32);
}

.encourage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 8px;
}

.enc-label {
  font-size: 11.5px;
  color: #b09b88;
}

.enc-emoji-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 32px;
  height: 30px;
  cursor: pointer;
  font-size: 14px;
}

.enc-emoji-btn:hover {
  transform: scale(1.12);
  background: rgba(212, 163, 115, 0.3);
}

.online-drawer {
  position: absolute;
  top: 62px;
  right: 14px;
  width: 256px;
  background: rgba(20, 15, 12, 0.9);
  border: 1px solid rgba(212, 163, 115, 0.35);
  border-radius: 16px;
  color: #f8f5f0;
  pointer-events: auto;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.drawer-header {
  padding: 10px 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 700;
  color: #fef3c7;
  background: rgba(34, 25, 19, 0.85);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
}

.live-pulse.active {
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}

.drawer-body {
  padding: 9px 10px 11px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.players-scroll {
  max-height: 225px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.14s ease;
}

.player-row:hover,
.player-row.selected {
  background: rgba(212, 163, 115, 0.18);
  border-color: rgba(251, 191, 36, 0.4);
}

.row-mood {
  font-size: 18px;
}

.row-info {
  flex: 1;
  min-width: 0;
}

.row-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #fffbeb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 5px;
}

.you-badge {
  font-size: 9.5px;
  background: #d4a373;
  color: #1c130e;
  padding: 1px 5px;
  border-radius: 999px;
  font-weight: 700;
}

.row-meta {
  font-size: 11px;
  color: #b09b88;
}

.typing-text {
  color: #fbbf24;
  font-weight: 600;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-wave-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 13px;
}

.quick-wave-btn:hover {
  background: #d4a373;
}

.quick-wave-btn.throw-mini:hover {
  background: rgba(239, 68, 68, 0.45);
  border-color: rgba(248, 113, 113, 0.65);
}

@media (max-width: 820px) {
  .online-drawer {
    width: 210px;
  }
}
</style>

