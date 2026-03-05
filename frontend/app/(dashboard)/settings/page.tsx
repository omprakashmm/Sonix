/**
 * Sonix — Settings / Appearance Page
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Music2, Clock, Headphones, BarChart3 } from 'lucide-react';
import { useThemeStore, type ThemeId } from '@/store/themeStore';
import { useLibraryStore } from '@/store/libraryStore';
import { cn } from '@/lib/utils';

const THEMES: {
  id: ThemeId;
  name: string;
  description: string;
  preview: string; // gradient for card background
  icon: string;
  iconColor: string;
}[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Classic deep dark with emerald glow',
    preview: 'linear-gradient(135deg, #050507 0%, #0a0a0f 50%, #111118 100%)',
    icon: '🌑',
    iconColor: '#14b8a6',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Vivid purple & pink neon atmosphere',
    preview: 'linear-gradient(135deg, #1a0030 0%, #2e0060 50%, #4a0090 100%)',
    icon: '💜',
    iconColor: '#a855f7',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean & quiet indigo-accented look',
    preview: 'linear-gradient(135deg, #0d0d1a 0%, #12123a 50%, #1a1a50 100%)',
    icon: '▫️',
    iconColor: '#6366f1',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Cyan & gold with scanline grid effect',
    preview: 'linear-gradient(135deg, #001018 0%, #002030 50%, #003040 100%)',
    icon: '⚡',
    iconColor: '#00d5e1',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange & amber glow',
    preview: 'linear-gradient(135deg, #1a0800 0%, #3d1200 50%, #5c1f00 100%)',
    icon: '🌅',
    iconColor: '#f97316',
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Soft rose & pink bloom',
    preview: 'linear-gradient(135deg, #1a0010 0%, #3d002a 50%, #5c0040 100%)',
    icon: '🌸',
    iconColor: '#f43f5e',
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { recentlyPlayed } = useLibraryStore();

  // ── Time-spent stats (persisted in localStorage) ──────────
  const totalSeconds: number = (() => {
    try { return Number(localStorage.getItem('sonix_total_seconds') ?? 0); }
    catch { return 0; }
  })();
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const tracksPlayed = recentlyPlayed?.length ?? 0;

  return (
    <div className="px-4 md:px-6 py-6 md:py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5 text-surface-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      {/* ── Time Spent Listening ──────────────────────────── */}
      <section className="mb-8 space-y-3">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-[0.12em] px-1">
          Your listening stats
        </p>
        <div className="glass rounded-2xl p-5 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-10 w-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <Clock className="h-5 w-5 text-brand-400" />
            </div>
            <p className="text-lg font-bold text-white">{hours}<span className="text-sm font-medium text-surface-400">h</span> {minutes}<span className="text-sm font-medium text-surface-400">m</span></p>
            <p className="text-xs text-surface-500">Time listened</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-10 w-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-brand-400" />
            </div>
            <p className="text-lg font-bold text-white">{tracksPlayed}</p>
            <p className="text-xs text-surface-500">Tracks played</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-10 w-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-brand-400" />
            </div>
            <p className="text-lg font-bold text-white">{totalSeconds > 0 ? Math.round(totalSeconds / Math.max(tracksPlayed, 1) / 60) : 0}<span className="text-sm font-medium text-surface-400">m</span></p>
            <p className="text-xs text-surface-500">Avg per track</p>
          </div>
        </div>
      </section>

      {/* Theme Picker */}
      <section className="space-y-4">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-[0.12em] px-1">
          Choose your theme
        </p>

        <div className="grid grid-cols-2 gap-4">
          {THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'relative rounded-2xl overflow-hidden text-left transition-all duration-200',
                  'border-2',
                  isActive
                    ? 'border-brand-400 shadow-lg shadow-brand-900/40'
                    : 'border-white/5 hover:border-white/15'
                )}
                style={{ background: t.preview }}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center z-10"
                  >
                    <Check className="h-3.5 w-3.5 text-white" />
                  </motion.div>
                )}
                <div className="p-6 pt-8 pb-5 space-y-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${t.iconColor}20` }}
                  >
                    <span>{t.icon}</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{t.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section className="mt-10 space-y-3">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-[0.12em] px-1">
          About
        </p>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center flex-shrink-0">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Sonix</p>
            <p className="text-xs text-surface-500 mt-0.5">Version 1.0.0</p>
          </div>
        </div>
      </section>
    </div>
  );
}
