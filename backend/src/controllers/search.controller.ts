/**
 * OpenWave — Search Controller
 * Full-text search across tracks, playlists, artists
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

export const searchAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, type = 'all', genre, limit = 20 } = req.query;
    const userId = (req as any).user.id;

    if (!q || String(q).trim() === '') {
      return res.json({ success: true, data: { tracks: [], playlists: [], artists: [], total: 0 } });
    }

    const query = String(q).trim();
    const lim = Number(limit);

    const [tracks, playlists] = await Promise.all([
      type === 'all' || type === 'tracks'
        ? prisma.track.findMany({
            where: {
              userId,
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { artist: { contains: query, mode: 'insensitive' } },
                { album: { contains: query, mode: 'insensitive' } },
                { genre: { contains: query, mode: 'insensitive' } },
              ],
              ...(genre ? { genre: String(genre) } : {}),
            },
            take: lim,
            orderBy: { playCount: 'desc' },
          })
        : [],

      type === 'all' || type === 'playlists'
        ? prisma.playlist.findMany({
            where: {
              userId,
              name: { contains: query, mode: 'insensitive' },
            },
            take: lim,
          })
        : [],
    ]);

    // Extract unique artists
    const artistMap = new Map<string, { name: string; trackCount: number; coverUrl?: string }>();
    tracks.forEach((t) => {
      if (t.artist.toLowerCase().includes(query.toLowerCase())) {
        const existing = artistMap.get(t.artist) || { name: t.artist, trackCount: 0, coverUrl: t.coverUrl || undefined };
        existing.trackCount++;
        artistMap.set(t.artist, existing);
      }
    });

    const artists = Array.from(artistMap.values()).slice(0, 10);

    res.json({
      success: true,
      data: {
        tracks: tracks.map(normTrack),
        playlists,
        artists,
        total: tracks.length + playlists.length + artists.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
