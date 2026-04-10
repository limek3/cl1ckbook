'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Globe2, LayoutDashboard } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useLocale } from '@/lib/locale-context';
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
  const isPublicRoute = Boolean(pathname && (pathname.startsWith('/m/')));
  const publicHref = isPublicRoute ? pathname : ownedProfile ? `/m/${ownedProfile.slug}` : '/create-profile';

  const labels = locale === 'ru'
    ? {
        subtitle: compact ? 'Публичная страница' : 'Премиальный booking flow',
        back: 'Назад в кабинет',
        dashboard: 'Кабинет',
        publicPage: 'Страница',
      }
    : {
        subtitle: compact ? 'Публичная страница' : 'Удобная онлайн-запись',
        back: 'Back to workspace',
        dashboard: locale === 'ru' ? 'Кабинет' : 'Dashboard',
        publicPage: 'Page',
      };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-2xl">
      <div className="centered-workspace flex items-center justify-between gap-4 px-4 py-[var(--topbar-padding-y)] md:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <BrandLogo className="w-[60px] sm:w-[68px]" priority />
            <div className="min-w-0">
              <div className="truncate text-[10.5px] text-muted-foreground">{labels.subtitle}</div>
            </div>
          </Link>
          <span className="hidden text-muted-foreground md:inline">/</span>
          <Link href="/dashboard" className="hidden items-center gap-1.5 text-[11.5px] text-muted-foreground transition hover:text-foreground md:inline-flex">
            <ChevronLeft className="size-3.5" />
            {labels.back}
          </Link>
        </div>

        <div className="flex items-center gap-[var(--topbar-gap)]">
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
          <LanguageToggle compact minimal />
          <ThemeToggle compact minimal />
        </div>
      </div>
    </header>
  );
}
