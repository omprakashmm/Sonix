
/**
 * OpenWave — Add Music Dialog
 * 4 tabs: Video (single YT) | YT Playlist | Spotify | Manual upload
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, List, Music, Plus, Music2 } from 'lucide-react';
import { VideoImport } from './VideoImport';
import { PlaylistImport } from './PlaylistImport';
import { ManualEntry } from './ManualEntry';

export type AddMusicTab = 'video' | 'playlist' | 'spotify' | 'manual';

interface AddSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Which tab to open — updated from 'upload'/'youtube' to new 4-tab ids */
  initialTab?: AddMusicTab;
}

const TABS: {
  id: AddMusicTab;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    id: 'video',
    label: 'Video',
    icon: <Youtube className="h-3.5 w-3.5" />,
    activeClass: 'bg-red-500 text-white shadow-lg shadow-red-900/30',
  },
  {
    id: 'playlist',
    label: 'YT Playlist',
    icon: <List className="h-3.5 w-3.5" />,
    activeClass: 'bg-red-500/15 text-red-400',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    icon: <Music className="h-3.5 w-3.5" />,
    activeClass: 'bg-green-500/15 text-green-400',
  },
  {
    id: 'manual',
    label: 'Manual',
    icon: <Plus className="h-3.5 w-3.5" />,
    activeClass: 'bg-brand-500/15 text-brand-400',
  },
];

export function AddSongDialog({
  open,
  onOpenChange,
  initialTab = 'video',
}: AddSongDialogProps) {
  const [tab, setTab] = useState<AddMusicTab>(initialTab);

  // Sync when dialog is (re-)opened with a different initialTab
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const handleSuccess = () => {
    setTimeout(() => onOpenChange(false), 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ─────────────────────────────── */}
          <motion.div
            key="add-music-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* ── Dialog Panel ─────────────────────────── */}
          <motion.div
            key="add-music-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-[480px] pointer-events-auto overflow-hidden rounded-2xl"
              style={{
                background: '#111118',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.7)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
                    <Music2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Add Music</h2>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-surface-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tab Bar */}
              <div className="px-6 pb-3">
                <div
                  className="flex rounded-xl overflow-hidden"
                  style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200 ${
                        tab === t.id
                          ? t.activeClass
                          : 'text-surface-400 hover:text-white'
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="px-6 pb-6 pt-1 min-h-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {tab === 'video' && <VideoImport onSuccess={handleSuccess} />}
                    {tab === 'playlist' && <PlaylistImport onSuccess={handleSuccess} />}
                    {tab === 'spotify' && <SpotifyPlaceholder />}
                    {tab === 'manual' && <ManualEntry onSuccess={handleSuccess} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SpotifyPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
        <Music className="h-7 w-7 text-green-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">Spotify Import</p>
        <p className="text-xs text-surface-400 mt-1 max-w-[260px]">
          Paste a Spotify playlist link — we&apos;ll match tracks and import available audio.
        </p>
      </div>
      <div className="w-full flex gap-2">
        <input
          type="url"
          placeholder="https://open.spotify.com/playlist/…"
          className="flex-1 bg-surface-700 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-surface-500 focus:outline-none focus:border-green-500/50"
        />
        <button
          disabled
          className="px-4 py-2.5 rounded-xl bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/20 opacity-60 cursor-not-allowed"
        >
          Fetch
        </button>
      </div>
      <p className="text-xs text-surface-500">Coming soon — Spotify integration in progress</p>
    </div>
  );
}
