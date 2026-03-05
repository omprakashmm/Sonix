
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, Play, Pause, Heart, Music2, Trash2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { cn, formatDuration, safeCoverUrl } from '@/lib/utils';
import type { Track } from '@/types';

interface DraggableItem {
  id: string;
  track: Track;
  position: number;
}

interface Props {
  tracks: Track[];
  playlistId: string;
  onPlay?: (track: Track, index: number) => void;
  onReorder?: (reorderedTracks: Track[]) => void;
}

function SortableTrackRow({
  item,
  index,
  playlistId,
}: {
  item: DraggableItem;
  index: number;
  playlistId: string;
}) {
  const { currentTrack, isPlaying, play, pause, setQueue } = usePlayerStore();
  const { likedTracks, likeTrack, unlikeTrack, removeTrackFromPlaylist } = useLibraryStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const active = currentTrack?.id === item.track.id;
  const liked = likedTracks.some((t) => t.id === item.track.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
        isDragging ? 'opacity-50 bg-white/10 z-50' : 'hover:bg-white/5',
        active ? 'bg-brand-500/10' : ''
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Index / Playing indicator */}
      <div className="w-6 text-center flex-shrink-0">
        <span className={cn('text-xs group-hover:hidden', active ? 'text-brand-400' : 'text-muted-foreground')}>
          {active && isPlaying ? (
            <span className="flex gap-px justify-center items-end h-3">
              {[1, 2, 3].map((i) => (
                <span key={i} className="w-0.5 bg-brand-400 rounded-sm animate-wave"
                  style={{ animationDelay: `${i * 0.15}s`, height: `${50 + i * 15}%` }} />
              ))}
            </span>
          ) : index + 1}
        </span>
        <button
          onClick={() => {
            if (active) { isPlaying ? pause() : play(); }
            else { play(item.track); }
          }}
          className="hidden group-hover:block text-white"
        >
          {active && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
      </div>

      {/* Cover + info */}
      <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700">
        {safeCoverUrl(item.track.coverUrl) ? (
          <img src={safeCoverUrl(item.track.coverUrl)!} alt={item.track.title} width={40} height={40} className="object-cover h-full w-full" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Music2 className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', active ? 'text-brand-400' : 'text-white')}>
          {item.track.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{item.track.artist}</p>
      </div>

      <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
        {formatDuration(item.track.duration)}
      </span>

      {/* Like */}
      <button
        onClick={() => liked ? unlikeTrack(item.track.id) : likeTrack(item.track.id)}
        className={cn(
          'p-1 opacity-0 group-hover:opacity-100 transition-all',
          liked ? 'opacity-100 text-brand-400' : 'text-muted-foreground hover:text-white'
        )}
      >
        <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
      </button>

      {/* Remove from playlist */}
      <button
        onClick={() => removeTrackFromPlaylist(playlistId, item.track.id)}
        className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function DraggableTrackList({ tracks, playlistId, onReorder }: Props) {
  const [localItems, setLocalItems] = useState<DraggableItem[]>(() =>
    tracks.map((track, i) => ({ id: track.id, track, position: i }))
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Keep local list in sync when parent updates
  useEffect(() => {
    setLocalItems(tracks.map((track, i) => ({ id: track.id, track, position: i })));
  }, [tracks]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = localItems.findIndex((i) => i.id === active.id);
    const newIndex = localItems.findIndex((i) => i.id === over.id);

    const next = [...localItems];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);

    setLocalItems(next);
    onReorder?.(next.map((i) => i.track));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={localItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {localItems.map((item, index) => (
            <SortableTrackRow
              key={item.id}
              item={item}
              index={index}
              playlistId={playlistId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
