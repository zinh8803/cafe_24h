# 24h Café – Đặc tả Nghiệp vụ & Góp ý Cải tiến Sản phẩm (Business Specification)

## 1. Tầm nhìn & Định vị
- **Tên sản phẩm**: 24h Café (*A little place to slow down*)
- **Thể loại**: 2D Top-down Social Hangout / Virtual Cozy Café trên trình duyệt (Desktop & Mobile Web).
- **Triết lý cốt lõi**: Không áp lực thắng thua, không cày cấp, vào ngay không cần đăng ký tài khoản (Guest-first).

## 2. Phân tích & Góp ý Bổ sung cho Thiết kế Sản phẩm (`feature.md`)

Qua rà soát tài liệu thiết kế gốc (`feature.md`), dưới đây là **5 điểm khuyết quan trọng** cần bổ sung ngay từ giai đoạn MVP để đảm bảo khả năng giữ chân người dùng (Retention) và tính khả thi kỹ thuật:

### 2.1. Bổ sung Hệ thống Âm thanh & Pomodoro (Ambient Sound Mixer & Study Timer) – *Ưu tiên P0.5*
- **Vấn đề**: Nhóm khách hàng mục tiêu số 1 và số 2 là *Học sinh, sinh viên (vừa học vừa thư giãn)* và *Nhân viên văn phòng*. Nếu vào quán chỉ có hình ảnh 2D mà không có âm thanh hoặc công cụ đồng hành, người chơi sẽ rời đi sau 2–3 phút khi không có ai chat.
- **Giải pháp đề xuất**:
  - **Ambient Sound Mixer**: Bật/tắt và chỉnh âm lượng độc lập cho: Nhạc nền Lofi/Jazz nhẹ, tiếng mưa rơi bên cửa sổ, tiếng máy pha cà phê & tiếng ồn trắng (white noise) trong quán.
  - **Cozy Pomodoro (25/5)**: Đồng hồ đếm ngược tùy chọn hiển thị trạng thái `🎧 Đang tập trung (18:20)` trên đầu nhân vật để người khác biết họ đang học/làm việc và có thể ngồi học cùng bàn.

### 2.2. Giải bài toán "Phòng trống lúc mới ra mắt" (Cold-Start Problem)
- **Vấn đề**: Một game social nếu người chơi đầu tiên vào lúc 2h sáng thấy phòng `1/25` trống trơn sẽ thoát ngay lập tức.
- **Giải pháp đề xuất**:
  - **NPC Barista (Mèo / Nhân viên pha chế)**: Luôn đứng tại khu vực `Coffee Bar`, tự động chào khi có người mới vào, pha chế đồ uống và chia sẻ *Daily Quote*.
  - **Memory Echoes (Dấu vết người ghé quán)**: Hiển thị các ly cà phê còn ấm hoặc lời nhắn để lại trên bàn của những người vừa ghé qua trong 24h gần nhất.

### 2.3. Chuẩn hóa Đồng bộ Trạng thái Phòng & Ghế ngồi (Authoritative Room & Seat State)
- **Vấn đề**: Thiết kế ban đầu có sự kiện `player:sit` nhưng chưa định nghĩa cơ chế giải phóng ghế (`player:stand`), snapshot trạng thái phòng khi mới vào (`room:state`), và xử lý tranh chấp khi 2 người click cùng 1 ghế.
- **Giải pháp**:
  - Server quản lý bản đồ ghế ngồi (`seatMap: Map<seatId, userId>`).
  - Khi người chơi di chuyển (`player:move`) hoặc ngắt kết nối (`disconnect`), server tự động giải phóng ghế họ đang ngồi và phát sự kiện cập nhật cho cả phòng.

### 2.4. Cơ chế Chụp ảnh Polaroid (Screenshot & Share) không vỡ UI
- **Vấn đề**: Nếu vẽ tên nhân vật, mood và chat bubble bằng HTML DOM đè lên Canvas của Phaser, hàm chụp màn hình của Phaser (`renderer.snapshot`) sẽ chỉ chụp được nhân vật mà mất toàn bộ chữ và biểu cảm.
- **Giải pháp**:
  - Render tên hiển thị, mood badge, đồ uống đang cầm và bong bóng chat trực tiếp trong scene Phaser 3, sau đó xuất ảnh qua bộ ghép khung **Polaroid 24h Café** (gồm ảnh chụp khu vực quanh nhân vật, thời gian thực tế, câu trích dẫn tâm trạng và URL quán).

### 2.5. Lộ trình Tính năng MVP (Đã tinh chỉnh)

| Mã | Chức năng | Ưu tiên | Ghi chú triển khai |
|---|---|---|---|
| F01 | Truy cập Guest không cần tài khoản | P0 | Tạo `guestId` + token lưu `localStorage` |
| F02 | Tạo avatar, màu trang phục, nickname, mood | P0 | 6 mẫu nhân vật & bảng màu hiện đại |
| F03 | Di chuyển nhân vật (WASD / Phím mũi tên / Click-to-move / Joystick) | P0 | Va chạm tường, nội suy chuyển động 15Hz |
| F04 | Hiển thị người chơi realtime theo phòng (tối đa 25 người/phòng) | P0 | Tự động chọn phòng hoặc chuyển phòng |
| F05 | Ngồi vào ghế & Đứng dậy | P0 | Server khóa ghế chống trùng lặp |
| F06 | Chat trong quán (Bong bóng chat trên đầu + Lịch sử chat) | P0 | Giới hạn 120 ký tự, cooldown 1.2s, lọc từ ngữ |
| F07 | Emoji nhanh & Biểu cảm (`👋 ☕ ❤️ 😂 ✨`) | P0 | Hiệu ứng bay lên trên đầu nhân vật |
| F08 | Gọi đồ uống ảo & Mời cà phê người ngồi cùng | P1 (Có sẵn trong MVP) | Cà phê sữa đá, Matcha, Trà đào, Cacao nóng |
| F09 | Chu kỳ Ngày/Đêm & Thời tiết (Morning, Rainy, Sunset, Midnight) | P1 (Có sẵn trong MVP) | Đồng bộ từ Server hoặc chuyển thử nghiệm |
| F10 | Chụp ảnh Polaroid kèm Quote & Tải về chia sẻ | P1 (Có sẵn trong MVP) | Xuất file PNG có đóng dấu 24h Café |
| F11 | Bảng lời nhắn ẩn danh (Anonymous Message Board) | P1 (Có sẵn trong MVP) | Đăng lời nhắn tích cực & thả tim |

