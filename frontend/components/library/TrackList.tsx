/**
 * OpenWave — Track List Component
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, Heart, MoreHorizontal, Music2,
  Download, Trash2, ListPlus, Clock,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { cn, formatDuration, safeCoverUrl } from '@/lib/utils';
import type { Track } from '@/types';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddToPlaylistSubmenu } from './AddToPlaylistSubmenu';
import { TrackSkeleton } from './TrackSkeleton';

interface Props {
  tracks: Track[];
  isLoading?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function TrackList({ tracks, isLoading, showActions, compact }: Props) {
  const { currentTrack, isPlaying, play, pause, setQueue } = usePlayerStore();
  const { likedTracks, likeTrack, unlikeTrack, deleteTrack } = useLibraryStore();

  const isLiked = (id: string) => likedTracks.some((t) => t.id === id);
  const isCurrent = (id: string) => currentTrack?.id === id;

  const handlePlay = (track: Track, index: number) => {
    if (isCurrent(track.id)) {
      isPlaying ? pause() : play();
    } else {
      setQueue(tracks, index);
      play(track);
    }
  };

  const handleDownload = async (track: Track) => {
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL}/tracks/${track.id}/download`;
    link.download = `${track.artist} - ${track.title}.mp3`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <TrackSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full glass flex items-center justify-center mb-4">
          <Music2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-white font-medium">No tracks yet</p>
        <p className="text-muted-foreground text-sm mt-1">Import from YouTube or upload your files</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {/* Header row */}
      {!compact && (
        <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider border-b border-white/5 mb-1">
          <span className="w-8 text-center">#</span>
          <span>Title</span>
          <span>Album</span>
          <span></span>
          <span className="flex items-center"><Clock className="h-3 w-3" /></span>
        </div>
      )}

      {tracks.map((track, index) => {
        const active = isCurrent(track.id);
        const liked = isLiked(track.id);

        return (
          <motion.div
            key={track.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              'group grid items-center gap-4 px-4 py-2 rounded-xl cursor-pointer transition-all',
              compact
                ? 'grid-cols-[auto_1fr_auto]'
                : 'grid-cols-[auto_1fr_1fr_auto_auto]',
              active
                ? 'bg-brand-500/10 text-brand-400'
                : 'hover:bg-white/5 text-white'
            )}
          >
            {/* Index / Play button */}
            <div className="w-8 text-center flex-shrink-0">
              <span className={cn(
                'text-sm group-hover:hidden',
                active ? 'text-brand-400' : 'text-muted-foreground'
              )}>
                {active && isPlaying ? (
                  <span className="flex gap-px justify-center items-end h-4">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="w-0.5 bg-brand-400 rounded-sm animate-wave"
                        style={{ animationDelay: `${i * 0.15}s`, height: `${50 + i * 15}%` }}
                      />
                    ))}
                  </span>
                ) : (
                  index + 1
                )}
              </span>
              <button
                onClick={() => handlePlay(track, index)}
                className="hidden group-hover:block text-white"
              >
                {active && isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
              </button>
            </div>

            {/* Track info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700">
                {safeCoverUrl(track.coverUrl) ? (
                  <img src={safeCoverUrl(track.coverUrl)!} alt={track.title} width={40} height={40} className="object-cover h-full w-full" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Music2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-medium truncate', active ? 'text-brand-400' : 'text-white')}>
                  {track.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
            </div>

            {/* Album (hidden on compact) */}
            {!compact && (
              <p className="text-sm text-muted-foreground truncate">
                {track.album || '—'}
              </p>
            )}

            {/* Like button */}
            {showActions && (
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  liked ? unlikeTrack(track.id) : likeTrack(track.id);
                }}
                className={cn(
                  'opacity-0 group-hover:opacity-100 transition-all p-1',
                  liked ? 'opacity-100 text-brand-400' : 'text-muted-foreground hover:text-white'
                )}
              >
                <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
              </motion.button>
            )}

            {/* Duration + more menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-muted-foreground tabular-nums">
                {formatDuration(track.duration)}
              </span>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-60 md:opacity-0 md:group-hover:opacity-100 p-1 text-muted-foreground hover:text-white transition-all"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-surface-700 border-white/10 text-white w-48"
                    align="end"
                  >
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handlePlay(track, index)}>
                      <Play className="h-4 w-4" /> Play now
                    </DropdownMenuItem>
                    <AddToPlaylistSubmenu trackId={track.id} />
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleDownload(track)}>
                      <Download className="h-4 w-4" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
                      onClick={() => deleteTrack(track.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
