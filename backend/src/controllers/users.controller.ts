/**
 * OpenWave — Users Controller
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, username: true,
        avatar: true, bio: true, createdAt: true,
        _count: { select: { tracks: true, playlists: true, likedTracks: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const requesterId = (req as any).user.id;
    if (id !== requesterId) throw new AppError('Forbidden', 403);

    const { name, username, bio } = req.body;

    if (username) {
      const existing = await prisma.user.findFirst({ where: { username, id: { not: id } } });
      if (existing) throw new AppError('Username already taken', 409);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, username, bio },
      select: { id: true, name: true, username: true, avatar: true, bio: true, email: true },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const requesterId = (req as any).user.id;
    if (id !== requesterId) throw new AppError('Forbidden', 403);
    if (!req.file) throw new AppError('Avatar file required', 400);

    // Optimize image with sharp
    const optimizedPath = req.file.path.replace(/\.[^.]+$/, '-opt.webp');
    await sharp(req.file.path)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(optimizedPath);

    const user = await prisma.user.update({
      where: { id },
      data: { avatar: `/uploads/avatars/${path.basename(optimizedPath)}` },
      select: { id: true, avatar: true },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
