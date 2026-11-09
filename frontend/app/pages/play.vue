<template>
  <main class="play-screen">
    <!-- Top HUD -->
    <CafeTopHud />

    <!-- Toast Notification Banner -->
    <transition name="fade">
      <div v-if="store.toastMessage" class="cafe-toast">
        {{ store.toastMessage }}
      </div>
    </transition>

    <!-- Phaser 3 2D Game World (ClientOnly for SSR safety) -->
    <ClientOnly>
      <CafePhaserCanvas />
      <template #fallback>
        <div class="loading-cafe-stage">
          <div class="spinner">☕</div>
          <p>Đang pha cà phê và mở cửa quán 24h Café...</p>
        </div>
      </template>
    </ClientOnly>

    <!-- Virtual Touch Joystick on Mobile -->
    <MobileJoystick />

    <!-- Realtime Multi-User Presence Drawer, Player Interaction Card & Coffee Invite Banner -->
    <OnlinePlayersDrawer />

    <!-- Bottom Chat & Emote Bar -->
    <CafeBottomBar />

    <!-- Interactive Modals -->
    <AvatarCustomizerModal />
    <DrinkMenuModal />
    <AnonymousBoardModal />
    <PolaroidShareModal />
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCafeSocket } from '~/composables/useCafeSocket';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const route = useRoute();
const { connectSocket } = useCafeSocket();

onMounted(() => {
  const requestedRoom =
    typeof route.query.room === 'string' && route.query.room.trim()
      ? route.query.room.trim()
      : undefined;
  connectSocket(requestedRoom);
});
</script>

<style scoped>
.play-screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #120d0a;
  user-select: none;
}

.loading-cafe-stage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fef3c7;
  gap: 12px;
}

.spinner {
  font-size: 40px;
  animation: pulse 1.4s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.18);
  }
}

.cafe-toast {
  position: absolute;
  top: 68px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: rgba(28, 20, 14, 0.94);
  border: 1px solid #fbbf24;
  color: #fef3c7;
  padding: 9px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

