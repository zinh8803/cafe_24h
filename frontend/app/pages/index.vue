<template>
  <div class="landing-page">
    <SiteNavbar />

    <!-- Hero Section with Instant Guest Character Creator -->
    <section class="hero-section">
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="pill-tag">
            <span class="pill-dot">●</span>
            <span>QUÁN CÀ PHÊ 24H • MỞ CỬA 24/7 TRÊN TRÌNH DUYỆT • KHÔNG CẦN CÀI ĐẶT</span>
          </div>

          <h1 class="hero-title">
            <span class="main-title">24h Café</span>
            <span class="hero-sub">A Little Place to Slow Down • Chốn Dừng Chân Dịu Êm</span>
          </h1>

          <p class="hero-desc">
            Một quán cà phê cổ điển mang phong cách mộc mạc ấm áp, mở cửa suốt ngày đêm.
            Chọn chiếc bàn gỗ cạnh cửa sổ ngắm mưa rả rích,
            thưởng thức tách cà phê pha thơm ngát hay ấm trà nóng và cùng chuyện trò với những tâm hồn đồng điệu.
          </p>

          <div class="atmosphere-chips">
            <span class="chip-item">☀️ Nắng Sớm Hinoki</span>
            <span class="chip-item">🌧️ Mưa Rào Ban Trưa</span>
            <span class="chip-item">🌇 Hoàng Hôn Ấm Áp</span>
            <span class="chip-item">🌙 Đêm Trăng Tĩnh Lặng</span>
          </div>
        </div>

        <!-- Quick Character Card: Sổ Khách Quán -->
        <div class="quick-entry-card">
          <div class="card-stamp">☕</div>
          <div class="card-header">
            <div class="header-badge">GUEST PASS</div>
            <h2>Ghi Tên Bước Vào Quán</h2>
            <p>Không cần tạo tài khoản • Ghé quán ngay trong 5 giây</p>
          </div>

          <form class="entry-form" @submit.prevent="enterCafeNow">
            <label class="form-row">
              <span class="row-label">Tên hiển thị của bạn (Nickname)</span>
              <input
                v-model="nickname"
                type="text"
                maxlength="24"
                placeholder="Ví dụ: Mây 2 Giờ Sáng, Trà Xanh..."
                class="washi-input"
              />
            </label>

            <div class="form-row">
              <span class="row-label">Tâm trạng hôm nay (Daily Mood)</span>
              <div class="mini-grid">
                <button
                  v-for="m in MOOD_OPTIONS"
                  :key="m.id"
                  type="button"
                  class="mini-chip"
                  :class="{ active: mood === m.id }"
                  @click="mood = m.id"
                >
                  <span class="mood-emoji">{{ m.emoji }}</span>
                  <span>{{ m.label }}</span>
                </button>
              </div>
            </div>

            <div class="form-row">
              <span class="row-label">Nhân vật & Kiểu dáng</span>
              <div class="mini-grid">
                <button
                  v-for="av in AVATAR_PRESETS"
                  :key="av.id"
                  type="button"
                  class="mini-chip"
                  :class="{ active: avatarId === av.id }"
                  @click="avatarId = av.id"
                >
                  <span class="av-icon">🧑</span>
                  <span>{{ av.name }}</span>
                </button>
              </div>
            </div>

            <div class="form-row">
              <span class="row-label">Màu áo len / Áo Haori</span>
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
              <span>🍵 Kéo Cửa Bước Vào Kissaten 24h</span>
              <span class="cta-arrow">→</span>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- 6 Cafe Zones Showcase -->
    <section class="zones-section">
      <div class="section-container">
        <div class="section-badge">GHIBLI ZONES • 6 GÓC QUÁN</div>
        <h2 class="section-heading">6 Góc Nhỏ Bình Yên Trong Quán</h2>
        <p class="section-lead">
          Mỗi góc bàn là một nốt trầm thư thái, nơi bạn có thể làm việc, đọc sách hay đơn giản là thả hồn theo điệu nhạc.
        </p>

        <div class="zones-grid">
          <div v-for="z in zonesList" :key="z.name" class="zone-card">
            <div class="zone-icon-box">{{ z.icon }}</div>
            <h3>{{ z.name }}</h3>
            <p>{{ z.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Viral Highlights Section -->
    <section class="viral-section">
      <div class="section-container">
        <div class="section-badge">INTERACTIVE EXPERIENCES</div>
        <h2 class="section-heading">Những Khoảnh Khắc Khiến Bạn Muốn Quay Lại</h2>
        <p class="section-lead">
          Tận hưởng những tương tác nhẹ nhàng không áp lực giữa lòng quán cà phê ảo.
        </p>

        <div class="viral-grid">
          <div class="viral-item">
            <span class="viral-badge">4.1 • CON DẤU TÂM TRẠNG</span>
            <h3>Daily Mood Thư Thái</h3>
            <p>
              Chọn biểu cảm 😊 Vui vẻ, 😴 Buồn ngủ hay 🍵 Cần tĩnh lặng. Mọi người có thể gửi icon ấm áp động viên mà không tạo áp lực phải giao tiếp.
            </p>
          </div>
          <div class="viral-item">
            <span class="viral-badge">4.2 • LỜI CHÚC BÌNH YÊN</span>
            <h3>Bảng Lời Nhắn Ẩn Danh</h3>
            <p>
              Treo tấm thiệp gỗ để lại những lời chúc bình yên lên tường quán. Mỗi lời nhắn là một chiếc ôm tinh thần gửi gắm tới những lữ khách xa lạ.
            </p>
          </div>
          <div class="viral-item">
            <span class="viral-badge">4.3 • TRÀ & CÀ PHÊ BÌNH YÊN</span>
            <h3>Cụng Ly Trà & Pomodoro</h3>
            <p>
              Ngồi chung bàn gỗ, gọi một ly Matcha Latte hay cà phê thơm nóng, cụng ly 🥂 và cùng bật đồng hồ Pomodoro 25 phút học bài.
            </p>
          </div>
          <div class="viral-item">
            <span class="viral-badge">4.4 • POLAROID NOSTALGIA</span>
            <h3>Ảnh Kỷ Niệm Triện Son</h3>
            <p>
              Lưu giữ khoảnh khắc ghé quán bằng tấm ảnh Polaroid có đóng triện son, câu danh ngôn chữa lành và dấu thời gian thực tế.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-left">
          <span class="footer-logo">24h Café</span>
          <span class="footer-sub">Quán cà phê ảo 2D mộc mạc ấm áp • Mở cửa 24/7 trên trình duyệt.</span>
        </div>
        <div class="footer-links">
          <NuxtLink to="/about">Giới Thiệu</NuxtLink>
          <NuxtLink to="/community-guidelines">Quy Tắc Quán</NuxtLink>
          <NuxtLink to="/privacy">Quyền Riêng Tư</NuxtLink>
          <NuxtLink to="/daily-quotes">Daily Quotes</NuxtLink>
        </div>
      </div>
    </footer>
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
  { icon: '🚪', name: 'Lối Vào Quán (Entrance)', desc: 'Cửa gỗ ấm cúng với rèm vải mộc và chuông gió leng keng đón khách.' },
  { icon: '🌧️', name: 'Bàn Cửa Sổ (Window Seats)', desc: 'Dãy bàn gỗ sồi sáng ngắm mưa rơi ngoài hiên phố, lắng nghe tiếng lộp độp thanh bình.' },
  { icon: '☕', name: 'Quầy Pha Chế (Coffee Bar)', desc: 'Tỏa hương cà phê thơm ngát và ấm trà bốc khói cùng Mèo Barista túc trực 24/7.' },
  { icon: '💬', name: 'Sảnh Chung (Main Hall)', desc: 'Không gian ghế nệm vintage, góc gặp gỡ thân tình và bảng lời nhắn treo điều ước.' },
  { icon: '🍵', name: 'Khu Chiếu Yên Tĩnh (Quiet Zone)', desc: 'Chiếu cói êm dịu truyền thống, bàn trà bệt và đồng hồ Pomodoro tập trung làm việc.' },
  { icon: '🎋', name: 'Vườn Thư Giãn (Zen Garden)', desc: 'Sân hiên ngoài trời với đèn đá, khóm trúc xanh rì rào và ao nước tĩnh tại dưới trăng.' },
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
  background-color: #f7f3eb;
  background-image: radial-gradient(rgba(140, 98, 57, 0.08) 1px, transparent 0);
  background-size: 24px 24px;
  color: #120803;
  display: flex;
  flex-direction: column;
}

.hero-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 24px 64px;
  width: 100%;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.95fr;
  gap: 48px;
  align-items: center;
}

