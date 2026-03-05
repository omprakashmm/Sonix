/**
 * OpenWave — Search Routes
 */
import { Router } from 'express';
import { searchAll } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth.middleware';

export const searchRouter = Router();

searchRouter.use(authenticate);
searchRouter.get('/', searchAll);
