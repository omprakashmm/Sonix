
import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';

export function useKeyboardShortcuts() {
  const {
    isPlaying,
    play,
    pause,
    next,
    previous,
    isMuted,
    volume,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    currentTrack,
  } = usePlayerStore();

  const { likedTracks, likeTrack, unlikeTrack } = useLibraryStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when user is typing in an input / textarea / contenteditable
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
        case 'ArrowRight':
          if (e.altKey) {
            e.preventDefault();
            next();
          }
          break;
        case 'ArrowLeft':
          if (e.altKey) {
            e.preventDefault();
            previous();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 's':
        case 'S':
          toggleShuffle();
          break;
        case 'r':
        case 'R':
          cycleRepeat();
          break;
        case 'l':
        case 'L':
          if (currentTrack) {
            const isLiked = likedTracks.some((t) => t.id === currentTrack.id);
            isLiked ? unlikeTrack(currentTrack.id) : likeTrack(currentTrack.id);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    isPlaying, play, pause, next, previous,
    isMuted, volume, setVolume, toggleMute,
    toggleShuffle, cycleRepeat,
    currentTrack, likedTracks, likeTrack, unlikeTrack,
  ]);
}
