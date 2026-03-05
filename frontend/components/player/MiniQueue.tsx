/**
 * OpenWave — Mini Queue panel
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, GripVertical, Music2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { cn, formatDuration, safeCoverUrl } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MiniQueue({ open, onClose }: Props) {
  const { queue, queueIndex, play } = usePlayerStore();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 right-4 w-80 max-h-96 overflow-hidden rounded-2xl glass-strong z-50 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Queue ({queue.length})</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {queue.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Queue is empty</p>
            ) : (
              queue.map((track, i) => (
                <motion.button
                  key={`${track.id}-${i}`}
                  onClick={() => play(track)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left',
                    i === queueIndex && 'bg-brand-500/10'
                  )}
                >
                  <div className="h-9 w-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-600">
                    {safeCoverUrl(track.coverUrl) ? (
                      <img src={safeCoverUrl(track.coverUrl)!} alt={track.title} width={36} height={36} className="object-cover w-full h-full" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Music2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm truncate', i === queueIndex ? 'text-brand-400 font-medium' : 'text-white')}>
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDuration(track.duration)}
                  </span>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
