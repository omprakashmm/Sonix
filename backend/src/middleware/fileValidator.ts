/**
 * OpenWave — File Validator Middleware
 */
import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import path from 'path';

const ALLOWED_AUDIO_MIMES = new Set([
  'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/wav',
  'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/x-m4a',
  'audio/ogg', 'audio/vorbis', 'audio/webm',
]);

const ALLOWED_AUDIO_EXTS = new Set([
  '.mp3', '.flac', '.wav', '.aac', '.m4a', '.ogg', '.webm', '.opus',
]);

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
]);

const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export const fileValidator = {
  audio: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_AUDIO_MIMES.has(file.mimetype) || ALLOWED_AUDIO_EXTS.has(ext)) {
      callback(null, true);
    } else {
      callback(
        new Error(`Invalid audio file type. Allowed: ${[...ALLOWED_AUDIO_EXTS].join(', ')}`)
      );
    }
  },

  image: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype) || ALLOWED_IMAGE_EXTS.has(ext)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid image file type. Allowed: jpg, png, webp, gif'));
    }
  },
};
