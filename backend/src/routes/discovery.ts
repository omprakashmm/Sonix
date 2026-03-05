/**
 * OpenWave — Discovery & Search Routes
 */
import { Router } from 'express';
import { getTrending, getRecentlyAdded, getRecommended } from '../controllers/discovery.controller';
import { searchAll } from '../controllers/search.controller';
import { defaultUser } from '../middleware/defaultUser.middleware';

export const discoveryRouter = Router();
export const searchRouter = Router();

discoveryRouter.use(defaultUser);
searchRouter.use(defaultUser);

discoveryRouter.get('/trending', getTrending);
discoveryRouter.get('/recently-added', getRecentlyAdded);
discoveryRouter.get('/recommended', getRecommended);

searchRouter.get('/', searchAll);
