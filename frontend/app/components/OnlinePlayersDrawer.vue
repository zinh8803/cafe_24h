<template>
  <aside class="multiplayer-layer kissaten-players-layer">
    <!-- 1. Realtime Coffee Together Invitation Banner (Thiệp mời nâng chén trà) -->
    <transition name="banner-slide">
      <div v-if="store.pendingCoffeeInvite" class="coffee-invite-banner washi-banner">
        <div class="invite-text">
          <span class="invite-icon">{{ store.pendingCoffeeInvite.drinkIcon || '🍵' }}</span>
          <div class="invite-info">
            <div class="invite-sender">
              <strong>{{ store.pendingCoffeeInvite.fromNickname }}</strong> muốn cụm ly trà cùng bạn!
            </div>
            <div class="invite-drink-label">
              Món: <em>{{ store.pendingCoffeeInvite.drinkName }}</em>
            </div>
          </div>
        </div>
        <div class="invite-actions">
          <button type="button" class="accept-btn hanko-accept" @click="acceptCoffeeInvite">
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

    <!-- 2. Selected Player Kissaten Pass Card (Thẻ khách lữ quán) -->
    <transition name="pop-card">
      <div v-if="selectedPlayer" class="selected-player-card kissaten-guest-card">
        <div class="card-top">
          <div class="player-badge">
            <span class="mood-avatar-ring">
              {{ getMoodEmoji(selectedPlayer.mood) }}
            </span>
            <div class="player-meta">
              <div class="p-name">
                {{ selectedPlayer.nickname }}
                <span v-if="selectedPlayer.isNpc" class="npc-badge">Barista</span>
                <span v-if="selectedPlayer.isStudying" class="study-badge">📚 Đang học bài</span>
              </div>
              <div class="p-sub">
                <span class="floor-tag">
                  {{ selectedPlayer.floor === 'rooftop' ? '🪜 Sân Thượng' : '🛋️ Tầng 1' }}
                </span>
                <span class="divider">•</span>
                <span>{{ getMoodLabel(selectedPlayer.mood) }}</span>
                <span v-if="selectedPlayer.drinkName" class="drink-tag">
                  • {{ selectedPlayer.drinkIcon }} {{ selectedPlayer.drinkName }}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="close-mini-btn"
            title="Đóng thẻ"
            @click="store.selectedPlayerId = ''"
          >
            ✕
          </button>
        </div>

        <div class="interaction-buttons">
          <button
            type="button"
            class="interact-btn primary-tea"
            @click="handleSitWith(selectedPlayer.userId)"
          >
            🪑 Ngồi Cùng Bàn
          </button>
          <button
            type="button"
            class="interact-btn"
            @click="handleInviteCoffee(selectedPlayer.userId)"
          >
            🍵 Mời Thức Uống
          </button>
          <button
            type="button"
            class="interact-btn throw-btn"
            :class="{ disabled: selectedPlayer.isStudying }"
            :disabled="selectedPlayer.isStudying"
            :title="selectedPlayer.isStudying ? 'Người này đang tập trung học bài 📚 (Miễn nhiễm ném ly)' : 'Ném ly'"
            @click="handleThrowCup(selectedPlayer.userId)"
          >
            {{ selectedPlayer.isStudying ? '🛡️ Miễn Nhiễm' : '🎯 Ném Ly' }}
          </button>
        </div>

        <div class="encourage-row">
          <span class="enc-label">Gửi lời chúc ấm:</span>
          <div class="enc-emojis">
            <button
              v-for="emo in ['👋', '🍵', '❤️', '🌸', '✨']"
              :key="emo"
              type="button"
              class="enc-emoji-btn"
              @click="encouragePlayer(selectedPlayer.userId, emo)"
            >
              {{ emo }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 3. Collapsible Online Players Sidebar (Sổ Khách Ghé Quán) -->
    <div class="online-drawer kissaten-drawer" :class="{ collapsed: !store.showOnlineDrawer }">
      <button
        type="button"
        class="drawer-header"
        @click="store.showOnlineDrawer = !store.showOnlineDrawer"
      >
        <div class="header-title">
          <span class="hanko-mini">👥</span>
          <span class="header-label">Khách Ghé Quán ({{ store.players.length }})</span>
        </div>
        <span class="toggle-arrow">{{ store.showOnlineDrawer ? '▾' : '▴' }}</span>
      </button>

      <div v-if="store.showOnlineDrawer" class="drawer-body">
        <div class="players-scroll">
          <div
            v-for="p in store.players"
            :key="p.userId"
            class="player-row washi-row"
            :class="{
              self: p.userId === store.userId,
              selected: store.selectedPlayerId === p.userId,
            }"
            @click="onClickPlayerRow(p.userId)"
          >
            <div class="row-avatar">
              <span class="avatar-emoji">{{ getMoodEmoji(p.mood) }}</span>
            </div>

            <div class="row-info">
              <div class="row-name">
                <span class="nickname">{{ p.nickname }}</span>
                <span v-if="p.userId === store.userId" class="you-badge">Bạn</span>
                <span v-if="p.isNpc" class="npc-mini">NPC</span>
              </div>
              <div class="row-meta">
                <span v-if="p.isTyping" class="typing-text">💬 đang viết...</span>
                <span v-else-if="p.isStudying" class="study-text">📚 Đang học</span>
                <span v-else-if="p.floor === 'rooftop'" class="rooftop-text">🪜 Sân Thượng</span>
                <span v-else-if="p.seatId" class="seat-text">🪑 Ghế {{ p.seatId }}</span>
                <span v-else class="wander-text">🚶 Dạo quán</span>
                <span v-if="p.drinkIcon" class="drink-mini"> • {{ p.drinkIcon }}</span>
              </div>
            </div>

            <div v-if="p.userId !== store.userId" class="row-actions">
              <button
                type="button"
                class="micro-btn invite"
                title="Mời ly đồ uống"
                @click.stop="handleInviteCoffee(p.userId)"
              >
                🍵
              </button>
              <button
                type="button"
                class="micro-btn throw"
                :title="p.isStudying ? 'Đang học bài (Miễn nhiễm)' : 'Ném ly'"
                @click.stop="p.isStudying ? store.showToast(`${p.nickname} đang tập trung học bài 📚, không thể ném ly!`) : handleThrowCup(p.userId)"
              >
                {{ p.isStudying ? '🛡️' : '🎯' }}
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
.kissaten-players-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 35;
}

