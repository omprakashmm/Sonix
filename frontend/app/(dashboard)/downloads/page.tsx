/**
 * OpenWave — Downloads Page
 */

import { motion } from 'framer-motion';
import { Download, FolderOpen, Info } from 'lucide-react';

export default function DownloadsPage() {
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Download className="h-7 w-7 text-brand-400" />
            Downloads
          </h1>
          <p className="text-surface-400 mt-1 text-sm">
            Tracks saved locally for offline playback
          </p>
        </div>

        {/* Empty state */}
        <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-20 w-20 rounded-2xl bg-surface-700 flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-surface-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">No downloads yet</p>
            <p className="text-surface-400 text-sm mt-1">
              Import tracks from YouTube or upload audio files to get started.
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10">
          <Info className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-surface-400 leading-relaxed">
            All music you import is stored locally on the server and available for
            playback without an internet connection.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
