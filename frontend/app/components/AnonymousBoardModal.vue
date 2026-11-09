<template>
  <div v-if="store.showAnonymousBoardModal" class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3>📌 Bảng Thông Điệp Ẩn Danh</h3>
          <p class="subtitle">
            Để lại một lời chúc hoặc câu nói ấm áp cho những người lạ ghé quán sau bạn.
          </p>
        </div>
        <button type="button" class="close-btn" @click="close">✕</button>
      </div>

      <!-- Compose Note Form -->
      <form class="note-compose-form" @submit.prevent="submitNote">
        <textarea
          v-model="noteContent"
          rows="2"
          maxlength="240"
          placeholder="Viết một lời nhắn tích cực ẩn danh (ví dụ: Nếu hôm nay bạn mệt, hãy nghỉ ngơi một chút...)"
          class="note-textarea"
        />
        <div class="compose-actions">
          <span class="char-counter">{{ noteContent.length }}/240</span>
          <button type="submit" class="post-note-btn">Ghim Lên Bảng 📌</button>
        </div>
      </form>

      <!-- Notes Grid -->
      <div class="notes-list">
        <article
          v-for="item in store.anonymousMessages"
          :key="item.id"
          class="sticky-note"
        >
          <p class="note-text">“{{ item.content }}”</p>
          <div class="note-meta">
            <span class="note-tag">{{ item.tag }}</span>
            <div class="reaction-bar">
              <button
                type="button"
                class="react-pill"
                @click="reactAnonymousMessage(item.id, 'heart')"
              >
                ❤️ {{ item.reactions?.heart || 0 }}
              </button>
              <button
                type="button"
                class="react-pill"
                @click="reactAnonymousMessage(item.id, 'coffee')"
              >
                ☕ {{ item.reactions?.coffee || 0 }}
              </button>
              <button
                type="button"
                class="react-pill"
                @click="reactAnonymousMessage(item.id, 'sparkle')"
              >
                ✨ {{ item.reactions?.sparkle || 0 }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCafeSocket } from '~/composables/useCafeSocket';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const { postAnonymousMessage, reactAnonymousMessage } = useCafeSocket();

const noteContent = ref('');

function close() {
  store.showAnonymousBoardModal = false;
}

async function submitNote() {
  if (!noteContent.value.trim()) return;
  await postAnonymousMessage(noteContent.value, `Từ ${store.currentZone}`);
  noteContent.value = '';
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(10, 8, 6, 0.78);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: min(640px, 96vw);
  max-height: 88vh;
  overflow-y: auto;
  background: #1f1712;
  border: 1px solid rgba(212, 163, 115, 0.45);
  border-radius: 20px;
  padding: 22px;
  color: #f8f5f0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.modal-header h3 {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 20px;
  color: #fef3c7;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #cbb8a4;
}

.close-btn {
  background: transparent;
  border: none;
  color: #d6ccc2;
  font-size: 18px;
  cursor: pointer;
}

.note-compose-form {
  background: #140f0c;
  border: 1px solid rgba(212, 163, 115, 0.35);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 16px;
}

.note-textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: #fffbeb;
  font-size: 13.5px;
  resize: none;
  outline: none;
  font-family: inherit;
}

.compose-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-counter {
  font-size: 11.5px;
  color: #9c8c7e;
}

.post-note-btn {
  background: #d4a373;
  color: #1c130e;
  border: none;
  border-radius: 9px;
  padding: 7px 14px;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
}

.notes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.sticky-note {
  background: linear-gradient(145deg, #2e221a, #251b14);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}

.note-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: #fef3c7;
  font-style: italic;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.note-tag {
  font-size: 11px;
  color: #b09b88;
}

.reaction-bar {
  display: flex;
  gap: 5px;
}

.react-pill {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: #f8f5f0;
  font-size: 11.5px;
  padding: 3px 8px;
  cursor: pointer;
}

.react-pill:hover {
  background: rgba(212, 163, 115, 0.28);
}
</style>

