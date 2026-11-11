<template>
  <header class="cafe-top-hud kissaten-hud">
    <div class="hud-inner">
      <!-- Left: Brand + Room Selector + Zone Pill -->
      <div class="hud-left">
        <NuxtLink to="/" class="brand-link" title="Về trang chủ">
          <div class="brand-hanko">
            <span class="hanko-icon">☕</span>
          </div>
          <div class="brand-info">
            <div class="brand-main">
              <span class="brand-name">24h Café</span>
              <span class="status-matcha-dot" :class="{ online: store.connected }" title="Kết nối trực tiếp" />
            </div>
            <span class="brand-tagline">A Little Place to Slow Down</span>
          </div>
        </NuxtLink>

        <div class="room-selector-wrap">
          <select
            :value="store.currentRoomId"
            class="room-select kissaten-pill"
            aria-label="Chọn phòng"
            @change="onRoomChange"
          >
            <option v-for="room in store.roomsList" :key="room.id" :value="room.id">
              🍵 {{ room.name }} ({{ room.onlineCount }}/{{ room.capacity }})
            </option>
          </select>
        </div>

        <div class="zone-pill kissaten-pill">
          <span class="zone-name">📍 {{ store.currentZone }}</span>
          <span class="divider">•</span>
          <span class="players-count">👥 {{ store.players.length }} vị khách</span>
        </div>
      </div>

      <!-- Center: Weather Cycle Switcher -->
      <nav class="hud-center kissaten-cycle-bar" aria-label="Thời tiết & Chu kỳ quán">
        <button
          v-for="(cfg, key) in WORLD_CYCLES"
          :key="key"
          type="button"
          class="cycle-btn"
          :class="{ active: store.worldCycle === key }"
          :title="cfg.subtitle"
          @click="setWorldCycle(key as WorldCycle)"
        >
          <span class="cycle-icon">{{ cfg.icon }}</span>
          <span class="cycle-label">{{ cfg.label }}</span>
        </button>
      </nav>

      <!-- Right: Audio Mixer, Pomodoro Timer, Camera & Profile -->
      <div class="hud-right">
        <!-- Ambient Sound Toggle + Mini Equalizer -->
        <div class="audio-cluster">
          <button
            type="button"
            class="hud-action-btn audio-btn kissaten-btn"
            :class="{ active: audioEnabled }"
            @click="toggleAudio"
          >
            <div v-if="audioEnabled" class="bamboo-equalizer">
              <span class="bamboo-bar b1" />
              <span class="bamboo-bar b2" />
              <span class="bamboo-bar b3" />
              <span class="bamboo-bar b4" />
            </div>
            <span v-else class="audio-muted-icon">🔇</span>
            <span class="btn-text">{{ audioEnabled ? 'Trà & Mưa Rơi' : 'Bật Nhạc Trà' }}</span>
          </button>

          <!-- Floating Washi Audio Popover -->
          <div v-if="audioEnabled" class="audio-popover washi-card">
            <div class="popover-header">
              <span>Âm Thanh Không Gian</span>
            </div>
            <label class="slider-row">
              <span class="slider-label">🌧️ Mưa rào</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                :value="rainVol"
                class="kissaten-slider"
                @input="onRainInput"
              />
            </label>
            <label class="slider-row">
              <span class="slider-label">🎹 Lofi Dương Cầm</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                :value="lofiVol"
                class="kissaten-slider"
                @input="onLofiInput"
              />
            </label>
          </div>
        </div>

        <!-- Cozy Study Pomodoro -->
        <button
          type="button"
          class="hud-action-btn pomodoro-btn kissaten-btn"
          :class="{ active: pomodoroRunning }"
          title="Bật/Tắt chế độ học bài Pomodoro 25 phút (Miễn nhiễm ném ly)"
          @click="togglePomodoro"
        >
          <span class="pomo-icon">{{ pomodoroRunning ? '📖' : '⏳' }}</span>
          <span class="pomo-digits">{{ formattedPomodoro }}</span>
          <span v-if="pomodoroRunning" class="pomo-badge">Học bài</span>
        </button>

        <!-- Polaroid Camera Screenshot -->
        <button
          type="button"
          class="hud-action-btn camera-btn kissaten-btn"
          title="Chụp ảnh lưu niệm hoài niệm"
          @click="capturePolaroidSnapshot"
        >
          <span class="cam-icon">📷</span>
          <span class="btn-text">Ảnh Kỷ Niệm</span>
        </button>

        <!-- Avatar & Mood Profile -->
        <button
          type="button"
          class="hud-action-btn profile-btn kissaten-btn"
          title="Đổi diện mạo & Cảm xúc"
          @click="store.showCustomizerModal = true"
        >
          <span class="profile-emoji">{{ store.currentMoodConfig.emoji }}</span>
          <span class="profile-name">{{ store.nickname }}</span>
        </button>
      </div>
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
const { switchRoom, setWorldCycle, capturePolaroidSnapshot, sendChatMessage, setStudyMode } = useCafeSocket();

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
    setStudyMode(false);
    if (pomodoroInterval) clearInterval(pomodoroInterval);
    pomodoroSeconds.value = 25 * 60;
    store.showToast('Đã tạm dừng giờ học bài.');
  } else {
    pomodoroRunning.value = true;
    setStudyMode(true);
    sendChatMessage('📖 Bắt đầu phiên học bài yên tĩnh 25 phút tại 24h Café!');
    store.showToast('Chế độ học bài 25 phút đã bật (Bảo vệ miễn nhiễm ném ly) 🍵');

    if (pomodoroInterval) clearInterval(pomodoroInterval);
    pomodoroInterval = setInterval(() => {
      if (pomodoroSeconds.value > 0) {
        pomodoroSeconds.value--;
      } else {
        pomodoroRunning.value = false;
        setStudyMode(false);
        if (pomodoroInterval) clearInterval(pomodoroInterval);
        pomodoroSeconds.value = 25 * 60;
        store.showToast('🎉 Hoàn thành 25 phút học bài! Hãy tự thưởng một ngụm trà Matcha nhé 🍵.');
      }
    } , 1000);
  }
}

