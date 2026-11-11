<template>
  <transition name="fade-modal">
    <div v-if="store.showPolaroidModal" class="modal-backdrop" @click.self="close">
      <div class="modal-card polaroid-keepsake-card">
        <div class="modal-header">
          <div>
            <div class="header-pretitle">KỶ NIỆM GHÉ QUÁN • ẢNH CHỤP POLAROID</div>
            <h3 class="header-title">📷 Ảnh Kỷ Niệm Tại Kissaten 24h</h3>
            <p class="subtitle">
              Lưu giữ khoảnh khắc tĩnh lặng kèm câu trích dẫn hoặc gửi thiệp mời bạn cùng bàn ghé quán.
            </p>
          </div>
          <button type="button" class="close-btn" @click="close">✕</button>
        </div>

        <div class="polaroid-preview-box washi-photo-frame">
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
            placeholder="Nhập dòng cảm nghĩ khắc ghi trên ảnh..."
            class="quote-input washi-input"
          />
          <button type="button" class="refresh-btn" @click="retakeWithNewQuote">
            Cập nhật chữ trên ảnh
          </button>
        </div>

        <div class="share-actions">
          <button type="button" class="secondary-btn" @click="copyInviteLink">
            🔗 Link Mời Bạn Cùng Bàn
          </button>
          <a
            :href="store.polaroidDataUrl"
            :download="`kissaten-24h-${Date.now()}.png`"
            class="download-btn hanko-download"
          >
            ⬇️ Tải Ảnh Kỷ Niệm HD
          </a>
        </div>
      </div>
    </div>
  </transition>
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
    store.showToast('Đã sao chép link mời bạn bè vào đúng phòng hiện tại! 🍵');
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
  background: rgba(18, 12, 8, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.polaroid-keepsake-card {
  width: min(640px, 96vw);
  max-height: 92vh;
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
  gap: 12px;
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

.washi-photo-frame {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fdfbf7;
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 16px;
  border: 2px solid #5c3a21;
}

.polaroid-img {
  max-width: 100%;
  max-height: 380px;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(43, 27, 17, 0.25);
}

.quote-custom-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.washi-input {
  flex: 1;
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-radius: 14px;
  padding: 10px 14px;
  color: #120803;
  font-size: 14px;
  font-weight: 600;
  outline: none;
}

.washi-input:focus {
  border-color: #1b4332;
  box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.2);
}

.refresh-btn {
  background: #fdfbf7;
  border: 1.5px solid #5c3a21;
  color: #120803;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.16s ease;
}

.refresh-btn:hover {
  background: #faedcd;
}

.share-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.secondary-btn {
  background: #fdfbf7;
  border: 1.5px solid #5c3a21;
  color: #120803;
  padding: 10px 18px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.16s ease;
}

.secondary-btn:hover {
  background: #faedcd;
}

.hanko-download {
  background: #1b4332;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.18s ease;
}

.hanko-download:hover {
  background: #2d6a4f;
  transform: translateY(-1px);
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
