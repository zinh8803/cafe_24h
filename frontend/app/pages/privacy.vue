<template>
  <div class="seo-page">
    <SiteNavbar />
    <main class="content-wrap">
      <span class="kicker">PRIVACY POLICY • CHÍNH SÁCH QUYỀN RIÊNG TƯ</span>
      <h1>Chính Sách Quyền Riêng Tư & Cookie</h1>
      <p>
        <strong>24h Café</strong> ưu tiên trải nghiệm ẩn danh không cần tài khoản (Guest Session).
      </p>
      <ul>
        <li><strong>Dữ liệu lưu trữ cục bộ (LocalStorage):</strong> Lưu mã phiên khách (<code>guestId</code>), biệt danh, trang phục và tâm trạng để bạn không phải chọn lại mỗi lần ghé quán.</li>
        <li><strong>Nội dung trò chuyện:</strong> Tin nhắn chat trong phòng không được lập chỉ mục (No-index) trên các công cụ tìm kiếm.</li>
        <li><strong>Quảng cáo & Cookie:</strong> Các trang thông tin ngoài game có thể sử dụng cookie tiêu chuẩn để thống kê lưu lượng và hiển thị banner phù hợp mà không che khuất giao diện điều khiển.</li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.seo-page {
  min-height: 100vh;
  background: #140f0c;
  color: #f8f5f0;
}
.content-wrap {
  max-width: 820px;
  margin: 0 auto;
  padding: 52px 22px 80px;
  line-height: 1.7;
}
.kicker {
  font-size: 12px;
  font-weight: 700;
  color: #fbbf24;
}
h1 {
  font-family: 'Fraunces', Georgia, serif;
  color: #fef3c7;
}
</style>

