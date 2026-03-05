/**
 * OpenWave — Rate Limiters
 */
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

// In development, bypass all rate limiting
const skipInDev = (_req: Request, _res: Response, next: NextFunction) => next();

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 min
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5000');

// General API rate limiter
export const rateLimiter = isDev ? skipInDev : rateLimit({
  windowMs,
  max,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth endpoints
export const authRateLimiter = isDev ? skipInDev : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// YouTube import limiter
export const youtubeRateLimiter = isDev ? skipInDev : rateLimit({
  windowMs,
  max: parseInt(process.env.YOUTUBE_IMPORT_RATE_LIMIT || '100'),
  message: { success: false, message: 'YouTube import rate limit exceeded.' },
});

// File upload limiter
export const uploadRateLimiter = isDev ? skipInDev : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: { success: false, message: 'Upload limit reached, please try again later.' },
});
