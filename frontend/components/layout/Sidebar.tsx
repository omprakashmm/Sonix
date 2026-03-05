/**
 * Sonix — Sidebar Navigation
 */

import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Search, Library, Heart, Plus, Music2,
  ListMusic, Settings, ChevronRight, CloudUpload, Download,
  Youtube, Music,
} from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { cn, safeCoverUrl } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { CreatePlaylistDialog } from '@/components/library/CreatePlaylistDialog';
import { AddSongDialog, type AddMusicTab } from '@/components/import/AddSongDialog';

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/downloads', icon: Download, label: 'Downloads' },
];

const COLLECTION_ITEMS = [
  { href: '/liked', icon: Heart, label: 'Liked Songs', gradient: 'from-purple-500 to-pink-500' },
];

export function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { pathname } = useLocation();
  const { playlists, tracks } = useLibraryStore();
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [addSongTab, setAddSongTab] = useState<AddMusicTab>('video');

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent<AddMusicTab>).detail;
      setAddSongTab(tab ?? 'video');
      setShowAddSong(true);
    };
    document.addEventListener('openAddSong', handler);
    return () => document.removeEventListener('openAddSong', handler);
  }, []);

  return (
    <>
      <aside className={cn(
        'w-64 flex-shrink-0 flex flex-col h-full glass-sidebar',
        'fixed md:static inset-y-0 left-0 z-40',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* ── Logo ─────────────────────────── */}
        <div className="px-6 py-5 border-b border-white/[0.05]">
          <Link to="/home" className="flex items-center gap-3 group" onClick={onClose}>
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center neon-ring"
            >
              <Music2 className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-gradient">
              Sonix
            </span>
          </Link>
        </div>

        {/* ── Main Nav ──────────────────────── */}
        <nav className="px-3 pt-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                to={href}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden',
                  active
                    ? 'nav-active-glow text-brand-400'
                    : 'text-muted-foreground hover:text-white hover:bg-white/[0.04]'
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="flex items-center gap-3 w-full"
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      active ? 'text-brand-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.7)]' : 'group-hover:text-white group-hover:scale-110'
                    )}
                  />
                  {label}
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400"
                      style={{ boxShadow: '0 0 6px rgba(20,184,166,0.8)' }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* ── Add Song ──────────────────────── */}
        <div className="px-4 mt-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setAddSongTab('manual'); setShowAddSong(true); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-900/40 hover:shadow-brand-700/40 hover:brightness-110 transition-all"
          >
            <CloudUpload className="h-4 w-4" />
            Add Song
          </motion.button>
        </div>

        {/* ── Import Music ───────────────────── */}
        <div className="px-3 mt-4 space-y-1">
          <p className="px-3 mb-2 text-xs font-semibold text-surface-500 uppercase tracking-[0.12em]">
            Import Music
          </p>
          <button
            onClick={() => { setAddSongTab('playlist'); setShowAddSong(true); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/[0.04] transition-all group"
          >
            <div className="h-7 w-7 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/25 transition-colors">
              <Youtube className="h-3.5 w-3.5 text-red-400" />
            </div>
            <span>YouTube Playlist</span>
            <span className="ml-auto text-[10px] font-medium text-surface-500 bg-surface-700 px-1.5 py-0.5 rounded">URL</span>
          </button>
          <button
            onClick={() => { setAddSongTab('spotify'); setShowAddSong(true); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/[0.04] transition-all group"
          >
            <div className="h-7 w-7 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/25 transition-colors">
              <Music className="h-3.5 w-3.5 text-green-400" />
            </div>
            <span>Spotify Playlist</span>
            <span className="ml-auto text-[10px] font-medium text-surface-500 bg-surface-700 px-1.5 py-0.5 rounded">URL</span>
          </button>
        </div>

        {/* ── Collection ─────────────────────── */}
        <div className="px-3 mt-6">
          <p className="px-3 mb-2 text-xs font-semibold text-surface-500 uppercase tracking-[0.12em]">
            Collection
          </p>
          {COLLECTION_ITEMS.map(({ href, icon: Icon, label, gradient }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  active ? 'nav-active-glow text-brand-400' : 'text-muted-foreground hover:text-white hover:bg-white/[0.04]'
                )}
              >
                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                  className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                >
                  <Icon className="h-4 w-4 text-white fill-white" />
                </motion.div>
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── Playlists ──────────────────────── */}
        <div className="px-3 mt-6 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-[0.12em]">
              Playlists
            </p>
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCreatePlaylist(true)}
              className="h-6 w-6 rounded-md hover:bg-brand-500/20 flex items-center justify-center transition-colors text-surface-500 hover:text-brand-400"
              title="New playlist"
            >
              <Plus className="h-3.5 w-3.5" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
            <AnimatePresence>
              {playlists.map((pl, i) => {
                const active = pathname === `/playlist/${pl.id}`;
                return (
                  <motion.div
                    key={pl.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <Link
                      to={`/playlist/${pl.id}`}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 group',
                        active ? 'bg-brand-500/10 text-brand-400' : 'text-muted-foreground hover:text-white hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="h-8 w-8 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-white/5 group-hover:ring-brand-500/20 transition-all">
                        {safeCoverUrl(pl.coverUrl) ? (
                          <img src={safeCoverUrl(pl.coverUrl)!} alt={pl.name} width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <ListMusic className="h-4 w-4 text-surface-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{pl.name}</p>
                        <p className="text-xs text-surface-500">{pl.trackCount} songs</p>
                      </div>
                      <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {playlists.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 py-6 text-xs text-surface-500 text-center leading-relaxed"
              >
                No playlists yet.
                <br />
                <span className="text-brand-500 cursor-pointer hover:underline" onClick={() => setShowCreatePlaylist(true)}>
                  Create one
                </span>
              </motion.p>
            )}
          </div>
        </div>

        {/* ── Settings ────────────────────────────── */}
        <div className="px-4 py-4 border-t border-white/[0.04] mt-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center flex-shrink-0">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Sonix</p>
              <p className="text-xs text-surface-500 truncate">{tracks.length} song{tracks.length !== 1 ? 's' : ''} in library</p>
            </div>
            <Link
              to="/settings"
              className="text-surface-500 hover:text-brand-400 transition-colors p-1.5 rounded-lg hover:bg-brand-500/10"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      <CreatePlaylistDialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist} />
      <AddSongDialog open={showAddSong} onOpenChange={setShowAddSong} initialTab={addSongTab} />
    </>
  );
}
