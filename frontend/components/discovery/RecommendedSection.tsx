
import { motion } from 'framer-motion';
import { Play, Sparkles, Music2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/types';
import { cn, safeCoverUrl } from '@/lib/utils';

interface Props {
  tracks: Track[];
  isLoading?: boolean;
}

export function RecommendedSection({ tracks }: Props) {
  const { play, setQueue } = usePlayerStore();

  if (!tracks.length) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-brand-400" />
        <h2 className="text-xl font-bold text-white">Recommended For You</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tracks.slice(0, 10).map((track, i) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { setQueue(tracks, i); play(track); }}
            className="glass-card rounded-2xl p-3 cursor-pointer hover:bg-white/10 group transition-all"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-surface-700">
              {safeCoverUrl(track.coverUrl) ? (
                <img src={safeCoverUrl(track.coverUrl)!} alt={track.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music2 className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              {/* Gradient overlay + play button */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:scale-105 active:scale-95">
                <Play className="h-5 w-5 text-white fill-white ml-0.5" />
              </button>
            </div>

            <p className="text-sm font-medium text-white truncate">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artist}</p>

            {track.genre && (
              <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-medium">
                {track.genre}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