/* 1. Realtime Coffee Together Banner */
.washi-banner {
  position: absolute;
  top: 76px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 2px solid #4a3221;
  border-radius: 20px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 18px;
  color: #120803;
  box-shadow: 0 16px 36px -4px rgba(43, 27, 17, 0.35);
  pointer-events: auto;
  max-width: 92vw;
  flex-wrap: wrap;
}

.invite-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.invite-icon {
  font-size: 30px;
}

.invite-sender {
  font-size: 13.5px;
  font-weight: 700;
  color: #120803;
}

.invite-drink-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #5c3a21;
}

.invite-actions {
  display: flex;
  gap: 8px;
}

.hanko-accept {
  background: #1b4332;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hanko-accept:hover {
  background: #2d6a4f;
  transform: translateY(-1px);
}

.decline-btn {
  background: #fdfbf7;
  color: #4a3221;
  border: 1.5px solid #5c3a21;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.decline-btn:hover {
  background: #faedcd;
  color: #120803;
}

/* 2. Selected Player Card */
.kissaten-guest-card {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: min(380px, 92vw);
  background: #ffffff;
  border: 2px solid #4a3221;
  border-radius: 22px;
  padding: 16px 18px;
  color: #120803;
  box-shadow: 0 20px 48px -4px rgba(43, 27, 17, 0.4);
  pointer-events: auto;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.player-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mood-avatar-ring {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #faedcd;
  border: 2px solid #5c3a21;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.player-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.p-name {
  font-size: 15.5px;
  font-weight: 800;
  color: #120803;
  display: flex;
  align-items: center;
  gap: 6px;
}

.npc-badge {
  background: #8b2500;
  color: #ffffff;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  font-weight: 800;
}

.study-badge {
  background: #d8f3dc;
  color: #0d3b1e;
  border: 1.5px solid #2d6a4f;
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
  font-weight: 800;
}

.p-sub {
  font-size: 12.5px;
  font-weight: 600;
  color: #4a3221;
  display: flex;
  align-items: center;
  gap: 5px;
}

.floor-tag {
  color: #1b4332;
  font-weight: 800;
}

.close-mini-btn {
  background: #fdfbf7;
  border: 1.5px solid #5c3a21;
  color: #120803;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.close-mini-btn:hover {
  background: #faedcd;
}

.interaction-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.interact-btn {
  flex: 1;
  background: #fdfbf7;
  border: 1.5px solid #5c3a21;
  color: #1a0f08;
  padding: 8px 10px;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: center;
}

.interact-btn:hover:not(:disabled) {
  background: #faedcd;
  border-color: #8b2500;
  transform: translateY(-1px);
}

.interact-btn.primary-tea {
  background: #1b4332;
  border-color: #1b4332;
  color: #ffffff;
}

.interact-btn.primary-tea:hover {
  background: #2d6a4f;
}

.interact-btn.throw-btn.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #e9ecef;
}

