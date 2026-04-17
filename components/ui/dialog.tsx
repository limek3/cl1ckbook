'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}
function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}
function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}
function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}
function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn('fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out', className)} {...props} />;
}
function DialogContent({ className, children, showCloseButton = true, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn('fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[16px] border border-border bg-popover p-5 text-popover-foreground shadow-[0_20px_60px_rgba(15,23,42,0.12)] duration-200 sm:max-w-xl', className)}
        {...props}
      >
        {children}
        {showCloseButton ? <DialogPrimitive.Close className="absolute right-4 top-4 rounded-[10px] border border-transparent p-1 text-muted-foreground transition hover:border-border hover:bg-accent/40 hover:text-foreground"><XIcon className="size-4" /><span className="sr-only">Close</span></DialogPrimitive.Close> : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="dialog-header" className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />; }
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="dialog-footer" className={cn('flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end', className)} {...props} />; }
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title data-slot="dialog-title" className={cn('text-[18px] font-semibold tracking-[-0.02em]', className)} {...props} />; }
function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description data-slot="dialog-description" className={cn('text-[13px] leading-6 text-muted-foreground', className)} {...props} />; }

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger };
