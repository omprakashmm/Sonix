import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { DashboardLayout } from '@/app/(dashboard)/layout';

const HomePage      = lazy(() => import('@/app/(dashboard)/home/page'));
const LibraryPage   = lazy(() => import('@/app/(dashboard)/library/page'));
const LikedPage     = lazy(() => import('@/app/(dashboard)/liked/page'));
const SearchPage    = lazy(() => import('@/app/(dashboard)/search/page'));
const PlaylistPage  = lazy(() => import('@/app/(dashboard)/playlist/[id]/page'));
const SettingsPage  = lazy(() => import('@/app/(dashboard)/settings/page'));
const DownloadsPage = lazy(() => import('@/app/(dashboard)/downloads/page'));

export function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen items-center justify-center"><span className="text-surface-500 text-sm">Loading…</span></div>}>
            <Routes>
              {/* Redirect root to home */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<Navigate to="/home" replace />} />
              <Route path="/register" element={<Navigate to="/home" replace />} />

              {/* Dashboard layout with nested pages */}
              <Route element={<DashboardLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/liked" element={<LikedPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </ThemeProvider>
    </QueryProvider>
  );
}
