<template>
  <div class="seo-page">
    <SiteNavbar />
    <main class="content-wrap">
      <span class="kicker">DAILY QUOTES • NHỮNG CÂU NÓI HẰNG NGÀY</span>
      <h1>Những dòng nhắn gửi cho ngày chậm lại</h1>
      <p class="lead">
        Mỗi ngày tại 24h Café đều có một câu trích dẫn mới để bạn lưu vào tấm ảnh Polaroid hoặc gửi cho một người đang cần lắng nghe.
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
    zone: 'Window Seats #2',
  },
  {
    text: 'Nếu hôm nay bạn mệt, hãy nghỉ ngơi một chút. Không cần phải giỏi mọi thứ mỗi ngày.',
    time: '01:15',
    zone: 'Quiet Corner',
  },
  {
    text: 'Ở đây không ai hỏi bạn đã làm được gì, chỉ hỏi bạn muốn uống trà đào hay cà phê.',
    time: '17:30',
    zone: 'Coffee Bar',
  },
  {
    text: 'Đêm muộn nhất cũng sẽ dịu lại bên một tách cacao nóng và tiếng mưa ngoài hiên.',
    time: '02:10',
    zone: 'Garden Terrace',
  },
  {
    text: 'Chậm lại một nhịp không có nghĩa là bạn đang tụt lại phía sau.',
    time: '08:20',
    zone: 'Main Hall',
  },
];
</script>

<style scoped>
.seo-page {
  min-height: 100vh;
  background: #140f0c;
  color: #f8f5f0;
}

.content-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 52px 22px 80px;
}

.kicker {
  font-size: 12px;
  font-weight: 700;
  color: #fbbf24;
  letter-spacing: 0.06em;
}

h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 36px;
  color: #fef3c7;
  margin: 10px 0 12px;
}

.lead {
  color: #d6ccc2;
  font-size: 16px;
  line-height: 1.65;
  margin-bottom: 32px;
}

.quotes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quote-card {
  margin: 0;
  background: #1f1712;
  border-left: 4px solid #d4a373;
  border-radius: 14px;
  padding: 20px 24px;
}

.quote-card p {
  margin: 0 0 10px;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 19px;
  font-style: italic;
  color: #fffbeb;
}

.quote-card footer {
  font-size: 12.5px;
  color: #b09b88;
}
</style>

