<template>
  <transition name="fade-modal">
    <div v-if="store.showDrinkModal" class="modal-backdrop" @click.self="close">
      <div class="modal-card oshina-gaki-menu">
        <div class="modal-header">
          <div>
            <div class="header-pretitle">THỰC ĐƠN ĐỒ UỐNG • DRINK MENU 24H</div>
            <h3 class="header-title">🍵 Thực Đơn Trà & Cà Phê</h3>
            <p class="subtitle">
              Chọn món yêu thích — Barista Minh sẽ tận tâm pha chế và mang đến tận bàn của bạn.
            </p>
          </div>
          <button type="button" class="close-btn" @click="close">✕</button>
        </div>

        <div class="drinks-grid">
          <div
            v-for="drink in DRINK_MENU"
            :key="drink.id"
            class="drink-card washi-drink-card"
            :class="{ active: store.currentDrinkId === drink.id }"
            @click="selectDrink(drink.id)"
          >
            <div class="drink-icon-wrap">
              <span class="drink-icon">{{ drink.icon }}</span>
            </div>
            <div class="drink-info">
              <div class="drink-name-row">
                <span class="drink-name">{{ drink.name }}</span>
                <span v-if="store.currentDrinkId === drink.id" class="current-badge">Đang dùng</span>
              </div>
              <p class="drink-desc">{{ drink.description }}</p>
            </div>
            <button type="button" class="order-btn hanko-order-btn">
              <span>Gọi Món</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
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
  background: rgba(18, 12, 8, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.oshina-gaki-menu {
  width: min(640px, 96vw);
  max-height: 88vh;
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

.drinks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 12px;
}

.washi-drink-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fdfbf7;
  border: 2px solid #5c3a21;
  border-radius: 18px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.washi-drink-card:hover {
  background: #faedcd;
  border-color: #8b2500;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -2px rgba(43, 27, 17, 0.25);
}

.washi-drink-card.active {
  background: #fefae0;
  border-color: #1b4332;
}

.drink-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #faedcd;
  border: 1.5px solid #5c3a21;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drink-icon {
  font-size: 26px;
}

.drink-info {
  flex: 1;
  min-width: 0;
}

.drink-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.drink-name {
  font-weight: 800;
  font-size: 15px;
  color: #120803;
}

.current-badge {
  background: #d8f3dc;
  color: #0d3b1e;
  font-size: 10.5px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1.5px solid #2d6a4f;
}

.drink-desc {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: #3d2314;
  line-height: 1.4;
}

.hanko-order-btn {
  background: #1b4332;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.16s ease;
  flex-shrink: 0;
}

.washi-drink-card:hover .hanko-order-btn {
  background: #2d6a4f;
  transform: scale(1.05);
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
