/**
 * Sonix — Reusable track context-menu (3-dots) for discovery sections
 */

import { motion } from 'framer-motion';
import { MoreHorizontal, Play, Heart, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddToPlaylistSubmenu } from '@/components/library/AddToPlaylistSubmenu';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/types';

interface Props {
  track: Track;
  tracks?: Track[];  // full list for queue context
  index?: number;
  /** extra classes on the trigger button */
  className?: string;
}

export function TrackMenu({ track, tracks = [], index = 0, className = '' }: Props) {
  const { likedTracks, likeTrack, unlikeTrack, deleteTrack } = useLibraryStore();
  const { play, setQueue } = usePlayerStore();
  const liked = likedTracks.some((t) => t.id === track.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => e.stopPropagation()}
          className={`p-1.5 rounded-lg text-surface-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${className}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-surface-700 border-white/10 text-white w-48"
        align="end"
      >
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => { setQueue(tracks.length ? tracks : [track], index); play(track); }}
        >
          <Play className="h-4 w-4" /> Play now
        </DropdownMenuItem>

        <AddToPlaylistSubmenu trackId={track.id} />

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => liked ? unlikeTrack(track.id) : likeTrack(track.id)}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
          {liked ? 'Unlike' : 'Like'}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
          onClick={() => deleteTrack(track.id)}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
