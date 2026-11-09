# ☕ 24h Café — A little place to slow down

Dự án game social 2D multiplayer trên trình duyệt theo tài liệu đặc tả [`feature.md`](./feature.md).

## Cấu trúc thư mục

```text
cafe_24h/
├── frontend/                 # Nuxt 3 + TypeScript + Phaser 3 + Socket.IO Client
│   ├── app/
│   │   ├── components/       # HUD, Chat Bar, Modals, Mobile Joystick
│   │   ├── pages/            # /, /play, /daily-quotes, /about, /privacy, /community-guidelines
│   │   ├── composables/      # useCafeSocket (Realtime + Local Fallback)
│   │   └── stores/           # useCafeStore (Pinia)
│   ├── game/
│   │   ├── scenes/           # CafeMainScene (Phaser 3 2D Top-down)
│   │   ├── entities/         # PlayerAvatar
│   │   ├── animations/       # CharacterAnimator
│   │   ├── systems/          # EventBus, PolaroidExporter, AmbientAudioEngine
│   │   └── assets/           # cafeCatalog (Seats, Drinks, Outfits, Moods, Cycles)
│   └── public/
├── backend/                  # NestJS + Socket.IO Gateway
│   └── src/
│       ├── auth/             # Guest session
│       ├── player/           # Avatar, outfit, nickname
│       ├── room/             # Multi-room capacity (25 CCU/room) & seat locking
│       ├── game/             # Socket.IO Authoritative Gateway
│       ├── chat/             # Rate-limited room chat
│       ├── mood/             # Daily Moods
│       ├── message/          # Anonymous Message Board
│       ├── item/             # Virtual drinks & outfits
│       ├── moderation/       # Content sanitization & reporting
│       └── analytics/        # Online & viral metrics
└── docs/
    ├── business.md           # Đặc tả nghiệp vụ & Góp ý cải tiến sản phẩm
    ├── database.md           # Thiết kế MySQL schema & ER Diagram
    ├── api.md                # Đặc tả REST API
    └── game-events.md        # Đặc tả sự kiện Socket.IO Realtime
```

## Hướng dẫn chạy dự án (Development)

### 1. Khởi chạy Backend (NestJS - Port `3001`)
```bash
cd backend
npm install
npm run start:dev
```

### 2. Khởi chạy Frontend (Nuxt 3 + Phaser 3 - Port `3000`)
```bash
cd frontend
npm install
npm run dev
```

Truy cập `http://localhost:3000` (Landing page) hoặc `http://localhost:3000/play` (Vào thẳng quán).

