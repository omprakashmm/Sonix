/**
 * Sonix — Mobile Bottom Navigation Bar
 * Shows only on mobile (< md). Handles Home/Search/Library/Liked navigation.
 */

import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Library, Heart, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/home',    icon: Home,      label: 'Home'    },
  { href: '/search',  icon: Search,    label: 'Search'  },
  { href: '/library', icon: Library,   label: 'Library' },
  { href: '/liked',   icon: Heart,     label: 'Liked'   },
  { href: '/settings',icon: Settings2, label: 'Profile' },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Glossy glass background */}
      <div className="absolute inset-0 mobile-bottom-nav-glass" />

      <div className="relative flex items-center justify-around px-2 h-16 safe-pb">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} to={href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-0.5 py-1"
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      active
                        ? 'text-brand-400 drop-shadow-[0_0_6px_rgba(var(--brand-rgb),0.8)]'
                        : 'text-surface-500'
                    )}
                    fill={active ? 'rgba(var(--brand-rgb),0.15)' : 'none'}
                  />
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        key="dot"
                        layoutId="bottomNavDot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-400"
                        style={{ boxShadow: '0 0 6px rgba(var(--brand-rgb), 0.9)' }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors duration-200',
                    active ? 'text-brand-400' : 'text-surface-600'
                  )}
                >
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
