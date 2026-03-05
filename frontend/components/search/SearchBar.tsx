
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface Props {
  compact?: boolean;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBar({ compact, autoFocus, onSearch }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
    if (e.key === 'Escape') {
      setValue('');
      inputRef.current?.blur();
    }
  };

  const clear = () => {
    setValue('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 rounded-full transition-all',
        compact ? 'w-40 focus-within:w-56' : 'w-full',
        focused
          ? 'bg-surface-600 ring-1 ring-brand-500/50'
          : 'bg-surface-700 hover:bg-surface-600'
      )}
    >
      <Search className={cn(
        'absolute left-3 h-4 w-4 transition-colors',
        focused ? 'text-brand-400' : 'text-muted-foreground'
      )} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        placeholder="Search songs, artists…"
        className="w-full bg-transparent pl-9 pr-8 py-2 text-sm text-white placeholder:text-muted-foreground outline-none"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clear}
            className="absolute right-3 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
