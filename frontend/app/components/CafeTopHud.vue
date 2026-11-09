<template>
  <header class="cafe-top-hud">
    <!-- Left: Brand + Room Selector + Zone -->
    <div class="hud-left">
      <NuxtLink to="/" class="brand-badge" title="Về trang chủ">
        <span class="brand-dot" :class="{ online: store.connected }" />
        <span class="brand-title">24h Café</span>
      </NuxtLink>

      <div class="room-selector-wrap">
        <select
          :value="store.currentRoomId"
          class="room-select"
          aria-label="Chọn phòng"
          @change="onRoomChange"
        >
          <option v-for="room in store.roomsList" :key="room.id" :value="room.id">
            {{ room.name }} ({{ room.onlineCount }}/{{ room.capacity }})
          </option>
        </select>
      </div>

      <div class="zone-pill">
        <span>📍 {{ store.currentZone }}</span>
        <span class="divider">•</span>
        <span>👥 {{ store.players.length }} người</span>
      </div>
    </div>

    <!-- Center: Day/Night & Weather Cycle Switcher -->
    <div class="hud-center">
      <button
        v-for="(cfg, key) in WORLD_CYCLES"
        :key="key"
        type="button"
        class="cycle-btn"
        :class="{ active: store.worldCycle === key }"
        :title="cfg.subtitle"
        @click="setWorldCycle(key as WorldCycle)"
      >
        <span>{{ cfg.icon }}</span>
        <span class="cycle-label">{{ cfg.label }}</span>
      </button>
    </div>

    <!-- Right: Audio Mixer, Pomodoro Timer, Camera & Profile -->
    <div class="hud-right">
      <!-- Ambient Sound Toggle -->
      <div class="audio-cluster">
        <button
          type="button"
          class="hud-action-btn"
          :class="{ active: audioEnabled }"
          @click="toggleAudio"
        >
          <span>{{ audioEnabled ? '🎧 Nhạc & Mưa: Bật' : '🔇 Bật Nhạc Chill' }}</span>
        </button>

        <div v-if="audioEnabled" class="audio-popover">
          <label class="slider-row">
            <span>🌧️ Mưa</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="rainVol"
              @input="onRainInput"
            />
          </label>
          <label class="slider-row">
            <span>🎹 Lofi</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="lofiVol"
              @input="onLofiInput"
            />
          </label>
        </div>
      </div>

      <!-- Cozy Study Pomodoro -->
      <button
        type="button"
        class="hud-action-btn pomodoro-btn"
        :class="{ active: pomodoroRunning }"
        title="Bật/Tắt đồng hồ tập trung Pomodoro 25 phút"
        @click="togglePomodoro"
      >
        <span>⏱️ {{ formattedPomodoro }}</span>
      </button>

      <!-- Polaroid Camera Screenshot (Section 4.5) -->
      <button
        type="button"
        class="hud-action-btn camera-btn"
        @click="capturePolaroidSnapshot"
      >
        <span>📸 Chụp Ảnh</span>
      </button>

      <!-- Avatar & Mood Customizer -->
      <button
        type="button"
        class="hud-action-btn profile-btn"
        @click="store.showCustomizerModal = true"
      >
        <span>{{ store.currentMoodConfig.emoji }} {{ store.nickname }}</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { WORLD_CYCLES, type WorldCycle } from '@game/assets/cafeCatalog';
import { ambientAudio } from '@game/systems/AmbientAudioEngine';
import { useCafeSocket } from '~/composables/useCafeSocket';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const { switchRoom, setWorldCycle, capturePolaroidSnapshot, sendChatMessage } = useCafeSocket();

const audioEnabled = ref(false);
const rainVol = ref(0.35);
const lofiVol = ref(0.25);

const pomodoroRunning = ref(false);
const pomodoroSeconds = ref(25 * 60);
let pomodoroInterval: ReturnType<typeof setInterval> | null = null;

