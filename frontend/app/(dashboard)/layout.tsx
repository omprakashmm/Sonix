/**
 * Sonix — Dashboard Layout
 */
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useLibraryStore } from '@/store/libraryStore';

export function DashboardLayout() {
  const { fetchTracks, fetchPlaylists, fetchLikedTracks } = useLibraryStore();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchTracks();
    fetchPlaylists();
    fetchLikedTracks();
  }, [fetchTracks, fetchPlaylists, fetchLikedTracks]);

  // Lenis smooth scroll on main scroll container
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const lenis = new Lenis({
      wrapper: el,
      content: el.firstElementChild as HTMLElement,
      lerp: 0.1,
      smoothWheel: true,
      touchMultiplier: 1.2,
    });
    let raf: number;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  const location = useLocation();

  return (
    <div className="relative flex h-screen overflow-hidden bg-surface-950">
      <AnimatedBackground intensity="subtle" />

      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar />
        <main
          ref={mainRef}
          className="flex-1 scrollbar-thin"
          style={{ overflowY: 'auto' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full pb-[144px] md:pb-[88px]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MusicPlayer — above bottom nav on mobile, full-width (after sidebar) on desktop */}
      <MusicPlayer />

      {/* Mobile-only bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

export default DashboardLayout;



