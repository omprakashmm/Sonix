/**
 * OpenWave — Tracks Controller
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { StorageService } from '../services/storage.service';
import { MetadataService } from '../services/metadata.service';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();
const storageService = new StorageService();
const metadataService = new MetadataService();

// ─── Get Tracks ───────────────────────────────────────────────
export const getTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc', genre } = req.query;

    const tracks = await prisma.track.findMany({
      where: {
        userId,
        ...(genre && { genre: genre as string }),
      },
      orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.track.count({ where: { userId } });

    // Annotate with liked status
    const likedIds = new Set(
      (await prisma.likedTrack.findMany({ where: { userId }, select: { trackId: true } }))
        .map((l) => l.trackId)
    );

    const tracksWithMeta = tracks.map((t) => ({
      ...t,
      isLiked: likedIds.has(t.id),
      fileUrl: storageService.getPublicUrl(t.fileUrl),
      coverUrl: t.coverUrl ? storageService.getPublicUrl(t.coverUrl) : null,
    }));

    res.json({
      success: true,
      data: tracksWithMeta,
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: Number(page) * Number(limit) < total,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Track ─────────────────────────────────────────
export const getTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const track = await prisma.track.findFirst({
      where: { id, userId },
    });
    if (!track) throw new AppError('Track not found', 404);

    const liked = await prisma.likedTrack.findUnique({
      where: { userId_trackId: { userId, trackId: id } },
    });

    res.json({
      success: true,
      data: {
        ...track,
        isLiked: !!liked,
        fileUrl: storageService.getPublicUrl(track.fileUrl),
        coverUrl: track.coverUrl ? storageService.getPublicUrl(track.coverUrl) : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Upload Track ─────────────────────────────────────────────
export const uploadTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const file = req.file;
    if (!file) throw new AppError('Audio file required', 400);

    // Extract metadata from the uploaded file
    const metadata = await metadataService.extractFromFile(file.path);

    // Create track record
    const track = await prisma.track.create({
      data: {
        title: req.body.title || metadata.title || path.parse(file.originalname).name,
        artist: req.body.artist || metadata.artist || 'Unknown Artist',
        album: req.body.album || metadata.album,
        genre: req.body.genre || metadata.genre,
        duration: metadata.duration || 0,
        fileUrl: file.path,
        fileSize: file.size,
        bitrate: metadata.bitrate,
        format: (({
          'audio/mpeg': 'MP3',
          'audio/mp3': 'MP3',
          'audio/flac': 'FLAC',
          'audio/wav': 'WAV',
          'audio/x-wav': 'WAV',
          'audio/aac': 'AAC',
          'audio/mp4': 'M4A',
          'audio/x-m4a': 'M4A',
          'audio/ogg': 'OGG',
        } as Record<string, string>)[file.mimetype] ?? 'MP3') as any,
        coverUrl: metadata.coverUrl,
        source: 'UPLOAD',
        userId,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...track,
        fileUrl: storageService.getPublicUrl(track.fileUrl),
        coverUrl: track.coverUrl ? storageService.getPublicUrl(track.coverUrl) : null,
      },
      message: 'Track uploaded successfully',
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Track ─────────────────────────────────────────────
export const updateTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const existing = await prisma.track.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Track not found', 404);

    let coverUrl = existing.coverUrl;
    if (req.file) {
      // New cover uploaded
      coverUrl = req.file.path;
    }

    const track = await prisma.track.update({
      where: { id },
      data: {
        title: req.body.title ?? existing.title,
        artist: req.body.artist ?? existing.artist,
        album: req.body.album ?? existing.album,
        genre: req.body.genre ?? existing.genre,
        coverUrl,
      },
    });

    res.json({ success: true, data: track });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Track ─────────────────────────────────────────────
export const deleteTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const track = await prisma.track.findFirst({ where: { id, userId } });
    if (!track) throw new AppError('Track not found', 404);

    // Delete file from storage
    await storageService.deleteFile(track.fileUrl);
    if (track.coverUrl) await storageService.deleteFile(track.coverUrl);

    await prisma.track.delete({ where: { id } });

    res.json({ success: true, message: 'Track deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Liked Tracks ─────────────────────────────────────────────
export const getLikedTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const liked = await prisma.likedTrack.findMany({
      where: { userId },
      include: { track: true },
      orderBy: { likedAt: 'desc' },
    });
    res.json({
      success: true,
      data: liked.map((l) => ({
        ...l.track,
        isLiked: true,
        fileUrl: storageService.getPublicUrl(l.track.fileUrl),
        coverUrl: l.track.coverUrl ? storageService.getPublicUrl(l.track.coverUrl) : null,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const likeTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    await prisma.likedTrack.upsert({
      where: { userId_trackId: { userId, trackId: id } },
      update: {},
      create: { userId, trackId: id },
    });
    await prisma.track.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
    });

    res.json({ success: true, message: 'Track liked' });
  } catch (err) {
    next(err);
  }
};

export const unlikeTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    await prisma.likedTrack.delete({
      where: { userId_trackId: { userId, trackId: id } },
    });
    await prisma.track.update({
      where: { id },
      data: { likeCount: { decrement: 1 } },
    });

    res.json({ success: true, message: 'Track unliked' });
  } catch (err) {
    next(err);
  }
};

// ─── History ──────────────────────────────────────────────────
export const recordPlay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;
    const { duration, completed } = req.body;

    await prisma.playHistory.create({
      data: { userId, trackId: id, duration, completed: !!completed },
    });
    await prisma.track.update({
      where: { id },
      data: { playCount: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getRecentlyPlayed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const history = await prisma.playHistory.findMany({
      where: { userId },
      include: { track: true },
      orderBy: { playedAt: 'desc' },
      take: 20,
      distinct: ['trackId'],
    });
    res.json({
      success: true,
      data: history.map((h) => ({
        ...h.track,
        fileUrl: storageService.getPublicUrl(h.track.fileUrl),
        coverUrl: h.track.coverUrl ? storageService.getPublicUrl(h.track.coverUrl) : null,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const getMostPlayed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const tracks = await prisma.track.findMany({
      where: { userId },
      orderBy: { playCount: 'desc' },
      take: 20,
    });
    res.json({
      success: true,
      data: tracks.map((t) => ({
        ...t,
        fileUrl: storageService.getPublicUrl(t.fileUrl),
        coverUrl: t.coverUrl ? storageService.getPublicUrl(t.coverUrl) : null,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Download Track ───────────────────────────────────────────
export const downloadTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const track = await prisma.track.findFirst({ where: { id, userId } });
    if (!track) throw new AppError('Track not found', 404);

    const filePath = track.fileUrl;
    if (!fs.existsSync(filePath)) throw new AppError('File not found', 404);

    const filename = `${track.artist} - ${track.title}.${track.format.toLowerCase()}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', `audio/${track.format.toLowerCase()}`);
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    next(err);
  }
};
