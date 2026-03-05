/**
 * Sonix — Library Zustand Store
 * Manages user's music library (tracks, playlists, liked songs)
 */
import { create } from 'zustand';
import api from '@/lib/api';
import type { Track, Playlist, LibraryStore } from '@/types';
import { toast } from 'sonner';

// Module-level fetch-time cache — prevents redundant API calls on navigation
let _lastTracksFetch = 0;
let _lastPlaylistsFetch = 0;
let _lastLikedFetch = 0;
const CACHE_TTL = 30_000; // 30 s

export const useLibraryStore = create<LibraryStore>()((set, get) => ({
  tracks: [],
  playlists: [],
  likedTracks: [],
  recentlyPlayed: [],
  mostPlayed: [],
  isLoading: false,
  error: null,

  fetchTracks: async (force = false) => {
    if (!force && Date.now() - _lastTracksFetch < CACHE_TTL && get().tracks.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ success: boolean; data: Track[] }>('/tracks');
      set({ tracks: Array.isArray(res.data.data) ? res.data.data : [], isLoading: false });
      _lastTracksFetch = Date.now();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchPlaylists: async (force = false) => {
    if (!force && Date.now() - _lastPlaylistsFetch < CACHE_TTL && get().playlists.length > 0) return;
    try {
      const res = await api.get<{ success: boolean; data: Playlist[] }>('/playlists');
      set({ playlists: Array.isArray(res.data.data) ? res.data.data : [] });
      _lastPlaylistsFetch = Date.now();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchLikedTracks: async (force = false) => {
    if (!force && Date.now() - _lastLikedFetch < CACHE_TTL && get().likedTracks.length > 0) return;
    try {
      const res = await api.get<{ success: boolean; data: Track[] }>('/tracks/liked');
      set({ likedTracks: Array.isArray(res.data.data) ? res.data.data : [] });
      _lastLikedFetch = Date.now();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchRecentlyPlayed: async () => {
    try {
      const res = await api.get<{ success: boolean; data: Track[] }>('/tracks/recently-played');
      set({ recentlyPlayed: Array.isArray(res.data.data) ? res.data.data : [] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  likeTrack: async (trackId: string) => {
    try {
      await api.post(`/tracks/${trackId}/like`);
      const track = get().tracks.find((t) => t.id === trackId);
      if (track) {
        set((s) => ({
          likedTracks: [...s.likedTracks, { ...track, isLiked: true }],
          tracks: s.tracks.map((t) =>
            t.id === trackId ? { ...t, isLiked: true, likeCount: (t.likeCount || 0) + 1 } : t
          ),
        }));
      }
      toast.success('Added to Liked Songs');
    } catch (err: any) {
      toast.error('Failed to like track');
    }
  },

  unlikeTrack: async (trackId: string) => {
    try {
      await api.delete(`/tracks/${trackId}/like`);
      set((s) => ({
        likedTracks: s.likedTracks.filter((t) => t.id !== trackId),
        tracks: s.tracks.map((t) =>
          t.id === trackId ? { ...t, isLiked: false, likeCount: Math.max(0, (t.likeCount || 1) - 1) } : t
        ),
      }));
      toast.success('Removed from Liked Songs');
    } catch (err: any) {
      toast.error('Failed to unlike track');
    }
  },

  createPlaylist: async (name: string, description?: string) => {
    const res = await api.post<{ success: boolean; data: Playlist }>('/playlists', { name, description, isPublic: false });
    const playlist = res.data.data;
    set((s) => ({ playlists: [...s.playlists, playlist] }));
    toast.success(`Playlist "${name}" created`);
    return playlist;
  },

  deletePlaylist: async (playlistId: string) => {
    await api.delete(`/playlists/${playlistId}`);
    set((s) => ({ playlists: s.playlists.filter((p) => p.id !== playlistId) }));
    toast.success('Playlist deleted');
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string) => {
    await api.post(`/playlists/${playlistId}/tracks`, { trackId });
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === playlistId ? { ...p, trackCount: p.trackCount + 1 } : p
      ),
    }));
    toast.success('Added to playlist');
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              trackCount: Math.max(0, p.trackCount - 1),
              tracks: p.tracks?.filter((t) => t.id !== trackId),
            }
          : p
      ),
    }));
    toast.success('Removed from playlist');
  },

  deleteTrack: async (trackId: string) => {
    await api.delete(`/tracks/${trackId}`);
    set((s) => ({
      tracks: s.tracks.filter((t) => t.id !== trackId),
      likedTracks: s.likedTracks.filter((t) => t.id !== trackId),
    }));
    toast.success('Track deleted');
  },
}));
