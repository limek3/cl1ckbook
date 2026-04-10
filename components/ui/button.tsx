import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-[13px] font-medium tracking-[-0.01em] transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary-hover hover:shadow-[var(--shadow-card)]',
        destructive:
          'border border-transparent bg-destructive text-destructive-foreground shadow-[var(--shadow-soft)] hover:opacity-95',
        outline:
          'border border-border/90 bg-card text-foreground shadow-[var(--shadow-soft)] hover:border-primary/18 hover:bg-accent/72 hover:text-foreground',
        secondary:
          'border border-border/70 bg-secondary text-secondary-foreground shadow-none hover:bg-accent/80',
        ghost:
          'border border-transparent text-muted-foreground shadow-none hover:bg-accent/72 hover:text-foreground',
        link:
          'h-auto rounded-none border-0 p-0 text-muted-foreground underline-offset-4 shadow-none hover:text-foreground hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 rounded-[12px] px-3 text-[12px]',
        lg: 'h-11 px-5',
        icon: 'size-10 rounded-[14px]',
        'icon-sm': 'size-8 rounded-[12px]',
        'icon-lg': 'size-11 rounded-[16px]',
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