.encourage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1.5px solid #d4c5b2;
}

.enc-label {
  font-size: 12px;
  font-weight: 700;
  color: #4a3221;
}

.enc-emojis {
  display: flex;
  gap: 4px;
}

.enc-emoji-btn {
  background: transparent;
  border: none;
  font-size: 17px;
  padding: 4px 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s;
}

.enc-emoji-btn:hover {
  transform: scale(1.25);
  background: #faedcd;
}

/* 3. Online Players Sidebar (Kissaten Guestbook) */
.kissaten-drawer {
  position: absolute;
  top: 72px;
  right: 16px;
  width: 250px;
  background: #ffffff;
  border: 2px solid #4a3221;
  border-radius: 18px;
  box-shadow: 0 16px 36px -4px rgba(43, 27, 17, 0.35);
  pointer-events: auto;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.kissaten-drawer.collapsed {
  width: auto;
}

.drawer-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  color: #120803;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  text-align: left;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hanko-mini {
  width: 20px;
  height: 20px;
  background: #b91c1c;
  color: #fff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: serif;
}

.toggle-arrow {
  color: #5c3a21;
  font-size: 14px;
  font-weight: 900;
}

.drawer-body {
  padding: 0 10px 10px 10px;
}

.players-scroll {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 2px;
}

.players-scroll::-webkit-scrollbar {
  width: 4px;
}
.players-scroll::-webkit-scrollbar-thumb {
  background: #8c6239;
  border-radius: 4px;
}

.washi-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 12px;
  background: #fdfbf7;
  border: 1.5px solid #d4c5b2;
  cursor: pointer;
  transition: all 0.16s ease;
}

.washi-row:hover {
  background: #faedcd;
  border-color: #8b2500;
}

.washi-row.selected {
  background: #fefae0;
  border-color: #1b4332;
}

.row-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #faedcd;
  border: 1.5px solid #5c3a21;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.row-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-name {
  font-size: 12.5px;
  font-weight: 800;
  color: #120803;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nickname {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.you-badge {
  background: #d8f3dc;
  color: #0d3b1e;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 999px;
  border: 1px solid #2d6a4f;
}

.npc-mini {
  background: #8b2500;
  color: #ffffff;
  font-size: 9.5px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 999px;
}

.row-meta {
  font-size: 11px;
  font-weight: 600;
  color: #4a3221;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.typing-text { color: #8b2500; font-weight: 800; }
.study-text { color: #0d3b1e; font-weight: 800; }
.rooftop-text { color: #1b4332; font-weight: 800; }

.row-actions {
  display: flex;
  gap: 4px;
}

.micro-btn {
  background: #ffffff;
  border: 1.5px solid #5c3a21;
  font-size: 11.5px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.12s;
}

.micro-btn:hover {
  transform: scale(1.18);
  background: #faedcd;
}

/* Animations */
.banner-slide-enter-active,
.banner-slide-leave-active,
.pop-card-enter-active,
.pop-card-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.banner-slide-enter-from,
.banner-slide-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}

.pop-card-enter-from,
.pop-card-leave-to {
  transform: translate(-50%, 20px) scale(0.96);
  opacity: 0;
}

@media (max-width: 768px) {
  .kissaten-drawer {
    display: none;
  }
}
</style>
