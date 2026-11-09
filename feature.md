1. Tổng quan sản phẩm
24h Café
A little place to slow down.








rareconnections.io


Social game
2D modern
Multiplayer
Browser game

Ý tưởng cốt lõi

Một quán cà phê hoạt động 24/7 trong thế giới ảo. Người chơi điều khiển nhân vật của mình, chọn bàn, gọi đồ uống ảo, nghe nhạc, trò chuyện và gặp gỡ những người đang online.

Đối tượng người chơi
Nhóm	Nhu cầu
Học sinh, sinh viên	Vừa học vừa có không gian thư giãn
Nhân viên văn phòng	Giải trí sau giờ làm
Người thích game nhẹ	Không muốn tải game
Người thích kết bạn	Gặp người lạ, trò chuyện
Người thích aesthetic	Chụp ảnh nhân vật, không gian đẹp

Định vị: một nơi để ghé vào bất cứ lúc nào, không áp lực thắng thua, không cần cày cấp.
2. Thiết kế thế giới game
2.1. Giao diện chính








gog.com


Tôi đề xuất góc nhìn Top-down 2D, hơi nghiêng nhẹ theo phong cách game hiện đại.

Các khu vực chính:
Khu vực	Chức năng
Entrance	Lối vào quán
Main Hall	Khu vực ngồi chung
Window Seats	Bàn cạnh cửa sổ
Coffee Bar	Quầy pha chế
Quiet Corner	Góc yên tĩnh
Garden	Khu vườn ngoài trời

Trong MVP chỉ cần một bản đồ duy nhất, chưa cần chia nhiều tầng hoặc nhiều chi nhánh.
2.2. Chu kỳ ngày và đêm










Morning Café

Ánh nắng, nhạc nhẹ, khách uống cà phê.











Rainy Afternoon

Mưa ngoài cửa sổ, ánh sáng dịu.











Sunset Café

Ánh hoàng hôn, không gian ấm áp.











Midnight Café

Đèn neon, trăng sao, nhạc chill.


Thời tiết và thời gian thay đổi theo đồng hồ server hoặc chu kỳ cố định. Không cần người chơi thực hiện nhiệm vụ để mở khóa.
2.3. Nhân vật








2dpixx.itch.io


Mỗi người chơi có một avatar:
- Nam/nữ hoặc nhân vật trung tính.
- Tùy chỉnh tóc, màu da, quần áo.
- Biểu cảm khuôn mặt.
- Animation đi bộ, ngồi, vẫy tay, uống cà phê.
- Tên hiển thị và trạng thái cảm xúc.
MVP chỉ cần 6–10 mẫu nhân vật và một số trang phục miễn phí.

3. Nghiệp vụ MVP
Mục tiêu MVP là tạo ra một sản phẩm đủ để kiểm chứng xem người dùng có thích quay lại hay không.
3.1. Luồng người chơi
Truy cập 24h Café

Không cần cài đặt ứng dụng


Tạo nhân vật

Chọn avatar, tên hiển thị


Vào quán cà phê

Thấy người chơi đang online


Ngồi thư giãn


Trò chuyện


Gọi đồ uống


Chụp ảnh




Lưu kỷ niệm và chia sẻ

Quay lại quán vào ngày hôm sau


3.2. Danh sách chức năng MVP
Mã	Chức năng	Ưu tiên
F01	Truy cập không cần tài khoản	P0
F02	Tạo avatar và nickname	P0
F03	Di chuyển nhân vật	P0
F04	Hiển thị người chơi realtime	P0
F05	Ngồi vào bàn	P0
F06	Chat trong quán	P0
F07	Emoji và biểu cảm	P0
F08	Gọi đồ uống ảo	P1
F09	Chu kỳ ngày/đêm	P1
F10	Chụp và chia sẻ ảnh	P1
F11	Lưu trang phục	P1
F12	Bảng xếp hạng	P2

