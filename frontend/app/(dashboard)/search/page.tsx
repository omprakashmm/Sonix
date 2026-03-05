/**
 * OpenWave — Search Page
 */

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchResults } from '@/components/search/SearchResults';
import api from '@/lib/api';
import type { SearchResult } from '@/types';
import { Input } from '@/components/ui/input';

const GENRE_TAGS = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical',
  'R&B', 'Country', 'Metal', 'Lo-Fi', 'Synthwave', 'Indie',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!debouncedQuery && !selectedGenre) {
      setResults(null);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set('q', debouncedQuery);
        if (selectedGenre) params.set('genre', selectedGenre);

        const res = await api.get<SearchResult>(`/search?${params}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery, selectedGenre]);

  return (
    <div className="px-6 py-8 space-y-6">
      {/* ── Search Input ─────────────────────────── */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="pl-12 pr-12 h-14 text-lg glass border-white/10 bg-surface-800 placeholder:text-muted-foreground rounded-2xl"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Genre Filter Tags ─────────────────────── */}
      <div>
        <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">
          Browse by genre
        </p>
        <div className="flex flex-wrap gap-2">
          {GENRE_TAGS.map((genre) => (
            <motion.button
              key={genre}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGenre === genre
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'glass border-white/10 text-muted-foreground hover:text-white hover:border-white/20'
              }`}
            >
              {genre}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {(query || selectedGenre) ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <SearchResults results={results} isLoading={isLoading} query={query} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="h-20 w-20 rounded-full glass flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Find your music</h2>
            <p className="text-muted-foreground max-w-sm">
              Search for songs, artists, or albums — or browse by genre above.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
