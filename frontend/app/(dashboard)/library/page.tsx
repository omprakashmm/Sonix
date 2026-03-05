/**
 * Sonix — Library Page
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Music2, ListMusic } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { TrackList } from '@/components/library/TrackList';
import { PlaylistGrid } from '@/components/library/PlaylistGrid';
import { AddSongDialog } from '@/components/import/AddSongDialog';
import { CreatePlaylistDialog } from '@/components/library/CreatePlaylistDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LibraryPage() {
  const { tracks, playlists, isLoading } = useLibraryStore();
  const [showImport, setShowImport] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists'>('tracks');

  return (
    <div className="px-4 md:px-6 py-6 md:py-8">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Your Library</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {tracks.length} tracks · {playlists.length} playlists
          </p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Music
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowCreatePlaylist(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold glass border-white/10 text-surface-300 hover:text-white transition-all"
          >
            <ListMusic className="h-4 w-4" /> New Playlist
          </motion.button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'tracks' | 'playlists')}>
        <TabsList className="glass mb-4 md:mb-6">
          <TabsTrigger value="tracks" className="gap-2">
            <Music2 className="h-4 w-4" /> Tracks
          </TabsTrigger>
          <TabsTrigger value="playlists" className="gap-2">
            <ListMusic className="h-4 w-4" /> Playlists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks">
          <TrackList tracks={tracks} isLoading={isLoading} showActions />
        </TabsContent>
        <TabsContent value="playlists">
          <PlaylistGrid playlists={playlists} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <AddSongDialog open={showImport} onOpenChange={setShowImport} />
      <CreatePlaylistDialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist} />
    </div>
  );
}
