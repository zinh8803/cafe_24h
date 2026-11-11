<template>
  <div class="seo-page">
    <SiteNavbar />
    <main class="content-wrap">
      <span class="kicker">ABOUT • GIỚI THIỆU QUÁN</span>
      <h1>Về 24h Café</h1>
      <p class="lead">
        <strong>24h Café</strong> là một không gian quán cà phê cổ điển mang phong cách mộc mạc ấm áp hoạt động 24/7 ngay trên trình duyệt web.
        Không có áp lực nhiệm vụ, không có điểm số cạnh tranh và hoàn toàn không cần tải ứng dụng phức tạp.
      </p>

      <h2>Triết Lý Thiết Kế Mộc Mạc</h2>
      <div class="info-card">
        <ul class="feature-list">
          <li>
            <strong>Dành cho học sinh, sinh viên & người làm việc:</strong> Vừa mở tab nghe tiếng mưa rơi rả rích, vừa dùng đồng hồ Pomodoro 25 phút học bài trong phòng chiếu Tatami yên tĩnh.
          </li>
          <li>
            <strong>Kết nối ấm áp không áp lực:</strong> Chia sẻ cảm xúc qua Con Dấu Tâm Trạng (Daily Mood), treo tấm thẻ gỗ Ema gửi lời chúc ẩn danh hay cụng ly trà Matcha cùng lữ khách cùng bàn.
          </li>
          <li>
            <strong>Lưu giữ ký ức dịu dàng:</strong> Chụp bức ảnh Polaroid hoài niệm đóng triện son Hanko, khắc ghi khoảnh khắc an yên bên tách cà phê ấm.
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
.seo-page {
  min-height: 100vh;
  background-color: #f7f3eb;
  background-image: radial-gradient(rgba(140, 98, 57, 0.08) 1px, transparent 0);
  background-size: 24px 24px;
  color: #120803;
}

.content-wrap {
  max-width: 840px;
  margin: 0 auto;
  padding: 52px 24px 80px;
  line-height: 1.75;
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
  margin: 10px 0 16px;
}

.lead {
  font-size: 17px;
  color: #2b1b11;
  margin-bottom: 28px;
}

h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 24px;
  font-weight: 800;
  color: #120803;
  margin: 32px 0 16px;
}

.info-card {
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 4px 16px rgba(43, 27, 17, 0.06);
}

.feature-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #3d2314;
  font-size: 15.5px;
}

.feature-list strong {
  color: #120803;
}
</style>
