/**
 * OpenWave — Playlist Routes
 */
import { Router } from 'express';
import {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrack,
  removeTrack,
  reorderTracks,
} from '../controllers/playlists.controller';
import { defaultUser } from '../middleware/defaultUser.middleware';

export const playlistsRouter = Router();

playlistsRouter.use(defaultUser);

playlistsRouter.get('/', getPlaylists);
playlistsRouter.get('/:id', getPlaylist);
playlistsRouter.post('/', createPlaylist);
playlistsRouter.patch('/:id', updatePlaylist);
playlistsRouter.delete('/:id', deletePlaylist);

// Track management
playlistsRouter.post('/:id/tracks', addTrack);
playlistsRouter.delete('/:id/tracks/:trackId', removeTrack);
playlistsRouter.put('/:id/tracks/reorder', reorderTracks);
