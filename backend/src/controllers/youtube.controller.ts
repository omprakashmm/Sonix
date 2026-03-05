/**
 * OpenWave — YouTube Import Controller
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { YouTubeService } from '../services/youtube.service';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();
const youtubeService = new YouTubeService();

// ─── Import From YouTube ──────────────────────────────────────
export const importFromYouTube = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    const userId = (req as any).user.id;

    if (!url) throw new AppError('YouTube URL is required', 400);

    const isValid = youtubeService.isValidYouTubeUrl(url);
    if (!isValid) throw new AppError('Invalid YouTube URL', 400);

    // Create job record
    const job = await prisma.importJob.create({
      data: {
        url,
        status: 'QUEUED',
        progress: 0,
        userId,
      },
    });

    // Start async processing (non-blocking)
    youtubeService.processImportJob(job.id, url, userId).catch((err) => {
      console.error(`Import job ${job.id} failed:`, err);
    });

    res.status(202).json({
      success: true,
      data: { jobId: job.id },
      message: 'Import job queued',
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Import Status ────────────────────────────────────────
export const getImportStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.jobId as string;
    const userId = (req as any).user.id;

    const job = await prisma.importJob.findFirst({
      where: { id: jobId, userId },
      include: {
        // Include track if completed
      },
    });

    if (!job) throw new AppError('Import job not found', 404);

    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// ─── Get User Import Jobs ─────────────────────────────────────
export const getUserImportJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const jobs = await prisma.importJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
};

// ─── Cancel Import ────────────────────────────────────────────
export const cancelImport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.jobId as string;
    const userId = (req as any).user.id;

    const job = await prisma.importJob.findFirst({
      where: { id: jobId, userId },
    });
    if (!job) throw new AppError('Import job not found', 404);

    if (job.status === 'DONE') {
      throw new AppError('Cannot cancel completed job', 400);
    }

    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: 'ERROR', error: 'Cancelled by user' },
    });

    res.json({ success: true, message: 'Import cancelled' });
  } catch (err) {
    next(err);
  }
};

// ─── Get YouTube Metadata (preview) ──────────────────────────
export const getYouTubeMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.query;
    if (!url) throw new AppError('URL is required', 400);

    const metadata = await youtubeService.getMetadata(url as string);
    res.json({ success: true, data: metadata });
  } catch (err) {
    next(err);
  }
};

// ─── Get YouTube Playlist Metadata ───────────────────────────
export const getPlaylistMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.query;
    if (!url) throw new AppError('URL is required', 400);

    const data = await youtubeService.getPlaylistMetadata(url as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── Import Playlist (queues a job per video) ─────────────────
export const importPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    const userId = (req as any).user.id;

    if (!url) throw new AppError('Playlist URL is required', 400);

    // Fetch the playlist items quickly (flat list)
    const playlist = await youtubeService.getPlaylistMetadata(url);

    // Queue one import job per video (cap at 50)
    const items = playlist.items.slice(0, 50);
    const jobIds: string[] = [];

    for (const item of items) {
      const videoUrl = `https://www.youtube.com/watch?v=${item.videoId}`;
      const job = await prisma.importJob.create({
        data: {
          url: videoUrl,
          status: 'QUEUED',
          progress: 0,
          userId,
          title: item.title,
          artist: item.artist,
          thumbnail: item.thumbnail,
        },
      });
      jobIds.push(job.id);
      // Start async processing (non-blocking, staggered 200ms apart)
      setTimeout(() => {
        youtubeService.processImportJob(job.id, videoUrl, userId).catch((err) => {
          console.error(`Playlist import job ${job.id} failed:`, err);
        });
      }, jobIds.length * 200);
    }

    res.status(202).json({
      success: true,
      data: { jobIds, totalQueued: jobIds.length, playlistTitle: playlist.playlistTitle },
      message: `Queued ${jobIds.length} tracks from "${playlist.playlistTitle}"`,
    });
  } catch (err) {
    next(err);
  }
};
