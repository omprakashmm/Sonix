/**
 * OpenWave — Player Zustand Store
 * Manages global audio playback state
 */
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { Track, PlayerStore, PlayerState, RepeatMode } from '@/types';

// ─── Audio Element Singleton ────────────────────────────────
let audioElement: HTMLAudioElement | null = null;
let playPromise: Promise<void> | null = null;

export const getAudio = (): HTMLAudioElement => {
  if (typeof window === 'undefined') return null as any;
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'metadata';
    audioElement.crossOrigin = 'anonymous';
  }
  return audioElement;
};

/** Safely start playback — cancels any in-flight play before loading a new src */
const safePlay = async (audio: HTMLAudioElement, newSrc?: string): Promise<void> => {
  // If a play is in flight, let it settle (or fail silently) before changing src
  if (playPromise) {
    await playPromise.catch(() => {});
    playPromise = null;
  }
  // Guard: don't attempt to play if src is not a valid HTTP URL
  if (newSrc && !newSrc.startsWith('http')) {
    console.warn('playerStore: invalid audio URL, skipping play:', newSrc);
    return;
  }
  if (newSrc && audio.src !== newSrc) {
    audio.pause();
    audio.src = newSrc;
    audio.load();
  }
  playPromise = audio.play();
  await playPromise.catch((err: Error) => {
    // AbortError is expected when a new track interrupts — silence it
    if (err.name !== 'AbortError') console.error(err);
  });
  playPromise = null;
};

// ─── Player Store ───────────────────────────────────────────
export const usePlayerStore = create<PlayerStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ── Initial State ──────────────────────────────────
        currentTrack: null,
        queue: [],
        queueIndex: -1,
        state: 'idle',
        isPlaying: false,
        isShuffle: false,
        repeatMode: 'none',
        volume: 0.8,
        isMuted: false,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        isMinimized: false,
        crossfadeDuration: 0,

        // ── Actions ────────────────────────────────────────
        play: (track?: Track) => {
          const { queue, queueIndex, currentTrack, volume, isMuted } = get();
          const audio = getAudio();
          if (!audio) return;

          if (track && track.id !== currentTrack?.id) {
            // New track — update queue position
            const trackIndex = queue.findIndex((t) => t.id === track.id);
            audio.volume = isMuted ? 0 : volume;
            set({
              currentTrack: track,
              queueIndex: trackIndex >= 0 ? trackIndex : queueIndex,
              state: 'loading',
              isPlaying: true,
              currentTime: 0,
            });
            safePlay(audio, track.fileUrl);
          } else {
            // Resume current
            set({ isPlaying: true, state: 'playing' });
            safePlay(audio);
          }
        },

        pause: () => {
          const audio = getAudio();
          if (audio) audio.pause();
          set({ isPlaying: false, state: 'paused' });
        },

        togglePlay: () => {
          const { isPlaying, play, pause } = get();
          isPlaying ? pause() : play();
        },

        next: () => {
          const { queue, queueIndex, isShuffle, repeatMode, play } = get();
          if (!queue.length) return;

          let nextIndex: number;
          if (isShuffle) {
            do {
              nextIndex = Math.floor(Math.random() * queue.length);
            } while (nextIndex === queueIndex && queue.length > 1);
          } else {
            nextIndex = queueIndex + 1;
            if (nextIndex >= queue.length) {
              if (repeatMode === 'all') {
                nextIndex = 0;
              } else {
                set({ isPlaying: false, state: 'paused' });
                return;
              }
            }
          }
          set({ queueIndex: nextIndex });
          play(queue[nextIndex]);
        },

        previous: () => {
          const { queue, queueIndex, currentTime, play } = get();
          const audio = getAudio();

          // If past 3 seconds, restart current track
          if (currentTime > 3) {
            if (audio) audio.currentTime = 0;
            set({ currentTime: 0 });
            return;
          }

          const prevIndex = Math.max(0, queueIndex - 1);
          if (queue[prevIndex]) {
            set({ queueIndex: prevIndex });
            play(queue[prevIndex]);
          }
        },

        seek: (time: number) => {
          const audio = getAudio();
          if (audio) audio.currentTime = time;
          set({ currentTime: time });
        },

        setVolume: (volume: number) => {
          const clipped = Math.max(0, Math.min(1, volume));
          const audio = getAudio();
          if (audio) audio.volume = clipped;
          set({ volume: clipped, isMuted: clipped === 0 });
        },

        toggleMute: () => {
          const { isMuted, volume } = get();
          const audio = getAudio();
          const newMuted = !isMuted;
          if (audio) audio.volume = newMuted ? 0 : volume;
          set({ isMuted: newMuted });
        },

        toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

        cycleRepeat: () =>
          set((s) => {
            const order: RepeatMode[] = ['none', 'all', 'one'];
            const next = order[(order.indexOf(s.repeatMode) + 1) % order.length];
            const audio = getAudio();
            if (audio) audio.loop = next === 'one';
            return { repeatMode: next };
          }),

        setQueue: (tracks: Track[], startIndex = 0) => {
          set({ queue: tracks, queueIndex: startIndex });
        },

        addToQueue: (track: Track) =>
          set((s) => ({ queue: [...s.queue, track] })),

        removeFromQueue: (index: number) =>
          set((s) => {
            const queue = s.queue.filter((_, i) => i !== index);
            const queueIndex =
              index < s.queueIndex
                ? s.queueIndex - 1
                : s.queueIndex;
            return { queue, queueIndex };
          }),

        clearQueue: () => set({ queue: [], queueIndex: -1 }),

        setCurrentTime: (currentTime: number) => set({ currentTime }),
        setDuration: (duration: number) => set({ duration }),
        setBuffered: (buffered: number) => set({ buffered }),
        setState: (state: PlayerState) => set({ state }),
        toggleMinimized: () => set((s) => ({ isMinimized: !s.isMinimized })),
      }),
      {
        name: 'sonix-player',
        // Only persist preferences, not runtime state
        partialize: (s) => ({
          volume: s.volume,
          isMuted: s.isMuted,
          isShuffle: s.isShuffle,
          repeatMode: s.repeatMode,
          crossfadeDuration: s.crossfadeDuration,
          isMinimized: s.isMinimized,
        }),
      }
    )
  )
);
