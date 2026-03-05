/**
 * OpenWave — Theme Store
 * Persists the user's selected visual theme
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 'dark' | 'neon' | 'minimal' | 'cyberpunk' | 'sunset' | 'rose';

interface ThemeStore {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'sonix-theme' }
  )
);
