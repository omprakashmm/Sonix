
import { motion } from 'framer-motion';
import { Play, Music2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { TrackMenu } from '@/components/discovery/TrackMenu';
import type { Track } from '@/types';
import { cn, safeCoverUrl } from '@/lib/utils';

interface Props {
  tracks: Track[];
  isLoading?: boolean;
}

export function FeaturedSection({ tracks, isLoading }: Props) {
  const { play, setQueue } = usePlayerStore();

  if (isLoading) {
    return (
      <section>
        <div className="h-6 w-28 bg-surface-800 rounded-lg shimmer mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 glass-card rounded-xl p-2 pr-4 h-[70px]">
              <div className="h-14 w-14 rounded-lg bg-surface-700 shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-700 rounded shimmer w-3/4" />
                <div className="h-2.5 bg-surface-800 rounded shimmer w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!tracks.length) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Featured</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {tracks.slice(0, 6).map((track, i) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => { setQueue(tracks, i); play(track); }}
            className={cn(
              'floating-card flex items-center gap-3 glass-card rounded-xl overflow-hidden cursor-pointer group transition-all p-2 pr-2',
              'hover:border-brand-500/20 hover:bg-white/[0.06]'
            )}
          >
            <div className="relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700 ring-1 ring-white/5 group-hover:ring-brand-500/30 transition-all">
              {safeCoverUrl(track.coverUrl) ? (
                <img src={safeCoverUrl(track.coverUrl)!} alt={track.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music2 className="h-6 w-6 text-surface-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Play className="h-5 w-5 text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                </motion.div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate group-hover:text-brand-300 transition-colors">{track.title}</p>
              <p className="text-xs text-surface-400 truncate">{track.artist}</p>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <TrackMenu track={track} tracks={tracks} index={i} className="md:opacity-0 md:group-hover:opacity-100 opacity-60" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
