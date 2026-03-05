/**
 * OpenWave — Waveform Visualizer (WaveSurfer.js)
 */

import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  trackUrl: string;
  onReady?: (duration: number) => void;
}

export function WaveformVisualizer({ trackUrl, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const { isPlaying, currentTime, seek } = usePlayerStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance
    waveSurferRef.current?.destroy();

    waveSurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(255, 255, 255, 0.2)',
      progressColor: '#14b8a6',
      cursorColor: 'rgba(255, 255, 255, 0.5)',
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 64,
      normalize: true,
      interact: true,
      backend: 'MediaElement',
    });

    waveSurferRef.current.load(trackUrl);

    waveSurferRef.current.on('ready', () => {
      const dur = waveSurferRef.current?.getDuration() || 0;
      onReady?.(dur);
    });

    waveSurferRef.current.on('interaction', (newTime) => {
      seek(newTime);
    });

    return () => {
      waveSurferRef.current?.destroy();
    };
  }, [trackUrl]);

  // Sync play/pause state
  useEffect(() => {
    const ws = waveSurferRef.current;
    if (!ws) return;
    if (isPlaying && !ws.isPlaying()) {
      ws.play().catch(() => {});
    } else if (!isPlaying && ws.isPlaying()) {
      ws.pause();
    }
  }, [isPlaying]);

  return (
    <div className="w-full rounded-lg overflow-hidden">
      <div ref={containerRef} />
    </div>
  );
}
