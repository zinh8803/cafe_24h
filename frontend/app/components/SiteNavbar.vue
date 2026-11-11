<template>
  <nav class="site-navbar">
    <div class="nav-inner">
      <NuxtLink to="/" class="brand-link">
        <div class="brand-hanko">
          <span class="hanko-kanji">☕</span>
        </div>
        <div class="brand-info">
          <div class="brand-main">
            <span class="brand-name">24h Café</span>
          </div>
          <span class="brand-tagline">Quán Cà Phê Mộc Mạc • A Little Place to Slow Down</span>
        </div>
      </NuxtLink>

      <div class="nav-links">
        <NuxtLink to="/daily-quotes" class="nav-item">📜 Daily Quotes</NuxtLink>
        <NuxtLink to="/about" class="nav-item">🍵 Giới Thiệu</NuxtLink>
        <NuxtLink to="/community-guidelines" class="nav-item">🏮 Nội Quy</NuxtLink>
        <NuxtLink to="/privacy" class="nav-item">🔒 Riêng Tư</NuxtLink>
        <NuxtLink to="/play" class="enter-cafe-btn">
          <span>🍵 Bước Vào Quán</span>
          <span class="btn-arrow">→</span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.site-navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fdfbf7;
  border-bottom: 2.5px solid #4a3221;
  box-shadow: 0 4px 18px rgba(43, 27, 17, 0.08);
  backdrop-filter: blur(8px);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #120803;
  transition: transform 0.15s ease;
}

.brand-link:hover {
  transform: translateY(-1px);
}

.brand-hanko {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #b91c1c;
  border: 2px solid #7f1d1d;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(185, 28, 28, 0.35);
  flex-shrink: 0;
}

.hanko-kanji {
  color: #ffffff;
  font-weight: 900;
  font-size: 15px;
  letter-spacing: 1px;
  font-family: serif;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.brand-kanji {
  font-size: 13px;
  font-weight: 800;
  color: #8b2500;
  letter-spacing: 1px;
}

.brand-name {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 20px;
  font-weight: 800;
  color: #120803;
  letter-spacing: -0.01em;
}

.brand-tagline {
  font-size: 11px;
  font-weight: 600;
  color: #4a3221;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.nav-item {
  color: #2b1b11;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #b91c1c;
  background: #f4ecdf;
  border-color: #d8c3b0;
}

.enter-cafe-btn {
  background: #1b4332;
  color: #ffffff;
  text-decoration: none;
  padding: 9px 18px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 13.5px;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 2px solid #0d281e;
  box-shadow: 0 3px 0 #0d281e;
  transition: all 0.15s ease;
}

.enter-cafe-btn:hover {
  background: #2d6a4f;
  transform: translateY(-1px);
  box-shadow: 0 4px 0 #0d281e;
}

.enter-cafe-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #0d281e;
}

.btn-arrow {
  font-size: 15px;
  transition: transform 0.15s ease;
}

.enter-cafe-btn:hover .btn-arrow {
  transform: translateX(3px);
}
</style>
