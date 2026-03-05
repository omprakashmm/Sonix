
import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Context ─────────────────────────────────────────────────

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue>({
  open: false,
  setOpen: () => {},
});

// ─── DropdownMenu ─────────────────────────────────────────────

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

// ─── DropdownMenuTrigger ──────────────────────────────────────

interface TriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function DropdownMenuTrigger({ asChild, children, className, onClick }: TriggerProps) {
  const { open, setOpen } = React.useContext(DropdownContext);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{ onClick: React.MouseEventHandler }>,
      { onClick: handleClick }
    );
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}

// ─── DropdownMenuContent ──────────────────────────────────────

interface ContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function DropdownMenuContent({ children, className, align = 'end' }: ContentProps) {
  const { open, setOpen } = React.useContext(DropdownContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open, setOpen]);

  if (!open) return null;

  const alignCls =
    align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2';

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-xl border border-white/10 bg-surface-800 p-1 shadow-xl animate-in fade-in-0 zoom-in-95',
        alignCls,
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── DropdownMenuItem ─────────────────────────────────────────

interface ItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

export function DropdownMenuItem({ children, className, onClick, ...props }: ItemProps) {
  const { setOpen } = React.useContext(DropdownContext);
  return (
    <button
      type="button"
      className={cn(
        'flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-white/80 outline-none transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── DropdownMenuSeparator ────────────────────────────────────

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn('-mx-1 my-1 h-px bg-white/10', className)} />;
}

// ─── DropdownMenuLabel ────────────────────────────────────────

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

export function DropdownMenuLabel({ children, className }: LabelProps) {
  return (
    <div className={cn('px-3 py-1.5 text-xs font-semibold text-muted-foreground', className)}>
      {children}
    </div>
  );
}

// ─── Sub-menu ─────────────────────────────────────────────────

const SubContext = React.createContext<DropdownContextValue>({
  open: false,
  setOpen: () => {},
});

export function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SubContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </SubContext.Provider>
  );
}

export function DropdownMenuSubTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(SubContext);
  return (
    <button
      type="button"
      className={cn(
        'flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors',
        className
      )}
      onMouseEnter={() => setOpen(true)}
      onClick={() => setOpen(!open)}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </button>
  );
}

export function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuSubContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = React.useContext(SubContext);
  if (!open) return null;
  return (
    <div
      className={cn(
        'absolute left-full top-0 z-50 ml-1 min-w-[8rem] overflow-hidden rounded-xl border border-white/10 bg-surface-800 p-1 shadow-xl',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── DropdownMenuGroup ────────────────────────────────────────

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
