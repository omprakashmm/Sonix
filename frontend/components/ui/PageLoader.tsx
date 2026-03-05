
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className }: PageLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Animate progress bar to ~85% quickly then stall until content ready
    const t1 = setTimeout(() => setProgress(40), 80);
    const t2 = setTimeout(() => setProgress(70), 250);
    const t3 = setTimeout(() => setProgress(88), 500);
    const t4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setDone(true), 400);
    }, 900);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  if (done) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center',
        'animate-gradient-bg transition-opacity duration-500',
        done ? 'opacity-0 pointer-events-none' : 'opacity-100',
        className
      )}
    >
      {/* Logo / Brand */}
      <div className="mb-8 flex flex-col items-center gap-3">
        {/* Animated concentric rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full border border-brand-500/20 animate-ping-slow" />
          <div className="absolute h-16 w-16 rounded-full border border-brand-500/30 animate-pulse" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 neon-ring-lg">
            {/* Equalizer icon */}
            <div className="flex items-end gap-[3px] h-5">
              {[3, 5, 4, 6, 3].map((h, i) => (
                <div
                  key={i}
                  className="eq-bar w-[3px] bg-brand-400 rounded-sm"
                  style={{ height: `${h * 3}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight text-gradient">Sonix</p>
          <p className="text-xs text-surface-400 tracking-[0.2em] uppercase mt-0.5">
            Loading your music
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[2px] bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Subtle dots */}
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 w-1 rounded-full bg-brand-500/50 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
