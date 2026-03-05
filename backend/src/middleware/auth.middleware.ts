/**
 * OpenWave — Auth Middleware
 * JWT verification middleware
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    (req as any).user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else if (err.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else {
      next(err);
    }
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'ADMIN') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};
