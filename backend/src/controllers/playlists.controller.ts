/**
 * OpenWave — Playlists Controller
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const getPlaylists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: { select: { tracks: true } },
        tracks: {
          take: 1,
          include: { track: { select: { coverUrl: true } } },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = playlists.map((p) => ({
      ...p,
      trackCount: p._count.tracks,
      coverUrl: p.coverUrl || p.tracks[0]?.track.coverUrl || null,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

export const getPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const playlist = await prisma.playlist.findFirst({
      where: { id, OR: [{ userId }, { isPublic: true }] },
      include: {
        tracks: {
          include: { track: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) throw new AppError('Playlist not found', 404);

    res.json({
      success: true,
      data: {
        ...playlist,
        tracks: playlist.tracks.map((pt) => ({
          ...pt.track,
          position: pt.position,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, isPublic = false } = req.body;

    const playlist = await prisma.playlist.create({
      data: { name, description, isPublic, userId },
    });

    res.status(201).json({ success: true, data: playlist });
  } catch (err) {
    next(err);
  }
};

export const updatePlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const existing = await prisma.playlist.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Playlist not found', 404);

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        name: req.body.name ?? existing.name,
        description: req.body.description ?? existing.description,
        isPublic: req.body.isPublic ?? existing.isPublic,
      },
    });

    res.json({ success: true, data: playlist });
  } catch (err) {
    next(err);
  }
};

export const deletePlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const playlist = await prisma.playlist.findFirst({ where: { id, userId } });
    if (!playlist) throw new AppError('Playlist not found', 404);

    await prisma.playlist.delete({ where: { id } });
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (err) {
    next(err);
  }
};

export const addTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { trackId } = req.body;
    const userId = (req as any).user.id;

    const playlist = await prisma.playlist.findFirst({ where: { id, userId } });
    if (!playlist) throw new AppError('Playlist not found', 404);

    // Get max position
    const maxPos = await prisma.playlistTrack.aggregate({
      where: { playlistId: id },
      _max: { position: true },
    });

    await prisma.playlistTrack.upsert({
      where: { playlistId_trackId: { playlistId: id, trackId } },
      update: {},
      create: {
        playlistId: id,
        trackId,
        position: (maxPos._max?.position ?? -1) + 1,
      },
    });

    res.json({ success: true, message: 'Track added to playlist' });
  } catch (err) {
    next(err);
  }
};

export const removeTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const trackId = req.params.trackId as string;
    const userId = (req as any).user.id;

    const playlist = await prisma.playlist.findFirst({ where: { id, userId } });
    if (!playlist) throw new AppError('Playlist not found', 404);

    await prisma.playlistTrack.delete({
      where: { playlistId_trackId: { playlistId: id, trackId } },
    });

    res.json({ success: true, message: 'Track removed from playlist' });
  } catch (err) {
    next(err);
  }
};

export const reorderTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { trackIds } = req.body; // ordered array of trackIds
    const userId = (req as any).user.id;

    const playlist = await prisma.playlist.findFirst({ where: { id, userId } });
    if (!playlist) throw new AppError('Playlist not found', 404);

    // Update positions in bulk
    await Promise.all(
      (trackIds as string[]).map((trackId, index) =>
        prisma.playlistTrack.update({
          where: { playlistId_trackId: { playlistId: id, trackId } },
          data: { position: index },
        })
      )
    );

    res.json({ success: true, message: 'Playlist reordered' });
  } catch (err) {
    next(err);
  }
};
