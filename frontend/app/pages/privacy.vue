<template>
  <div class="seo-page">
    <SiteNavbar />
    <main class="content-wrap">
      <span class="kicker">PRIVACY POLICY • CHÍNH SÁCH QUYỀN RIÊNG TƯ</span>
      <h1>Chính Sách Quyền Riêng Tư & Dữ Liệu</h1>
      <p class="lead">
        <strong>24h Café</strong> luôn tôn trọng và ưu tiên trải nghiệm ẩn danh không cần tài khoản của khách ghé thăm.
      </p>

      <div class="privacy-card">
        <ul class="privacy-list">
          <li>
            <strong>Dữ liệu lưu trữ trình duyệt (LocalStorage):</strong> Lưu tạm thời mã phiên khách (<code>guestId</code>), tên hiển thị, tâm trạng và trang phục trên thiết bị của bạn để bạn không phải thiết lập lại ở các lần ghé quán tiếp theo.
          </li>
          <li>
            <strong>Tin nhắn & tương tác trực tiếp:</strong> Dữ liệu chat trong phòng theo thời gian thực được bảo mật và không được lập chỉ mục tìm kiếm công khai.
          </li>
          <li>
            <strong>Không thu thập dữ liệu cá nhân nhạy cảm:</strong> Quán không đòi hỏi số điện thoại, mật khẩu hay tài khoản ngân hàng để bắt đầu trải nghiệm.
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

.privacy-card {
  background: #ffffff;
  border: 2px solid #5c3a21;
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 4px 16px rgba(43, 27, 17, 0.06);
}

.privacy-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #3d2314;
  font-size: 15.5px;
}

.privacy-list strong {
  color: #120803;
}

code {
  background: #faedcd;
  color: #8b2500;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 700;
}
</style>
