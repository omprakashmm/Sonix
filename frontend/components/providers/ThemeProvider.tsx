import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    // Remove existing theme classes
    root.classList.remove('theme-dark', 'theme-neon', 'theme-minimal', 'theme-cyberpunk', 'theme-sunset', 'theme-rose');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return <>{children}</>;
}
