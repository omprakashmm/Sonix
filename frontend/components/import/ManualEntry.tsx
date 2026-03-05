
/**
 * ManualEntry – upload an audio file and manually fill in track metadata.
 * Used in the "Manual" tab of the Add Music dialog.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useLibraryStore } from '@/store/libraryStore';
import { cn } from '@/lib/utils';

type Stage = 'idle' | 'uploading' | 'done' | 'error';

export function ManualEntry({ onSuccess }: { onSuccess?: () => void }) {
  const { fetchTracks } = useLibraryStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setAudioFile(f);
    // Pre-fill title from filename if empty
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;

    setStage('uploading');
    setError('');
    setProgress(0);

    const form = new FormData();
    form.append('audio', audioFile);
    if (title.trim()) form.append('title', title.trim());
    if (artist.trim()) form.append('artist', artist.trim());
    if (album.trim()) form.append('album', album.trim());
    if (genre.trim()) form.append('genre', genre.trim());

    try {
      await api.post('/tracks/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          const pct = ev.total ? Math.round((ev.loaded * 100) / ev.total) : 0;
          setProgress(pct);
        },
      });
      setStage('done');
      fetchTracks();
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Upload failed';
      setError(msg);
      setStage('error');
    }
  };

  const reset = () => {
    setAudioFile(null); setStage('idle'); setError('');
    setTitle(''); setArtist(''); setAlbum(''); setGenre(''); setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-surface-400">Upload an audio file with custom metadata</p>

      {/* File picker */}
      <div
        onClick={() => fileRef.current?.click()}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all',
          audioFile
            ? 'border-green-500/40 bg-green-500/[0.05]'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
        )}
      >
        <div className={cn(
          'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
          audioFile ? 'bg-green-500/20' : 'bg-surface-700'
        )}>
          {audioFile ? (
            <Music2 className="h-4 w-4 text-green-400" />
          ) : (
            <Upload className="h-4 w-4 text-surface-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {audioFile ? (
            <p className="text-sm text-white truncate">{audioFile.name}</p>
          ) : (
            <p className="text-sm text-surface-400">Click to select an audio file</p>
          )}
          <p className="text-xs text-surface-500">MP3, FLAC, WAV, AAC, M4A</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".mp3,.flac,.wav,.aac,.m4a,.ogg,audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Metadata fields */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Title', value: title, set: setTitle, placeholder: 'Track title', required: false },
          { label: 'Artist', value: artist, set: setArtist, placeholder: 'Artist name', required: false },
          { label: 'Album', value: album, set: setAlbum, placeholder: 'Album name', required: false },
          { label: 'Genre', value: genre, set: setGenre, placeholder: 'e.g. Pop', required: false },
        ].map((field) => (
          <div key={field.label}>
            <label className="block text-[10px] text-surface-500 mb-1 font-medium uppercase tracking-wide">
              {field.label}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
              disabled={stage === 'uploading'}
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-surface-500 bg-surface-700 border border-white/10 focus:outline-none focus:border-brand-500/60 disabled:opacity-60 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-xl px-3 py-2">
          <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Progress bar */}
        {stage === 'uploading' && (
          <motion.div key="prog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
            <div className="flex justify-between text-xs text-surface-400">
              <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-surface-700 overflow-hidden">
              <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
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
              <p className="text-sm font-medium text-white">Upload complete!</p>
              <p className="text-xs text-surface-400">Track added to your library</p>
            </div>
            <button type="button" onClick={reset} className="text-xs text-surface-400 hover:text-white transition-colors ml-auto">
              Upload another
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      {(stage === 'idle' || stage === 'error') && (
        <button
          type="submit"
          disabled={!audioFile}
          className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="h-4 w-4" /> Upload Track
        </button>
      )}
    </form>
  );
}
