<template>
  <transition name="fade-modal">
    <div v-if="store.showCustomizerModal" class="modal-backdrop" @click.self="close">
      <div class="modal-card kissaten-customizer-card">
        <div class="modal-header">
          <div>
            <div class="header-pretitle">DANH TÍNH & TÂM TRẠNG • TÙY CHỈNH NHÂN VẬT</div>
            <h3 class="header-title">✨ Diện Mạo & Tâm Trạng Hôm Nay</h3>
            <p class="subtitle">
              Chọn phong cách và cảm xúc hôm nay để mọi người trong quán cùng sẻ chia.
            </p>
          </div>
          <button type="button" class="close-btn" @click="close">✕</button>
        </div>

        <form class="customizer-body" @submit.prevent="save">
          <!-- Nickname -->
          <label class="field-block">
            <span class="field-label">Tên hiển thị tại quán</span>
            <input
              v-model="localNickname"
              type="text"
              maxlength="24"
              placeholder="Ví dụ: Mây Lang Thang, Haruki..."
              class="text-input washi-input"
            />
          </label>

          <!-- Daily Mood -->
          <div class="field-block">
            <span class="field-label">Daily Mood – Cảm xúc hôm nay</span>
            <div class="grid-options mood-grid">
              <button
                v-for="m in MOOD_OPTIONS"
                :key="m.id"
                type="button"
                class="option-chip mood-chip washi-chip"
                :class="{ selected: localMood === m.id }"
                @click="localMood = m.id"
              >
                <span class="big-emoji">{{ m.emoji }}</span>
                <span class="mood-text">{{ m.label }}</span>
              </button>
            </div>
          </div>

          <!-- Avatar Style -->
          <div class="field-block">
            <span class="field-label">Phong Cách Nhân Vật Ghibli</span>
            <div class="grid-options">
              <button
                v-for="av in AVATAR_PRESETS"
                :key="av.id"
                type="button"
                class="option-chip avatar-chip washi-chip"
                :class="{ selected: localAvatarId === av.id }"
                @click="localAvatarId = av.id"
              >
                <span class="chip-icon">🧑</span>
                <span>{{ av.name }}</span>
              </button>
            </div>
          </div>

          <!-- Outfit Presets -->
          <div class="field-block">
            <span class="field-label">Trang Phục Len Ấm & Kimono Dệt Mộc</span>
            <div class="grid-options">
              <button
                v-for="out in OUTFIT_PRESETS"
                :key="out.id"
                type="button"
                class="option-chip outfit-chip washi-chip"
                :class="{ selected: localOutfitId === out.id }"
                @click="localOutfitId = out.id"
              >
                <span class="swatch" :style="{ backgroundColor: out.cssColor }" />
                <span>{{ out.name }}</span>
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="secondary-btn" @click="close">Đóng</button>
            <button type="submit" class="primary-btn hanko-save-btn">Lưu & Xuất Hiện Trong Quán</button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  AVATAR_PRESETS,
  MOOD_OPTIONS,
  OUTFIT_PRESETS,
} from '@game/assets/cafeCatalog';
import { useCafeSocket } from '~/composables/useCafeSocket';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const { updateProfileAndMood } = useCafeSocket();

const localNickname = ref(store.nickname);
const localAvatarId = ref(store.avatarId);
const localOutfitId = ref(store.outfitId);
const localMood = ref(store.mood);

watch(
  () => store.showCustomizerModal,
  (open) => {
    if (open) {
      localNickname.value = store.nickname;
      localAvatarId.value = store.avatarId;
      localOutfitId.value = store.outfitId;
      localMood.value = store.mood;
    }
  },
);

function close() {
  store.showCustomizerModal = false;
}

function save() {
  updateProfileAndMood({
    nickname: localNickname.value,
    avatarId: localAvatarId.value,
    outfitId: localOutfitId.value,
    mood: localMood.value,
  });
  store.showToast('Đã lưu diện mạo và tâm trạng mới ✨');
  close();
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

.kissaten-customizer-card {
  width: min(600px, 96vw);
  max-height: 90vh;
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
  margin-bottom: 20px;
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

.customizer-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 800;
  color: #3d2314;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.washi-input {
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-radius: 14px;
  padding: 10px 14px;
  color: #120803;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  transition: all 0.2s ease;
}

.washi-input:focus {
  border-color: #1b4332;
  box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.2);
  background: #ffffff;
}

.grid-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.washi-chip {
  background: #fdfbf7;
  border: 1.5px solid #5c3a21;
  color: #120803;
  padding: 8px 14px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.18s ease;
}

.washi-chip:hover {
  background: #faedcd;
  border-color: #8b2500;
  transform: translateY(-1px);
}

.washi-chip.selected {
  background: #fefae0;
  border-color: #1b4332;
  color: #1b4332;
  box-shadow: 0 3px 10px rgba(27, 67, 50, 0.25);
}

.mood-chip {
  padding: 8px 12px;
}

.big-emoji {
  font-size: 18px;
}

.swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #4a3221;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 14px;
  border-top: 1.5px solid #d4c5b2;
  margin-top: 6px;
}

.secondary-btn {
  background: #fdfbf7;
  border: 1.5px solid #5c3a21;
  color: #120803;
  padding: 9px 18px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.secondary-btn:hover {
  background: #faedcd;
}

.hanko-save-btn {
  background: #1b4332;
  border: none;
  color: #ffffff;
  padding: 9px 20px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.hanko-save-btn:hover {
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
