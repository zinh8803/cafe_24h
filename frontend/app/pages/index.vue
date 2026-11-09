<template>
  <div class="landing-page">
    <SiteNavbar />

    <!-- Hero Section with Instant Guest Character Creator -->
    <section class="hero-section">
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="pill-tag">🌙 MỞ CỬA 24/7 TRÊN TRÌNH DUYỆT • KHÔNG CẦN TẢI GAME</div>
          <h1 class="hero-title">
            24h Café
            <span class="hero-sub">A little place to slow down.</span>
          </h1>
          <p class="hero-desc">
            Một quán cà phê ấm áp hoạt động suốt ngày đêm trong thế giới 2D. Chọn chiếc bàn cạnh cửa sổ,
            gọi một ly cà phê sữa đá, bật tiếng mưa rơi và trò chuyện cùng những người đang thức.
          </p>

          <div class="atmosphere-chips">
            <span>☀️ Morning Café</span>
            <span>🌧️ Rainy Afternoon</span>
            <span>🌇 Sunset Café</span>
            <span>🌙 Midnight Neon</span>
          </div>
        </div>

        <!-- Quick Character Card (F01 + F02: Enter without account) -->
        <div class="quick-entry-card">
          <div class="card-header">
            <h2>Bước Vào Quán Ngay</h2>
            <p>Không cần đăng ký tài khoản • Tạo nhân vật trong 5 giây</p>
          </div>

          <form class="entry-form" @submit.prevent="enterCafeNow">
            <label class="form-row">
              <span>Tên hiển thị của bạn</span>
              <input
                v-model="nickname"
                type="text"
                maxlength="24"
                placeholder="Ví dụ: Mây 2 Giờ Sáng..."
              />
            </label>

            <div class="form-row">
              <span>Tâm trạng hôm nay (Daily Mood)</span>
              <div class="mini-grid">
                <button
                  v-for="m in MOOD_OPTIONS"
                  :key="m.id"
                  type="button"
                  class="mini-chip"
                  :class="{ active: mood === m.id }"
                  @click="mood = m.id"
                >
                  {{ m.emoji }} {{ m.label }}
                </button>
              </div>
            </div>

            <div class="form-row">
              <span>Nhân vật & Trang phục</span>
              <div class="mini-grid">
                <button
                  v-for="av in AVATAR_PRESETS"
                  :key="av.id"
                  type="button"
                  class="mini-chip"
                  :class="{ active: avatarId === av.id }"
                  @click="avatarId = av.id"
                >
                  🧑 {{ av.name }}
                </button>
              </div>
            </div>

            <div class="form-row">
              <span>Màu áo len / Hoodie</span>
              <div class="swatch-row">
                <button
                  v-for="out in OUTFIT_PRESETS"
                  :key="out.id"
                  type="button"
                  class="color-pill"
                  :class="{ active: outfitId === out.id }"
                  @click="outfitId = out.id"
                >
                  <span class="dot" :style="{ backgroundColor: out.cssColor }" />
                  <span>{{ out.name }}</span>
                </button>
              </div>
            </div>

            <button type="submit" class="cta-play-btn">
              ☕ Mở Cửa Bước Vào 24h Café
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- 6 Cafe Zones Showcase -->
    <section class="zones-section">
      <div class="section-container">
        <h2 class="section-heading">6 Góc Nhỏ Trong Quán Dành Cho Bạn</h2>
        <p class="section-lead">
          Một bản đồ ấm cúng duy nhất, nơi mỗi góc bàn đều mang một cảm xúc riêng.
        </p>

        <div class="zones-grid">
          <div v-for="z in zonesList" :key="z.name" class="zone-card">
            <div class="zone-icon">{{ z.icon }}</div>
            <h3>{{ z.name }}</h3>
            <p>{{ z.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Viral Gameplay Highlights (Section 4) -->
    <section class="viral-section">
      <div class="section-container">
        <h2 class="section-heading">Những Khoảnh Khắc Khiến Bạn Muốn Quay Lại</h2>
        <div class="viral-grid">
          <div class="viral-item">
            <span class="viral-badge">4.1 • Daily Mood</span>
            <h3>Tâm Trạng Mỗi Ngày</h3>
            <p>
              Chọn biểu cảm 😊 Vui vẻ, 😴 Buồn ngủ hay 🥲 Cần người lắng nghe. Mọi người có thể thả emoji động viên mà không áp lực phải bắt chuyện.
            </p>
          </div>
          <div class="viral-item">
            <span class="viral-badge">4.2 • Anonymous Message</span>
            <h3>Bảng Lời Nhắn Ẩn Danh</h3>
            <p>
              Đọc và ghim những lời chúc ấm áp trên bức tường gỗ của quán. Mỗi lời nhắn là một chiếc ôm tinh thần lúc đêm muộn.
            </p>
          </div>
          <div class="viral-item">
            <span class="viral-badge">4.3 • Coffee Together</span>
            <h3>Uống Cà Phê Cùng Nhau</h3>
            <p>
              Ngồi chung bàn, gọi một ly Cà Phê Sữa Đá hoặc Matcha Latte, cùng cụng ly 🥂 và bật đồng hồ Pomodoro 25 phút học bài.
            </p>
          </div>
          <div class="viral-item">
            <span class="viral-badge">4.5 • Polaroid Share</span>
            <h3>Chụp Ảnh Kỷ Niệm</h3>
            <p>
              Xuất ảnh Polaroid có đóng dấu thời gian thực, câu nói tâm trạng và logo 24h Café chỉ với 1 cú click.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  AVATAR_PRESETS,
  MOOD_OPTIONS,
  OUTFIT_PRESETS,
} from '@game/assets/cafeCatalog';
import { useCafeStore } from '~/stores/useCafeStore';

const store = useCafeStore();
const router = useRouter();

const nickname = ref('Khách Ghé Quán');
const avatarId = ref(AVATAR_PRESETS[0].id);
const outfitId = ref(OUTFIT_PRESETS[0].id);
const mood = ref(MOOD_OPTIONS[4].id);

const zonesList = [
  { icon: '🚪', name: 'Entrance', desc: 'Lối vào quán với thảm chào mừng và bảng hiệu đèn neon ấm áp.' },
  { icon: '🌧️', name: 'Window Seats', desc: 'Bàn đôi cạnh khung cửa kính lớn nhìn ra phố mưa rơi rả rích.' },
  { icon: '☕', name: 'Coffee Bar', desc: 'Quầy pha chế có Mèo Barista túc trực 24/7 phục vụ cà phê và cacao nóng.' },
  { icon: '💬', name: 'Main Hall', desc: 'Không gian ngồi chung nhộn nhịp và Bảng Lời Nhắn Ẩn Danh.' },
  { icon: '📚', name: 'Quiet Corner', desc: 'Góc yên tĩnh với kệ sách, đèn bàn xanh và đồng hồ Pomodoro học tập.' },
  { icon: '🌿', name: 'Garden', desc: 'Khu vườn ngoài trời dưới ánh đèn dây lung linh và tiếng mưa đêm.' },
];

onMounted(() => {
  store.loadSavedGuestProfile();
  nickname.value = store.nickname;
  avatarId.value = store.avatarId;
  outfitId.value = store.outfitId;
  mood.value = store.mood;
});

function enterCafeNow() {
  store.nickname = nickname.value.trim().slice(0, 24) || 'Khách Ghé Quán';
  store.avatarId = avatarId.value;
  store.outfitId = outfitId.value;
  store.mood = mood.value;
  store.saveGuestProfile();
  router.push('/play');
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 10%, #2c1e16 0%, #140f0c 60%, #0d0a08 100%);
  color: #f8f5f0;
}

.hero-section {
  max-width: 1180px;
  margin: 0 auto;
  padding: 56px 22px 48px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.95fr;
  gap: 40px;
  align-items: center;
}

.pill-tag {
  display: inline-block;
  background: rgba(212, 163, 115, 0.16);
  border: 1px solid rgba(212, 163, 115, 0.4);
  color: #fde68a;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 6px 13px;
  border-radius: 999px;
  margin-bottom: 18px;
}

.hero-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(40px, 5.5vw, 64px);
  line-height: 1.05;
  margin: 0 0 18px;
  color: #fffbeb;
}

