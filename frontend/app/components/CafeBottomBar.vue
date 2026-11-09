<template>
  <footer class="cafe-bottom-bar">
    <!-- Collapsible Chat History Drawer -->
    <div v-if="showChatLog" class="chat-history-panel">
      <div class="chat-panel-header">
        <span>💬 Trò chuyện tại {{ store.currentRoomName }}</span>
        <button type="button" class="close-mini" @click="showChatLog = false">Thu gọn</button>
      </div>
      <div class="chat-messages-scroll">
        <div v-if="store.visibleChats.length === 0" class="empty-chat-hint">
          Quán đang yên tĩnh... Hãy gửi một lời chào 👋 hoặc nhấp một ngụm cà phê nhé.
        </div>
        <div
          v-for="msg in store.visibleChats"
          :key="msg.id"
          class="chat-line"
        >
          <strong class="chat-author">{{ msg.nickname }}:</strong>
          <span class="chat-text">{{ msg.content }}</span>
          <button
            v-if="msg.userId !== store.userId"
            type="button"
            class="mute-btn"
            title="Ẩn tin nhắn từ người này"
            @click="store.toggleMuteUser(msg.userId)"
          >
            🔇
          </button>
        </div>
      </div>
    </div>

    <!-- Main Dock Bar -->
    <div class="dock-main-row">
      <!-- Left Quick Actions -->
      <div class="dock-actions">
        <button
          type="button"
          class="dock-btn"
          @click="showChatLog = !showChatLog"
        >
          💬 Lịch sử ({{ store.visibleChats.length }})
        </button>

        <button
          type="button"
          class="dock-btn highlight-drink"
          @click="store.showDrinkModal = true"
        >
          {{ store.currentDrinkConfig.icon }} Gọi Đồ Uống
        </button>

        <button
          type="button"
          class="dock-btn"
          title="Nâng ly cà phê cùng mọi người trong phòng"
          @click="triggerCoffeeTogether"
        >
          🥂 Cụm Ly
        </button>

        <button
          type="button"
          class="dock-btn"
          @click="openBoard"
        >
          📌 Lời Nhắn Ẩn Danh
        </button>
      </div>

      <!-- Center Chat Input -->
      <form class="chat-form" @submit.prevent="handleSend">
        <input
          v-model="draft"
          type="text"
          maxlength="120"
          placeholder="Nhắn trò chuyện trong quán (Enter để gửi)..."
          class="chat-input"
          @input="onTypingInput"
          @blur="onStopTyping"
        />
        <button type="submit" class="send-btn">Gửi</button>
      </form>

      <!-- Right Quick Emojis -->
      <div class="emoji-strip">
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
} = useCafeSocket();

const draft = ref('');
const showChatLog = ref(false);
const quickEmojis = ['👋', '☕', '❤️', '😂', '✨', '🎵'];
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

function openBoard() {
  fetchAnonymousMessages();
  store.showAnonymousBoardModal = true;
}
</script>

<style scoped>
.cafe-bottom-bar {
  position: absolute;
  bottom: 12px;
  left: 14px;
  right: 14px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.chat-history-panel {
  width: min(560px, 94vw);
  background: rgba(20, 15, 12, 0.92);
  border: 1px solid rgba(212, 163, 115, 0.35);
  border-radius: 14px;
  padding: 10px 14px;
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.chat-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #fde68a;
  margin-bottom: 6px;
}

.close-mini {
  background: transparent;
  border: none;
  color: #d6ccc2;
  font-size: 11px;
  cursor: pointer;
}

.chat-messages-scroll {
  max-height: 150px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;
}

.empty-chat-hint {
  color: #a89f91;
  font-style: italic;
  font-size: 12.5px;
}

.chat-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #f8f5f0;
}

.chat-author {
  color: #fbbf24;
  white-space: nowrap;
}

.chat-text {
  word-break: break-word;
  flex: 1;
}

.mute-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.45;
  font-size: 11px;
}

.mute-btn:hover {
  opacity: 1;
}

.dock-main-row {
  width: min(1140px, 98vw);
  background: rgba(22, 16, 12, 0.92);
  border: 1px solid rgba(212, 163, 115, 0.36);
  border-radius: 18px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.dock-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.dock-btn {
  border: 1px solid rgba(212, 163, 115, 0.3);
  background: rgba(42, 31, 23, 0.85);
  color: #faedcd;
  padding: 7px 11px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dock-btn:hover {
  background: #b07d56;
  color: #fff;
}

.highlight-drink {
  border-color: rgba(251, 191, 36, 0.5);
  color: #fef3c7;
}

.chat-form {
  flex: 1;
  min-width: 220px;
  display: flex;
  gap: 6px;
}

.chat-input {
  flex: 1;
  background: rgba(14, 10, 8, 0.85);
  border: 1px solid rgba(212, 163, 115, 0.35);
  border-radius: 10px;
  padding: 8px 12px;
  color: #fffbeb;
  font-size: 13px;
  outline: none;
}

.chat-input:focus {
  border-color: #fbbf24;
}

.send-btn {
  background: #d4a373;
  color: #1c130e;
  border: none;
  border-radius: 10px;
  padding: 8px 15px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.emoji-strip {
  display: flex;
  align-items: center;
  gap: 4px;
}

.emoji-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(38, 28, 22, 0.8);
  border-radius: 9px;
  width: 34px;
  height: 34px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.14s ease;
}

.emoji-btn:hover {
  transform: translateY(-2px) scale(1.1);
  background: rgba(212, 163, 115, 0.3);
}
</style>

