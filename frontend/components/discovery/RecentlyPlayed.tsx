
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Music2, History } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { TrackMenu } from '@/components/discovery/TrackMenu';
import type { Track } from '@/types';
import { cn, safeCoverUrl } from '@/lib/utils';

interface Props {
  tracks: Track[];
  isLoading?: boolean;
}

export function RecentlyPlayed({ tracks, isLoading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { play, setQueue, currentTrack } = usePlayerStore();

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-brand-400" />
          <div className="h-6 w-36 bg-surface-800 rounded-lg shimmer" />
        </div>
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-none w-40 glass-card rounded-2xl p-3">
              <div className="aspect-square rounded-xl bg-surface-700 shimmer mb-3" />
              <div className="h-3 bg-surface-700 rounded shimmer mb-1.5" />
              <div className="h-2.5 bg-surface-800 rounded shimmer w-2/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!tracks.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-brand-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
          <h2 className="text-xl font-bold text-white">Recently Added</h2>
        </div>
        <div className="flex gap-1">
          <motion.button
            whileHover={{ x: -1 }} whileTap={{ scale: 0.88 }}
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg glass hover:bg-white/10 text-surface-400 hover:text-white transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ x: 1 }} whileTap={{ scale: 0.88 }}
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg glass hover:bg-white/10 text-surface-400 hover:text-white transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {tracks.map((track, i) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => { setQueue(tracks, i); play(track); }}
              className={cn(
                'floating-card flex-none w-40 glass-card rounded-2xl p-3 cursor-pointer group transition-all relative',
                isCurrent && 'border-brand-500/25 bg-brand-500/5'
              )}
            >
              {/* 3-dots — top right corner, visible on hover */}
              <div
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <TrackMenu track={track} tracks={tracks} index={i} className="opacity-100 bg-black/60 rounded-lg" />
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-surface-700 ring-1 ring-white/[0.06] group-hover:ring-brand-500/20 transition-all">
                {safeCoverUrl(track.coverUrl) ? (
                  <img
                    src={safeCoverUrl(track.coverUrl)!}
                    alt={track.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Music2 className="h-8 w-8 text-surface-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.7 }}
                    whileInView={{ scale: 1 }}
                    className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.5)]"
                  >
                    <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                  </motion.div>
                </div>
              </div>
              <p className={cn(
                'text-xs font-semibold truncate transition-colors',
                isCurrent ? 'text-brand-400' : 'text-white group-hover:text-brand-300'
              )}>
                {track.title}
              </p>
              <p className="text-xs text-surface-400 truncate mt-0.5">{track.artist}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
