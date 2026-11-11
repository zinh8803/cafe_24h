<template>
  <footer class="cafe-bottom-bar kissaten-bottom-bar">
    <!-- Collapsible Chat History Drawer (Sổ trò chuyện Kissaten) -->
    <transition name="drawer-slide">
      <div v-if="showChatLog" class="chat-history-panel washi-paper-drawer">
        <div class="chat-panel-header">
          <div class="header-left">
            <span class="chat-header-title">📜 Trò chuyện tại {{ store.currentRoomName }}</span>
            <span class="chat-newest-badge">Mới nhất trên đầu</span>
          </div>
          <button type="button" class="close-mini-btn" @click="showChatLog = false">
            ✕ Thu gọn
          </button>
        </div>

        <div class="chat-messages-scroll">
          <div v-if="store.visibleChats.length === 0" class="empty-chat-hint">
            <span class="empty-icon">🍵</span>
            <p>Quán đang rất thanh tịnh... Hãy gửi một lời chào hoặc thưởng thức một tách trà nhé.</p>
          </div>
          <div
            v-for="msg in store.visibleChats"
            :key="msg.id"
            class="chat-bubble-row"
            :class="{ isSelf: msg.userId === store.userId }"
          >
            <div class="bubble-content">
              <span class="bubble-author">{{ msg.nickname }}</span>
              <span class="bubble-text">{{ msg.content }}</span>
            </div>
            <button
              v-if="msg.userId !== store.userId"
              type="button"
              class="mute-user-btn"
              title="Ẩn tin nhắn từ người này"
              @click="store.toggleMuteUser(msg.userId)"
            >
              🔇
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Japanese Kissaten Bento Tray Dock -->
    <div class="dock-main-row bento-tray-dock">
      <!-- Left Quick Actions -->
      <div class="dock-actions">
        <button
          type="button"
          class="dock-btn kissaten-tab"
          :class="{ active: showChatLog }"
          title="Mở sổ trò chuyện"
          @click="showChatLog = !showChatLog"
        >
          <span class="dock-icon">📜</span>
          <span class="dock-label">Trò chuyện</span>
          <span v-if="store.visibleChats.length" class="chat-counter-badge">
            {{ store.visibleChats.length }}
          </span>
        </button>

        <button
          type="button"
          class="dock-btn highlight-drink kissaten-tab"
          title="Gọi món từ Barista Minh"
          @click="store.showDrinkModal = true"
        >
          <span class="dock-icon pulse-drink">{{ store.currentDrinkConfig.icon }}</span>
          <span class="dock-label">Thực Đơn</span>
        </button>

        <!-- Ném Ly (Aim Mode F) -->
        <div class="throw-group">
          <button
            type="button"
            class="dock-btn throw-aim-btn kissaten-tab"
            :class="{ active: store.isAimingThrow }"
            :title="store.isAimingThrow ? 'Nhấp để ném ngay phía trước, hoặc click chuột vào sàn quán' : 'Bật nhắm để ném ly có định hướng (Phím tắt: F hoặc click chuột phải)'"
            @click="onThrowBtnClick"
          >
            <span class="dock-icon">🎯</span>
            <span class="dock-label">{{ store.isAimingThrow ? 'Ném Ngay' : 'Ném Ly' }}</span>
            <span class="shortcut-key">F</span>
          </button>
          <button
            v-if="store.isAimingThrow"
            type="button"
            class="cancel-aim-btn"
            title="Huỷ nhắm (ESC)"
            @click.stop="store.toggleAimThrow(false)"
          >
            ✕
          </button>
        </div>

        <button
          type="button"
          class="dock-btn kissaten-tab"
          title="Nâng ly trà cùng mọi người trong phòng"
          @click="triggerCoffeeTogether"
        >
          <span class="dock-icon">🥂</span>
          <span class="dock-label">Cụm Ly</span>
        </button>

        <button
          type="button"
          class="dock-btn kissaten-tab"
          title="Xem bảng thẻ thông điệp ẩn danh"
          @click="openBoard"
        >
          <span class="dock-icon">🎏</span>
          <span class="dock-label">Thẻ Lời Nhắn</span>
        </button>
      </div>

      <!-- Center Chat Input (Giấy thư Washi) -->
      <form class="chat-form washi-chat-form" @submit.prevent="handleSend">
        <input
          v-model="draft"
          type="text"
          maxlength="120"
          placeholder="Nhắn nhủ điều gì đó với quán (Enter để gửi)..."
          class="chat-input"
          @input="onTypingInput"
          @blur="onStopTyping"
        />
        <button type="submit" class="send-btn hanko-send-btn" title="Gửi lời nhắn">
          <span class="hanko-icon">➤</span>
        </button>
      </form>

      <!-- Right Quick Tactile Emojis (Trà đạo & Ghibli) -->
      <div class="emoji-strip kissaten-emoji-tray">
        <button
          v-for="emo in quickEmojis"
          :key="emo"
          type="button"
          class="emoji-btn"
          @click="sendEmote(emo)"
        >
          {{ emo }}
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCafeSocket } from '~/composables/useCafeSocket';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const {
  setTypingStatus,
  sendChatMessage,
  sendEmote,
  triggerCoffeeTogether,
  fetchAnonymousMessages,
  throwStraightForward,
} = useCafeSocket();

