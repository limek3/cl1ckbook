'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { CheckCircle2, Copy, ExternalLink, Globe2, Link2, Share2 } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MasterAvatar } from '@/components/profile/master-avatar';
import { useMobile } from '@/hooks/use-mobile';
import type { MasterProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/locale-context';

export function DashboardHeader({
  badge,
  title,
  description,
  actions,
}: {
  badge?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  const isMobile = useMobile();

  return (
    <div className="dashboard-header border-b border-border pb-3 md:pb-4" data-mobile-compact={isMobile ? 'true' : 'false'}>
      {badge ? <div className="chip-muted max-w-full truncate">{badge}</div> : null}
      <div className="mt-2 flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="page-title leading-none">{title}</h1>
          <p className={cn('page-subtitle', isMobile && 'line-clamp-2 max-w-[44rem]')}>{description}</p>
        </div>
        {actions ? <div className="dashboard-header-actions flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  icon?: LucideIcon;
}) {
  const isMobile = useMobile();

  return (
    <div
      className={cn(
        'workspace-metric-card workspace-card rounded-[16px] p-3',
        isMobile && 'workspace-metric-card-mobile',
      )}
    >
      <div className={cn('flex items-start justify-between gap-3', isMobile && 'items-center gap-2.5')}>
        <div className="min-w-0 flex-1">
          <div className="metric-label">{label}</div>
          <div className={cn('mt-1 metric-value truncate', isMobile && 'mt-1 text-[18px]')}>{value}</div>
        </div>
        {Icon ? (
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-[12px] border border-border bg-accent/60 text-muted-foreground md:size-9',
              isMobile && 'size-8 rounded-[11px]',
            )}
          >
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>
      {hint || delta ? (
        <div className={cn('mt-2 flex flex-wrap items-center gap-2 text-[11px] md:text-[12px]', isMobile && 'mt-1.5 gap-1.5')}>
          {delta ? <span className="workspace-pill">{delta}</span> : null}
          {hint ? <span className="text-muted-foreground">{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const isMobile = useMobile();

  return (
    <section
      className={cn(
        'workspace-section-card workspace-card rounded-[18px] p-3.5 md:p-4',
        isMobile && 'workspace-section-card-mobile',
        className,
      )}
    >
      <div className="flex flex-col gap-2.5 border-b border-border pb-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className={cn('text-[14px] font-semibold tracking-[-0.02em] text-foreground md:text-[16px]', isMobile && 'text-[13.5px]')}>
            {title}
          </div>
          {description ? (
            <p className={cn('mt-1 text-[11.5px] leading-5 text-muted-foreground md:text-[12.5px] md:leading-[1.45rem]', isMobile && 'line-clamp-2 text-[11px] leading-[1.2rem]')}>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="section-card-actions flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">{actions}</div> : null}
      </div>
      <div className={cn('mt-3', isMobile && 'mt-2.5')}>{children}</div>
    </section>
  );
}

export function PublicPageHero({
  profile,
  alignTop = false,
  sticky = false,
}: {
  profile: MasterProfile;
  alignTop?: boolean;
  sticky?: boolean;
}) {
  const { locale } = useLocale();
  const isMobile = useMobile();
  const [copiedState, setCopiedState] = useState<'link' | 'message' | null>(null);

  const publicUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/m/${profile.slug}`;
    return `${window.location.origin}/m/${profile.slug}`;
  }, [profile.slug]);

  const shareMessage = useMemo(() => {
    return locale === 'ru'
      ? `Здравствуйте! Вот моя ссылка для записи: ${publicUrl}\nНа странице есть услуги, свободные слоты и быстрый способ оставить заявку.`
      : `Hello! Here is my booking link: ${publicUrl}\nThe page already includes services, available slots, and a quick request flow.`;
  }, [locale, publicUrl]);

  const copyValue = async (value: string, type: 'link' | 'message') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedState(type);
      window.setTimeout(() => setCopiedState(null), 1400);
    } catch {}
  };

  const handleShare = async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return;
    try {
      await navigator.share({ title: profile.name, text: shareMessage, url: publicUrl });
    } catch {}
  };

  const labels = locale === 'ru'
    ? {
        badge: 'Публичная страница активна',
        title: 'Главная ссылка мастера',
        description: 'Сразу видно, как выглядит карточка, какая ссылка уходит клиенту и какими действиями поделиться без лишних шагов.',
        connected: 'Подключено',
        live: 'Страница доступна для записи',
        copyLink: copiedState === 'link' ? 'Скопировано' : 'Скопировать ссылку',
        copyMessage: copiedState === 'message' ? 'Скопировано' : 'Скопировать сообщение',
        share: 'Поделиться',
        open: 'Открыть страницу',
      }
    : {
        badge: 'Public page is active',
        title: 'Primary master link',
        description: 'See the page card, the live URL, and the sharing actions in one compact block.',
        connected: 'Connected',
        live: 'Ready to accept bookings',
        copyLink: copiedState === 'link' ? 'Copied' : 'Copy link',
        copyMessage: copiedState === 'message' ? 'Copied' : 'Copy message',
        share: 'Share',
        open: 'Open page',
      };

  if (isMobile) {
    return (
      <section
        className={cn(
          'workspace-card accent-gradient overflow-hidden rounded-[18px] p-3',
          alignTop && 'mt-0',
        )}
      >
        <div className="flex items-start gap-3">
          <MasterAvatar name={profile.name} avatar={profile.avatar} className="h-12 w-12 rounded-[14px]" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-card/82 backdrop-blur">
                <CheckCircle2 className="size-3.5" />
                {labels.connected}
              </Badge>
            </div>
            <div className="mt-1 truncate text-[15px] font-semibold tracking-[-0.03em] text-foreground">
              {profile.name}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {profile.profession} · {profile.city}
            </div>
          </div>
          <Button asChild size="sm" className="h-8 rounded-full px-3">
            <Link href={`/m/${profile.slug}`}>
              <ExternalLink className="size-3.5" />
              {labels.open}
            </Link>
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: locale === 'ru' ? 'Статус' : 'Status', value: labels.connected },
            { label: 'Slug', value: profile.slug },
            { label: locale === 'ru' ? 'Режим' : 'Mode', value: labels.live },
          ].map((item) => (
            <div key={item.label} className="rounded-[14px] border border-border/80 bg-card/72 px-2.5 py-2">
              <div className="truncate text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</div>
              <div className="mt-1 truncate text-[11px] font-medium text-foreground">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-[14px] border border-border/80 bg-card/72 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Link2 className="size-3.5 shrink-0" />
            <span className="truncate">{publicUrl}</span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => copyValue(publicUrl, 'link')}>
            <Copy className="size-3.5" />
            {labels.copyLink}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="size-3.5" />
            {labels.share}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="col-span-2" onClick={() => copyValue(shareMessage, 'message')}>
            <Copy className="size-3.5" />
            {labels.copyMessage}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'workspace-card hero-grid accent-gradient overflow-hidden rounded-[20px] p-3.5 md:p-5',
        alignTop && 'mt-0',
        sticky && 'xl:sticky xl:top-4 xl:z-20',
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-card/80 backdrop-blur">
            <CheckCircle2 className="size-3.5" />
            {labels.badge}
          </Badge>

          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-foreground md:text-[30px]">{labels.title}</h2>
            <p className="mt-2 max-w-[720px] text-[12px] leading-6 text-muted-foreground md:mt-3 md:text-[14px] md:leading-7">
              {labels.description}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: locale === 'ru' ? 'Статус' : 'Status', value: labels.connected },
              { label: locale === 'ru' ? 'Slug' : 'Slug', value: profile.slug },
              { label: locale === 'ru' ? 'Публичный режим' : 'Public mode', value: labels.live },
            ].map((item) => (
              <div key={item.label} className="rounded-[14px] border border-border bg-card/70 px-3 py-2.5 backdrop-blur">
                <div className="text-[10px] text-muted-foreground md:text-[11px]">{item.label}</div>
                <div className="mt-1 truncate text-[12px] font-medium text-foreground md:text-[13px]">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
            <div className="workspace-soft-panel flex min-h-10 items-center gap-2.5 px-3 py-2.5">
              <Link2 className="size-4 text-muted-foreground" />
              <span className="truncate text-[12px] text-foreground md:text-[13px]">{publicUrl}</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => copyValue(publicUrl, 'link')}>
              <Copy className="size-4" />
              {labels.copyLink}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => copyValue(shareMessage, 'message')}>
              <Copy className="size-4" />
              {labels.copyMessage}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="size-4" />
              {labels.share}
            </Button>
          </div>
        </div>

        <div className="workspace-card rounded-[18px] border border-border/80 bg-card/80 p-3.5 backdrop-blur md:rounded-[22px] md:p-4">
          <div className="flex items-start gap-3">
            <MasterAvatar name={profile.name} avatar={profile.avatar} className="h-14 w-14 rounded-[16px] md:h-16 md:w-16 md:rounded-[18px]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-[15px] font-semibold text-foreground md:text-[17px]">{profile.name}</div>
                <Badge variant="outline">
                  <Globe2 className="size-3.5" />
                  {labels.connected}
                </Badge>
              </div>
              <div className="truncate text-[12px] text-muted-foreground md:text-[13px]">{profile.profession}</div>
              <div className="mt-1 truncate text-[11px] text-muted-foreground md:text-[12px]">{profile.city}</div>
            </div>
          </div>

          <div className="mt-3 line-clamp-3 text-[12px] leading-5 text-muted-foreground md:mt-4 md:text-[13px] md:leading-6">{profile.bio}</div>

          <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
            {profile.services.slice(0, 4).map((service) => (
              <span key={service} className="chip-muted">
                {service}
              </span>
            ))}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:mt-4">
            <Button asChild size="sm">
              <Link href={`/m/${profile.slug}`}>
                <ExternalLink className="size-4" />
                {labels.open}
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => copyValue(publicUrl, 'link')}>
              <Copy className="size-4" />
              {labels.copyLink}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
