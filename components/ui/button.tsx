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
          'border border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-text)] shadow-[var(--button-primary-shadow)] hover:bg-[color:var(--button-primary-hover)] hover:border-[color:var(--button-primary-border-hover)]',
        destructive:
          'border border-[color:var(--button-danger-border)] bg-[color:var(--button-danger-bg)] text-[color:var(--button-danger-text)] shadow-[var(--button-primary-shadow)] hover:bg-[color:var(--button-danger-hover)] hover:border-[color:var(--button-danger-border-hover)]',
        outline:
          'border border-[color:var(--button-outline-border)] bg-[color:var(--button-outline-bg)] text-[color:var(--button-outline-text)] shadow-[var(--button-outline-shadow)] hover:bg-[color:var(--button-outline-hover)] hover:border-[color:var(--button-outline-border-hover)]',
        secondary:
          'border border-[color:var(--button-secondary-border)] bg-[color:var(--button-secondary-bg)] text-[color:var(--button-secondary-text)] shadow-[var(--button-outline-shadow)] hover:bg-[color:var(--button-secondary-hover)] hover:border-[color:var(--button-secondary-border-hover)]',
        ghost:
          'border border-transparent bg-transparent text-[color:var(--button-ghost-text)] shadow-none hover:bg-[color:var(--button-ghost-hover)] hover:text-[color:var(--button-outline-text)]',
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