const draft = ref('');
const showChatLog = ref(false);
const quickEmojis = ['🍵', '☕', '🍡', '🌸', '✨', '🐱'];
let typingTimer: ReturnType<typeof setTimeout> | null = null;

function onTypingInput() {
  const hasText = draft.value.trim().length > 0;
  setTypingStatus(hasText);
  if (typingTimer) clearTimeout(typingTimer);
  if (hasText) {
    typingTimer = setTimeout(() => {
      setTypingStatus(false);
    }, 2200);
  }
}

function onStopTyping() {
  if (typingTimer) clearTimeout(typingTimer);
  setTypingStatus(false);
}

function handleSend() {
  if (!draft.value.trim()) return;
  if (typingTimer) clearTimeout(typingTimer);
  setTypingStatus(false);
  sendChatMessage(draft.value);
  draft.value = '';
}

function onThrowBtnClick() {
  if (store.isAimingThrow) {
    throwStraightForward();
  } else {
    store.toggleAimThrow(true);
  }
}

function openBoard() {
  fetchAnonymousMessages();
  store.showAnonymousBoardModal = true;
}
</script>

<style scoped>
.kissaten-bottom-bar {
  position: absolute;
  bottom: 14px;
  left: 16px;
  right: 16px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

/* Washi Paper Chat History Drawer */
.washi-paper-drawer {
  width: min(580px, 95vw);
  max-height: 290px;
  background: #ffffff;
  border: 2px solid #4a3221;
  border-radius: 20px;
  padding: 14px 18px;
  pointer-events: auto;
  box-shadow: 0 16px 40px -8px rgba(43, 27, 17, 0.35);
  display: flex;
  flex-direction: column;
}

.chat-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1.5px solid #d4c5b2;
  margin-bottom: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-header-title {
  font-size: 14px;
  font-weight: 800;
  color: #120803;
  letter-spacing: -0.01em;
}

.chat-newest-badge {
  font-size: 11px;
  font-weight: 800;
  color: #0d3b1e;
  background: #d8f3dc;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #2d6a4f;
}

.close-mini-btn {
  background: #fdfbf7;
  border: 1.5px solid #5c3a21;
  color: #1a0f08;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-mini-btn:hover {
  background: #faedcd;
  color: #8b2500;
}

.chat-messages-scroll {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.chat-messages-scroll::-webkit-scrollbar {
  width: 5px;
}
.chat-messages-scroll::-webkit-scrollbar-thumb {
  background: #8c6239;
  border-radius: 4px;
}

.empty-chat-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  color: #4a3221;
  font-size: 13.5px;
  font-weight: 600;
  text-align: center;
  gap: 6px;
}

.empty-icon {
  font-size: 26px;
}

.chat-bubble-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  background: #fdfbf7;
  border: 1.5px solid #d4c5b2;
  border-radius: 12px;
  padding: 8px 12px;
}

.chat-bubble-row.isSelf {
  background: #fefae0;
  border-color: #8c6239;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bubble-author {
  font-size: 11.5px;
  font-weight: 800;
  color: #8b2500;
}

.chat-bubble-row.isSelf .bubble-author {
  color: #1b4332;
}

