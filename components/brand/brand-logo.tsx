import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  tone?: 'auto' | 'light' | 'dark';
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  alt?: string;
}

export function BrandLogo({
  tone = 'auto',
  className,
  imageClassName,
  priority = false,
  alt = 'КликБук',
}: BrandLogoProps) {
  const lightLogo = (
    <Image
      src="/brand/klikbuk-logo-light.png"
      alt={alt}
      width={530}
      height={401}
      priority={priority}
      className={cn('h-auto w-full select-none', imageClassName)}
    />
  );

  const darkLogo = (
    <Image
      src="/brand/klikbuk-logo-dark.png"
      alt={alt}
      width={530}
      height={398}
      priority={priority}
      className={cn('h-auto w-full select-none', imageClassName)}
    />
  );

  if (tone === 'light') {
    return <div className={cn('shrink-0', className)}>{lightLogo}</div>;
  }

  if (tone === 'dark') {
    return <div className={cn('shrink-0', className)}>{darkLogo}</div>;
  }

  return (
    <div className={cn('shrink-0', className)}>
      <div className="dark:hidden">{lightLogo}</div>
      <div className="hidden dark:block">{darkLogo}</div>
    </div>
  );
}
