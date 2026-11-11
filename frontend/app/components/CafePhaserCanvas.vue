<template>
  <div class="phaser-stage-wrapper" @contextmenu.prevent>
    <div ref="canvasHost" class="phaser-canvas-host" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type * as PhaserTypes from 'phaser';

const canvasHost = ref<HTMLElement | null>(null);
let phaserGame: PhaserTypes.Game | null = null;

onMounted(async () => {
  if (!canvasHost.value) return;
  const { createCafePhaserGame } = await import('@game/index');
  phaserGame = createCafePhaserGame(canvasHost.value);
});

onBeforeUnmount(() => {
  if (phaserGame) {
    phaserGame.destroy(true);
    phaserGame = null;
  }
});
</script>

<style scoped>
.phaser-stage-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: hidden;
}

.phaser-canvas-host {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phaser-canvas-host :deep(canvas) {
  display: block;
  box-shadow: 0 16px 48px rgba(43, 27, 17, 0.25);
  border-radius: 12px;
}
</style>

