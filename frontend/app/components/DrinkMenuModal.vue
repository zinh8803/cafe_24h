<template>
  <div v-if="store.showDrinkModal" class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3>☕ Thực Đơn Đồ Uống 24h Café</h3>
          <p class="subtitle">Chọn một thức uống yêu thích cho nhân vật của bạn (Miễn phí trong MVP).</p>
        </div>
        <button type="button" class="close-btn" @click="close">✕</button>
      </div>

      <div class="drinks-grid">
        <div
          v-for="drink in DRINK_MENU"
          :key="drink.id"
          class="drink-card"
          :class="{ active: store.currentDrinkId === drink.id }"
          @click="selectDrink(drink.id)"
        >
          <div class="drink-icon">{{ drink.icon }}</div>
          <div class="drink-info">
            <div class="drink-name">{{ drink.name }}</div>
            <p class="drink-desc">{{ drink.description }}</p>
          </div>
          <button type="button" class="order-btn">Gọi món</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DRINK_MENU } from '@game/assets/cafeCatalog';
import { useCafeSocket } from '~/composables/useCafeSocket';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const { orderDrink } = useCafeSocket();

function close() {
  store.showDrinkModal = false;
}

function selectDrink(drinkId: string) {
  orderDrink(drinkId);
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
  width: min(580px, 96vw);
  max-height: 88vh;
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

.drinks-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drink-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #2b2019;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.16s ease;
}

.drink-card:hover,
.drink-card.active {
  border-color: #fbbf24;
  background: rgba(212, 163, 115, 0.18);
}

.drink-icon {
  font-size: 30px;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
}

.drink-info {
  flex: 1;
}

.drink-name {
  font-weight: 700;
  font-size: 14.5px;
  color: #fef3c7;
}

.drink-desc {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: #d6ccc2;
}

.order-btn {
  background: #d4a373;
  color: #1c130e;
  border: none;
  border-radius: 9px;
  padding: 7px 12px;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
}
</style>