const formattedPomodoro = computed(() => {
  const mins = String(Math.floor(pomodoroSeconds.value / 60)).padStart(2, '0');
  const secs = String(pomodoroSeconds.value % 60).padStart(2, '0');
  return `${mins}:${secs}`;
});

function onRoomChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  if (target.value) {
    switchRoom(target.value);
  }
}

function toggleAudio() {
  if (audioEnabled.value) {
    ambientAudio.stop();
    audioEnabled.value = false;
  } else {
    ambientAudio.start();
    audioEnabled.value = true;
  }
}

function onRainInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value);
  rainVol.value = val;
  ambientAudio.setRainVolume(val);
}

function onLofiInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value);
  lofiVol.value = val;
  ambientAudio.setLofiVolume(val);
}

function togglePomodoro() {
  if (pomodoroRunning.value) {
    pomodoroRunning.value = false;
    if (pomodoroInterval) clearInterval(pomodoroInterval);
    pomodoroSeconds.value = 25 * 60;
  } else {
    pomodoroRunning.value = true;
    sendChatMessage('🎧 Bắt đầu phiên tập trung 25 phút tại quán!');
    pomodoroInterval = setInterval(() => {
      if (pomodoroSeconds.value > 0) {
        pomodoroSeconds.value -= 1;
      } else {
        pomodoroRunning.value = false;
        if (pomodoroInterval) clearInterval(pomodoroInterval);
        pomodoroSeconds.value = 25 * 60;
        store.showToast('🎉 Hoàn thành 25 phút tập trung! Hãy tự thưởng một ngụm cà phê nhé.');
      }
    }, 1000);
  }
}

onBeforeUnmount(() => {
  if (pomodoroInterval) clearInterval(pomodoroInterval);
  ambientAudio.stop();
});
</script>

<style scoped>
.cafe-top-hud {
  position: absolute;
  top: 12px;
  left: 14px;
  right: 14px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  pointer-events: none;
}

.hud-left,
.hud-center,
.hud-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  pointer-events: auto;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(24, 18, 14, 0.88);
  border: 1px solid rgba(212, 163, 115, 0.35);
  padding: 7px 13px;
  border-radius: 999px;
  text-decoration: none;
  color: #fef3c7;
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: 15px;
  backdrop-filter: blur(8px);
}

.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
}

.brand-dot.online {
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}

.room-select {
  background: rgba(24, 18, 14, 0.88);
  color: #f8f5f0;
  border: 1px solid rgba(212, 163, 115, 0.35);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}

.zone-pill {
  background: rgba(24, 18, 14, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e6ccb2;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.divider {
  opacity: 0.45;
}

.hud-center {
  background: rgba(20, 15, 12, 0.86);
  border: 1px solid rgba(212, 163, 115, 0.28);
  border-radius: 999px;
  padding: 3px;
  backdrop-filter: blur(8px);
}

.cycle-btn {
  border: none;
  background: transparent;
  color: #d6ccc2;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.18s ease;
}

.cycle-btn.active {
  background: #d4a373;
  color: #1c130e;
}

.audio-cluster {
  position: relative;
}

.audio-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: rgba(24, 18, 14, 0.95);
  border: 1px solid rgba(212, 163, 115, 0.4);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 170px;
}

.slider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #faedcd;
}

.slider-row input {
  width: 95px;
  accent-color: #d4a373;
}

.hud-action-btn {
  border: 1px solid rgba(212, 163, 115, 0.35);
  background: rgba(24, 18, 14, 0.88);
  color: #faedcd;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
}

.hud-action-btn:hover,
.hud-action-btn.active {
  background: #b07d56;
  color: #fffbeb;
}

.camera-btn {
  background: linear-gradient(135deg, #d97706, #b45309);
  border-color: #fbbf24;
  color: #fffbeb;
}

@media (max-width: 900px) {
  .cycle-label,
  .zone-pill {
    display: none;
  }
}
</style>