P0 là bắt buộc để ra mắt. P1 và P2 có thể triển khai sau.
3.3. Quy tắc gameplay
Di chuyển:
- WASD hoặc phím mũi tên trên máy tính.
- Joystick ảo trên điện thoại.
- Không thể đi xuyên tường, bàn ghế.
- Không thể chiếm cùng một vị trí ngồi.
Ngồi:
- Click vào ghế để ngồi.
- Nhân vật chuyển sang animation ngồi.
- Có thể đứng dậy bất cứ lúc nào.
Chat:
- Chat chung trong quán.
- Tin nhắn bong bóng xuất hiện phía trên nhân vật.
- Emoji nhanh như 👋 ☕ ❤️ 😂.
- Giới hạn tần suất tin nhắn.
- Có chức năng mute, block và report.
Đồ uống:
- Chọn cà phê, trà sữa, trà đào.
- Nhân vật thực hiện animation uống.
- Có hiệu ứng hình ảnh nhỏ.
- Không cần hệ thống nguyên liệu hoặc nấu ăn trong MVP.
4. Những gameplay giúp game viral
Đây là phần tôi muốn đầu tư nhiều nhất. Một quán cà phê chỉ có di chuyển và chat sẽ nhanh chóng nhàm chán.

Chúng ta cần tạo ra những hoạt động khiến người chơi muốn chụp ảnh, chia sẻ và quay lại.
4.1. Daily Mood – Tâm trạng mỗi ngày








mongleharu.com


Khi vào game, người chơi chọn tâm trạng:
- 😊 Vui vẻ.
- 😴 Buồn ngủ.
- 😔 Hơi buồn.
- 🥰 Hạnh phúc.
- 😌 Bình yên.
- 🥲 Cần người lắng nghe.
Tâm trạng hiển thị bên cạnh avatar. Những người khác có thể gửi emoji động viên.

Đây là cơ chế tạo tương tác mà không bắt buộc mọi người phải chat.
4.2. Anonymous Message – Lời nhắn ẩn danh








gamesradar.com


Trong quán có một bảng thông điệp.

Người chơi có thể:
- Để lại lời chúc.
- Viết một câu nói tích cực.
- Gửi lời nhắn ẩn danh.
- Đọc lời nhắn của người khác.
- Thả reaction.
Ví dụ:
Nếu hôm nay bạn mệt, hãy nghỉ ngơi một chút. Không cần phải giỏi mọi thứ mỗi ngày.

Đây là tính năng có khả năng tạo nội dung chia sẻ trên mạng xã hội. Cần lọc spam, nội dung độc hại và thông tin cá nhân.
4.3. Coffee Together – Uống cà phê cùng nhau








twitch.tv


Hai người có thể:
1. Chọn cùng một bàn.
2. Gửi lời mời uống cà phê.
3. Cùng thực hiện animation uống.
4. Chụp ảnh chung.
5. Chia sẻ khoảnh khắc.
Không cần xây dựng hệ thống bạn bè phức tạp ở phiên bản đầu.
4.4. Daily Events – Sự kiện hằng ngày








haowallpaper.com


Một số sự kiện:
Sự kiện	Hoạt động
Rainy Day	Cả quán chuyển sang trời mưa
Music Night	Cùng nghe nhạc
Friday Night	Đèn neon và không gian đêm
Christmas Café	Trang trí cây thông
Valentine's Café	Tặng hoa và lời chúc

Sự kiện có thể chạy tự động theo lịch server.
4.5. Screenshot & Share – Cơ chế lan truyền








duniaku.idntimes.com


Đây là tính năng rất quan trọng.

Khi click Camera:
- Ẩn giao diện điều khiển.
- Chụp khu vực xung quanh nhân vật.
- Tạo ảnh có logo 24h Café.
- Gắn câu nói hoặc tâm trạng.
- Cho phép tải ảnh và chia sẻ.
Ví dụ nội dung:
23:48 – Có những ngày chỉ muốn ngồi yên trong một quán cà phê cùng những người xa lạ.

Người chia sẻ sẽ vô tình trở thành kênh marketing cho game.
5. Kiến trúc kỹ thuật
Với dự án này, tôi đề xuất sử dụng những công nghệ quen thuộc với nền tảng backend của cậu chủ, không cần đưa quá nhiều công nghệ mới vào MVP.
System Architecture
Client – Browser

Desktop / Mobile

Nuxt 3 + TypeScript + Phaser 3

HTTPS / WebSocket

NestJS Backend

REST API + Socket.IO Gateway

Authentication / Chat / Game Room / Player State

MySQL

User, avatar, messages, items


Redis

Presence, room state, cache



Nginx + VPS

Reverse Proxy / SSL / Static Assets


