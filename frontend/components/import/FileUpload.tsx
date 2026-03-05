
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music2, CheckCircle2, XCircle, X, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { useLibraryStore } from '@/store/libraryStore';
import { cn, formatBytes } from '@/lib/utils';
import type { UploadProgress } from '@/types';

const ACCEPTED_AUDIO = {
  'audio/mpeg': ['.mp3'],
  'audio/flac': ['.flac'],
  'audio/wav': ['.wav'],
  'audio/aac': ['.aac'],
  'audio/mp4': ['.m4a'],
  'audio/ogg': ['.ogg'],
};

export function FileUpload({ onSuccess }: { onSuccess?: () => void }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const { fetchTracks } = useLibraryStore();

  const updateUpload = (id: string, patch: Partial<UploadProgress>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const uploadFile = async (file: File) => {
    const id = `${file.name}-${Date.now()}`;
    setUploads((prev) => [
      ...prev,
      { id, filename: file.name, fileName: file.name, progress: 0, status: 'uploading' as const, fileSize: file.size },
    ]);

    const form = new FormData();
    form.append('audio', file);

    try {
      await api.post('/tracks/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          updateUpload(id, { progress: pct });
        },
      });

      updateUpload(id, { status: 'done', progress: 100 });
      fetchTracks();
      onSuccess?.();
    } catch {
      updateUpload(id, { status: 'error', errorMessage: 'Upload failed' });
    }
  };

  const onDrop = useCallback((accepted: File[]) => {
    accepted.forEach(uploadFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_AUDIO,
    multiple: true,
  });

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center gap-3"
        >
          <div className={cn(
            'h-14 w-14 rounded-full flex items-center justify-center transition-all',
            isDragActive ? 'bg-brand-500/20' : 'bg-white/5'
          )}>
            <Upload className={cn('h-6 w-6 transition-colors', isDragActive ? 'text-brand-400' : 'text-muted-foreground')} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isDragActive ? 'Drop files here' : 'Drag & drop audio files'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              MP3, FLAC, WAV, AAC, M4A, OGG supported
            </p>
          </div>
          <button className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors">
            Browse files
          </button>
        </motion.div>
      </div>

      {/* Upload list */}
      <AnimatePresence>
        {uploads.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 glass-card rounded-xl p-3">
              {/* Icon */}
              <div className="h-9 w-9 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
                {u.status === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : u.status === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
                )}
              </div>

              {/* Name + progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-white truncate">{u.fileName}</p>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {u.status === 'done'
                      ? 'Done'
                      : u.status === 'error'
                        ? 'Failed'
                        : `${u.progress}%`}
                  </span>
                </div>
                {u.status === 'uploading' && (
                  <Progress value={u.progress} className="h-1 bg-surface-700 [&>div]:bg-brand-500" />
                )}
                {u.status === 'error' && (
                  <p className="text-xs text-red-400">{u.errorMessage}</p>
                )}
                {u.fileSize && u.status !== 'error' && (
                  <p className="text-xs text-muted-foreground">{formatBytes(u.fileSize)}</p>
                )}
              </div>

              {/* Remove */}
              {(u.status === 'done' || u.status === 'error') && (
                <button onClick={() => removeUpload(u.id)} className="text-muted-foreground hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
