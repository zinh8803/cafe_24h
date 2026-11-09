<template>
  <div v-if="store.showCustomizerModal" class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3>✨ Hồ Sơ & Tâm Trạng Hôm Nay</h3>
          <p class="subtitle">Chọn diện mạo và tâm trạng để mọi người trong quán đồng cảm cùng bạn.</p>
        </div>
        <button type="button" class="close-btn" @click="close">✕</button>
      </div>

      <form class="customizer-body" @submit.prevent="save">
        <label class="field-block">
          <span class="field-label">Tên hiển thị trên đầu nhân vật</span>
          <input
            v-model="localNickname"
            type="text"
            maxlength="24"
            placeholder="Ví dụ: Mây Lang Thang..."
            class="text-input"
          />
        </label>

        <div class="field-block">
          <span class="field-label">Daily Mood – Tâm trạng mỗi ngày (F07 / 4.1)</span>
          <div class="grid-options mood-grid">
            <button
              v-for="m in MOOD_OPTIONS"
              :key="m.id"
              type="button"
              class="option-chip"
              :class="{ selected: localMood === m.id }"
              @click="localMood = m.id"
            >
              <span class="big-emoji">{{ m.emoji }}</span>
              <span>{{ m.label }}</span>
            </button>
          </div>
        </div>

        <div class="field-block">
          <span class="field-label">Mẫu Nhân Vật (6 phong cách)</span>
          <div class="grid-options">
            <button
              v-for="av in AVATAR_PRESETS"
              :key="av.id"
              type="button"
              class="option-chip"
              :class="{ selected: localAvatarId === av.id }"
              @click="localAvatarId = av.id"
            >
              <span>🧑 {{ av.name }}</span>
            </button>
          </div>
        </div>

        <div class="field-block">
          <span class="field-label">Trang Phục Miễn Phí (F11)</span>
          <div class="grid-options">
            <button
              v-for="out in OUTFIT_PRESETS"
              :key="out.id"
              type="button"
              class="option-chip"
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
          <button type="submit" class="primary-btn">Lưu & Cập Nhật Vào Quán</button>
        </div>
      </form>
    </div>
  </div>
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
  background: rgba(10, 8, 6, 0.76);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: min(560px, 96vw);
  max-height: 90vh;
  overflow-y: auto;
  background: #1f1712;
  border: 1px solid rgba(212, 163, 115, 0.45);
  border-radius: 20px;
  padding: 22px;
  color: #f8f5f0;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
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

.customizer-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #e6ccb2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.text-input {
  background: #130e0b;
  border: 1px solid rgba(212, 163, 115, 0.4);
  border-radius: 10px;
  padding: 10px 14px;
  color: #fffbeb;
  font-size: 14px;
}

.grid-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 8px;
}

.option-chip {
  background: #2b2019;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 11px;
  padding: 9px 11px;
  color: #f5ebe0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;
}

.option-chip.selected {
  background: rgba(212, 163, 115, 0.25);
  border-color: #fbbf24;
  color: #fef3c7;
}

.swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.secondary-btn {
  background: transparent;
  border: 1px solid rgba(212, 163, 115, 0.35);
  color: #e6ccb2;
  padding: 9px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn {
  background: #d4a373;
  border: none;
  color: #1c130e;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}
</style>

