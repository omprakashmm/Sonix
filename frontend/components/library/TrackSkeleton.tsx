/**
 * Small skeleton row for the TrackList loading state
 */
export function TrackSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-2 animate-pulse">
      <div className="w-8 h-4 rounded bg-white/5 flex-shrink-0" />
      <div className="h-10 w-10 rounded-lg bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3 w-1/3 rounded bg-white/5" />
        <div className="h-2 w-1/4 rounded bg-white/5" />
      </div>
      <div className="h-3 w-1/5 rounded bg-white/5 hidden md:block" />
      <div className="h-3 w-8 rounded bg-white/5" />
    </div>
  );
}
