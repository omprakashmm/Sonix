/**
 * OpenWave — Audio Streaming Route
 * Handles byte-range requests for progressive streaming
 */
import { Router } from 'express';
import { streamTrack } from '../controllers/stream.controller';
import { defaultUser } from '../middleware/defaultUser.middleware';

export const streamRouter = Router();

// Stream uses default user (no token required)
streamRouter.get('/:trackId', defaultUser, streamTrack);
