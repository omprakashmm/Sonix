/**
 * Sonix — Top Bar
 */

import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const navigate = useNavigate();

  return (
    <header className="relative h-14 md:h-16 flex items-center gap-2 md:gap-4 px-4 md:px-6 glass-topbar gradient-border-bottom flex-shrink-0 z-10">
      {/* Mobile: show Sonix logo since sidebar is hidden */}
      <Link to="/home" className="flex md:hidden items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center neon-ring">
          <Music2 className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-gradient">Sonix</span>
      </Link>

      {/* Nav arrows — desktop only */}
      <div className="hidden md:flex gap-1.5">
        <motion.div whileHover={{ x: -1 }} whileTap={{ scale: 0.88 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 rounded-full glass text-surface-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ x: 1 }} whileTap={{ scale: 0.88 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(1)}
            className="h-8 w-8 rounded-full glass text-surface-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <SearchBar compact />
      </div>

      {/* Avatar / Settings */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} className="ml-auto">
        <Link to="/settings">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center ring-2 ring-brand-500/30 hover:ring-brand-400/60 transition-all cursor-pointer">
            <Music2 className="h-4 w-4 text-white" />
          </div>
        </Link>
      </motion.div>
    </header>
  );
}
