
import { useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay = 350
): T {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  return ((...args: unknown[]) => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => callback(...args), delay);
  }) as T;
}
