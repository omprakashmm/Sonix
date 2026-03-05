
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Music2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLibraryStore } from '@/store/libraryStore';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreatePlaylistDialog({ trigger, open: externalOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };
  const { createPlaylist } = useLibraryStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    await createPlaylist(data.name, data.description);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-white">
            <Plus className="h-4 w-4" />
            New playlist
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-surface-800 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Music2 className="h-5 w-5 text-brand-400" />
            </div>
            <DialogTitle className="text-lg font-semibold">Create playlist</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-muted-foreground">Name</Label>
            <Input
              id="name"
              placeholder="My awesome playlist"
              {...register('name')}
              className="bg-surface-700 border-white/10 text-white placeholder:text-muted-foreground focus:border-brand-500"
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-muted-foreground">
              Description <span className="opacity-50">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What's this playlist about?"
              rows={3}
              {...register('description')}
              className="bg-surface-700 border-white/10 text-white placeholder:text-muted-foreground focus:border-brand-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 text-muted-foreground hover:text-white"
              onClick={() => { reset(); setOpen(false); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white"
            >
              {isSubmitting ? 'Creating…' : 'Create playlist'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