5.1. Frontend
- Nuxt 3: giao diện website, SEO, landing page.
- Phaser 3: render bản đồ 2D, animation và điều khiển nhân vật.
- TypeScript: quản lý logic game.
- Socket.IO Client: giao tiếp realtime.
Tách Phaser thành một game module riêng bên trong Nuxt. Không nên viết toàn bộ logic game vào Vue components.
5.2. Backend NestJS
Chia thành các module:
Module	Trách nhiệm
AuthModule	Guest session, đăng nhập
PlayerModule	Avatar, nickname
RoomModule	Phòng và trạng thái
GameModule	Di chuyển, ngồi, tương tác
ChatModule	Chat realtime
MoodModule	Tâm trạng
MessageModule	Lời nhắn ẩn danh
ItemModule	Đồ uống, trang phục
AnalyticsModule	Thống kê hành vi
ModerationModule	Report, block, spam

5.3. Cơ chế multiplayer
Đây là phần backend quan trọng nhất.

Tôi đề xuất mỗi quán là một Socket.IO room.

Ví dụ:
cafe:main
cafe:quiet
cafe:garden


Các sự kiện realtime:
Event	Chiều	Mục đích
player:join	Client → Server	Vào quán
player:leave	Client → Server	Rời quán
player:move	Client → Server	Di chuyển
player:moved	Server → Client	Đồng bộ vị trí
player:sit	Client → Server	Ngồi ghế
player:emote	Client → Server	Biểu cảm
chat:send	Client → Server	Gửi tin nhắn
chat:new	Server → Client	Nhận tin nhắn

Nguyên tắc quan trọng: Server phải xác thực vị trí, giới hạn tốc độ di chuyển, kiểm tra ghế còn trống và giới hạn chat. Không để client tự quyết định trạng thái có thẩm quyền.

Với MVP, không cần đồng bộ vị trí 60 lần/giây. Có thể gửi trạng thái di chuyển ở khoảng 10–15 lần/giây và nội suy chuyển động ở client.
5.4. Database
Các bảng chính:
users
  id
  guest_id
  nickname
  created_at

player_profiles
  id
  user_id
  avatar_id
  outfit_id
  mood

game_rooms
  id
  name
  room_type
  capacity

player_sessions
  id
  user_id
  room_id
  last_seen_at

chat_messages
  id
  user_id
  room_id
  content
  created_at

cafe_items
  id
  name
  item_type
  price

player_items
  id
  user_id
  item_id

anonymous_messages
  id
  user_id
  content
  created_at

reports
  id
  reporter_id
  target_type
  target_id
  reason
  status


Không lưu vị trí di chuyển liên tục vào MySQL. Vị trí realtime nằm trong bộ nhớ server hoặc Redis; chỉ lưu những dữ liệu thực sự cần thiết.
5.5. Cấu trúc thư mục
24h-cafe/
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── composables/
│   │   └── stores/
│   ├── game/
│   │   ├── scenes/
│   │   ├── entities/
│   │   ├── animations/
│   │   ├── systems/
│   │   └── assets/
│   └── public/
│
├── backend/
│   └── src/
│       ├── auth/
│       ├── player/
│       ├── room/
│       ├── game/
│       ├── chat/
│       ├── mood/
│       ├── message/
│       ├── item/
│       └── moderation/
│
└── docs/
    ├── business.md
    ├── database.md
    ├── api.md
    └── game-events.md



6. Hệ thống phòng và khả năng chịu tải
Không nên để toàn bộ người chơi ở cùng một Socket.IO room nếu lượng truy cập tăng.

Tôi đề xuất:
- Mỗi phòng có giới hạn 20–30 người.
- Khi phòng đầy, tự động tạo phòng mới.
- Người chơi có thể chọn phòng hoặc vào phòng đông người.
- Người chơi offline được loại khỏi danh sách bằng heartbeat và timeout.
Ví dụ:
24h Café
├── Main Hall #001 (25/25)
├── Main Hall #002 (18/25)
├── Main Hall #003 (12/25)
├── Quiet Corner #001 (10/25)
└── Garden #001 (20/25)


Khi lượng truy cập tăng:
Quy mô	Hướng triển khai
1–100 CCU	Một NestJS instance
100–500 CCU	Tối ưu event, Redis, kiểm thử tải
500–2.000 CCU	Nhiều instance, Socket.IO Redis adapter
Trên 2.000 CCU	Tách game gateway, giám sát và scale theo tải

Đây là các mốc thiết kế tham khảo, không phải cam kết năng lực của VPS. Cần benchmark bằng tải thực tế.

