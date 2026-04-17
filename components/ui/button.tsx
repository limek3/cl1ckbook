import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border text-[13px] font-medium tracking-[-0.01em] transition-[background-color,border-color,color,opacity] duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-primary/28 bg-primary text-primary-foreground hover:border-primary/40 hover:bg-[color:var(--primary-hover)]',
        destructive:
          'border-destructive/25 bg-destructive text-destructive-foreground hover:border-destructive/35 hover:bg-destructive/90',
        outline:
          'border-border bg-card text-foreground hover:bg-accent/55',
        secondary:
          'border-border bg-secondary text-secondary-foreground hover:bg-accent/60',
        ghost:
          'border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-accent/48 hover:text-foreground',
        link: 'h-auto rounded-none border-0 p-0 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 rounded-[10px] px-3 text-[12px]',
        lg: 'h-11 px-5',
        icon: 'size-10 rounded-[12px] p-0',
        'icon-sm': 'size-8 rounded-[10px] p-0',
        'icon-lg': 'size-11 rounded-[14px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
