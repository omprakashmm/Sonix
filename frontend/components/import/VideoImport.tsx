/**
 * VideoImport – single YouTube video URL → import to library.
 * Used in the "Video" tab of the Add Music dialog.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Music2, CheckCircle2, XCircle, X } from 'lucide-react';
import api from '@/lib/api';
import { useLibraryStore } from '@/store/libraryStore';
import type { YouTubeMetadata, YouTubeImportJob } from '@/types';

type Stage = 'idle' | 'fetching' | 'preview' | 'importing' | 'done' | 'error';

export function VideoImport({ onSuccess }: { onSuccess?: () => void }) {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<YouTubeMetadata | null>(null);
  const [job, setJob] = useState<YouTubeImportJob | null>(null);
  const [error, setError] = useState('');
  const { fetchTracks } = useLibraryStore();

  const atIdle = stage === 'idle' || stage === 'error';

  const fetchPreview = async () => {
    if (!url.trim()) return;
    setStage('fetching');
    setError('');
    try {
      const { data } = await api.get<{ data: YouTubeMetadata }>('/youtube/metadata', { params: { url } });
      setPreview(data.data);
      setStage('preview');
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to fetch video info';
      setError(msg);
      setStage('error');
    }
  };

  const startImport = async () => {
    if (!preview) return;
    setStage('importing');
    try {
      const { data } = await api.post<{ data: { jobId: string } }>('/youtube/import', { url });
      const jobId = data.data.jobId;
      if (!jobId) throw new Error('No job ID returned');
      setJob({ id: jobId, status: 'QUEUED', progress: 0 } as YouTubeImportJob);
      poll(jobId);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Import failed';
      setError(msg);
      setStage('error');
    }
  };

  const poll = (jobId: string) => {
    let attempts = 0;
    const iv = setInterval(async () => {
      if (++attempts > 120) {
        clearInterval(iv);
        setError('Import timed out');
        setStage('error');
        return;
      }
      try {
        const { data } = await api.get<{ data: YouTubeImportJob }>(`/youtube/jobs/${jobId}`);
        const j = data.data;
        setJob(j);
        if (j.status === 'DONE') { clearInterval(iv); setStage('done'); fetchTracks(true); onSuccess?.(); }
        else if (j.status === 'ERROR') {
          clearInterval(iv);
          setError(j.error ?? 'yt-dlp failed');
          setStage('error');
        }
      } catch { /* keep polling on network blip */ }
    }, 1500);
  };

  const reset = () => { setUrl(''); setStage('idle'); setPreview(null); setJob(null); setError(''); };

  return (
    <div className="space-y-4">
      <p className="text-xs text-surface-400">Paste a YouTube video URL or youtu.be link</p>

      {/* URL row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && atIdle && fetchPreview()}
            placeholder="https://www.youtube.com/watch?v=…"
            disabled={!atIdle}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder:text-surface-500 bg-surface-700 border border-white/10 focus:outline-none focus:border-red-500/60 disabled:opacity-60 transition-colors"
          />
        </div>

        {atIdle ? (
          <button
            onClick={fetchPreview}
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
          <motion.div
            key="fetching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 gap-4"
          >
            {/* Bouncing dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                  className="h-2 w-2 rounded-full bg-red-500"
                  style={{ boxShadow: '0 0 8px rgba(239,68,68,0.7)' }}
                />
              ))}
            </div>
            <p className="text-xs text-surface-400">Fetching video info…</p>
          </motion.div>
        )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-xl px-3 py-2.5">
          <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Empty state */}
        {stage === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 space-y-2"
          >
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Youtube className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-xs text-surface-500">Paste a YouTube URL and click Fetch</p>
          </motion.div>
        )}

        {/* Preview card */}
        {preview && (stage === 'preview' || stage === 'importing' || stage === 'done') && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 rounded-xl overflow-hidden p-3"
            style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="relative h-16 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700">
              {preview.thumbnail ? (
                <img src={preview.thumbnail} alt={preview.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music2 className="h-6 w-6 text-surface-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-medium text-white truncate leading-tight">{preview.title}</p>
              {preview.channel && (
                <p className="text-xs text-surface-400 mt-0.5 truncate">{preview.channel}</p>
              )}
              {preview.duration && (
                <p className="text-xs text-surface-500 mt-0.5">{preview.duration}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Import button */}
        {stage === 'preview' && (
          <motion.div key="import-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              onClick={startImport}
              className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Youtube className="h-4 w-4" /> Import to Library
            </button>
          </motion.div>
        )}

        {/* Progress */}
        {stage === 'importing' && job && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Status label + percentage */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-surface-300 font-medium">
                {job.status === 'DOWNLOADING' ? '⬇ Downloading audio'
                  : job.status === 'CONVERTING' ? '🔄 Converting to MP3'
                    : job.status === 'FETCHING_META' ? '🔍 Reading metadata'
                      : '⚙ Processing'}
              </span>
              <motion.span
                key={job.progress}
                initial={{ scale: 1.3, color: '#f87171' }}
                animate={{ scale: 1, color: '#e2e8f0' }}
                className="font-bold tabular-nums text-sm"
              >
                {job.progress}%
              </motion.span>
            </div>

            {/* Animated equalizer bars */}
            <div className="flex items-end gap-[3px] h-10 px-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const filled = (i / 27) * 100 <= job.progress;
                const isHead = Math.abs((i / 27) * 100 - job.progress) < 4;
                return (
                  <motion.div
                    key={i}
                    animate={filled ? {
                      height: [
                        `${24 + Math.sin(i * 0.7) * 14}px`,
                        `${16 + Math.sin(i * 0.7 + 1) * 18}px`,
                        `${24 + Math.sin(i * 0.7) * 14}px`,
                      ],
                    } : { height: '4px' }}
                    transition={{ duration: 0.8, repeat: filled ? Infinity : 0, delay: i * 0.025, ease: 'easeInOut' }}
                    className="flex-1 rounded-full"
                    style={{
                      background: filled
                        ? isHead
                          ? 'rgba(255,255,255,0.95)'
                          : `rgba(239,68,68,${0.5 + (i / 27) * 0.5})`
                        : 'rgba(255,255,255,0.07)',
                      boxShadow: isHead ? '0 0 8px rgba(239,68,68,0.9)' : 'none',
                      minWidth: '3px',
                    }}
                  />
                );
              })}
            </div>

            {/* Track progress bar underneath */}
            <div className="relative h-1 rounded-full overflow-hidden bg-surface-700">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)' }}
                animate={{ width: `${job.progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-y-0 w-20 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                animate={{ left: [`-80px`, `${job.progress}%`] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
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
              <p className="text-sm font-medium text-white">Import complete!</p>
              <p className="text-xs text-surface-400">Track added to your library</p>
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
