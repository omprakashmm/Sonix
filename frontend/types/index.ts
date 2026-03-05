// ============================================================
//  OpenWave — Shared TypeScript Interfaces & Types
// ============================================================

// ─── User & Auth ────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// ─── Track ──────────────────────────────────────────────────
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration: number;       // seconds
  fileUrl: string;        // stream URL
  coverUrl?: string;
  fileSize?: number;
  bitrate?: number;
  format: 'mp3' | 'flac' | 'wav' | 'aac' | 'm4a';
  source: 'upload' | 'youtube' | 'soundcloud';
  sourceUrl?: string;
  lyrics?: string;
  playCount: number;
  likeCount: number;
  isLiked?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackWithMeta extends Track {
  isLiked: boolean;
  isInQueue: boolean;
  position?: number;
}

// ─── Playlist ───────────────────────────────────────────────
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  isSmartPlaylist: boolean;
  smartConfig?: SmartPlaylistConfig;
  trackCount: number;
  totalDuration: number;
  userId: string;
  tracks?: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface SmartPlaylistConfig {
  rules: SmartRule[];
  matchAll: boolean;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SmartRule {
  field: 'genre' | 'artist' | 'album' | 'playCount' | 'likeCount' | 'createdAt';
  operator: 'is' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number;
}

// ─── Player ─────────────────────────────────────────────────
export type RepeatMode = 'none' | 'all' | 'one';
export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlayerStore {
  // State
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  state: PlayerState;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  isMinimized: boolean;
  crossfadeDuration: number; // seconds (0 = disabled)

  // Actions
  play: (track?: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setState: (state: PlayerState) => void;
  toggleMinimized: () => void;
}

// ─── Library ────────────────────────────────────────────────
export interface LibraryStore {
  tracks: Track[];
  playlists: Playlist[];
  likedTracks: Track[];
  recentlyPlayed: Track[];
  mostPlayed: Track[];
  isLoading: boolean;
  error: string | null;

  fetchTracks: (force?: boolean) => Promise<void>;
  fetchPlaylists: (force?: boolean) => Promise<void>;
  fetchLikedTracks: (force?: boolean) => Promise<void>;
  fetchRecentlyPlayed: () => Promise<void>;
  likeTrack: (trackId: string) => Promise<void>;
  unlikeTrack: (trackId: string) => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
}

// ─── Upload / Import ────────────────────────────────────────
export interface UploadProgress {
  id: string;
  filename: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
  errorMessage?: string;
  fileSize?: number;
  track?: Track;
}

export interface YouTubeImportJob {
  id: string;
  url: string;
  status: 'QUEUED' | 'DOWNLOADING' | 'CONVERTING' | 'FETCHING_META' | 'DONE' | 'ERROR';
  progress: number;
  title?: string;
  artist?: string;
  thumbnail?: string;
  error?: string;
  errorMessage?: string;
  track?: Track;
  createdAt: string;
}

export interface YouTubeMetadata {
  title: string;
  artist: string;
  album?: string;
  thumbnail: string;
  duration: number;
  videoId: string;
  channel?: string;
}

export interface YouTubePlaylistItem {
  videoId: string;
  title: string;
  duration?: string | number;
  thumbnail?: string;
}

export interface YouTubePlaylistMetadata {
  playlistTitle: string;
  channelName?: string;
  totalItems: number;
  items: YouTubePlaylistItem[];
}

// ─── Search ─────────────────────────────────────────────────
export interface SearchResult {
  tracks: Track[];
  playlists: Playlist[];
  artists: ArtistSummary[];
  total: number;
}

export interface ArtistSummary {
  name: string;
  trackCount: number;
  coverUrl?: string;
}

// ─── Discovery ──────────────────────────────────────────────
export interface DiscoveryData {
  trending: Track[];
  recentlyAdded: Track[];
  recommended: Track[];
  featuredPlaylist?: Playlist;
}

// ─── API ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ─── Forms ──────────────────────────────────────────────────
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface TrackEditForm {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  cover?: File;
}

export interface PlaylistForm {
  name: string;
  description?: string;
  isPublic: boolean;
}

// ─── Utility ────────────────────────────────────────────────
export interface ColorPalette {
  dominant: string;
  vibrant: string;
  muted: string;
  darkVibrant: string;
  darkMuted: string;
  lightVibrant: string;
}

export type SortOrder = 'asc' | 'desc';
export type TrackSortBy = 'title' | 'artist' | 'album' | 'duration' | 'createdAt' | 'playCount';
export type Theme = 'dark' | 'light' | 'system';
