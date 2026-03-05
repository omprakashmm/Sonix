# Sonix  Deployment Guide

> Full-stack: **Vite + React** frontend  **Express + Prisma** backend  **PostgreSQL** (Supabase)

---

## Stack Overview

| Layer | Technology | Recommended Host |
|---|---|---|
| Frontend | Vite 5 + React + React Router | **Vercel** (free) |
| Backend | Node.js + Express + Prisma | **Railway** (free tier) |
| Database | PostgreSQL | **Supabase** (already configured) |
| Audio storage | Local disk  S3 in production | AWS S3 |

---

## 1  Database (Supabase  already done)

Your `DATABASE_URL` in `backend/.env` already points to Supabase.
After any schema change run:

```bash
cd backend
npx prisma migrate deploy   # apply pending migrations
npx prisma generate         # regenerate client
```

---

## 2  Backend  Railway

### 2.1 Push code to GitHub

```bash
git add .
git commit -m "deploy: ready"
git push origin main
```

### 2.2 Create Railway project

1. Go to https://railway.app  **New Project  Deploy from GitHub**
2. Select your repository
3. Set **Root Directory** to `backend`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm start`

### 2.3 Add environment variables in Railway

| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase connection string |
| `NODE_ENV` | `production` |
| `BACKEND_PORT` | `3001` |
| `JWT_SECRET` | Random 64-char string |
| `JWT_EXPIRES_IN` | `7d` |
| `REFRESH_TOKEN_SECRET` | Another random string |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `STORAGE_TYPE` | `local` (or `s3`) |

### 2.4 Add ffmpeg + yt-dlp (create `backend/nixpacks.toml`)

```toml
[phases.setup]
nixPkgs = ["ffmpeg", "yt-dlp"]
```

### 2.5 Verify

```
https://sonix-backend.up.railway.app/api/tracks    should return JSON
```

---

## 3  Frontend  Vercel

### 3.1 Set production API URL

Create `frontend/.env.production`:

```env
VITE_API_URL=https://sonix-backend.up.railway.app/api
```

Make sure `frontend/lib/api.ts` uses it:

```ts
baseURL: import.meta.env.VITE_API_URL ?? '/api'
```

### 3.2 Deploy

**Option A  Vercel CLI**

```bash
npm i -g vercel
cd D:\git\music
vercel login
vercel --prod
```

**Option B  Vercel Dashboard**

1. https://vercel.com  **New Project  Import GitHub repo**
2. Root directory: / (repo root)
3. Vercel auto-reads `vercel.json`:
   - Build: `cd frontend && npm install && npm run build`
   - Output: `frontend/dist`
4. Done  Vercel handles SPA routing via the rewrite rule.

### 3.3 Update ALLOWED_ORIGINS

In Railway, update `ALLOWED_ORIGINS` to your Vercel URL:
```
ALLOWED_ORIGINS=https://sonix.vercel.app
```

---

## 4  Local Development

```bash
# Install all deps
npm run install:all

# Setup backend env
cp .env.example backend/.env
# Edit backend/.env with your DATABASE_URL and secrets

# Run migrations
cd backend && npx prisma migrate deploy && cd ..

# Start both (frontend :3000, backend :3001)
npm run dev:all
```

---

## 5  Production Checklist

- [ ] `JWT_SECRET` is a random 64+ char string (never commit it)
- [ ] `NODE_ENV=production` on Railway (enables rate limiting)
- [ ] `ALLOWED_ORIGINS` matches Vercel domain exactly
- [ ] Use `STORAGE_TYPE=s3` in production (local disk is ephemeral on Railway)
- [ ] `backend/.env` is in `.gitignore` (already done)
- [ ] Run `npx prisma migrate deploy` after every schema change

---

## 6  VPS Deploy (Nginx + PM2)

```bash
# Ubuntu 22.04
sudo apt update && sudo apt install -y nginx ffmpeg nodejs npm python3-pip
pip install yt-dlp

git clone https://github.com/your/sonix.git /var/www/sonix
cd /var/www/sonix

# Backend
cd backend && cp ../.env.example .env && nano .env
npm install && npm run build

# Frontend
cd ../frontend && npm install && npm run build
```

**`/etc/nginx/sites-available/sonix`:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend SPA
    root /var/www/sonix/frontend/dist;
    location / { try_files \ /index.html; }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
    }
    location /uploads { proxy_pass http://localhost:3001; }
}
```

```bash
npm i -g pm2
cd /var/www/sonix/backend
pm2 start dist/index.js --name sonix-api
pm2 save && pm2 startup
```

---

## 7  Alternative Hosts

| Service | Frontend | Backend | Notes |
|---|---|---|---|
| **Vercel** |  Best |  | Serverless  use separate backend |
| **Netlify** |  |  | Backend must be elsewhere |
| **Railway** |  |  Best | Full-stack in one project |
| **Render** |  |  | Free tier sleeps after 15min |
| **DigitalOcean/Hetzner VPS** |  Nginx |  PM2 | Full control |