onBeforeUnmount(() => {
  if (pomodoroInterval) clearInterval(pomodoroInterval);
  setStudyMode(false);
  ambientAudio.stop();
});
</script>

<style scoped>
.kissaten-hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: #fdfbf7;
  border-bottom: 2.5px solid #4a3221;
  box-shadow: 0 4px 18px rgba(43, 27, 17, 0.08);
}

.hud-inner {
  max-width: 100%;
  padding: 8px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.hud-left,
.hud-center,
.hud-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Brand Link */
.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #120803;
  transition: transform 0.15s ease;
}

.brand-link:hover {
  transform: translateY(-1px);
}

.brand-hanko {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #b91c1c;
  border: 2px solid #7f1d1d;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(185, 28, 28, 0.35);
  flex-shrink: 0;
}

.hanko-icon {
  font-size: 16px;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-name {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 18px;
  font-weight: 800;
  color: #120803;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.brand-tagline {
  font-size: 10.5px;
  font-weight: 600;
  color: #4a3221;
}

.status-matcha-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.status-matcha-dot.online {
  background: #15803d;
  box-shadow: 0 0 6px #22c55e;
}

/* Room Selector & Zone Pill */
.kissaten-pill {
  background: #ffffff;
  border: 1.5px solid #5c3a21;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: #120803;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(74, 50, 33, 0.05);
}

.kissaten-pill:hover {
  border-color: #8b2500;
  background: #fdfbf7;
}

.divider {
  opacity: 0.6;
  font-weight: 900;
  color: #4a3221;
}

/* Cycle Bar */
.kissaten-cycle-bar {
  background: #f7f3eb;
  border: 1.5px solid #8c6239;
  border-radius: 999px;
  padding: 3px;
  display: flex;
  gap: 3px;
  box-shadow: 0 2px 4px rgba(74, 50, 33, 0.06);
}

.cycle-btn {
  border: none;
  background: transparent;
  color: #2b1810;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
}

.cycle-btn:hover {
  color: #000000;
  background: rgba(74, 50, 33, 0.1);
}

.cycle-btn.active {
  background: #1b4332;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(27, 67, 50, 0.35);
}

/* Action Buttons */
.kissaten-btn {
  background: #ffffff;
  border: 1.5px solid #5c3a21;
  border-radius: 999px;
  padding: 6px 13px;
  font-size: 12.5px;
  font-weight: 700;
  color: #120803;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(74, 50, 33, 0.05);
  transition: all 0.15s ease;
}

.kissaten-btn:hover {
  transform: translateY(-1px);
  border-color: #8b2500;
  background: #faedcd;
}

.kissaten-btn.active {
  background: #1b4332;
  border-color: #0d281e;
  color: #ffffff;
}

/* Bamboo Equalizer */
.bamboo-equalizer {
  display: flex;
  align-items: flex-end;
  gap: 2.5px;
  height: 14px;
  width: 14px;
}

.bamboo-bar {
  width: 2.5px;
  background: #ffffff;
  border-radius: 1px;
  animation: bambooBounce 1.2s infinite ease-in-out alternate;
}

.b1 { height: 40%; animation-delay: 0.1s; }
.b2 { height: 85%; animation-delay: 0.3s; }
.b3 { height: 60%; animation-delay: 0.2s; }
.b4 { height: 100%; animation-delay: 0.4s; }

@keyframes bambooBounce {
  0% { height: 25%; }
  100% { height: 100%; }
}

/* Washi Audio Popover */
.audio-cluster {
  position: relative;
}

.washi-card {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border: 2px solid #4a3221;
  border-radius: 18px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 230px;
  box-shadow: 0 16px 36px rgba(43, 27, 17, 0.2);
}

.popover-header {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8b2500;
}

.slider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #120803;
}

.kissaten-slider {
  width: 100px;
  accent-color: #1b4332;
  cursor: pointer;
}

/* Pomodoro */
.pomodoro-btn.active {
  background: #b91c1c;
  border-color: #7f1d1d;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(185, 28, 28, 0.35);
}

.pomo-digits {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 800;
  font-size: 13px;
}

.pomo-badge {
  background: #ffffff;
  color: #b91c1c;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
}

@media (max-width: 960px) {
  .cycle-label,
  .zone-pill,
  .btn-text,
  .brand-tagline {
    display: none;
  }
}
</style>
