/**
 * OpenWave — Audio Streaming Controller
 * Supports byte-range requests for progressive audio streaming
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const streamTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackId = req.params.trackId as string;
    const userId = (req as any).user.id;

    const track = await prisma.track.findFirst({
      where: {
        id: trackId,
        OR: [{ userId }, { isPublic: true }],
      },
    });

    if (!track) throw new AppError('Track not found', 404);

    const filePath = path.resolve(track.fileUrl);

    if (!fs.existsSync(filePath)) {
      throw new AppError('Audio file not found on disk', 404);
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // MIME type mapping
    const mimeTypes: Record<string, string> = {
      MP3: 'audio/mpeg',
      FLAC: 'audio/flac',
      WAV: 'audio/wav',
      AAC: 'audio/aac',
      M4A: 'audio/mp4',
      OGG: 'audio/ogg',
    };
    const contentType = mimeTypes[track.format] || 'audio/mpeg';

    if (range) {
      // ── Partial Content (Range Request) ──────────────────
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      // Validate range
      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Content-Duration': String(track.duration),
      });

      fileStream.pipe(res);
    } else {
      // ── Full File ─────────────────────────────────────────
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Duration': String(track.duration),
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
};