.pill-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #faedcd;
  border: 1.5px solid #8c6239;
  color: #3a2010;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(74, 50, 33, 0.08);
}

.pill-dot {
  color: #1b4332;
  font-size: 10px;
}

.hero-title {
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kanji-kicker {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #8b2500;
  font-family: serif;
}

.main-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(42px, 5.5vw, 68px);
  font-weight: 800;
  line-height: 1.05;
  color: #120803;
  letter-spacing: -0.02em;
}

.hero-sub {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(18px, 2.2vw, 24px);
  font-weight: 600;
  font-style: italic;
  color: #5c3a21;
  margin-top: 6px;
}

.hero-desc {
  font-size: 16.5px;
  line-height: 1.75;
  color: #2b1b11;
  margin-bottom: 28px;
  max-width: 580px;
}

.atmosphere-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip-item {
  background: #ffffff;
  border: 1.5px solid #5c3a21;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #120803;
  box-shadow: 0 2px 4px rgba(74, 50, 33, 0.06);
}

/* Quick Entry Card */
.quick-entry-card {
  position: relative;
  background: #ffffff;
  border: 2.5px solid #4a3221;
  border-radius: 24px;
  padding: 28px 30px;
  box-shadow: 0 16px 40px rgba(43, 27, 17, 0.12);
}

