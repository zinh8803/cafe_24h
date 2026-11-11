<template>
  <transition name="fade-modal">
    <div v-if="store.showAnonymousBoardModal" class="modal-backdrop" @click.self="close">
      <div class="modal-card ema-board-card">
        <div class="modal-header">
          <div>
            <div class="header-pretitle">LỜI CHÚC & TÂM SỰ • BẢNG LỜI NHẮN ẨN DANH</div>
            <h3 class="header-title">🎏 Bảng Lời Nhắn Ẩn Danh</h3>
            <p class="subtitle">
              Để lại một lời chúc lành hoặc dòng suy tư ấm áp cho những vị khách ghé quán sau bạn.
            </p>
          </div>
          <button type="button" class="close-btn" @click="close">✕</button>
        </div>

        <!-- Compose Note Form -->
        <form class="note-compose-form washi-compose-box" @submit.prevent="submitNote">
          <textarea
            v-model="noteContent"
            rows="2"
            maxlength="240"
            placeholder="Viết một lời nhắn tích cực ẩn danh (ví dụ: Mong ngày hôm nay dịu dàng với bạn...)"
            class="note-textarea"
          />
          <div class="compose-actions">
            <span class="char-counter">{{ noteContent.length }}/240 ký tự</span>
            <button type="submit" class="post-note-btn hanko-post-btn">
              <span>Ghim Thẻ Lời Nhắn 🎏</span>
            </button>
          </div>
        </form>

        <!-- Notes Grid (Thẻ Ema Washi) -->
        <div class="notes-list">
          <article
            v-for="item in store.anonymousMessages"
            :key="item.id"
            class="sticky-note ema-note"
          >
            <!-- Red string loop for Ema wooden plaque -->
            <div class="ema-string" />

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
                  🍵 {{ item.reactions?.coffee || 0 }}
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
  </transition>
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
  background: rgba(18, 12, 8, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.ema-board-card {
  width: min(660px, 96vw);
  max-height: 88vh;
  overflow-y: auto;
  background: #ffffff;
  border: 2.5px solid #4a3221;
  border-radius: 24px;
  padding: 24px;
  color: #120803;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  border-bottom: 2px dashed #8c6239;
  padding-bottom: 14px;
}

.header-pretitle {
  font-size: 11.5px;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #8b2500;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.header-title {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 23px;
  font-weight: 800;
  color: #120803;
  letter-spacing: -0.01em;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 13.5px;
  font-weight: 600;
  color: #3d2314;
  line-height: 1.45;
}

.close-btn {
  background: #fdfbf7;
  border: 1.5px solid #4a3221;
  color: #120803;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  transition: all 0.16s ease;
}

.close-btn:hover {
  background: #faedcd;
}

.washi-compose-box {
  background: #fdfbf7;
  border: 2px solid #5c3a21;
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 20px;
}

.note-textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: #120803;
  font-size: 14px;
  font-weight: 600;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
}

.note-textarea::placeholder {
  color: #6b5344;
}

.compose-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1.5px solid #d4c5b2;
}

.char-counter {
  font-size: 12px;
  font-weight: 700;
  color: #5c3a21;
}

.hanko-post-btn {
  background: #1b4332;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.hanko-post-btn:hover {
  background: #2d6a4f;
  transform: translateY(-1px);
}

.notes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.ema-note {
  position: relative;
  background: #fdfbf7;
  border: 2px solid #5c3a21;
  border-radius: 18px;
  padding: 16px;
  padding-top: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  box-shadow: 0 4px 14px rgba(43, 27, 17, 0.15);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.ema-note:hover {
  transform: translateY(-2px);
  border-color: #8b2500;
  background: #faedcd;
}

.ema-string {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 6px;
  border-radius: 999px;
  background: #b91c1c;
  box-shadow: 0 1px 3px rgba(185, 28, 28, 0.5);
}

.note-text {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.6;
  color: #120803;
  font-style: italic;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1.5px solid #d4c5b2;
}

.note-tag {
  font-size: 11.5px;
  color: #5c3a21;
  font-weight: 800;
}

.reaction-bar {
  display: flex;
  gap: 5px;
}

.react-pill {
  background: #ffffff;
  border: 1.5px solid #5c3a21;
  border-radius: 999px;
  color: #120803;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.react-pill:hover {
  background: #faedcd;
  border-color: #8b2500;
  transform: scale(1.05);
}

/* Modal Fade Animation */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
