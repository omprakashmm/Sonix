/**
 * Sonix — Persistent Music Player (Bottom Bar)
 *
 * Features: play/pause, next/prev, seek, volume, shuffle, repeat,
 *           keyboard shortcuts, crossfade, waveform, lyrics toggle,
 *           music-reactive glow, equalizer bars, marquee title
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Minimize2, Maximize2,
} from 'lucide-react';
import { usePlayerStore, getAudio } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { PlayerProgressBar } from './PlayerProgressBar';
import { VolumeControl } from './VolumeControl';
import { cn, safeCoverUrl } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/** Animated equalizer bars */
function EqualizerBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-3 w-5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'w-[3px] rounded-sm bg-brand-400',
            playing ? 'eq-bar' : 'opacity-30'
          )}
          style={{ height: playing ? '8px' : `${i % 2 === 0 ? 8 : 5}px` }}
        />
      ))}
    </div>
  );
}

/** Scrolling title marquee */
function MarqueeTitle({ text, className }: { text: string; className?: string }) {
  const overflows = text.length > 20;
  return (
    <div className={cn('ticker-wrap overflow-hidden', className)} style={{ '--ticker-bg': 'transparent' } as React.CSSProperties}>
      {overflows ? (
        <span className="ticker-text text-sm font-semibold text-white pr-12 whitespace-nowrap">
          {text}&nbsp;&nbsp;•&nbsp;&nbsp;{text}
        </span>
      ) : (
        <span className="text-sm font-semibold text-white truncate block">{text}</span>
      )}
    </div>
  );
}

