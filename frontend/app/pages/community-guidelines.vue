<template>
  <div class="seo-page">
    <SiteNavbar />
    <main class="content-wrap">
      <span class="kicker">COMMUNITY GUIDELINES • NỘI QUY QUÁN TRÀ</span>
      <h1>Nội Quy Chung Tại Kissaten 24h</h1>
      <p class="lead">
        Để giữ cho không gian quán luôn là một chốn dừng chân bình yên và an toàn cho tất cả mọi người, xin bạn hãy lưu ý:
      </p>

      <div class="guidelines-card">
        <ol class="rules-list">
          <li>
            <strong>Tôn trọng sự yên tĩnh & lòng tử tế:</strong> Không sử dụng ngôn từ kích động, phân biệt đối xử hoặc xúc phạm các vị khách khác trong quán.
          </li>
          <li>
            <strong>Bảo vệ thông tin cá nhân:</strong> Không chia sẻ số điện thoại, địa chỉ nhà hay liên kết nguy hại lên Bảng Gỗ Ema hay khung chat chung.
          </li>
          <li>
            <strong>Giữ không gian trò chuyện êm dịu:</strong> Hệ thống tự động giới hạn tần suất gửi tin và hỗ trợ tính năng Ẩn (Mute) / Báo cáo (Report) nhanh chóng ngay trên danh sách khách.
          </li>
        </ol>
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

.guidelines-card {
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 4px 16px rgba(43, 27, 17, 0.06);
}

.rules-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #3d2314;
  font-size: 15.5px;
}

.rules-list strong {
  color: #120803;
}
</style>
