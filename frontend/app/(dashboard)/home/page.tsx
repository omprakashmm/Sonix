/**
 * Sonix — Home / Discovery Page
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FeaturedSection } from '@/components/discovery/FeaturedSection';
import { TrendingTracks } from '@/components/discovery/TrendingTracks';
import { RecentlyPlayed } from '@/components/discovery/RecentlyPlayed';
import { RecommendedSection } from '@/components/discovery/RecommendedSection';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import api from '@/lib/api';
import type { Track } from '@/types';
import { Music2, ListMusic, Heart, Youtube, Upload, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Quick-start card for empty state */
function QuickCard({
  icon: Icon,
  label,
  desc,
  color,
  to,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  to?: string;
  onClick?: () => void;
}) {
  const inner = (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group relative rounded-2xl p-5 flex items-start gap-4 border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 80% at 0% 0%, ${color}10 0%, transparent 70%)` }} />
      <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return <div onClick={onClick}>{inner}</div>;
}

/** Library stats row */
function StatsBar({ tracks, playlists, liked }: { tracks: number; playlists: number; liked: number }) {
  if (tracks === 0) return null;
  return (
    <div className="flex items-center gap-6 mt-5">
      {[
        { icon: Music2, value: tracks, label: 'songs' },
        { icon: ListMusic, value: playlists, label: 'playlists' },
        { icon: Heart, value: liked, label: 'liked' },
      ].map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-sm font-semibold text-white tabular-nums">{value}</span>
          <span className="text-xs text-surface-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState<Track[]>([]);
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tracks, playlists, likedTracks } = useLibraryStore();
  const { play } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      const [t, r, n] = await Promise.allSettled([
        api.get<{ success: boolean; data: Track[] }>('/discovery/trending'),
        api.get<{ success: boolean; data: Track[] }>('/discovery/recommended'),
        api.get<{ success: boolean; data: Track[] }>('/discovery/recently-added'),
      ]);
      if (t.status === 'fulfilled') setTrending(Array.isArray(t.value.data.data) ? t.value.data.data : []);
      if (r.status === 'fulfilled') setRecommended(Array.isArray(r.value.data.data) ? r.value.data.data : []);
      if (n.status === 'fulfilled') setRecentlyAdded(Array.isArray(n.value.data.data) ? n.value.data.data : []);
      setIsLoading(false);
    };
    load();
  }, []);

  const isEmpty = !isLoading && tracks.length === 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 md:px-6 py-5 md:py-8 space-y-6 md:space-y-8"
    >
      {/* ── Greeting hero ──────────────────────────── */}
      <motion.div variants={sectionVariants}>
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--brand-rgb),0.08) 0%, rgba(99,102,241,0.04) 60%, transparent 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-purple-600/8 blur-2xl" />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {getGreeting()} 👋
            </h1>
            <p className="text-surface-400 mt-2 text-base">
              {isEmpty
                ? 'Your music library is empty — add your first song to get started.'
                : `${tracks.length} song${tracks.length !== 1 ? 's' : ''} in your library.`}
            </p>
          </motion.div>

          <StatsBar tracks={tracks.length} playlists={playlists.length} liked={likedTracks.length} />

          <div className="mt-6 ticker-wrap opacity-15 pointer-events-none" style={{ '--ticker-bg': 'transparent' } as React.CSSProperties}>
            <span className="ticker-text text-[11px] font-medium tracking-[0.15em] uppercase text-brand-400">
              {Array(6).fill('✦ Sonix  ✦ Your Music  ✦ Anywhere  ✦ Play Free  ').join('')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Start (empty library) ─────────────────────── */}
      {isEmpty && (
        <motion.div variants={sectionVariants} className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-[0.12em]">Get started</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickCard icon={Youtube}    label="Import from YouTube" desc="Paste any YouTube URL to download and add it to your library instantly." color="#ef4444"
              onClick={() => document.dispatchEvent(new CustomEvent('openAddSong', { detail: 'video' }))} />
            <QuickCard icon={Upload}     label="Upload audio files"  desc="Drag & drop or browse for MP3, FLAC, WAV, and other audio files." color="rgb(var(--brand-rgb))"
              onClick={() => document.dispatchEvent(new CustomEvent('openAddSong', { detail: 'manual' }))} />
            <QuickCard icon={ListMusic}  label="Import a playlist"   desc="Import an entire YouTube playlist in one click." color="#a855f7"
              onClick={() => document.dispatchEvent(new CustomEvent('openAddSong', { detail: 'playlist' }))} />
          </div>
        </motion.div>
      )}

      {/* ── Quick Access tiles (non-empty library) ── directly below greeting */}
      {!isEmpty && (
        <motion.div variants={sectionVariants} className="space-y-3">
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-[0.12em]">Quick access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickCard icon={Music2}    label="Library"    desc="All your songs"   color="rgb(var(--brand-rgb))" to="/library" />
            <QuickCard icon={Heart}     label="Liked"      desc="Your favourites"  color="#ec4899" to="/liked" />
            <QuickCard icon={ListMusic} label="Playlists"  desc={`${playlists.length} playlist${playlists.length !== 1 ? 's' : ''}`} color="#a855f7" to="/library" />
            <QuickCard icon={Youtube}   label="Add music"  desc="Import new songs" color="#ef4444"
              onClick={() => document.dispatchEvent(new CustomEvent('openAddSong', { detail: 'video' }))} />
          </div>
        </motion.div>
      )}

      {/* ── Discovery sections — only render when they have data ── */}
      {!isEmpty && (
        <>
          {(isLoading || recentlyAdded.length > 0) && (
            <motion.div variants={sectionVariants}>
              <FeaturedSection tracks={recentlyAdded.slice(0, 6)} isLoading={isLoading} />
            </motion.div>
          )}

          {(isLoading || recentlyAdded.length > 0) && (
            <motion.div variants={sectionVariants}>
              <RecentlyPlayed tracks={recentlyAdded} isLoading={isLoading} />
            </motion.div>
          )}

          {/* Fallback: show library tracks directly if discovery APIs return nothing */}
          {!isLoading && recentlyAdded.length === 0 && tracks.length > 0 && (
            <motion.div variants={sectionVariants}>
              <RecentlyPlayed tracks={[...tracks].reverse().slice(0, 12)} isLoading={false} />
            </motion.div>
          )}

          {(isLoading || trending.length > 0) && (
            <motion.div variants={sectionVariants}>
              <TrendingTracks tracks={trending} isLoading={isLoading} />
            </motion.div>
          )}

          {/* Fallback trending: show library tracks when trending API returns nothing */}
          {!isLoading && trending.length === 0 && tracks.length > 0 && (
            <motion.div variants={sectionVariants}>
              <TrendingTracks tracks={tracks.slice(0, 10)} isLoading={false} />
            </motion.div>
          )}

          {recommended.length > 0 && (
            <motion.div variants={sectionVariants}>
              <RecommendedSection tracks={recommended} isLoading={isLoading} />
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