.card-stamp {
  position: absolute;
  top: 18px;
  right: 20px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px dashed #b91c1c;
  color: #b91c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  opacity: 0.85;
}

.card-header {
  margin-bottom: 20px;
}

.header-badge {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #8b2500;
  margin-bottom: 4px;
}

.card-header h2 {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 24px;
  font-weight: 800;
  color: #120803;
}

.card-header p {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #5c3a21;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.row-label {
  font-size: 13px;
  font-weight: 800;
  color: #120803;
}

.washi-input {
  background: #fdfbf7;
  border: 2px solid #5c3a21;
  border-radius: 12px;
  padding: 11px 15px;
  color: #120803;
  font-size: 14.5px;
  font-weight: 600;
  outline: none;
  transition: all 0.15s ease;
}

.washi-input:focus {
  border-color: #1b4332;
  box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.15);
  background: #ffffff;
}

.mini-grid,
.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.mini-chip,
.color-pill {
  background: #f7f3eb;
  border: 1.5px solid #8c6239;
  color: #120803;
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.mini-chip:hover,
.color-pill:hover {
  background: #ede6d9;
  border-color: #5c3a21;
}

.mini-chip.active,
.color-pill.active {
  background: #d8f3dc;
  border: 2px solid #1b4332;
  color: #081c15;
  box-shadow: 0 2px 6px rgba(27, 67, 50, 0.18);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.cta-play-btn {
  margin-top: 10px;
  background: #1b4332;
  color: #ffffff;
  border: 2px solid #0d281e;
  border-radius: 14px;
  padding: 14px 22px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 0 #0d281e;
  transition: all 0.15s ease;
}

.cta-play-btn:hover {
  background: #2d6a4f;
  transform: translateY(-1px);
  box-shadow: 0 5px 0 #0d281e;
}

.cta-play-btn:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #0d281e;
}

.cta-arrow {
  font-size: 18px;
  transition: transform 0.15s ease;
}

.cta-play-btn:hover .cta-arrow {
  transform: translateX(4px);
}

/* Sections Common */
.zones-section,
.viral-section {
  padding: 64px 24px;
  border-top: 2.5px solid #4a3221;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-badge {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #8b2500;
  margin-bottom: 8px;
}

.section-heading {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 32px;
  font-weight: 800;
  color: #120803;
  margin: 0 0 10px;
}

.section-lead {
  color: #3d2314;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 32px;
  max-width: 680px;
}

/* Zones Grid */
.zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.zone-card {
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 6px 18px rgba(43, 27, 17, 0.06);
  transition: transform 0.15s ease;
}

.zone-card:hover {
  transform: translateY(-2px);
  border-color: #1b4332;
}

.zone-icon-box {
  font-size: 28px;
  margin-bottom: 10px;
}

.zone-kanji {
  font-size: 12px;
  font-weight: 800;
  color: #8b2500;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.zone-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #120803;
}

.zone-card p {
  margin: 0;
  color: #3d2314;
  font-size: 14px;
  line-height: 1.6;
}

/* Viral Grid */
.viral-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.viral-item {
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 6px 18px rgba(43, 27, 17, 0.06);
}

.viral-badge {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #ef4444;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.viral-item h3 {
  margin: 0 0 8px;
  color: #120803;
  font-size: 18px;
  font-weight: 800;
}

.viral-item p {
  margin: 0;
  color: #3d2314;
  font-size: 14px;
  line-height: 1.6;
}

/* Footer */
.site-footer {
  margin-top: auto;
  background: #fdfbf7;
  border-top: 2.5px solid #4a3221;
  padding: 28px 24px;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-logo {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 17px;
  font-weight: 800;
  color: #120803;
}

.footer-sub {
  font-size: 12px;
  color: #5c3a21;
  font-weight: 500;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.footer-links a {
  color: #2b1b11;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: color 0.15s ease;
}

.footer-links a:hover {
  color: #b91c1c;
}

@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
</style>
