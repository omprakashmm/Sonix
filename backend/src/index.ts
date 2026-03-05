/**
 * OpenWave — Express Backend Entry Point
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { authRouter } from './routes/auth';
import { tracksRouter } from './routes/tracks';
import { playlistsRouter } from './routes/playlists';
import { youtubeRouter } from './routes/youtube';
import { streamRouter } from './routes/stream';
import { usersRouter } from './routes/users';
import { discoveryRouter } from './routes/discovery';
import { searchRouter } from './routes/search';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// ─── Security & Middleware ───────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));

// ─── Rate Limiting ───────────────────────────────────────────
app.use('/api', rateLimiter);

// ─── Static File Serving ─────────────────────────────────────
const uploadsDir = process.env.LOCAL_UPLOAD_PATH || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', etag: true, lastModified: true }));

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/stream', streamRouter);
app.use('/api/users', usersRouter);
app.use('/api/discovery', discoveryRouter);
app.use('/api/search', searchRouter);

// ─── Health Check ────────────────────────────────────────────
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🎵 Sonix API running on http://localhost:${PORT}`);
  logger.info(`📁 Uploads directory: ${uploadsDir}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
