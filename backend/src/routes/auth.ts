/**
 * OpenWave — Auth Routes
 */
import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { registerSchema, loginSchema } from '../validators/auth.validators';

export const authRouter = Router();

// Public routes
authRouter.post('/register', authRateLimiter, validateRequest(registerSchema), register);
authRouter.post('/login', authRateLimiter, validateRequest(loginSchema), login);
authRouter.post('/refresh', refreshToken);
authRouter.post('/forgot-password', authRateLimiter, forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get('/verify-email/:token', verifyEmail);

// Protected routes
authRouter.get('/me', authenticate, getMe);
