<template>
  <nav class="site-navbar">
    <div class="nav-inner">
      <NuxtLink to="/" class="brand-link">
        <span class="cup-badge">☕</span>
        <div>
          <span class="brand-name">24h Café</span>
          <span class="brand-tagline">A little place to slow down</span>
        </div>
      </NuxtLink>

      <div class="nav-links">
        <NuxtLink to="/daily-quotes" class="nav-item">Daily Quotes</NuxtLink>
        <NuxtLink to="/about" class="nav-item">Giới Thiệu</NuxtLink>
        <NuxtLink to="/community-guidelines" class="nav-item">Quy Tắc</NuxtLink>
        <NuxtLink to="/privacy" class="nav-item">Quyền Riêng Tư</NuxtLink>
        <NuxtLink to="/play" class="enter-cafe-btn">Bước Vào Quán →</NuxtLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.site-navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(20, 15, 12, 0.88);
  border-bottom: 1px solid rgba(212, 163, 115, 0.22);
  backdrop-filter: blur(12px);
}

.nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 11px;
  text-decoration: none;
  color: #fef3c7;
}

.cup-badge {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(212, 163, 115, 0.2);
  border: 1px solid rgba(212, 163, 115, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
}

.brand-name {
  display: block;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.1;
}

.brand-tagline {
  display: block;
  font-size: 11.5px;
  color: #cbb8a4;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.nav-item {
  color: #e6ccb2;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  transition: color 0.15s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #fbbf24;
}

.enter-cafe-btn {
  background: linear-gradient(135deg, #d4a373, #b07d56);
  color: #1c130e;
  text-decoration: none;
  padding: 9px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13.5px;
  transition: transform 0.15s ease;
}

.enter-cafe-btn:hover {
  transform: translateY(-1px);
}
</style>

