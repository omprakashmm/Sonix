/**
 * OpenWave — Liked Songs Page
 */

import { useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLibraryStore } from '@/store/libraryStore';
import { TrackList } from '@/components/library/TrackList';
import { usePlayerStore } from '@/store/playerStore';

export default function LikedPage() {
  const { likedTracks, isLoading, fetchLikedTracks } = useLibraryStore();
  const { setQueue, play } = usePlayerStore();

  useEffect(() => {
    fetchLikedTracks();
  }, [fetchLikedTracks]);

  const playAll = () => {
    if (likedTracks.length === 0) return;
    setQueue(likedTracks, 0);
    play(likedTracks[0]);
  };

  return (
    <div className="px-6 py-8">
      {/* ── Hero Header ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end gap-6 mb-8 p-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #1d1135 0%, #0d1a2e 50%, #050507 100%)',
        }}
      >
        <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl flex-shrink-0">
          <Heart className="h-16 w-16 text-white fill-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Playlist</p>
          <h1 className="text-4xl font-extrabold text-white mt-1">Liked Songs</h1>
          <p className="text-muted-foreground mt-2">{likedTracks.length} songs</p>
          {likedTracks.length > 0 && (
            <button
              onClick={playAll}
              className="mt-4 px-6 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-full font-semibold text-sm transition-colors"
            >
              Play All
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Track List ─────────────────────────────── */}
      <TrackList tracks={likedTracks} isLoading={isLoading} showActions />
    </div>
  );
}
