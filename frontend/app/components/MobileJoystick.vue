<template>
  <div
    ref="padEl"
    class="mobile-joystick"
    @pointerdown="onStart"
    @pointermove="onMove"
    @pointerup="onEnd"
    @pointercancel="onEnd"
  >
    <div
      class="joystick-knob"
      :style="{ transform: `translate(${knobX}px, ${knobY}px)` }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { gameEventBus } from '@game/systems/EventBus';

const padEl = ref<HTMLElement | null>(null);
const dragging = ref(false);
const knobX = ref(0);
const knobY = ref(0);
const maxRadius = 32;

function onStart(e: PointerEvent) {
  dragging.value = true;
  (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  updateVector(e);
}

function onMove(e: PointerEvent) {
  if (!dragging.value) return;
  updateVector(e);
}

function onEnd() {
  dragging.value = false;
  knobX.value = 0;
  knobY.value = 0;
  gameEventBus.emit('scene:joystickInput', { vx: 0, vy: 0 });
}

function updateVector(e: PointerEvent) {
  if (!padEl.value) return;
  const rect = padEl.value.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const clamped = Math.min(maxRadius, dist);

  knobX.value = (dx / dist) * clamped;
  knobY.value = (dy / dist) * clamped;

  gameEventBus.emit('scene:joystickInput', {
    vx: knobX.value / maxRadius,
    vy: knobY.value / maxRadius,
  });
}
</script>

<style scoped>
.mobile-joystick {
  position: absolute;
  bottom: 92px;
  left: 22px;
  z-index: 32;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: rgba(24, 18, 14, 0.65);
  border: 2px solid rgba(212, 163, 115, 0.45);
  display: none;
  align-items: center;
  justify-content: center;
  touch-action: none;
}

.joystick-knob {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(212, 163, 115, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

@media (max-width: 900px), (pointer: coarse) {
  .mobile-joystick {
    display: flex;
  }
}
</style>

