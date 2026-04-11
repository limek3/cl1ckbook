'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Globe2, LayoutDashboard } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useLocale } from '@/lib/locale-context';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { BrandLogo } from '@/components/brand/brand-logo';

interface SiteHeaderProps {
  compact?: boolean;
}

export function SiteHeader({ compact = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { ownedProfile } = useApp();
  const isMobile = useMobile();

  const isPublicRoute = Boolean(pathname && pathname.startsWith('/m/'));
  const publicHref = isPublicRoute ? pathname : ownedProfile ? `/m/${ownedProfile.slug}` : '/create-profile';

  const labels =
    locale === 'ru'
      ? {
          subtitle: compact ? 'Публичная страница' : 'КликБук',
          mobileSubtitle: compact ? 'Страница' : 'КликБук',
          back: 'Назад в кабинет',
          dashboard: 'Кабинет',
          publicPage: 'Страница',
        }
      : {
          subtitle: compact ? 'Public page' : 'KlikBuk',
          mobileSubtitle: compact ? 'Page' : 'KlikBuk',
          back: 'Back to workspace',
          dashboard: 'Workspace',
          publicPage: 'Page',
        };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-2xl">
      <div className="centered-workspace flex items-center justify-between gap-3 px-3 py-2.5 md:gap-4 md:px-6 md:py-[var(--topbar-padding-y)] xl:px-8">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 md:gap-3">
            <BrandLogo className={isMobile ? 'w-[44px]' : 'w-[68px]'} priority />
            <div className="min-w-0">
              <div className="max-w-[84px] truncate text-[13px] font-semibold tracking-[-0.03em] text-foreground md:hidden">
                {labels.mobileSubtitle}
              </div>
              <div className="hidden max-w-[120px] truncate text-[11px] text-muted-foreground md:block md:max-w-none md:text-[10.5px]">
                {labels.subtitle}
              </div>
            </div>
          </Link>

          <span className="hidden text-muted-foreground md:inline">/</span>

          <Link
            href="/dashboard"
            className="hidden items-center gap-1.5 text-[11.5px] text-muted-foreground transition hover:text-foreground md:inline-flex"
          >
            <ChevronLeft className="size-3.5" />
            {labels.back}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 md:gap-[var(--topbar-gap)]">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden h-[var(--topbar-control-height)] md:inline-flex border-0 bg-transparent px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Link href={publicHref}>
              <Globe2 className="size-4 text-primary" />
              {labels.publicPage}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden h-[var(--topbar-control-height)] md:inline-flex rounded-[10px] px-2.5 shadow-none"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              {labels.dashboard}
            </Link>
          </Button>

          <LanguageToggle compact minimal className={isMobile ? 'min-w-[56px]' : undefined} />
          <ThemeToggle compact minimal className={isMobile ? 'min-w-[76px]' : undefined} />
        </div>
      </div>
    </header>
  );
}