.hero-sub {
  display: block;
  font-size: clamp(20px, 2.6vw, 30px);
  font-weight: 500;
  font-style: italic;
  color: #d4a373;
  margin-top: 8px;
}

.hero-desc {
  font-size: 16.5px;
  line-height: 1.68;
  color: #dfd3c3;
  margin-bottom: 24px;
}

.atmosphere-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.atmosphere-chips span {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  color: #faedcd;
}

.quick-entry-card {
  background: rgba(31, 23, 18, 0.92);
  border: 1px solid rgba(212, 163, 115, 0.42);
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}

.card-header h2 {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 22px;
  color: #fef3c7;
}

.card-header p {
  margin: 4px 0 18px;
  font-size: 13px;
  color: #cbb8a4;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
  color: #e6ccb2;
}

.form-row input {
  background: #130e0b;
  border: 1px solid rgba(212, 163, 115, 0.4);
  border-radius: 11px;
  padding: 10px 14px;
  color: #fffbeb;
  font-size: 14px;
}

.mini-grid,
.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini-chip,
.color-pill {
  background: #2b2019;
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #f5ebe0;
  border-radius: 9px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mini-chip.active,
.color-pill.active {
  background: rgba(212, 163, 115, 0.28);
  border-color: #fbbf24;
  color: #fef3c7;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.cta-play-btn {
  margin-top: 6px;
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #fffbeb;
  border: none;
  border-radius: 13px;
  padding: 13px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.cta-play-btn:hover {
  transform: translateY(-2px);
}

.zones-section,
.viral-section {
  padding: 48px 22px;
  border-top: 1px solid rgba(212, 163, 115, 0.14);
}

.section-container {
  max-width: 1180px;
  margin: 0 auto;
}

.section-heading {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 28px;
  color: #fef3c7;
  margin: 0 0 8px;
}

.section-lead {
  color: #cbb8a4;
  margin: 0 0 28px;
}

.zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.zone-card,
.viral-item {
  background: rgba(31, 23, 18, 0.78);
  border: 1px solid rgba(212, 163, 115, 0.22);
  border-radius: 16px;
  padding: 20px;
}

.zone-icon {
  font-size: 26px;
  margin-bottom: 8px;
}

.zone-card h3,
.viral-item h3 {
  margin: 0 0 6px;
  color: #fef3c7;
  font-size: 17px;
}

.zone-card p,
.viral-item p {
  margin: 0;
  color: #d6ccc2;
  font-size: 13.5px;
  line-height: 1.55;
}

.viral-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.viral-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 8px;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}
</style>

