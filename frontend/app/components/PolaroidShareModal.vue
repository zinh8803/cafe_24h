<template>
  <div v-if="store.showPolaroidModal" class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3>📸 Khoảnh Khắc Tại 24h Café</h3>
          <p class="subtitle">
            Tải ảnh Polaroid kỷ niệm hoặc chia sẻ lên mạng xã hội kèm câu trích dẫn hôm nay.
          </p>
        </div>
        <button type="button" class="close-btn" @click="close">✕</button>
      </div>

      <div class="polaroid-preview-box">
        <img
          v-if="store.polaroidDataUrl"
          :src="store.polaroidDataUrl"
          alt="24h Cafe Polaroid Snapshot"
          class="polaroid-img"
        />
      </div>

      <div class="quote-custom-row">
        <input
          v-model="store.dailyQuote"
          type="text"
          maxlength="90"
          placeholder="Nhập dòng cảm nghĩ trên ảnh..."
          class="quote-input"
        />
        <button type="button" class="refresh-btn" @click="retakeWithNewQuote">
          Cập nhật chữ trên ảnh
        </button>
      </div>

      <div class="share-actions">
        <button type="button" class="secondary-btn" @click="copyInviteLink">
          🔗 Sao chép Link Mời Bạn Cùng Bàn
        </button>
        <a
          :href="store.polaroidDataUrl"
          :download="`24h-cafe-${Date.now()}.png`"
          class="download-btn"
        >
          ⬇️ Tải Ảnh PNG Chất Lượng Cao
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCafeSocket } from '~/composables/useCafeSocket';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const { capturePolaroidSnapshot } = useCafeSocket();

function close() {
  store.showPolaroidModal = false;
}

function retakeWithNewQuote() {
  capturePolaroidSnapshot();
}

async function copyInviteLink() {
  if (typeof window === 'undefined') return;
  const inviteUrl = `${window.location.origin}/play?room=${encodeURIComponent(store.currentRoomId)}`;
  try {
    await navigator.clipboard.writeText(inviteUrl);
    store.showToast('Đã sao chép link mời bạn bè vào đúng phòng hiện tại! 🔗');
  } catch {
    store.showToast(`Link mời phòng: ${inviteUrl}`);
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 65;
  background: rgba(10, 8, 6, 0.82);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: min(640px, 96vw);
  max-height: 92vh;
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

.polaroid-preview-box {
  background: #120d0a;
  border-radius: 14px;
  padding: 10px;
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.polaroid-img {
  max-width: 100%;
  max-height: 410px;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
}

.quote-custom-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.quote-input {
  flex: 1;
  background: #130e0b;
  border: 1px solid rgba(212, 163, 115, 0.35);
  border-radius: 10px;
  padding: 9px 12px;
  color: #fffbeb;
  font-size: 13px;
}

.refresh-btn {
  background: #3a2a1f;
  color: #faedcd;
  border: 1px solid rgba(212, 163, 115, 0.4);
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.share-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.secondary-btn {
  background: transparent;
  border: 1px solid rgba(212, 163, 115, 0.4);
  color: #faedcd;
  padding: 10px 15px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.download-btn {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #fffbeb;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
}
</style>

