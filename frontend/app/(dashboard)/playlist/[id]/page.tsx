/**
 * OpenWave — Playlist Detail Page
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, MoreHorizontal, Pencil, Trash2, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { DraggableTrackList } from '@/components/library/DraggableTrackList';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Playlist, Track } from '@/types';
import { formatDuration } from '@/lib/utils';
import { toast } from 'sonner';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { setQueue, play, toggleShuffle } = usePlayerStore();
  const { deletePlaylist } = useLibraryStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<Playlist & { tracks: Track[] }>(`/playlists/${id}`);
        setPlaylist(res.data);
        setTracks(res.data.tracks || []);
      } catch {
        toast.error('Playlist not found');
            navigate('/library');
      } finally {
        setIsLoading(false);
      }
    };
    load();
}, [id, navigate]);

  const playPlaylist = (startIndex = 0) => {
    if (!tracks.length) return;
    setQueue(tracks, startIndex);
    play(tracks[startIndex]);
  };

  const playShuffled = () => {
    if (!tracks.length) return;
    toggleShuffle();
    const idx = Math.floor(Math.random() * tracks.length);
    setQueue(tracks, idx);
    play(tracks[idx]);
  };

  const handleDelete = async () => {
    if (!playlist) return;
    await deletePlaylist(playlist.id);
    navigate('/library');
  };

  const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);

  if (isLoading || !playlist) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-48 rounded-2xl shimmer" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {/* ── Hero ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end gap-6 mb-8 p-6 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #0d2137 0%, #050507 100%)' }}
      >
        {/* Cover art */}
        <div className="h-40 w-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl bg-surface-700">
          {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.name} width={160} height={160} className="object-cover w-full h-full" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900">
              <Music2 className="h-16 w-16 text-brand-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Playlist</p>
          <h1 className="text-4xl font-extrabold text-white mt-1 truncate">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{playlist.description}</p>
          )}
          <p className="text-muted-foreground mt-2 text-sm">
            {tracks.length} songs · {formatDuration(totalDuration)}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={() => playPlaylist(0)}
              className="bg-brand-500 hover:bg-brand-400 text-white rounded-full px-6 gap-2"
              disabled={!tracks.length}
            >
              <Play className="h-4 w-4 fill-current" /> Play
            </Button>
            <Button
              variant="outline"
              onClick={playShuffled}
              className="glass border-white/10 rounded-full px-4 gap-2"
              disabled={!tracks.length}
            >
              <Shuffle className="h-4 w-4" /> Shuffle
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-700 border-white/10 text-white">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Pencil className="h-4 w-4" /> Edit playlist
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4" /> Delete playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* ── Track List (Draggable) ─────────────────── */}
      <DraggableTrackList
        tracks={tracks}
        playlistId={playlist.id}
        onPlay={(track, index) => playPlaylist(index)}
        onReorder={setTracks}
      />
    </div>
  );
}
