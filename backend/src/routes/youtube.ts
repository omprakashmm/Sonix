/**
 * OpenWave — YouTube Import Routes
 */
import { Router } from 'express';
import {
  importFromYouTube,
  getImportStatus,
  getUserImportJobs,
  cancelImport,
  getYouTubeMetadata,
  getPlaylistMetadata,
  importPlaylist,
} from '../controllers/youtube.controller';
import { defaultUser } from '../middleware/defaultUser.middleware';
import { youtubeRateLimiter } from '../middleware/rateLimiter';

export const youtubeRouter = Router();

youtubeRouter.use(defaultUser);

// Import a YouTube URL (single video)
youtubeRouter.post('/import', youtubeRateLimiter, importFromYouTube);

// Import a full playlist
youtubeRouter.post('/import-playlist', youtubeRateLimiter, importPlaylist);

// Get metadata without importing
youtubeRouter.get('/metadata', getYouTubeMetadata);

// Get playlist metadata (preview before importing)
youtubeRouter.get('/playlist-metadata', getPlaylistMetadata);

// Job management
youtubeRouter.get('/jobs', getUserImportJobs);
youtubeRouter.get('/jobs/:jobId', getImportStatus);
youtubeRouter.delete('/jobs/:jobId', cancelImport);
