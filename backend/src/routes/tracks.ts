/**
 * OpenWave — Tracks Routes
 */
import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  getTracks,
  getTrack,
  uploadTrack,
  updateTrack,
  deleteTrack,
  getLikedTracks,
  likeTrack,
  unlikeTrack,
  getRecentlyPlayed,
  getMostPlayed,
  recordPlay,
  downloadTrack,
} from '../controllers/tracks.controller';
import { defaultUser } from '../middleware/defaultUser.middleware';
import { fileValidator } from '../middleware/fileValidator';
import { uploadRateLimiter } from '../middleware/rateLimiter';

const UPLOADS_DIR = process.env.LOCAL_UPLOAD_PATH || path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100');

// ─── Multer Configuration ────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_: Request, __: Express.Multer.File, cb: (e: Error | null, dest: string) => void) => {
    cb(null, path.join(UPLOADS_DIR, 'audio'));
  },
  filename: (_: Request, file: Express.Multer.File, cb: (e: Error | null, name: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const coverStorage = multer.diskStorage({
  destination: (_: Request, __: Express.Multer.File, cb: (e: Error | null, dest: string) => void) => {
    cb(null, path.join(UPLOADS_DIR, 'covers'));
  },
  filename: (_: Request, file: Express.Multer.File, cb: (e: Error | null, name: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const audioUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: fileValidator.audio,
});

const coverUpload = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for covers
  fileFilter: fileValidator.image,
});

export const tracksRouter = Router();

// All routes use the default user (no login required)
tracksRouter.use(defaultUser);

// ─── Track CRUD ───────────────────────────────────────────────
tracksRouter.get('/', getTracks);
tracksRouter.get('/liked', getLikedTracks);
tracksRouter.get('/recently-played', getRecentlyPlayed);
tracksRouter.get('/most-played', getMostPlayed);
tracksRouter.get('/:id', getTrack);
tracksRouter.post(
  '/upload',
  uploadRateLimiter,
  audioUpload.single('audio'),
  uploadTrack
);
tracksRouter.patch(
  '/:id',
  coverUpload.single('cover'),
  updateTrack
);
tracksRouter.delete('/:id', deleteTrack);

// ─── Interactions ─────────────────────────────────────────────
tracksRouter.post('/:id/like', likeTrack);
tracksRouter.delete('/:id/like', unlikeTrack);
tracksRouter.post('/:id/play', recordPlay);
tracksRouter.get('/:id/download', downloadTrack);