Với VPS Windows Server hiện tại, có thể chạy bản thử nghiệm. Khi chuẩn bị public rộng, tôi khuyên triển khai production trên Ubuntu VPS để dễ quản lý Nginx, PM2 và Redis hơn. 
7. Kế hoạch kiếm tiền
Tôi không khuyến khích đưa quảng cáo vào ngay khi người chơi vừa vào quán. Hãy để người dùng yêu thích sản phẩm trước.
7.1. Monetag – Nguồn thu quảng cáo








monetag.com


Các vị trí quảng cáo đề xuất:
Vị trí	Hình thức	Đề xuất
Trang chủ	Banner	Có thể dùng
Trang giới thiệu	Banner	Có thể dùng
Khu vực ngoài game	Banner	Có thể dùng
Trong lúc chơi	Popunder	Không khuyến khích
Phần thưởng tùy chọn	Rewarded Ads	Chỉ khi có định dạng phù hợp

Tôi ưu tiên banner quảng cáo vì không làm gián đoạn người chơi.

Lưu ý:
- Kiểm tra chính sách Monetag đối với nội dung và traffic trước khi tích hợp.
- Không tự tạo lượt click hoặc lượt xem.
- Có chính sách quyền riêng tư và thông báo cookie phù hợp.
- Không để quảng cáo che khuất nút điều khiển trên mobile.
7.2. Các nguồn doanh thu bổ sung










Bán trang phục avatar

Trang phục giới hạn, mũ, phụ kiện, kiểu tóc.
Ưu tiên sau MVP












Vật phẩm trang trí

Bàn, ghế, đèn, chậu cây, hiệu ứng riêng.












Đồ uống đặc biệt

Bộ sưu tập cà phê, trà và đồ uống theo mùa.












Donate

Người chơi ủng hộ để duy trì thế giới 24h Café.



7.3. Ước tính doanh thu quảng cáo
Ví dụ giả định để cậu chủ hình dung, không phải báo giá CPM thực tế của Monetag.

Giả sử:
- 1.000 người truy cập/ngày.
- Mỗi người có 2 lượt hiển thị quảng cáo/ngày.
- Tổng cộng 2.000 impressions/ngày.
- Giả định eCPM là $0.5–$2.
Công thức:
\[
Revenue = \frac{Impressions}{1000} \times eCPM
\]

Máy tính doanh thu quảng cáo
Lượt truy cập/ngày
1.000




Impressions/người/ngày
2




eCPM giả định
$1.00





Doanh thu/ngày
$2.00

Doanh thu/tháng (30 ngày)
$60.00


Mô hình chưa trừ thuế, chi phí máy chủ, traffic không hợp lệ, tỷ lệ lấp đầy quảng cáo và các yếu tố ảnh hưởng đến eCPM. Không phải doanh thu được đảm bảo.

Chiến lược của tôi: Đầu tiên đạt 1.000 người chơi/ngày, sau đó mới thử tối ưu quảng cáo. Đừng hy sinh retention chỉ để tăng số lần hiển thị.
8. Chiến lược viral và marketing
Tôi muốn game có cơ chế tự quảng bá thay vì phụ thuộc hoàn toàn vào quảng cáo trả phí.
8.1. TikTok Marketing
Các nội dung có thể làm:










POV: 2 giờ sáng

"Không ngủ được nên vào quán cà phê..."











Gặp người lạ

"Hôm nay mình ngồi cạnh một người không quen..."











Không gian thư giãn

"Một nơi để trốn khỏi thế giới thực."











Khoảnh khắc đẹp

"Chúng mình gặp nhau tại 24h Café."


8.2. Cơ chế viral trong game
Tôi đề xuất 4 cơ chế:
1. Share Your Mood: Chia sẻ tâm trạng kèm ảnh nhân vật.
2. Invite a Friend: Mời bạn bè vào cùng phòng.
3. Daily Quote: Mỗi ngày có một câu nói mới.
4. Cafe Memory: Tạo ảnh kỷ niệm khi ngồi cùng người khác.
Mỗi ảnh chia sẻ có URL website để người xem có thể vào chơi ngay.
8.3. SEO
Không chỉ xây dựng trang game. Hãy có những trang nội dung có thể được Google index:
- / – Landing page.
- /play – Chơi game.
- /about – Giới thiệu.
- /privacy – Quyền riêng tư.
- /community-guidelines – Quy tắc cộng đồng.
- /daily-quotes – Những câu nói hằng ngày.
Không index nội dung chat riêng tư hoặc thông tin cá nhân.