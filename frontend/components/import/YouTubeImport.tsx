
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Search, Loader2, Music2, CheckCircle2, XCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import type { YouTubeMetadata, YouTubeImportJob } from '@/types';
import { cn } from '@/lib/utils';

type Stage = 'idle' | 'preview' | 'importing' | 'done' | 'error';

export function YouTubeImport({ onSuccess }: { onSuccess?: () => void }) {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<YouTubeMetadata | null>(null);
  const [job, setJob] = useState<YouTubeImportJob | null>(null);
  const [error, setError] = useState('');

  const fetchPreview = async () => {
    if (!url.trim()) return;
    setStage('preview');
    setError('');
    try {
      const { data } = await api.get<{ data: YouTubeMetadata }>('/youtube/metadata', { params: { url } });
      setPreview(data.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to fetch video info';
      setError(msg);
      setStage('idle');
    }
  };

  const startImport = async () => {
    if (!preview) return;
    setStage('importing');
    try {
      const { data } = await api.post<{ data: { jobId: string } }>('/youtube/import', { url });
      const jobId = data.data.jobId;
      if (!jobId) throw new Error('No job ID returned from server');
      setJob({ id: jobId, status: 'QUEUED', progress: 0 } as any);
      pollStatus(jobId);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Import failed';
      setError(msg);
      setStage('error');
    }
  };

  const pollStatus = (jobId: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 120) { // 3-minute timeout
        clearInterval(interval);
        setError('Import timed out');
        setStage('error');
        return;
      }
      try {
        const { data } = await api.get<{ success: boolean; data: YouTubeImportJob }>(`/youtube/jobs/${jobId}`);
        const job = data.data;
        setJob(job);
        if (job.status === 'DONE') {
          setStage('done');
          clearInterval(interval);
          onSuccess?.();
        } else if (job.status === 'ERROR') {
          setError((job as any).errorMessage ?? 'yt-dlp import failed — make sure yt-dlp is installed');
          setStage('error');
          clearInterval(interval);
        }
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        if (msg) {
          setError(msg);
          setStage('error');
          clearInterval(interval);
        }
        // network blip — keep polling
      }
    }, 1500);
  };

  const reset = () => {
    setUrl('');
    setStage('idle');
    setPreview(null);
    setJob(null);
    setError('');
  };

  return (
    <div className="space-y-4">
      {/* URL input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPreview()}
            placeholder="Paste a YouTube URL…"
            className="pl-9 bg-surface-700 border-white/10 text-white placeholder:text-muted-foreground focus:border-brand-500"
            disabled={stage !== 'idle'}
          />
        </div>
        {stage === 'idle' ? (
          <Button onClick={fetchPreview} disabled={!url.trim()} className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
            <Search className="h-4 w-4" /> Preview
          </Button>
        ) : (
          <Button variant="ghost" onClick={reset} className="text-muted-foreground hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 rounded-xl px-3 py-2">
          <XCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Preview card */}
        {preview && (stage === 'preview' || stage === 'importing' || stage === 'done') && (
          <motion.div
            key="preview-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex gap-4 glass-card rounded-2xl p-4"
          >
            <div className="relative h-20 w-32 rounded-xl overflow-hidden flex-shrink-0 bg-surface-700">
              {preview.thumbnail ? (
                <img src={preview.thumbnail} alt={preview.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{preview.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{preview.channel}</p>
              <p className="text-xs text-muted-foreground">{preview.duration}</p>
            </div>
          </motion.div>
        )}

        {/* Action button */}
        {stage === 'preview' && (
          <motion.div key="import-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button onClick={startImport} className="w-full bg-brand-500 hover:bg-brand-600 text-white gap-2">
              <Youtube className="h-4 w-4" /> Import to library
            </Button>
          </motion.div>
        )}

        {/* Progress */}
        {stage === 'importing' && job && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {job.status === 'DOWNLOADING' ? 'Downloading audio…'
                  : job.status === 'CONVERTING' ? 'Converting to MP3…'
                    : job.status === 'FETCHING_META' ? 'Fetching metadata…'
                      : 'Processing…'}
              </span>
              <span>{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-1.5 bg-surface-700 [&>div]:bg-brand-500" />
          </motion.div>
        )}

        {/* Done */}
        {stage === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 bg-green-500/10 rounded-xl px-4 py-3"
          >
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Import complete!</p>
              <p className="text-xs text-muted-foreground">Track added to your library</p>
            </div>
            <Button onClick={reset} variant="ghost" size="sm" className="ml-auto text-muted-foreground hover:text-white">
              Import another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
