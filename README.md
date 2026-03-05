# 🎵 Sonix — Open Source Music Streaming

<p align="center">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-cyan?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

> A modern, open-source, ad-free music streaming platform built with Vite + React, Node.js, and PostgreSQL.
> Import from YouTube, upload your own music, and enjoy a beautiful Spotify-like experience — completely free.

---

## ✨ Features

- 🎵 **Music Streaming** — High-quality audio playback with HTML5 Audio API
- 📥 **YouTube Import** — Extract audio from YouTube URLs with auto metadata
- 📤 **File Upload** — Upload MP3/FLAC/WAV files with cover art
- 🎧 **Persistent Player** — Bottom player with seek, volume, shuffle, repeat, crossfade
- 📚 **Library Management** — Playlists, liked songs, recently/most played
- 🔍 **Search** — Full-text search by title, artist, album, genre
- 🌟 **Discovery** — Trending, recommended, recently added
- 🌙 **Dark Mode Default** — Glassmorphism UI with album art blur backgrounds
- 📱 **PWA Support** — Offline listening, installable as app
- 🎼 **Waveform Visualization** — Real-time audio waveform
- 🔤 **Lyrics Fetch** — Synchronized lyrics (when available)
- ⌨️ **Keyboard Shortcuts** — Full keyboard control
- 🔒 **Secure** — JWT auth, rate limiting, file validation

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite 5 + React 19 + TypeScript |
| Routing | React Router v6 |
| Styling | TailwindCSS + Framer Motion |
| UI Components | ShadCN/UI |
| State | Zustand |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (Access + Refresh tokens) |
| Audio | HTML5 Audio API + Web Audio API |
| Storage | Local filesystem / AWS S3 |
| YouTube | yt-dlp + ytdl-core |

---

## 📁 Project Structure

```
sonix/
├── frontend/                 # Vite 5 + React 19 SPA
│   ├── src/                  # Entry points (main.tsx, App.tsx)
│   ├── app/
│   │   └── (dashboard)/      # Page components (Home, Library, Search…)
│   ├── components/
│   │   ├── layout/           # Sidebar, TopBar, MobileBottomNav
│   │   ├── player/           # MusicPlayer, Controls, Waveform
│   │   ├── library/          # TrackList, PlaylistGrid, DnD
│   │   ├── discovery/        # FeaturedSection, TrendingTracks, TrackMenu
│   │   ├── import/           # YouTubeImport, FileUpload, AddSongDialog
│   │   └── search/           # SearchBar, SearchResults
│   ├── store/                # Zustand stores (player, library, auth)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # API client, utilities
│   └── types/                # TypeScript interfaces
│
├── backend/                  # Express API Server
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth, rate limit, validation
│   │   └── utils/            # JWT, helpers
│   ├── prisma/               # Schema & migrations
│   └── nixpacks.toml         # Railway system deps (ffmpeg, yt-dlp)
│
├── vercel.json               # Vercel SPA deploy config
├── .env.example              # Environment variables template
└── DEPLOYMENT.md             # Full deployment guide
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed globally
- ffmpeg installed

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/sonix.git
cd sonix

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev   # API on :3001

# Terminal 2 — Frontend
cd frontend && npm run dev  # App on :3000
```

Open [http://localhost:3000](http://localhost:3000) 🎵

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `→` | Next track |
| `←` | Previous track |
| `↑` | Volume up |
| `↓` | Volume down |
| `S` | Toggle shuffle |
| `R` | Toggle repeat |
| `M` | Toggle mute |
| `L` | Like current track |
| `F` | Toggle fullscreen player |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/tracks` | List all tracks |
| POST | `/api/tracks/upload` | Upload audio file |
| GET | `/api/tracks/:id/stream` | Stream audio |
| GET | `/api/tracks/:id/download` | Download track |
| POST | `/api/youtube/import` | Import from YouTube |
| GET | `/api/youtube/status/:jobId` | Import job status |
| GET | `/api/playlists` | List playlists |
| POST | `/api/playlists` | Create playlist |
| GET | `/api/search?q=query` | Search tracks |
| GET | `/api/discovery/trending` | Trending tracks |
| GET | `/api/discovery/recommended` | Recommended tracks |

---

## 🌍 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guides:
- **Frontend** → Vercel
- **Backend** → Railway / Render / Docker
- **Database** → Supabase / Railway / Neon

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🙏 Credits

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — YouTube audio extraction
- [ShadCN/UI](https://ui.shadcn.com/) — UI components
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Prisma](https://www.prisma.io/) — Database ORM

---

<p align="center">Made with ❤️ for music lovers</p>
