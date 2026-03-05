
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Music2, ListMusic, User } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import type { SearchResult } from '@/types';
import { formatDuration, safeCoverUrl } from '@/lib/utils';

interface Props {
  results: SearchResult | null;
  query: string;
  isLoading?: boolean;
}

export function SearchResults({ results, query }: Props) {
  const { play, setQueue } = usePlayerStore();

  if (!query) return null;
  if (!results) return null;

  const hasResults =
    results.tracks.length > 0 ||
    results.playlists.length > 0 ||
    results.artists.length > 0;

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full glass flex items-center justify-center mb-4">
          <Music2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-white font-medium">No results for "{query}"</p>
        <p className="text-muted-foreground text-sm mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tracks */}
      {results.tracks.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Music2 className="h-5 w-5 text-brand-400" /> Songs
          </h3>
          <div className="space-y-1">
            {results.tracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { setQueue(results.tracks, i); play(track); }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-all"
              >
                <div className="relative h-11 w-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700">
                  {safeCoverUrl(track.coverUrl) ? (
                    <img src={safeCoverUrl(track.coverUrl)!} alt={track.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Music2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-5 w-5 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatDuration(track.duration)}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Playlists */}
      {results.playlists.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-brand-400" /> Playlists
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {results.playlists.map((pl, i) => (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/playlist/${pl.id}`}
                  className="flex items-center gap-3 glass-card rounded-xl p-3 hover:bg-white/10 group transition-all"
                >
                  <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-700">
                    {safeCoverUrl(pl.coverUrl) ? (
                      <img src={safeCoverUrl(pl.coverUrl)!} alt={pl.name} className="object-cover h-full w-full" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ListMusic className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{pl.name}</p>
                    <p className="text-xs text-muted-foreground">Playlist</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Artists */}
      {results.artists.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-brand-400" /> Artists
          </h3>
          <div className="flex flex-wrap gap-3">
            {results.artists.map((artist, i) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 glass-card rounded-2xl px-4 py-3 hover:bg-white/10 cursor-pointer transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{artist.name}</p>
                  <p className="text-xs text-muted-foreground">{artist.trackCount} songs</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