export function MusicPlayer() {
  const {
    currentTrack, isPlaying, state, isShuffle, repeatMode,
    volume, isMuted, currentTime, duration, isMinimized,
    play, pause, next, previous, seek, setVolume,
    toggleMute, toggleShuffle, cycleRepeat, toggleMinimized,
    setCurrentTime, setDuration, setBuffered, setState,
  } = usePlayerStore();

  const { likedTracks, likeTrack, unlikeTrack } = useLibraryStore();
  const syncRef = useRef(false);
  void syncRef; // unused — audio src managed by playerStore

  // ── Sync HTML Audio element with store ─────────────────
  useEffect(() => {
    const audio = getAudio();
    if (!audio || !currentTrack) return;

    // Audio src is managed by playerStore.safePlay — just attach event listeners

    const handlers = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      durationchange: () => setDuration(audio.duration || 0),
      progress: () => {
        if (audio.buffered.length > 0) {
          setBuffered((audio.buffered.end(audio.buffered.length - 1) / audio.duration) * 100);
        }
      },
      canplay: () => setState('playing'),
      playing: () => setState('playing'),
      pause: () => setState('paused'),
      waiting: () => setState('loading'),
      error: () => setState('error'),
      ended: () => {
        const { repeatMode, next } = usePlayerStore.getState();
        if (repeatMode === 'one') {
          audio.currentTime = 0;
          audio.play().catch(console.error);
        } else {
          next();
        }
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler as EventListener);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler as EventListener);
      });
    };
  }, [currentTrack, setCurrentTime, setDuration, setBuffered, setState, isMuted, volume]);

  useKeyboardShortcuts();

  // ── Track cumulative listening time in localStorage ────
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      try {
        const prev = Number(localStorage.getItem('sonix_total_seconds') ?? 0);
        localStorage.setItem('sonix_total_seconds', String(prev + 1));
      } catch { /* storage unavailable */ }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const isLiked = currentTrack
    ? likedTracks.some((t) => t.id === currentTrack.id)
    : false;

  const toggleLike = () => {
    if (!currentTrack) return;
    isLiked ? unlikeTrack(currentTrack.id) : likeTrack(currentTrack.id);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 32 }}
      // Mobile: sit above bottom nav (h-16 = 64px). Desktop: start after sidebar (left-64)
      className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-50"
    >
      {/* ── Ambient glow backdrop ─────────────── */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 140% at 15% 120%, rgba(var(--glow-rgb), 0.14) 0%, transparent 65%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Glossy glass background ───────────────── */}
      <div className="absolute inset-0 glass-player-glossy shadow-[0_-16px_48px_rgba(0,0,0,0.8)]" />

      {/* ── Brand progress line at very top ──── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-700 via-brand-400 to-brand-600"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: 0.5 }}
        />
        {/* Glow dot at playhead */}
        {progress > 0 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-brand-300 shadow-[0_0_8px_rgba(var(--brand-rgb),0.9)] -translate-x-1/2"
            style={{ left: `${progress}%` }}
          />
        )}
      </div>

      {/* ── Main content ─────────────────────── */}
      <div className="relative px-3 md:px-5 pt-1 pb-2 h-[80px] flex items-center gap-2 md:gap-3">

        {/* ╣╗╣ LEFT / INFO: always visible ══════════════ */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 md:flex-none md:w-[280px]">
          {/* Album art — spinning disc */}
          <div className={cn(
            'relative h-10 w-10 md:h-[52px] md:w-[52px] rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-700',
            isPlaying
              ? 'ring-brand-400/50 disc-spin playing shadow-[0_0_18px_rgba(var(--brand-rgb),0.35)]'
              : 'ring-white/10 disc-spin'
          )}>
            {safeCoverUrl(currentTrack.coverUrl) ? (
              <img
                src={safeCoverUrl(currentTrack.coverUrl)!}
                alt={currentTrack.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-brand-700 to-surface-600 flex items-center justify-center">
                <span className="text-xl">🎵</span>
              </div>
            )}
            {/* Center hole */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-3 w-3 rounded-full bg-surface-950/80 ring-1 ring-white/10" />
            </div>
          </div>

          {/* Title / Artist */}
          <div className="min-w-0 flex-1">
            <MarqueeTitle text={currentTrack.title} className="max-w-[110px] md:max-w-[160px]" />
            <p className="text-[11px] text-surface-400 truncate mt-0.5 leading-tight">
              {currentTrack.artist}
            </p>
          </div>

          {/* Like + Equalizer */}
          <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
            <span className="hidden md:flex">
              <EqualizerBars playing={isPlaying} />
            </span>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.7 }}
              onClick={toggleLike}
              className={cn(
                'p-1.5 rounded-full transition-all duration-200',
                isLiked ? 'text-brand-400' : 'text-surface-600 hover:text-surface-200'
              )}
            >
              <Heart className={cn('h-4 w-4 transition-all', isLiked && 'fill-current drop-shadow-[0_0_5px_rgba(var(--brand-rgb),0.9)]')} />
            </motion.button>
          </div>
        </div>

        {/* ╣╗╣ MOBILE CONTROLS: small screens only ════════ */}
        <div className="flex md:hidden items-center gap-1 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={previous}
            className="p-1.5 rounded-full text-surface-300 hover:text-white transition-colors"
          >
            <SkipBack className="h-4 w-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.91 }}
            onClick={isPlaying ? pause : () => play()}
            disabled={state === 'loading'}
            className={cn(
              'relative h-9 w-9 rounded-full flex items-center justify-center',
              'bg-white text-black transition-all duration-300 disabled:opacity-50',
              isPlaying && 'shadow-[0_0_20px_rgba(255,255,255,0.22)]'
            )}
          >
            {state === 'loading' ? (
              <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-[1px]" />
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={next}
            className="p-1.5 rounded-full text-surface-300 hover:text-white transition-colors"
          >
            <SkipForward className="h-4 w-4" />
          </motion.button>
        </div>

        {/* ╣╗╣ CENTER: Controls + Progress ══════════════════════ */}
        <div className="hidden md:flex flex-1 flex-col items-center gap-1 min-w-0">
          {/* Playback buttons */}
          <div className="flex items-center gap-3">
            {/* Shuffle */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.82 }}
              onClick={toggleShuffle}
              title="Shuffle (S)"
              className={cn(
                'p-1.5 rounded-full transition-all duration-200',
                isShuffle
                  ? 'text-brand-400 drop-shadow-[0_0_6px_rgba(var(--brand-rgb),0.7)]'
                  : 'text-surface-500 hover:text-white'
              )}
            >
              <Shuffle className="h-[15px] w-[15px]" />
            </motion.button>

            {/* Previous */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.82 }}
              onClick={previous}
              title="Previous (←)"
              className="p-1.5 rounded-full text-surface-300 hover:text-white transition-colors"
            >
              <SkipBack className="h-[18px] w-[18px]" />
            </motion.button>

            {/* Play / Pause — main CTA */}
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.91 }}
              onClick={isPlaying ? pause : () => play()}
              disabled={state === 'loading'}
              title="Play/Pause (Space)"
              className={cn(
                'relative h-[44px] w-[44px] rounded-full flex items-center justify-center',
                'bg-white text-black transition-all duration-300 disabled:opacity-50',
                isPlaying && 'shadow-[0_0_28px_rgba(255,255,255,0.28)]'
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {state === 'loading' ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"
                  />
                ) : isPlaying ? (
                  <motion.div
                    key="pause"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 20 }}
                    transition={{ duration: 0.14 }}
                  >
                    <Pause className="h-5 w-5 fill-current" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -20 }}
                    transition={{ duration: 0.14 }}
                  >
                    <Play className="h-5 w-5 fill-current ml-[2px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.82 }}
              onClick={next}
              title="Next (→)"
              className="p-1.5 rounded-full text-surface-300 hover:text-white transition-colors"
            >
              <SkipForward className="h-[18px] w-[18px]" />
            </motion.button>

            {/* Repeat */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.82 }}
              onClick={cycleRepeat}
              title="Repeat (R)"
              className={cn(
                'p-1.5 rounded-full transition-all duration-200',
                repeatMode !== 'none'
                  ? 'text-brand-400 drop-shadow-[0_0_6px_rgba(var(--brand-rgb),0.7)]'
                  : 'text-surface-500 hover:text-white'
              )}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="h-[15px] w-[15px]" />
              ) : (
                <Repeat className="h-[15px] w-[15px]" />
              )}
            </motion.button>
          </div>

          {/* Progress bar row */}
          <PlayerProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
          />
        </div>

        {/* ═══ RIGHT: Volume + extras ══════════════ */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 justify-end" style={{ width: '260px' }}>
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            onClick={toggleMinimized}
            title="Mini player"
            className="p-1.5 rounded-full text-surface-500 hover:text-white hover:bg-white/5 transition-all"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
