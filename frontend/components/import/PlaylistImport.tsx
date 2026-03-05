
/**
 * PlaylistImport – fetch a YouTube playlist preview and batch-import all tracks.
 * Used in the "YT Playlist" tab of the Add Music dialog.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, Loader2, XCircle, Music2, Download, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { useLibraryStore } from '@/store/libraryStore';
import type { YouTubePlaylistMetadata } from '@/types';

type Stage = 'idle' | 'fetching' | 'preview' | 'importing' | 'done' | 'error';

export function PlaylistImport({ onSuccess }: { onSuccess?: () => void }) {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [meta, setMeta] = useState<YouTubePlaylistMetadata | null>(null);
  const [queued, setQueued] = useState(0);
  const [done, setDone] = useState(0);
  const [error, setError] = useState('');
  const { fetchTracks } = useLibraryStore();

  const atIdle = stage === 'idle' || stage === 'error';

  const fetchPlaylist = async () => {
    if (!url.trim()) return;
    setStage('fetching');
    setError('');
    try {
      const { data } = await api.get<{ data: YouTubePlaylistMetadata }>('/youtube/playlist-metadata', {
        params: { url },
      });
      setMeta(data.data);
      setStage('preview');
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to fetch playlist';
      setError(msg);
      setStage('error');
    }
  };

  const importAll = async () => {
    if (!meta) return;
    setStage('importing');
    setDone(0);
    try {
      const { data } = await api.post<{ data: { jobIds: string[]; totalQueued: number } }>(
        '/youtube/import-playlist',
        { url }
      );
      const { jobIds, totalQueued } = data.data;
      setQueued(totalQueued);
      pollJobs(jobIds);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Playlist import failed';
      setError(msg);
      setStage('error');
    }
  };

  const pollJobs = (jobIds: string[]) => {
    const completed = new Set<string>();
    let attempts = 0;
    const iv = setInterval(async () => {
      if (++attempts > 300) { clearInterval(iv); setStage('done'); fetchTracks(true); onSuccess?.(); return; }
      try {
        // Check a random un-completed job to gauge progress
        const pending = jobIds.filter((id) => !completed.has(id));
        if (pending.length === 0) {
          clearInterval(iv);
          setStage('done');
          fetchTracks(true);
          onSuccess?.();
          return;
        }
        const { data } = await api.get<{ data: { status: string } }>(
          `/youtube/jobs/${pending[0]}`
        );
        if (data.data.status === 'DONE' || data.data.status === 'ERROR') {
          completed.add(pending[0]);
          setDone(completed.size);
        }
      } catch { /* keep polling */ }
    }, 2000);
  };

  const reset = () => { setUrl(''); setStage('idle'); setMeta(null); setQueued(0); setDone(0); setError(''); };

  const progress = queued > 0 ? Math.round((done / queued) * 100) : 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-surface-400">Paste a YouTube playlist URL to import all tracks</p>

      {/* URL row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <List className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && atIdle && fetchPlaylist()}
            placeholder="https://www.youtube.com/playlist?list=…"
            disabled={!atIdle}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder:text-surface-500 bg-surface-700 border border-white/10 focus:outline-none focus:border-red-500/60 disabled:opacity-60 transition-colors"
          />
        </div>

        {atIdle ? (
          <button
            onClick={fetchPlaylist}
            disabled={!url.trim()}
            className="px-4 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Fetch
          </button>
        ) : (
          <button
            onClick={reset}
            className="px-3 rounded-xl text-surface-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Fetching spinner */}
      {stage === 'fetching' && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-xl px-3 py-2.5">
          <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Empty idle state */}
        {stage === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 space-y-2"
          >
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <List className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-xs text-surface-500">Paste a playlist URL and click Fetch</p>
          </motion.div>
        )}

        {/* Playlist Preview */}
        {meta && (stage === 'preview' || stage === 'importing' || stage === 'done') && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Playlist header card */}
            <div
              className="flex gap-3 items-center p-3 rounded-xl"
              style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Grid of up to 4 thumbnails */}
              <div className="flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden bg-surface-700 grid grid-cols-2 gap-px">
                {meta.items.slice(0, 4).map((item, i) =>
                  item.thumbnail ? (
                    <div key={i} className="relative overflow-hidden">
                      <img src={item.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div key={i} className="flex items-center justify-center bg-surface-600">
                      <Music2 className="h-3 w-3 text-surface-400" />
                    </div>
                  )
                )}
                {Array.from({ length: Math.max(0, 4 - meta.items.slice(0, 4).length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-surface-600 flex items-center justify-center">
                    <Music2 className="h-3 w-3 text-surface-400" />
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{meta.playlistTitle}</p>
                {meta.channelName && (
                  <p className="text-xs text-surface-400 truncate">{meta.channelName}</p>
                )}
                <p className="text-xs text-surface-500 mt-0.5">
                  {meta.totalItems} track{meta.totalItems !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Track list preview (first 5) */}
            <div className="space-y-1 max-h-[148px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {meta.items.slice(0, 20).map((item, i) => (
                <div
                  key={item.videoId}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-xs text-surface-500 w-5 text-right flex-shrink-0">{i + 1}</span>
                  {item.thumbnail ? (
                    <div className="relative h-7 w-10 rounded overflow-hidden flex-shrink-0">
                      <img src={item.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-7 w-10 rounded bg-surface-600 flex-shrink-0 flex items-center justify-center">
                      <Music2 className="h-3 w-3 text-surface-500" />
                    </div>
                  )}
                  <p className="text-xs text-surface-300 truncate flex-1">{item.title}</p>
                </div>
              ))}
              {meta.totalItems > 20 && (
                <p className="text-xs text-surface-500 text-center py-1">
                  +{meta.totalItems - 20} more tracks
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Import All button */}
        {stage === 'preview' && (
          <motion.div key="import-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              onClick={importAll}
              className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> Import All {meta?.totalItems} Tracks
            </button>
          </motion.div>
        )}

        {/* Importing progress */}
        {stage === 'importing' && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <div className="flex justify-between text-xs text-surface-400">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Importing tracks… ({done}/{queued})
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1 bg-surface-700 [&>div]:bg-red-500" />
            <p className="text-xs text-surface-500 text-center">
              This may take several minutes. You can close this dialog.
            </p>
          </motion.div>
        )}

        {/* Done */}
        {stage === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-green-500/10 rounded-xl px-4 py-3"
          >
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Playlist queued!</p>
              <p className="text-xs text-surface-400">{queued} tracks added to import queue</p>
            </div>
            <button onClick={reset} className="text-xs text-surface-400 hover:text-white transition-colors ml-auto">
              Import another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
