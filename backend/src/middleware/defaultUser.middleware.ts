/**
 * OpenWave — Default User Middleware
 * Bypasses authentication and injects the default/first user into req.user.
 * This allows the app to run without login while still using user-scoped data.
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Cache the default user in memory so we don't hit the DB on every request
let cachedUserId: string | null = null;
let cachedUserRole: string | null = null;

export const defaultUser = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Use cached user if available
    if (cachedUserId) {
      (req as any).user = { id: cachedUserId, role: cachedUserRole || 'USER' };
      return next();
    }

    // Look up by env DEFAULT_USER_EMAIL, or fall back to the first user in the DB
    const email = process.env.DEFAULT_USER_EMAIL;
    const user = email
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });

    if (!user) {
      // Auto-create a default user if the DB is empty
      const created = await prisma.user.create({
        data: {
          email: 'default@sonix.local',
          name: 'Sonix User',
          username: 'sonix',
          password: null,
          role: 'USER',
        },
      });
      cachedUserId = created.id;
      cachedUserRole = created.role;
      logger.info(`Created default user with id=${created.id}`);
    } else {
      cachedUserId = user.id;
      cachedUserRole = user.role;
    }

    (req as any).user = { id: cachedUserId, role: cachedUserRole || 'USER' };
    next();
  } catch (err) {
    // DB unreachable (e.g. Supabase free tier paused) — use a stable fallback
    // so the server remains operational. Requests will work; DB writes will
    // fail later with clearer errors rather than crashing everything here.
    // cachedUserId intentionally NOT set so the next request retries the DB.
    logger.warn(`defaultUser middleware DB error — using offline fallback: ${err}`);
    const fallbackId = process.env.DEFAULT_USER_FALLBACK_ID || 'offline-default-user';
    (req as any).user = { id: fallbackId, role: 'USER' };
    next();
  }
};

/** Call this to clear the in-memory cache (e.g. after seeding) */
export const clearDefaultUserCache = () => {
  cachedUserId = null;
  cachedUserRole = null;
};
