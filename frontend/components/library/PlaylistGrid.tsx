
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Music2, MoreHorizontal, Trash2 } from 'lucide-react';
import { safeCoverUrl } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import type { Playlist } from '@/types';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { plural } from '@/lib/utils';

interface Props {
  playlists: Playlist[];
  isLoading?: boolean;
}

function PlaylistCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 animate-pulse">
      <div className="aspect-square rounded-xl bg-white/5" />
      <div className="h-3 w-3/4 rounded bg-white/5" />
      <div className="h-2 w-1/2 rounded bg-white/5" />
    </div>
  );
}

export function PlaylistGrid({ playlists, isLoading }: Props) {
  const { setQueue, play } = usePlayerStore();
  const { deletePlaylist } = useLibraryStore();

  const handlePlayAll = (pl: Playlist) => {
    if (pl.tracks?.length) {
      setQueue(pl.tracks, 0);
      play(pl.tracks[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <PlaylistCardSkeleton key={i} />)}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full glass flex items-center justify-center mb-4">
          <Music2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-white font-medium">No playlists yet</p>
        <p className="text-muted-foreground text-sm mt-1">Create your first playlist to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {playlists.map((pl, i) => (
        <motion.div
          key={pl.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass-card rounded-2xl p-4 group hover:bg-white/10 transition-all cursor-pointer"
        >
          <Link to={`/playlist/${pl.id}`} className="block">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-surface-700">
              {safeCoverUrl(pl.coverUrl) ? (
                <img src={safeCoverUrl(pl.coverUrl)!} alt={pl.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music2 className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              {/* Hover play button */}
              <button
                onClick={(e) => { e.preventDefault(); handlePlayAll(pl); }}
                className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center
                           opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                           transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Play className="h-5 w-5 text-white fill-current ml-0.5" />
              </button>
            </div>

            <p className="text-sm font-medium text-white truncate">{pl.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {plural(pl.tracks?.length ?? pl.trackCount ?? 0, 'track')}
            </p>
          </Link>

          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.preventDefault()}
              className="mt-2 p-1 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-surface-700 border-white/10 text-white w-44" align="start">
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handlePlayAll(pl)}>
                <Play className="h-4 w-4" /> Play all
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
                onClick={() => deletePlaylist(pl.id)}
              >
                <Trash2 className="h-4 w-4" /> Delete playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      ))}
    </div>
  );
}