.bubble-text {
  font-size: 13.5px;
  color: #120803;
  font-weight: 600;
  line-height: 1.45;
  word-break: break-word;
}

.mute-user-btn {
  background: transparent;
  border: none;
  font-size: 13px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.mute-user-btn:hover {
  opacity: 1;
}

/* Transitions */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateY(20px) scale(0.97);
  opacity: 0;
}

/* Bento Tray Dock - High Contrast Solid Wood */
.bento-tray-dock {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 2px solid #4a3221;
  border-radius: 24px;
  padding: 8px 14px;
  box-shadow: 0 16px 36px -4px rgba(43, 27, 17, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  pointer-events: auto;
  max-width: 98vw;
  flex-wrap: wrap;
  justify-content: center;
}

.dock-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kissaten-tab {
  background: #fdfbf7;
  border: 1.5px solid #5c3a21;
  color: #1a0f08;
  padding: 8px 13px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.kissaten-tab:hover {
  background: #faedcd;
  border-color: #8b2500;
  color: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 27, 17, 0.2);
}

.kissaten-tab.active {
  background: #1b4332;
  border-color: #1b4332;
  color: #ffffff;
}

.dock-icon {
  font-size: 15px;
}

.chat-counter-badge {
  background: #8b2500;
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 900;
  padding: 1px 6px;
  border-radius: 999px;
  margin-left: 2px;
}

.highlight-drink {
  background: #e8f5e9;
  border-color: #1b4332;
  color: #0d3b1e;
  font-weight: 800;
}

.highlight-drink:hover {
  background: #c8e6c9;
  border-color: #0d3b1e;
}

.throw-group {
  display: flex;
  align-items: center;
}

.throw-aim-btn {
  background: #fff1f2;
  border-color: #b91c1c;
  color: #881337;
  font-weight: 800;
}

.throw-aim-btn.active {
  background: #b91c1c;
  border-color: #7f1d1d;
  color: #ffffff;
  animation: aimPulse 1.6s infinite ease-in-out;
}

@keyframes aimPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(185, 28, 28, 0.5); }
  50% { box-shadow: 0 0 0 6px rgba(185, 28, 28, 0); }
}

.shortcut-key {
  font-size: 10.5px;
  font-weight: 900;
  background: #4a3221;
  padding: 1px 6px;
  border-radius: 4px;
  color: #ffffff;
  margin-left: 2px;
}

.cancel-aim-btn {
  background: #b91c1c;
  color: #ffffff;
  border: none;
  border-radius: 0 12px 12px 0;
  padding: 8px 9px;
  margin-left: -4px;
  font-size: 11px;
  cursor: pointer;
  font-weight: 800;
}

/* Washi Chat Input Bar */
.washi-chat-form {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 280px;
  flex: 1;
}

.chat-input {
  width: 100%;
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-radius: 16px;
  padding: 9px 44px 9px 14px;
  color: #120803;
  font-size: 13.5px;
  font-weight: 600;
  outline: none;
  transition: all 0.2s ease;
}

.chat-input:focus {
  border-color: #1b4332;
  box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.25);
  background: #ffffff;
}

.chat-input::placeholder {
  color: #6b5344;
}

.hanko-send-btn {
  position: absolute;
  right: 6px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid #7f1d1d;
  background: #b91c1c;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  box-shadow: 0 2px 6px rgba(185, 28, 28, 0.4);
}

.hanko-send-btn:hover {
  background: #dc2626;
  transform: scale(1.08) rotate(3deg);
}

.hanko-icon {
  font-family: serif;
  font-weight: 900;
  font-size: 13.5px;
}

/* Emoji Tray */
.kissaten-emoji-tray {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fdfbf7;
  padding: 3px;
  border-radius: 16px;
  border: 1.5px solid #5c3a21;
}

.emoji-btn {
  background: transparent;
  border: none;
  font-size: 17px;
  padding: 5px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.16s ease;
}

.emoji-btn:hover {
  background: rgba(139, 37, 0, 0.18);
  transform: scale(1.22);
}

@media (max-width: 900px) {
  .dock-label,
  .shortcut-key {
    display: none;
  }
  .washi-chat-form {
    min-width: 180px;
  }
}
</style>
