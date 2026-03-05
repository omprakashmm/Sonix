
import { motion } from 'framer-motion';
import { Play, TrendingUp, Music2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { TrackMenu } from '@/components/discovery/TrackMenu';
import type { Track } from '@/types';
import { formatDuration, safeCoverUrl } from '@/lib/utils';

interface Props {
  tracks: Track[];
  isLoading?: boolean;
}

export function TrendingTracks({ tracks, isLoading }: Props) {
  const { play, setQueue, currentTrack, isPlaying } = usePlayerStore();

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-brand-400" />
          <div className="h-6 w-24 bg-surface-800 rounded-lg shimmer" />
        </div>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-2.5 rounded-xl">
              <div className="w-6 h-4 bg-surface-800 rounded shimmer" />
              <div className="h-11 w-11 rounded-lg bg-surface-700 shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-700 rounded shimmer w-2/3" />
                <div className="h-2.5 bg-surface-800 rounded shimmer w-1/3" />
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
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-brand-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
        <h2 className="text-xl font-bold text-white">Trending</h2>
      </div>

      <div className="space-y-0.5">
        {tracks.slice(0, 10).map((track, i) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.035, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => { setQueue(tracks, i); play(track); }}
              className={`track-row flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer group transition-all ${
                isCurrent ? 'bg-brand-500/8 border border-brand-500/15' : ''
              }`}
            >
              {/* Rank number or equalizer */}
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                {isCurrent && isPlaying ? (
                  <div className="flex items-end gap-[2px] h-4">
                    {[1,2,3].map(j => (
                      <div key={j} className="eq-bar w-[2.5px] bg-brand-400 rounded-sm" style={{ height: '8px' }} />
                    ))}
                  </div>
                ) : (
                  <span className={`text-sm font-bold tabular-nums ${
                    isCurrent ? 'text-brand-400' : 'text-surface-500'
                  }`}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Cover */}
              <div className="relative h-11 w-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700 ring-1 ring-white/[0.06] group-hover:ring-brand-500/20 transition-all">
                {safeCoverUrl(track.coverUrl) ? (
                  <img src={safeCoverUrl(track.coverUrl)!} alt={track.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Music2 className="h-5 w-5 text-surface-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
              </div>

              {/* Title + artist */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate transition-colors ${
                  isCurrent ? 'text-brand-400' : 'text-white group-hover:text-brand-300'
                }`}>
                  {track.title}
                </p>
                <p className="text-xs text-surface-400 truncate">{track.artist}</p>
              </div>

              {/* Play count */}
              <span className="text-xs text-surface-500 tabular-nums hidden sm:block">
                {(track.playCount ?? 0).toLocaleString()}
              </span>

              {/* Duration */}
              <span className="text-xs text-surface-500 tabular-nums">
                {formatDuration(track.duration)}
              </span>

              {/* 3-dots menu */}
              <TrackMenu track={track} tracks={tracks} index={i} className="md:opacity-0 md:group-hover:opacity-100 opacity-60" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
