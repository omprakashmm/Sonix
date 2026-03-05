/**
 * OpenWave — Volume Control
 */

import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, isMuted, onVolumeChange, onToggleMute }: Props) {
  const displayVolume = isMuted ? 0 : volume;

  const Icon =
    displayVolume === 0 ? VolumeX
    : displayVolume < 0.33 ? Volume
    : displayVolume < 0.66 ? Volume1
    : Volume2;

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onToggleMute}
        className="text-muted-foreground hover:text-white transition-colors p-1"
        title="Toggle mute (M)"
      >
        <Icon className="h-4 w-4" />
      </motion.button>

      <div className="progress-bar w-24 relative group">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-brand-500 pointer-events-none"
          style={{ width: `${displayVolume * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={displayVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="relative z-10 w-full opacity-0 cursor-pointer h-4"
          aria-label="Volume"
          title="Volume (↑/↓)"
        />
      </div>

      <span className="text-xs text-muted-foreground w-8 tabular-nums">
        {Math.round(displayVolume * 100)}
      </span>
    </div>
  );
}
