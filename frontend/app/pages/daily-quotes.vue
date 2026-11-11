<template>
  <div class="seo-page">
    <SiteNavbar />
    <main class="content-wrap">
      <span class="kicker">DAILY QUOTES • NHỮNG CÂU NÓI HẰNG NGÀY</span>
      <h1>Những Dòng Nhắn Gửi Cho Ngày Chậm Lại</h1>
      <p class="lead">
        Mỗi ngày tại Kissaten 24h đều có những câu nói để bạn lưu vào tấm ảnh Polaroid hoặc gửi gắm cho một tâm hồn đang cần lắng nghe.
      </p>

      <div class="quotes-list">
        <blockquote v-for="(q, idx) in quotes" :key="idx" class="quote-card">
          <p>“{{ q.text }}”</p>
          <footer>— {{ q.time }} • {{ q.zone }}</footer>
        </blockquote>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const quotes = [
  {
    text: 'Có những ngày chỉ muốn ngồi yên trong một quán cà phê cùng những người xa lạ.',
    time: '23:48',
    zone: 'Bàn Cửa Sổ #2',
  },
  {
    text: 'Nếu hôm nay bạn mệt, hãy nghỉ ngơi một chút. Không cần phải giỏi mọi thứ mỗi ngày.',
    time: '01:15',
    zone: 'Phòng Chiếu Tatami',
  },
  {
    text: 'Ở đây không ai hỏi bạn đã làm được gì, chỉ hỏi bạn muốn uống trà Houjicha hay cà phê Siphon.',
    time: '17:30',
    zone: 'Quầy Bar Kissaten',
  },
  {
    text: 'Đêm muộn nhất cũng sẽ dịu lại bên một tách trà nóng và tiếng mưa ngoài hiên gỗ.',
    time: '02:10',
    zone: 'Vườn Thiền Zen Garden',
  },
  {
    text: 'Chậm lại một nhịp không có nghĩa là bạn đang tụt lại phía sau.',
    time: '08:20',
    zone: 'Sảnh Chung Main Hall',
  },
];
</script>

<style scoped>
.seo-page {
  min-height: 100vh;
  background-color: #f7f3eb;
  background-image: radial-gradient(rgba(140, 98, 57, 0.08) 1px, transparent 0);
  background-size: 24px 24px;
  color: #120803;
}

.content-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 52px 24px 80px;
}

.kicker {
  font-size: 11.5px;
  font-weight: 800;
  color: #8b2500;
  letter-spacing: 0.08em;
}

h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 36px;
  font-weight: 800;
  color: #120803;
  margin: 10px 0 14px;
}

.lead {
  color: #3d2314;
  font-size: 16.5px;
  line-height: 1.7;
  margin-bottom: 36px;
}

.quotes-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.quote-card {
  margin: 0;
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-left: 6px solid #1b4332;
  border-radius: 16px;
  padding: 22px 26px;
  box-shadow: 0 4px 16px rgba(43, 27, 17, 0.06);
}

.quote-card p {
  margin: 0 0 10px;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 20px;
  font-style: italic;
  color: #120803;
  line-height: 1.5;
}

.quote-card footer {
  font-size: 13px;
  font-weight: 700;
  color: #5c3a21;
}
</style>
