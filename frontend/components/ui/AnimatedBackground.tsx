
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
  /** intensity: 'subtle' | 'normal' | 'vivid' */
  intensity?: 'subtle' | 'normal' | 'vivid';
}

export function AnimatedBackground({
  className,
  intensity = 'normal',
}: AnimatedBackgroundProps) {
  const opacityMap = { subtle: '6', normal: '10', vivid: '18' };
  const o = opacityMap[intensity];

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden',
        className
      )}
    >
      {/* Primary teal orb — top-left */}
      <div
        className={`blob-1 absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full
          bg-brand-500/${o} blur-[120px]`}
      />

      {/* Purple accent — center-right */}
      <div
        className={`blob-2 absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full
          bg-purple-700/${o} blur-[100px]`}
      />

      {/* Deep teal — bottom-left */}
      <div
        className={`blob-3 absolute -bottom-48 left-1/4 h-[550px] w-[550px] rounded-full
          bg-brand-700/${o} blur-[120px]`}
      />

      {/* Warm accent — bottom-right */}
      <div
        className={`blob-4 absolute -bottom-32 -right-32 h-[380px] w-[380px] rounded-full
          bg-indigo-800/${o} blur-[100px]`}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
