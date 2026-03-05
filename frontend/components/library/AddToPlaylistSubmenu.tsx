
import { useLibraryStore } from '@/store/libraryStore';
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ListPlus, Plus } from 'lucide-react';

interface Props {
  trackId: string;
}

export function AddToPlaylistSubmenu({ trackId }: Props) {
  const { playlists, addTrackToPlaylist } = useLibraryStore();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
        <ListPlus className="h-4 w-4" />
        Add to playlist
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="bg-surface-700 border-white/10 text-white w-48">
        {playlists.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground text-xs">
            No playlists yet
          </DropdownMenuItem>
        ) : (
          playlists.map((pl) => (
            <DropdownMenuItem
              key={pl.id}
              className="cursor-pointer gap-2"
              onClick={() => addTrackToPlaylist(pl.id, trackId)}
            >
              <Plus className="h-4 w-4" />
              {pl.name}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
