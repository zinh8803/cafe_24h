# 24h Café – Đặc tả REST API (API Specification)

Base URL mặc định (Môi trường phát triển): `http://localhost:3001/api`

## 1. Auth & Guest Session (`AuthModule` & `PlayerModule`)

### `POST /api/auth/guest`
Khởi tạo hoặc khôi phục phiên chơi không cần tài khoản (Guest Session).
- **Body**:
  ```json
  {
    "guestId": "guest_optional_existing_id",
    "nickname": "Mây Lang Thang",
    "avatarId": "preset_01",
    "outfitId": "latte_coat",
    "mood": "peaceful"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "user": {
      "id": "usr_89a1c2",
      "guestId": "guest_f931a",
      "nickname": "Mây Lang Thang",
      "avatarId": "preset_01",
      "outfitId": "latte_coat",
      "mood": "peaceful"
    }
  }
  ```

### `PATCH /api/player/profile`
Cập nhật trang phục, avatar, tên hiển thị hoặc tâm trạng.

---

## 2. Hệ thống Phòng (`RoomModule`)

### `GET /api/rooms`
Trả về danh sách các phòng hiện có kèm số lượng người đang online thực tế và trạng thái thời tiết/chu kỳ thời gian của quán.
- **Response `200 OK`**:
  ```json
  {
    "worldCycle": "midnight",
    "dailyQuote": "Có những ngày chỉ muốn ngồi yên trong một quán cà phê cùng những người xa lạ.",
    "rooms": [
      {
        "id": "cafe:main:001",
        "name": "Main Hall #001",
        "roomType": "main",
        "onlineCount": 14,
        "capacity": 25
      },
      {
        "id": "cafe:quiet:001",
        "name": "Quiet Corner #001",
        "roomType": "quiet",
        "onlineCount": 6,
        "capacity": 25
      }
    ]
  }
  ```

---

## 3. Lời nhắn Ẩn danh (`MessageModule`)

### `GET /api/messages`
Lấy danh sách các lời nhắn ẩn danh trên bảng thông điệp trong quán (tối đa 30 lời nhắn mới nhất).

### `POST /api/messages`
Gửi một lời nhắn ẩn danh mới (có bộ lọc từ ngữ không phù hợp và giới hạn 280 ký tự).
- **Body**:
  ```json
  {
    "userId": "usr_89a1c2",
    "content": "Nếu hôm nay bạn mệt, hãy nghỉ ngơi một chút. Không cần phải giỏi mọi thứ mỗi ngày."
  }
  ```

### `POST /api/messages/:id/react`
Thả biểu cảm (`❤️`, `☕`, `✨`) vào một lời nhắn ẩn danh.

---

## 4. Đồ uống & Vật phẩm (`ItemModule`)

### `GET /api/items`
Trả về danh sách đồ uống (Cà phê sữa đá, Matcha Latte, Trà đào cam sả, Cacao kem trứng, Trà hoa cúc mật ong) và các mẫu trang phục miễn phí trong MVP.

---

## 5. Kiểm duyệt & Thống kê (`ModerationModule` & `AnalyticsModule`)

### `POST /api/moderation/report`
Báo cáo người chơi hoặc lời nhắn vi phạm.

### `GET /api/analytics/summary`
Thống kê nhanh CCU hiện tại, số ly cà phê đã pha trong ngày, số lời nhắn ẩn danh đã gửi.

