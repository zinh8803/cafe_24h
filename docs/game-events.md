# 24h Café – Đặc tả Sự kiện Realtime (Socket.IO Game Events)

Namespace: `/` (Default Socket.IO Gateway)

## 1. Danh mục Sự kiện Multi-User Realtime (Client ↔ Server)

| Sự kiện | Chiều | Payload chính | Mô tả & Xác thực từ Server |
|---|---|---|---|
| `player:join` | Client → Server | `{ roomId?, guestId, sessionId, nickname, avatarId, outfitId, mood }` | Tham gia phòng. Mỗi tab trình duyệt có `sessionId` riêng để nhiều tab/thiết bị vào cùng lúc tạo thành các nhân vật độc lập. |
| `room:state` | Server → Client | `{ selfUserId, roomId, roomName, worldCycle, players, occupiedSeats, recentChats, roomsList }` | Gửi trạng thái toàn bộ phòng ngay khi người chơi vừa vào. |
| `rooms:updated` | Server → All | `{ roomsList }` | Cập nhật realtime số lượng người đang online ở từng phòng (`Main Hall #001`, `Quiet Corner #001`, `Garden #001`). |
| `player:joined` | Server → Room | `{ player }` | Thông báo realtime cho mọi người trong phòng khi có khách mới bước vào. |
| `player:leave` | Client → Server | `{}` | Người chơi chủ động rời phòng hoặc chuyển phòng. |
| `player:left` | Server → Room | `{ userId, nickname, freedSeatId }` | Thông báo khách rời phòng & mở khóa ghế nếu người đó đang ngồi. |
| `player:move` | Client → Server | `{ x, y, direction }` | Cập nhật vị trí (~14Hz). Server kiểm tra giới hạn bản đồ và tốc độ tối đa. Nếu đang ngồi ghế thì tự động mở khóa ghế. |
| `player:moved` | Server → Room | `{ userId, x, y, direction, seatId: null, freedSeatId }` | Đồng bộ vị trí để các client khác nội suy chuyển động mượt. |
| `player:sit` | Client → Server | `{ seatId }` | Yêu cầu ngồi vào một ghế. Server kiểm tra ghế trống; nếu trống thì khóa ghế và mở khóa ghế cũ (`freedSeatId`). |
| `player:sitWith` | Client → Server | `{ targetUserId }` | Tự động tìm ghế trống đối diện cùng bàn với `targetUserId` (hoặc đi tới cạnh họ) và phát sự kiện đồng bộ cho cả phòng. |
| `player:sat` | Server → Room | `{ userId, seatId, x, y, direction, freedSeatId }` | Đồng bộ trạng thái nhân vật ngồi vào ghế. |
| `player:stand` | Client → Server | `{}` | Đứng dậy khỏi ghế hiện tại. |
| `player:emote` | Client → Server | `{ emote }` | Phát biểu cảm nhanh (`👋`, `☕`, `❤️`, `😂`, `✨`, `🎵`). |
| `player:emoted` | Server → Room | `{ userId, emote }` | Hiển thị biểu cảm bay lên trên đầu nhân vật. |
| `player:drink` | Client → Server | `{ drinkId }` | Gọi đồ uống tại quán; nhân vật cầm ly và thực hiện hoạt ảnh thưởng thức. |
| `player:drank` | Server → Room | `{ userId, drinkId, drinkIcon, drinkName }` | Đồng bộ đồ uống trên tay nhân vật. |
| `player:mood` | Client → Server | `{ mood, nickname, avatarId, outfitId }` | Đổi tâm trạng hoặc diện mạo realtime. |
| `player:updated` | Server → Room | `{ userId, mood, nickname, avatarId, outfitId }` | Đồng bộ thông tin hồ sơ/tâm trạng mới. |
| `mood:encourage` | Client → Server | `{ targetUserId, emoji }` | Gửi biểu cảm động viên trực tiếp cho một người chơi khác trong phòng (Mục 4.1). |
| `mood:encouraged` | Server → Room | `{ fromUserId, fromNickname, toUserId, toNickname, emoji }` | Hiển thị hiệu ứng động viên trên cả 2 nhân vật và thông báo ấm áp. |
| `coffee:invite` | Client → Server | `{ targetUserId?, drinkId }` | Mời một người chơi cụ thể (hoặc cả phòng) uống cà phê cùng nhau (*Coffee Together* – Mục 4.3). |
| `coffee:invited` | Server → Target Client | `{ fromUserId, fromNickname, drinkId, drinkIcon, drinkName }` | Hiển thị banner lời mời uống cà phê trực tiếp cho người được mời. |
| `coffee:accept` | Client → Server | `{ fromUserId, fromNickname, drinkId, drinkIcon, drinkName }` | Người được mời đồng ý cụng ly; server đồng bộ đồ uống cho cả 2 nhân vật. |
| `coffee:cheered` | Server → Room | `{ fromUserId, fromNickname, targetUserId, targetNickname, drinkIcon, drinkName }` | Phát hoạt ảnh cụng ly `🥂☕` đồng bộ trên đầu 2 nhân vật. |
| `chat:typing` | Client → Server | `{ isTyping }` | Trạng thái đang gõ tin nhắn. |
| `player:typing` | Server → Room | `{ userId, isTyping }` | Hiển thị bong bóng `💬 đang gõ...` trên đầu nhân vật và trong danh sách phòng. |
| `chat:send` | Client → Server | `{ content }` | Gửi tin nhắn trong phòng (tối đa 120 ký tự, giới hạn 1 tin/1.1s). |
| `chat:new` | Server → Room | `{ id, userId, nickname, content, createdAt }` | Hiển thị bong bóng chat phía trên nhân vật và trong lịch sử chat. |
| `board:post` | Client → Server | `{ content, tag }` | Ghim lời nhắn ẩn danh mới lên bảng thông điệp. |
| `board:newNote` | Server → All | `{ note }` | Đồng bộ lời nhắn ẩn danh mới cho toàn bộ người chơi đang online. |
| `board:react` | Client → Server | `{ noteId, type }` | Thả tim (`heart`, `coffee`, `sparkle`) vào lời nhắn ẩn danh. |
| `board:noteReacted` | Server → All | `{ note }` | Đồng bộ số lượt thả tim lời nhắn ẩn danh theo thời gian thực. |
| `sim:toggleCrowd` | Client → Server | `{}` | Thêm/Bớt 4 khách mô phỏng trong phòng để kiểm thử tải và tương tác nhóm. |
| `world:setCycle` / `world:cycle` | Client ↔ Server | `{ cycle }` | Đồng bộ chu kỳ thời gian/thời tiết (`morning`, `rainy`, `sunset`, `midnight`) cho mọi người chơi. |
