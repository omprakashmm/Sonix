/**
 * OpenWave — Player Progress Bar
 * Custom range input with buffered progress overlay
 */

import { useRef, useCallback } from 'react';
import { formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function PlayerProgressBar({ currentTime, duration, onSeek }: Props) {
  const buffered = usePlayerStore((s) => s.buffered);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = (parseFloat(e.target.value) / 100) * duration;
      onSeek(time);
    },
    [duration, onSeek]
  );

  return (
    <div className="w-full flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
        {formatDuration(currentTime)}
      </span>

      <div className="progress-bar flex-1 relative group">
        {/* Buffered track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-white/10 pointer-events-none"
          style={{ width: `${buffered}%` }}
        />
        {/* Progress track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-brand-500 pointer-events-none transition-all"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={handleChange}
          className="relative z-10 w-full opacity-0 cursor-pointer h-4"
          aria-label="Track progress"
        />
      </div>

      <span className="text-xs text-muted-foreground w-10 tabular-nums">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
