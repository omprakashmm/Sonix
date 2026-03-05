/**
 * OpenWave — Discovery Controller
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { StorageService } from '../services/storage.service';

const prisma = new PrismaClient();
const storageService = new StorageService();

const normTrack = (t: any) => ({
  ...t,
  fileUrl: storageService.getPublicUrl(t.fileUrl),
  coverUrl: t.coverUrl ? storageService.getPublicUrl(t.coverUrl) : null,
});

export const getTrending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracks = await prisma.track.findMany({
      where: { isPublic: true },
      orderBy: { playCount: 'desc' },
      take: 20,
    });
    res.json({ success: true, data: tracks.map(normTrack) });
  } catch (err) {
    next(err);
  }
};

export const getRecentlyAdded = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const tracks = await prisma.track.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, data: tracks.map(normTrack) });
  } catch (err) {
    next(err);
  }
};

export const getRecommended = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    // Basic recommendation: find genres user listens to most
    const topGenres = await prisma.playHistory.groupBy({
      by: ['trackId'],
      where: { userId },
      _count: { trackId: true },
      orderBy: { _count: { trackId: 'desc' } },
      take: 10,
    });

    const listenedTrackIds = topGenres.map((h) => h.trackId);

    const listenedTracks = await prisma.track.findMany({
      where: { id: { in: listenedTrackIds } },
      select: { genre: true },
    });

    const genreFreq: Record<string, number> = {};
    listenedTracks.forEach((t) => {
      if (t.genre) genreFreq[t.genre] = (genreFreq[t.genre] || 0) + 1;
    });

    const topGenreNames = Object.entries(genreFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    // Find tracks in top genres not yet played
    const recommended = await prisma.track.findMany({
      where: {
        genre: { in: topGenreNames },
        id: { notIn: listenedTrackIds },
        isPublic: true,
      },
      orderBy: { likeCount: 'desc' },
      take: 20,
    });

    // If not enough, fill with popular tracks
    if (recommended.length < 10) {
      const popular = await prisma.track.findMany({
        where: { id: { notIn: [...listenedTrackIds, ...recommended.map((t) => t.id)] } },
        orderBy: { playCount: 'desc' },
        take: 20 - recommended.length,
      });
      recommended.push(...popular);
    }

    res.json({ success: true, data: recommended.map(normTrack) });
  } catch (err) {
    next(err);
  }
};
